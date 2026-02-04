import "../../assets/style/projectCard.css";

export default function ProjectCard({
  img,
  title,
  description,
  tags = [],
  price,
  onReadMore,
  onToggleLike,
  liked = false,
}) {
  return (
    <div className="pc-card">
      <div className="pc-thumb">
        <img className="pc-img" src={img} alt={title} loading="lazy" />
      </div>

      <div className="pc-body">
        <h3 className="pc-title">{title}</h3>
        <p className="pc-desc">{description}</p>

        {tags?.length > 0 && (
          <div className="pc-tags">
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="pc-tag">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="pc-footer">
          <button className="pc-btn" onClick={onReadMore}>
            Batafsil
          </button>

          <div className="pc-right">
            {price && <span className="pc-price">{price}</span>}

            <button
              className={`pc-like ${liked ? "is-liked" : ""}`}
              onClick={onToggleLike}
              aria-label="Like"
              type="button"
            >
              ♥
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
