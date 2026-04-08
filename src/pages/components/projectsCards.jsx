import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ProjectCard from "../components/projectCard";
import { getJobs, getRecommendedJobs, getSavedJobs, saveJob } from "../../api/jobs";
import "../../assets/style/projectsCards.css";

export default function Projects({ 
  activeTab = "recommended", 
  searchQuery = "",
  jobType = null,
  minBudget = null,
  maxBudget = null,
  sortBy = "created_at",
  sortOrder = "DESC",
  onProjectClick // Added this
}) {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_SIZE = 20;

  // Reset page when any filter config changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, jobType, minBudget, maxBudget, sortBy, sortOrder]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      
      let res;
      try {
        const params = { 
          page, 
          limit: PAGE_SIZE, 
          search: searchQuery || undefined,
          job_type: jobType || undefined,
          min_budget: minBudget !== null ? minBudget : undefined,
          max_budget: maxBudget !== null ? maxBudget : undefined,
          sort_by: sortBy,
          order: sortOrder
        };
        
        if (activeTab === "recommended") {
          res = await getRecommendedJobs(params);
        } else if (activeTab === "saved") {
          // If the backend 501s, we should mock it or catch it, but we'll try the API first
          res = await getSavedJobs(params);
        } else {
          res = await getJobs(params);
        }

        if (res?.success === false) {
          setError(res?.message || "Ma'lumotlarni yuklashda xato");
        } else {
          // res.data.projects is the new structure from /api/projects
          const data = res?.data?.projects || res?.data || res?.projects || res || [];
          const jobsList = Array.isArray(data) ? data : [];
          setJobs(jobsList);
          
          let totalItems = res?.data?.pagination?.total || res?.total || 0;
          let calculatedPages = res?.data?.pagination?.totalPages || res?.pages || Math.ceil(totalItems / PAGE_SIZE) || 1;
          setTotalPages(calculatedPages);
          
          // Initialize liked state appropriately
          const currentLikes = new Set(likedIds);
          jobsList.forEach(job => {
             // Agar "saved" tabda bo'lsak u albatta liked, yoki backenddan `is_saved: true` kelsa
             if (activeTab === "saved" || job.is_saved) {
                currentLikes.add(job.id);
             }
          });
          
          // Agar bazada saved jobs qo'shilmagan bo'lsa local storage dan tortib koramiz (mock)
          if(activeTab === "saved" && res?.success === false && res?.message?.includes("501")) {
            // backend doesn't support it yet
            // let's do nothing for now, it shows the error
          }

          setLikedIds(currentLikes);
        }
      } catch (err) {
        setError("Tarmoq xatosi yoki server ishlamayapti");
      }
      setLoading(false);
    };

    // Debounce to avoid too many requests while typing in search
    const timer = setTimeout(() => {
      fetchJobs();
    }, 400);

    return () => clearTimeout(timer);
  }, [page, activeTab, searchQuery]);

  const toggleLike = async (id) => {
    // Optimistik yangilash (darhol UI o'zgaradi)
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

    const res = await saveJob(id);
    if (res?.success === false) {
      // Agar xato bo'lsa oldingi holatga qaytaramiz
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      alert(res.message || "Saqlashda xatolik yuz berdi");
    }
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const pageItems = useMemo(() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1, 2, 3);
    if (page > 4) pages.push("dots-left");
    if (page > 3 && page < totalPages - 2) pages.push(page);
    if (page < totalPages - 3) pages.push("dots-right");
    pages.push(totalPages);
    return pages.filter((v, idx, arr) => arr.indexOf(v) === idx);
  }, [page, totalPages]);

  if (loading && page === 1) {
    return (
      <div className="projects-wrap">
        <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontSize: "1.1rem" }}>
          <div className="spinner"></div> 
          {t("findWork.projectsList.loading")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-wrap">
        <div style={{ textAlign: "center", padding: 40, color: "#dc2626", background: "var(--surface-2)", borderRadius: "12px" }}>
          {error}
        </div>
      </div>
    );
  }

  // Backend'dan kelgan ma'lumotni ProjectCard formatiga moslashtirish
  const mappedJobs = jobs.map((job) => {
    // Determine price representation
    let priceText = t("findWork.projectCard.recently");
    if (job.job_type === "fixed" && job.budget_max) {
      priceText = `${Number(job.budget_max).toLocaleString()} ${job.currency || 'UZS'}`;
    } else if (job.job_type === "hourly" && job.budget_min) {
      priceText = `${Number(job.budget_min)}–${Number(job.budget_max)} ${job.currency || 'UZS'}/soat`;
    }

    // Determine tags
    let tagsList = [];
    try {
      if (typeof job.required_skills === 'string') {
        tagsList = JSON.parse(job.required_skills);
      } else if (Array.isArray(job.required_skills)) {
        tagsList = job.required_skills;
      }
    } catch (e) {
      tagsList = [];
    }

    return {
      id: job.id,
      img: job.cover_image_url || null,
      title: job.title,
      description: job.description,
      tags: tagsList,
      price: priceText,
      type: job.job_type === 'hourly' ? t("findWork.projectCard.hourly") : t("findWork.projectCard.fixed"),
      experience: t("findWork.projectCard.intermediate"), // experience_level is not in DB yet
      posted: job.created_at ? new Date(job.created_at).toLocaleDateString() : t("findWork.projectCard.recently"),
    };
  });

  return (
    <div className="projects-wrap">
      {mappedJobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--muted)", background: "var(--surface-2)", borderRadius: "16px", border: "1px dashed var(--border)" }}>
          {t("findWork.projectsList.noProjects")}
        </div>
      ) : (
        <div className="projects-grid">
          {jobs.map((job) => {
            // Determine price representation for the card
            let priceText = t("findWork.projectCard.recently");
            if (job.job_type === "fixed" && job.budget_max) {
              priceText = `${Number(job.budget_max).toLocaleString()} ${job.currency || 'UZS'}`;
            } else if (job.job_type === "hourly" && job.budget_min) {
              priceText = `${Number(job.budget_min)}–${Number(job.budget_max)} ${job.currency || 'UZS'}/soat`;
            }

            let tagsList = [];
            try {
              if (typeof job.required_skills === 'string') tagsList = JSON.parse(job.required_skills);
              else if (Array.isArray(job.required_skills)) tagsList = job.required_skills;
            } catch (e) {}

            return (
              <ProjectCard
                key={job.id}
                img={job.cover_image_url}
                title={job.title}
                description={job.description}
                tags={tagsList}
                price={priceText}
                meta={`${job.job_type === 'hourly' ? t("findWork.projectCard.hourly") : t("findWork.projectCard.fixed")} · ${t("findWork.projectCard.intermediate")}`}
                posted={job.created_at ? new Date(job.created_at).toLocaleDateString() : t("findWork.projectCard.recently")}
                liked={likedIds.has(job.id)}
                proposalsCount={job.proposals_count}
                onToggleLike={() => toggleLike(job.id)}
                onReadMore={() => onProjectClick && onProjectClick(job)}
              />
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pg-wrap" style={{ marginTop: "2rem" }}>
          <button className="pg-nav" onClick={goPrev} disabled={page === 1} type="button">
            ‹ {t("findWork.projectsList.prev")}
          </button>
          <div className="pg-pages">
            {pageItems.map((p) => {
              if (p === "dots-left" || p === "dots-right") {
                return <span key={p} className="pg-dots">...</span>;
              }
              return (
                <button
                  key={p}
                  className={`pg-page ${page === p ? "is-active" : ""}`}
                  onClick={() => setPage(p)}
                  type="button"
                >{p}</button>
              );
            })}
          </div>
          <button className="pg-nav" onClick={goNext} disabled={page === totalPages} type="button">
            {t("findWork.projectsList.next")} ›
          </button>
        </div>
      )}
    </div>
  );
}
