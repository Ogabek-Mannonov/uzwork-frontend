import { useMemo, useState } from "react";
import ProjectCard from "../components/projectCard";
import { projects } from "../../assets/fakeData/data";
import "../../assets/style/projectsCards.css";

export default function Projects() {
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 20;

  const list = useMemo(() => projects, []);
  const totalPages = Math.ceil(list.length / PAGE_SIZE);

  const currentItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  }, [list, page]);

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

  // Pagination raqamlar (1,2,3,...,7) ko‘rinishi uchun
  const pageItems = useMemo(() => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // Har doim: 1, 2, 3
    pages.push(1, 2, 3);

    // O'rtada ...
    if (page > 4) pages.push("dots-left");

    // O'rtadagi current page (ixtiyoriy)
    if (page > 3 && page < totalPages - 2) pages.push(page);

    // O'rtada ...
    if (page < totalPages - 3) pages.push("dots-right");

    // Har doim oxiri: totalPages
    pages.push(totalPages);

    // Dublikatlarni tozalash (masalan page=2 bo‘lsa)
    return pages.filter((v, idx, arr) => arr.indexOf(v) === idx);
  }, [page, totalPages]);

  return (
    <div className="projects-wrap">
      <div className="projects-header">
        <h2 className="projects-title">Loyihalar</h2>
      </div>

      <div className="projects-grid">
        {currentItems.map((item) => (
          <ProjectCard
            key={item.id}
            img={item.img}
            title={item.title}
            description={item.description}
            tags={item.tags}
            price={item.price}
            liked={likedIds.has(item.id)}
            onToggleLike={() => toggleLike(item.id)}
            onReadMore={() => console.log("Open details:", item.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pg-wrap">
          <button
            className="pg-nav"
            onClick={goPrev}
            disabled={page === 1}
            type="button"
          >
            ‹ Oldingisi
          </button>

          <div className="pg-pages">
            {pageItems.map((p) => {
              if (p === "dots-left" || p === "dots-right") {
                return (
                  <span key={p} className="pg-dots">
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={p}
                  className={`pg-page ${page === p ? "is-active" : ""}`}
                  onClick={() => setPage(p)}
                  type="button"
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            className="pg-nav"
            onClick={goNext}
            disabled={page === totalPages}
            type="button"
          >
            Keyingisi ›
          </button>
        </div>
      )}
    </div>
  );
}
