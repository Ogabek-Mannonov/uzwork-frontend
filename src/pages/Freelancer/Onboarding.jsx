import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  FaRocket, 
  FaArrowRight, 
  FaArrowLeft, 
  FaCheckCircle, 
  FaTimes, 
  FaDollarSign,
  FaMapMarkerAlt
} from "react-icons/fa";
import { getCategories, updateMyProfile } from "../../api/profile";
import "./onboarding.css";

const Onboarding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    category_id: null,
    title: "",
    bio: "",
    hourly_rate: "",
    location: "",
    skills: [],
  });
  
  const [skillInput, setSkillInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const commonSkills = [
    "JavaScript", "TypeScript", "React", "Node.js", "Python", "Django", "Flask", 
    "Java", "Spring Boot", "C#", ".NET", "PHP", "Laravel", "Swift", "Kotlin", 
    "Flutter", "React Native", "Vue.js", "Angular", "Next.js", "Express.js",
    "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Azure",
    "Figma", "Adobe Photoshop", "Adobe Illustrator", "After Effects", "Premiere Pro",
    "UI Design", "UX Design", "Copywriting", "SEO", "SMM", "Google Ads",
    "English", "Russian", "Uzbek", "Excel", "Data Entry", "Project Management"
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Categories fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleCategorySelect = (id) => {
    setFormData({ ...formData, category_id: id });
  };

  const handleSkillInput = (e) => {
    const value = e.target.value;
    setSkillInput(value);
    if (value.trim()) {
      const filtered = commonSkills.filter(s => 
        s.toLowerCase().includes(value.toLowerCase()) && 
        !formData.skills.includes(s)
      ).slice(0, 8);
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addSkill = (skill) => {
    if (!formData.skills.includes(skill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill]
      });
    }
    setSkillInput("");
    setShowSuggestions(false);
  };

  const handleSkillAdd = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      addSkill(skillInput.trim());
      e.preventDefault();
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return !!formData.category_id;
      case 2: return formData.title.trim().length >= 5 && formData.location.trim().length >= 3;
      case 3: return formData.bio.trim().length >= 20;
      case 4: return formData.skills.length >= 3;
      case 5: return !!formData.hourly_rate && Number(formData.hourly_rate) > 0;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const res = await updateMyProfile(formData);
      if (res.success) {
        // IMPORTANT: Update local user data to prevent ProtectedRoute redirect loop
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { 
          ...user, 
          category_id: formData.category_id,
          title: formData.title,
          location: formData.location 
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Use window.location as a fail-safe to ensure full state reset if needed, 
        // but navigate should work if ProtectedRoute sees the new localStorage
        navigate("/find-work");
      }
    } catch (err) {
      console.error("Onboarding submit error:", err);
    } finally {
      setSaving(false);
    }
  };

  const progress = (step / 5) * 100;

  return (
    <div className="onboarding-shell">
      <nav className="onboarding-nav">
        <div className="onboarding-logo">UzWork</div>
        <div className="onboarding-progress-container">
          <div className="onboarding-progress-bar">
            <div 
              className="onboarding-progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="onboarding-exit">
           <button className="onboarding-exit-btn" onClick={() => {
             localStorage.clear();
             navigate("/login");
           }}>
             {t("common.logout", "Chiqish")}
           </button>
        </div>
      </nav>

      <main className="onboarding-main">
        <div className="onboarding-card soft-fade-in" key={step}>
          
          <div className="onboarding-step-indicator">
             {t("onboarding.step", "Bosqich")} {step} / 5
          </div>

          {step === 1 && (
            <div className="onboarding-content">
              <h1 className="onboarding-title">
                {t("onboarding.welcomeTitle", "Hush kelibsiz! Platformaga kirish uchun oz qoldi.")}
              </h1>
              <p className="onboarding-subtitle">
                {t("onboarding.welcomeDesc", "Sizning sohangiz nima? Biz sizga mos ishlarni topishimiz uchun asosiy yo'nalishingizni tanlang.")}
              </p>
              
              <div className="category-grid">
                {loading ? (
                  <div className="onboarding-loading">{t("common.loading", "Yuklanmoqda...")}</div>
                ) : categories.length === 0 ? (
                  <div className="onboarding-no-data">
                    <p>{t("onboarding.noCategories", "Kategoriyalar topilmadi.")}</p>
                    <button className="btn-secondary" onClick={fetchCategories} style={{ marginTop: 12 }}>
                      {t("common.retry", "Qayta urinish")}
                    </button>
                  </div>
                ) : (
                  categories.map(cat => (
                    <div 
                      key={cat.id} 
                      className={`category-item ${formData.category_id === cat.id ? 'selected' : ''}`}
                      onClick={() => handleCategorySelect(cat.id)}
                    >
                      <h4>{cat.name}</h4>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-content">
              <h1 className="onboarding-title">
                {t("onboarding.professionalInfo", "Professional sarlavha va ma'lumot")}
              </h1>
              <p className="onboarding-subtitle">
                {t("onboarding.titleDesc", "Sizni mijozlar qanday ko'rishini istaysiz? Masalan: Senior React Developer yoki Pro Graphic Designer.")}
              </p>
              
              <div className="onboarding-input-group">
                <label className="onboarding-label">{t("profile.title", "Sarlavha")}</label>
                <input 
                  className="onboarding-input"
                  placeholder="Senior JavaScript Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="onboarding-input-group">
                <label className="onboarding-label">{t("profile.location", "Manzil")}</label>
                <div style={{ position: 'relative' }}>
                   <FaMapMarkerAlt style={{ position: 'absolute', left: 16, top: 18, color: 'var(--muted)' }} />
                   <input 
                    className="onboarding-input"
                    placeholder="Tashkent, Uzbekistan"
                    style={{ paddingLeft: 44 }}
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="onboarding-content">
              <h1 className="onboarding-title">
                {t("onboarding.bioTitle", "O'zingiz haqida yozing")}
              </h1>
              <p className="onboarding-subtitle">
                {t("onboarding.bioDesc", "Tajribangiz, yutuqlaringiz va mijozlarga qanday yordam bera olishingiz haqida qisqacha ma'lumot bering.")}
              </p>
              
              <div className="onboarding-input-group">
                <textarea 
                  className="onboarding-input onboarding-textarea"
                  placeholder={t("profile.bioPlaceholder", "Men 5 yillik tajribaga ega Web Developer...")}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="onboarding-content">
              <h1 className="onboarding-title">
                {t("onboarding.skillsTitle", "Ko'nikmalaringizni qo'shing")}
              </h1>
              <p className="onboarding-subtitle">
                {t("onboarding.skillsDesc", "Siz yaxshi biladigan texnologiyalar yoki ko'nikmalarni yozing (kamida 3 ta).")}
              </p>
              
              <div className="skills-input-wrapper" style={{ position: 'relative' }}>
                <input 
                  className="onboarding-input"
                  placeholder={t("profile.addSkillPlaceholder", "Ko'nikma kiriting va Enter bosing")}
                  value={skillInput}
                  onChange={handleSkillInput}
                  onKeyDown={handleSkillAdd}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="skills-suggestions">
                    {filteredSuggestions.map((s, i) => (
                      <div 
                        key={i} 
                        className="suggestion-item"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevents blur before click
                          addSkill(s);
                        }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="skills-tags">
                {formData.skills.map(skill => (
                  <div key={skill} className="skill-tag">
                    {skill}
                    <FaTimes className="skill-remove" onClick={() => removeSkill(skill)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="onboarding-content">
              <h1 className="onboarding-title">
                {t("onboarding.rateTitle", "Soatlik ish haqingiz")}
              </h1>
              <p className="onboarding-subtitle">
                {t("onboarding.rateDesc", "Sizning bir soatlik xizmatingiz necha pul turadi? Buni istalgan vaqtda keyinroq o'zgartirishingiz mumkin.")}
              </p>
              
              <div className="onboarding-input-group">
                <label className="onboarding-label">{t("profile.hourlyRate", "Soatlik stavka ($/hr)")}</label>
                <div style={{ position: 'relative' }}>
                   <FaDollarSign style={{ position: 'absolute', left: 16, top: 18, color: 'var(--muted)' }} />
                   <input 
                    type="number"
                    className="onboarding-input"
                    placeholder="20"
                    style={{ paddingLeft: 44 }}
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ marginTop: 40, padding: 32, background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                 <FaCheckCircle size={48} color="var(--brand)" style={{ marginBottom: 16 }} />
                 <h3 style={{ marginBottom: 8 }}>{t("onboarding.ready", "Tayyormisiz?")}</h3>
                 <p style={{ color: 'var(--muted)' }}>
                    {t("onboarding.readyDesc", "Siz UzWork hamjamiyatiga qo'shilishga tayyorsiz. Ma'lumotlarni tasdiqlash uchun pastdagi tugmani bosing.")}
                 </p>
              </div>
            </div>
          )}

          <footer className="onboarding-footer">
            {step > 1 ? (
              <button className="btn-secondary" onClick={prevStep}>
                <FaArrowLeft /> {t("common.back", "Orqaga")}
              </button>
            ) : <div />}

            {step < 5 ? (
              <button 
                className="btn-primary" 
                onClick={nextStep}
                disabled={!isStepValid()}
              >
                {t("common.next", "Keyingisi")} <FaArrowRight />
              </button>
            ) : (
              <button 
                className="btn-primary" 
                onClick={handleSubmit}
                disabled={saving || !isStepValid()}
              >
                {saving ? t("common.saving", "Saqlanmoqda...") : t("onboarding.finish", "Tugallash")} <FaRocket />
              </button>
            )}
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
