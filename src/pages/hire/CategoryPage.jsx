import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./hire-css/hire-page.css";
import {
  mockCategory,
  mockFreelancers,
  mockHowItWorks,
  mockFaq,
  mockSimilar,
} from "../../api/hire/mockData.js";
import Header from "../components/header/Header.jsx";
import Footer from "../footer/Footer.jsx";

/* ================= STARS ================= */
const Stars = ({ value = 0 }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span className="uz-hire__stars" aria-label={`Reyting ${value} / 5`}>
      {"★".repeat(full)}
      {half ? "⯪" : ""}
      {"☆".repeat(empty)}
    </span>
  );
};

/* ================= CARD ================= */
const FreelancerCard = ({ f }) => {
  return (
    <article className="uz-card">
      <div className="uz-card__top">
        <img className="uz-card__avatar" src={f.avatar} alt={f.name} />
        <div className="uz-card__meta">
          <div className="uz-card__name">{f.name}</div>
          <div className="uz-card__loc">{f.location}</div>

          <div className="uz-card__row">
            <span className="uz-card__rate">${f.rate}/soat</span>
            <span className="uz-card__dot">•</span>
            <span className="uz-card__rating">
              <Stars value={f.rating} /> <b>{f.rating.toFixed(1)}</b>
            </span>
            <span className="uz-card__dot">•</span>
            <span className="uz-card__jobs">{f.jobs} ish</span>
          </div>
        </div>
      </div>

      <p className="uz-card__bio">{f.bio}</p>

      <div className="uz-card__tags">
        {f.tags.slice(0, 3).map((t) => (
          <span className="uz-tag" key={t}>
            {t}
          </span>
        ))}
      </div>

      <div className="uz-card__actions">
        <button className="uz-btn uz-btn--primary">Profilni ko'rish</button>
      </div>
    </article>
  );
};

