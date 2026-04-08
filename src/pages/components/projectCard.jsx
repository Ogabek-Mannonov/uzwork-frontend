import { ThumbsDown, Heart, Maximize2 } from "lucide-react";
import "../../assets/style/projectCard.css";
import "../../assets/style/theme.css"

export default function ProjectCard({
  img,
  title,
  description,
  tags = [],
  price,
  posted = "Yaqinda joylashdi",
  meta = "Fixed · Intermediate",
  location = "O'zbekiston",
  paymentVerified = true,
  proposalsCount = "0",
  onReadMore,
  onToggleLike,
  onDislike, // Added as a prop
  liked = false,
}) {
  return (
    <article className="pc-card" onClick={onReadMore}>
      <div className="pc-top">
        <span className="pc-posted">{posted}</span>

        <div className="pc-actions">
          <button 
            className="pc-iconBtn pc-dislike" 
            type="button" 
            aria-label="Dislike" 
            onClick={(e) => {
              e.stopPropagation();
              onDislike && onDislike();
            }}
          >
            <ThumbsDown size={20} />
          </button>

          <button
            className={`pc-iconBtn pc-heart ${liked ? "is-liked" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike();
            }}
            aria-label="Like"
            type="button"
          >
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
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
          {paymentVerified && (
            <span className="pc-badge">
              <span className="pc-badgeDot">✔</span>
              To'lov tasdiqlangan
            </span>
          )}

          <span className="pc-stars">★★★★★</span>

          {price && <span className="pc-spent">{price}</span>}

          <span className="pc-loc">{location}</span>
        </div>
      </div>

      <div className="pc-footnote">Takliflar: {proposalsCount}</div>
    </article>
  );
}
