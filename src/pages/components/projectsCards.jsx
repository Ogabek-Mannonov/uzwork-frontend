import { useEffect, useMemo, useState } from "react";
import ProjectCard from "../components/projectCard";
import { getJobs, getRecommendedJobs, getSavedJobs, saveJob } from "../../api/jobs";
import "../../assets/style/projectsCards.css";

export default function Projects({ activeTab = "recommended", searchQuery = "" }) {
  const [jobs, setJobs] = useState([]);
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_SIZE = 20;

  // Reset page on tab or search change
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      
      let res;
      try {
        const params = { page, limit: PAGE_SIZE, search: searchQuery };
        
        if (activeTab === "recommended") {
          res = await getRecommendedJobs(params);
        } else if (activeTab === "saved") {
          res = await getSavedJobs(params);
        } else {
          res = await getJobs(params);
        }

        if (res?.success === false) {
          setError(res?.message || "Ma'lumotlarni yuklashda xato");
        } else {
          const data = res?.data || res?.projects || res || [];
          const jobsList = Array.isArray(data) ? data : [];
          setJobs(jobsList);
          
          if (res?.total) setTotalPages(Math.ceil(res.total / PAGE_SIZE));
          if (res?.pages) setTotalPages(res.pages);
          if (res?.pagination?.total_pages) setTotalPages(res.pagination.total_pages);
          
          // Initialize liked state appropriately
          const currentLikes = new Set(likedIds);
          jobsList.forEach(job => {
             // Agar "saved" tabda bo'lsak u albatta liked, yoki backenddan `is_saved: true` kelsa
             if (activeTab === "saved" || job.is_saved) {
                currentLikes.add(job.id);
             }
          });
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
        <div style={{ textAlign: "center", padding: 40, color: "#888", fontSize: "1.1rem" }}>
          <div className="spinner"></div> 
          Ma'lumotlar yuklanmoqda...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-wrap">
        <div style={{ textAlign: "center", padding: 40, color: "#dc2626", background: "#fef2f2", borderRadius: "12px" }}>
          {error}
        </div>
      </div>
    );
  }

  // Backend'dan kelgan ma'lumotni ProjectCard formatiga moslashtirish
  const mappedJobs = jobs.map((job) => ({
    id: job.id,
    img: job.cover_image_url || null,
    title: job.title,
    description: job.description,
    tags: job.skills || [],
    price: job.budget_amount
      ? `${job.budget_amount.toLocaleString()} UZS` // Statically mapping it to UZS since it's an Uzbek platform
      : job.hourly_rate_min
      ? `${job.hourly_rate_min}–${job.hourly_rate_max} UZS/soat`
      : "Kelishiladi",
    type: job.type || "Fixed",
    experience: job.experience_level || "Intermediate",
    posted: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Yaqinda joylandi",
  }));

  return (
    <div className="projects-wrap">
      {mappedJobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280", background: "#f9fafb", borderRadius: "16px", border: "1px dashed #d1d5db" }}>
          Loyihalar topilmadi. Boshqa kalit so'z yoki tabni sinab ko'ring.
        </div>
      ) : (
        <div className="projects-grid">
          {mappedJobs.map((item) => (
            <ProjectCard
              key={item.id}
              img={item.img}
              title={item.title}
              description={item.description}
              tags={item.tags}
              price={item.price}
              meta={`${item.type} · ${item.experience}`}
              posted={item.posted}
              liked={likedIds.has(item.id)}
              onToggleLike={() => toggleLike(item.id)}
              onReadMore={() => window.location.href = `/jobs/${item.id}`}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pg-wrap" style={{ marginTop: "2rem" }}>
          <button className="pg-nav" onClick={goPrev} disabled={page === 1} type="button">
            ‹ Oldingi
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
            Keyingi ›
          </button>
        </div>
      )}
    </div>
  );
}
