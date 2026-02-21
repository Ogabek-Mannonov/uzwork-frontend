import "../../assets/style/projectCard.css";
import "../../assets/style/theme.css"

export default function ProjectCard({
  img, // ixtiyoriy (rasmda yo'q, xohlasangiz olib tashlaysiz)
  title,
  description,
  tags = [],
  price,
  posted = "Posted yesterday",
  meta = "Hourly · Intermediate · Est. Time: Less than 1 week, Less than 30 hrs/week",
  onReadMore,
  onToggleLike,
  liked = false,
}) {
  return (
    <article className="pc-card">
      <div className="pc-top">
        <span className="pc-posted">{posted}</span>

        <div className="pc-actions">
          <button className="pc-iconBtn" type="button" aria-label="Action">
            ⛶
          </button>

          <button
            className={`pc-iconBtn pc-heart ${liked ? "is-liked" : ""}`}
            onClick={onToggleLike}
            aria-label="Like"
            type="button"
          >
            ♥
          </button>
        </div>
      </div>

      <h3 className="pc-title">{title}</h3>
      <p className="pc-meta">{meta}</p>

      <p className="pc-desc">{description}</p>

      {tags?.length > 0 && (
        <div className="pc-tags">
          {tags.slice(0, 4).map((t) => (
            <span key={t} className="pc-tag">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="pc-bottom">
        <div className="pc-bottomLeft">
          <span className="pc-badge">
            <span className="pc-badgeDot">✔</span>
            Payment verified
          </span>

          <span className="pc-stars">★★★★★</span>

          {price && <span className="pc-spent">{price}</span>}

          <span className="pc-loc">Germany</span>
        </div>

        <button className="pc-btn" onClick={onReadMore} type="button">
          Batafsil
        </button>
      </div>

      <div className="pc-footnote">Proposals: 50+</div>
    </article>
  );
}
