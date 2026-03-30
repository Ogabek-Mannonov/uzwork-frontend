import { useEffect, useMemo, useState } from "react";
import ProjectCard from "../components/projectCard";
import { getJobs } from "../../api/jobs";
import "../../assets/style/projectsCards.css";

export default function Projects() {
  const [jobs, setJobs] = useState([]);
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const PAGE_SIZE = 20;

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const res = await getJobs({ page, limit: PAGE_SIZE });
      if (res?.success === false) {
        setError(res?.message || "Ma'lumotlarni yuklashda xato");
      } else {
        const data = res?.data || res?.projects || res || [];
        setJobs(Array.isArray(data) ? data : []);
        if (res?.total) setTotalPages(Math.ceil(res.total / PAGE_SIZE));
        if (res?.pages) setTotalPages(res.pages);
      }
      setLoading(false);
    };
    fetchJobs();
  }, [page]);

  const toggleLike = (id) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  if (loading) {
    return (
      <div className="projects-wrap">
        <div className="projects-header">
          <h2 className="projects-title">Loyihalar</h2>
        </div>
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>Yuklanmoqda...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-wrap">
        <div className="projects-header">
          <h2 className="projects-title">Loyihalar</h2>
        </div>
        <div style={{ textAlign: "center", padding: 40, color: "#dc2626" }}>{error}</div>
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
      ? `$${job.budget_amount}`
      : job.hourly_rate_min
      ? `$${job.hourly_rate_min}–$${job.hourly_rate_max}/soat`
      : "Kelishiladi",
  }));

  return (
    <div className="projects-wrap">
      <div className="projects-header">
        <h2 className="projects-title">Loyihalar</h2>
      </div>

      {mappedJobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>Loyihalar topilmadi</div>
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
              liked={likedIds.has(item.id)}
              onToggleLike={() => toggleLike(item.id)}
              onReadMore={() => window.location.href = `/jobs/${item.id}`}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pg-wrap">
          <button className="pg-nav" onClick={goPrev} disabled={page === 1} type="button">
            ‹ Oldingisi
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
            Keyingisi ›
          </button>
        </div>
      )}
    </div>
  );
}