/* ================= PAGE ================= */
export default function CategoryPage() {
  const navigate = useNavigate();
  const listRef = useRef(null);

  /* ===== SEARCH STATE ===== */
  const [query, setQuery] = useState("");

  /* ===== LOAD MORE ===== */
  const INITIAL = 6;
  const STEP = 6;

  const [visibleCount, setVisibleCount] = useState(INITIAL);
  const [locked, setLocked] = useState(false);

  /* ===== FILTER ===== */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockFreelancers;

    return mockFreelancers.filter((x) => {
      const s = `${x.name} ${x.location} ${x.bio} ${x.tags.join(" ")}`.toLowerCase();
      return s.includes(q);
    });
  }, [query]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const canLoadMore = visibleCount < filtered.length;

  const handleMore = () => {
    if (locked) {
      navigate("/signup");
      return;
    }

    if (canLoadMore) {
      const next = Math.min(visibleCount + STEP, filtered.length);
      setVisibleCount(next);
      if (next >= filtered.length) setLocked(true);
    } else {
      setLocked(true);
    }
  };

  const handleSearchGo = () => {
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* query o'zgarsa reset */
  useEffect(() => {
    setVisibleCount(INITIAL);
    setLocked(false);
  }, [query]);

  return (
    <main className="uz-hire">
      <Header />

      {/* ================= HERO ================= */}
      <section className="uz-hire__hero">
        <div className="uz-container">
          <div className="uz-hire__heroInner">
            {/* LEFT */}
            <div className="uz-hire__heroText">
              <div className="uz-hire__crumbs">
                <Link to="/">Bosh sahifa</Link>
                <span>/</span>
                <Link to="/hire">Freelancer yollash</Link>
                <span>/</span>
                <b>{mockCategory.title}</b>
              </div>

              <h1 className="uz-hire__title">{mockCategory.title}</h1>

              <div className="uz-hire__ratingLine">
                <span className="uz-hire__ratingLabel">Mijozlar reytingi</span>
                <Stars value={mockCategory.rating} />
                <b className="uz-hire__ratingValue">{mockCategory.rating}/5</b>
                <span className="uz-hire__reviews">
                  {mockCategory.reviewsCount.toLocaleString()} ta baho asosida
                </span>
              </div>

              <p className="uz-hire__desc">{mockCategory.description}</p>

              <div className="uz-hire__cta">
                <button className="uz-btn uz-btn--primary">Freelancer yollash</button>
                <button className="uz-btn uz-btn--ghost">Ish e'lon qilish</button>
              </div>

              <div className="uz-hire__trust">
                <div className="uz-trust__item">✅ Tekshirilgan profil</div>
                <div className="uz-trust__item">⚡ Tez javob</div>
                <div className="uz-trust__item">🔒 Xavfsiz to'lov</div>
              </div>
            </div>

            {/* RIGHT */}
            <aside className="uz-hire__heroBox">
              {/* ✅ SEARCH: Tezkor ko'rsatkichlar tepasida */}
              <div className="uz-hire__boxSearch">
                <div className="uz-hire__boxSearchTitle">Mutaxassis qidirish</div>

                <div className="uz-hire__boxSearchRow">
                  <input
                    className="uz-hire__boxSearchInput"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Masalan: telemarketing, sales, appointment..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearchGo();
                    }}
                  />
                  <button className="uz-hire__boxSearchBtn" onClick={handleSearchGo}>
                    Qidirish
                  </button>
                </div>

                {/* <div className="uz-hire__boxSearchHint">
                  Maslahat: “cold calling”, “B2B leads”, “appointment setting” deb yozib ko'ring.
                </div> */}
              </div>

              <div className="uz-hire__searchTitle">Tezkor ko'rsatkichlar</div>

              <div className="uz-metrics">
                <div className="uz-metric">
                  <div className="uz-metric__k">O'rtacha narx</div>
                  <div className="uz-metric__v">$7-$12/soat</div>
                </div>
                <div className="uz-metric">
                  <div className="uz-metric__k">Mavjud mutaxassislar</div>
                  <div className="uz-metric__v">120+</div>
                </div>
                <div className="uz-metric">
                  <div className="uz-metric__k">O'rtacha javob</div>
                  <div className="uz-metric__v">1 soat ichida</div>
                </div>
              </div>

              <div className="uz-hire__heroBoxCta">
                <button className="uz-btn uz-btn--primary uz-btn--full" onClick={() => navigate("/signup")}>
                  1 daqiqada boshlash
                </button>
                <div className="uz-hire__miniNote">Ro'yxatdan o'ting — ko'proq freelancer ko'rasiz</div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ================= TOP FREELANCERS ================= */}
      <section className="uz-hire__section" ref={listRef}>
        <div className="uz-container">
          <div className="uz-hire__sectionHead">
            <h2 className="uz-hire__h2">Top freelancerlar</h2>
            <div className="uz-hire__muted">
              {filtered.length} ta natija • {visible.length} tasi ko'rsatilmoqda
            </div>
          </div>

          <div className="uz-hire__grid">
            {visible.map((f) => (
              <FreelancerCard key={f.id} f={f} />
            ))}
          </div>

          <div className="uz-hire__center">
            <button className="uz-btn uz-btn--ghost" onClick={handleMore}>
              {locked ? "Ro'yxatdan o'ting — ko'proq ko'rish" : "Yana ko'rsatish"}
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="uz-hire__section uz-hire__section--soft">
        <div className="uz-container">
          <div className="uz-hire__headRow">
            <h2 className="uz-hire__h2">Qanday ishlaydi?</h2>
          </div>

          <div className="uz-hire__steps">
            {mockHowItWorks.map((s) => (
              <div className="uz-step" key={s.title}>
                <div className="uz-step__icon" />
                <div className="uz-step__title">{s.title}</div>
                <div className="uz-step__desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="uz-hire__section">
        <div className="uz-container">
          <h2 className="uz-hire__h2">Nega Uzwork?</h2>

          <div className="uz-why">
            <div className="uz-why__card">
              <h3>Yuqori sifat</h3>
              <p>Reyting va tajriba bo'yicha saralangan mutaxassislar.</p>
            </div>
            <div className="uz-why__card">
              <h3>Xavfsiz hamkorlik</h3>
              <p>Platforma ichida chat, fayl almashish va kuzatuv.</p>
            </div>
            <div className="uz-why__card">
              <h3>Tez start</h3>
              <p>Kerakli freelancer topish va ishni boshlash juda oson.</p>
            </div>
          </div>
        </div>
      </section>

      {/* INFO */}
      <section className="uz-hire__section uz-hire__section--soft">
        <div className="uz-container">
          <h2 className="uz-hire__h2">Cold caller kim va nima qiladi?</h2>
          <p className="uz-hire__p">
            Cold caller — bu potensial mijozlarga qo'ng'iroq qilib, mahsulot yoki xizmatni tanishtiradigan
            va lead’larni saralab beradigan mutaxassis. Ular savdo jarayonini tezlashtiradi va uchrashuvlar
            (appointment) belgilashda yordam beradi.
          </p>

          <ul className="uz-hire__list">
            <li>Lead generation va saralash</li>
            <li>Appointment setting va follow-up</li>
            <li>CRM yangilash va hisobot</li>
            <li>Scriptni yaxshilash va objection handling</li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="uz-hire__section">
        <div className="uz-container">
          <h2 className="uz-hire__h2">Ko'p so'raladigan savollar</h2>

          <div className="uz-faq">
            {mockFaq.map((item, idx) => (
              <details className="uz-faq__item" key={idx}>
                <summary className="uz-faq__q">{item.q}</summary>
                <div className="uz-faq__a">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SIMILAR */}
      <section className="uz-hire__section uz-hire__section--soft">
        <div className="uz-container">
          <h2 className="uz-hire__h2">Yana boshqa yo'nalishlar</h2>

          <div className="uz-similar">
            {mockSimilar.map((x) => (
              <Link className="uz-similar__link" key={x.slug} to={x.slug}>
                {x.label} <span className="uz-similar__arrow">→</span>
              </Link>
            ))}
          </div>

          <div className="uz-hire__finalCta">
            <div className="uz-hire__finalText">
              <h3>Ishni bugunoq boshlaymizmi?</h3>
              <p>1 daqiqada ro'yxatdan o'ting va freelancerlar bilan bog'laning.</p>
            </div>
            <button className="uz-btn uz-btn--primary" onClick={() => navigate("/signup")}>
              Ro'yxatdan o'tish
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}