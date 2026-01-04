import React from "react";
import { Link } from "react-router-dom";
import "./infocss/info.css";
import Footer from "../footer/Footer";
const Info = () => {
  return (
    <div className="info-container">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">UZWORK</div>
        <div className="nav-actions">
          <Link to="/login" className="nav-link">Kirish</Link>
          <Link to="/signup" className="nav-btn">Ro'yxatdan o'tish</Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero-bg">
        <div className="hero-overlay"></div>
        <div className="hero-content fade-in">
          <h1>Millionlab professional frilanserlarni toping</h1>
          <p>Mahalliy va global mutaxassislar bilan ishlash uchun yagona platforma</p>

          <div className="hero-search">
            <input placeholder="Masalan: Web developer, Designer, AI engineer" />
            <button>Qidirish</button>
          </div>
        </div>
      </header>

      {/* TRUST */}
      <section className="trust fade-in">
        <div className="trust-container">
          <h6 className="trust-title">
            1,000,000+ foydalanuvchi UZWORK ga ishonadi
          </h6>
          <div className="trust-stats">
            <div className="trust-stat">
              <h3>4.9★</h3>
              <p>O'rtacha reyting</p>
            </div>
            <div className="trust-stat">
              <h3>1M+</h3>
              <p>Faol foydalanuvchi</p>
            </div>
            <div className="trust-stat">
              <h3>100K+</h3>
              <p>Kompaniyalar</p>
            </div>
            <div className="trust-stat">
              <h3>24/7</h3>
              <p>Qo'llab-quvvatlash</p>
            </div>
          </div>

          <div className="trust-logos">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Apple_logo_grey.svg" alt="Apple" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories">
        <h2>Eng mashhur kategoriyalar</h2>
        <p className="categories-subtitle">
          Har bir soha uchun tasdiqlangan frilanserlar
        </p>

        <div className="categories-grid">
          {[
            ["🤖", "AI Services", "Chatbot, ML, Automation", "12,000+"],
            ["💻", "Development & IT", "Web, Mobile, Backend", "25,000+"],
            ["🎨", "Design & Creative", "UI/UX, Logo, Branding", "18,000+"],
            ["📈", "Sales & Marketing", "SEO, SMM, Ads", "9,500+"],
          ].map((c, i) => (
            <div className="category-card" key={i}>
              <div className="card-icon">{c[0]}</div>
              <h3>{c[1]}</h3>
              <p>{c[2]}</p>
              <span className="card-meta">{c[3]} frilanser</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2>Nega UZWORK?</h2>
        <p className="features-subtitle">
          Freelancer topishning eng ishonchli va tezkor yo‘li
        </p>

        <div className="features-grid">
          {[
            ["🔐", "Xavfsiz to'lov", "Ish tasdiqlangach mablag' o'tkaziladi"],
            ["🤖", "AI Matching", "Eng mos mutaxassislar avtomatik tanlanadi"],
            ["⚡", "Tez hiring", "Bir necha daqiqada mutaxassis toping"],
            ["🌍", "Global mutaxassislar", "Dunyo bo'ylab professional frilanserlar"],
          ].map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f[0]}</div>
              <h3>{f[1]}</h3>
              <p>{f[2]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing">
        <h2>Rejalarni solishtiring</h2>
        <p className="pricing-subtitle">
          Loyihangiz hajmiga mos tarifni tanlang
        </p>

        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Basic</h3>
            <div className="price">5% <span>xizmat haqi</span></div>
            <ul>
              <li>✔ AI funksiyalar</li>
              <li>✔ Loyihani boshqarish</li>
              <li>✔ Ish tugagach to'lov</li>
            </ul>
            <Link to="/signup" className="pricing-btn outline">Boshlash</Link>
          </div>

          <div className="pricing-card popular">
            <span className="badge">POPULAR</span>
            <h3>Business Plus</h3>
            <div className="price">10% <span>xizmat haqi</span></div>
            <ul>
              <li>✔ Top 1% frilanserlar</li>
              <li>✔ Shaxsiy recruiter</li>
              <li>✔ Team management</li>
            </ul>
            <Link to="/signup" className="pricing-btn filled">Boshlash</Link>
          </div>
        </div>
      </section>
      {/* Footer Part */}
      <Footer/>
    </div>
  );
};

export default Info;
