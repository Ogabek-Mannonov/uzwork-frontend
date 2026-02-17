import React, { useState } from "react";
import {
  Star,
  Edit,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  Globe,
  Download,
  Share2,
  Moon,
  Sun,
  Check,
  ChevronDown,
  ChevronUp,
  Users,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Code,
  Palette
} from "lucide-react";
import "./profile-css/profile.css";

const Profile = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);
  const [isEditing, setIsEditing] = useState({
    personal: false,
    bio: false,
    projects: false
  });
  
  const [profileData, setProfileData] = useState({
    name: "Muhammadali",
    username: "@BeMOre",
    email: "muhammadali@example.com",
    phone: "+998 99 123 45 67",
    location: "Toshkent, Uzbekistan",
    birthDate: "15 Yanvar, 1995",
    languages: "O'zbek, Ingliz, Rus",
    experience: "5+ yil",
    specialization: "Web & Mobile Designer",
    bio: "Salom! Men Muhammadali, web-dizayn va mobil ilovalar bilan shug'ullanaman. 5 yildan ortiq tajribaga egaman. Dizayn asoslarini chuqur bilishim, zamonaviy trendlarga moslashuvchanligim va mijozlar ehtiyojlarini tushunishim mening asosiy afzalliklarimdir.",
    rating: 5.0,
    reviews: 125
  });

  const bioFull = `Salom! Men Muhammadali, web-dizayn va mobil ilovalar bilan shug'ullanaman. 5 yildan ortiq tajribaga egaman. Dizayn asoslarini chuqur bilishim, zamonaviy trendlarga moslashuvchanligim va mijozlar ehtiyojlarini tushunishim mening asosiy afzalliklarimdir.

Mening ishimda men har bir loyiha uchun noyob yondashuvni qo'llayman, foydalanuvchi tajribasiga alohida e'tibor beraman va zamonaviy texnologiyalardan samarali foydalanaman. Jamoaviy ishlash qobiliyatim yuqori, vaqtni boshqarishda aniq va mas'uliyatli yondashuvga egaman.`;

  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "E-commerce Dashboard",
      progress: 85,
      deadline: "2024-12-15",
      team: 4,
      color: "#3B82F6"
    },
    {
      id: 2,
      name: "Mobile Banking App",
      progress: 70,
      deadline: "2024-11-30",
      team: 6,
      color: "#10B981"
    },
    {
      id: 3,
      name: "Portfolio Website",
      progress: 95,
      deadline: "2024-10-20",
      team: 2,
      color: "#8B5CF6"
    }
  ]);

  const stats = [
    { 
      id: 1, 
      title: "BUYURTMA", 
      value: "5.7K", 
      trend: "+12%",
      trendUp: true,
      icon: <TrendingUp size={20} />
    },
    { 
      id: 2, 
      title: "LOYIHA", 
      value: "12", 
      trend: "+3",
      trendUp: true,
      icon: <Target size={20} />
    }
  ];

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProjectProgress = (id, value) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, progress: Math.min(100, Math.max(0, value)) } : project
    ));
  };

  const handleSave = (type) => {
    setIsEditing(prev => ({ ...prev, [type]: false }));
    console.log(`${type} saved:`, profileData);
  };

  return (
    <div className={`profile-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      
      {/* HEADER */}
      <header className="profile-header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-text">Profile</span>
            <span className="logo-dot">.</span>
          </h1>
          
          <div className="header-controls">
            <div className="theme-switch">
              <button 
                className={`theme-btn ${darkMode ? 'active' : ''}`}
                onClick={() => setDarkMode(true)}
              >
                <Moon size={18} />
                Dark
              </button>
              <button 
                className={`theme-btn ${!darkMode ? 'active' : ''}`}
                onClick={() => setDarkMode(false)}
              >
                <Sun size={18} />
                Light
              </button>
            </div>
            
            <div className="header-buttons">
              <button className="header-btn share-btn">
                <Share2 size={18} />
                <span>Ulashish</span>
              </button>
              <button className="header-btn download-btn">
                <Download size={18} />
                <span>CV Yuklash</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="profile-main">
        
        {/* LEFT SIDE - PROFILE & BIO & EQUAL CARDS */}
        <div className="left-column">
          {/* MAIN PROFILE CARD */}
          <div className="card profile-card">
            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                <img
                  src="https://i.pravatar.cc/300"
                  alt="Profile"
                  className="profile-avatar"
                />
                <button 
                  className="avatar-edit-btn"
                  onClick={() => setIsEditing(prev => ({ ...prev, personal: true }))}
                >
                  <Edit size={14} />
                </button>
              </div>
              
              <div className="profile-info">
                <h2 className="profile-name">{profileData.name}</h2>
                <p className="profile-username">{profileData.username}</p>
                
                <div className="specialization">
                  <Briefcase size={16} />
                  <span>{profileData.specialization}</span>
                </div>
                
                <div className="rating-section">
                  <div className="stars">
                    <Star size={20} className="star filled" />
                    <Star size={20} className="star filled" />
                    <Star size={20} className="star filled" />
                    <Star size={20} className="star filled" />
                    <Star size={20} className="star" />
                  </div>
                  <div className="rating-details">
                    <span className="rating-value">{profileData.rating.toFixed(1)}</span>
                    <span className="rating-divider">|</span>
                    <span className="rating-count">{profileData.reviews} ta baho</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BIOGRAPHY CARD */}
          <div className="card bio-card">
            <div className="card-header">
              <h3 className="card-title">Biografiya</h3>
              <button 
                className="edit-icon-btn"
                onClick={() => setIsEditing(prev => ({ ...prev, bio: !prev.bio }))}
              >
                <Edit size={18} />
              </button>
            </div>
            
            <div className="bio-content">
              {isEditing.bio ? (
                <textarea
                  className="bio-edit-input"
                  value={showFullBio ? bioFull : profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows="5"
                  placeholder="Biografiyani kiriting..."
                />
              ) : (
                <>
                  <div className="bio-text">
                    <p>{showFullBio ? bioFull : profileData.bio}</p>
                  </div>
                  
                  <button 
                    className="show-more-btn"
                    onClick={() => setShowFullBio(!showFullBio)}
                  >
                    {showFullBio ? (
                      <>
                        <ChevronUp size={16} />
                        Kamroq ko'rsatish
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        Batafsil ko'rsatish
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
            
            {isEditing.bio && (
              <div className="edit-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setIsEditing(prev => ({ ...prev, bio: false }))}
                >
                  Bekor qilish
                </button>
                <button 
                  className="save-btn"
                  onClick={() => handleSave('bio')}
                >
                  <Check size={18} />
                  Saqlash
                </button>
              </div>
            )}
          </div>

          {/* EQUAL HEIGHT CARDS CONTAINER */}
          <div className="equal-cards-container">
            {/* SKILLS CARD */}
            <div className="card equal-card skills-card">
              <div className="card-header">
                <h3 className="card-title">Ko'nikmalar</h3>
                <div className="skill-percentage">95%</div>
              </div>
              
              <div className="skills-grid">
                <div className="skill-item">
                  <div className="skill-info">
                    <span className="skill-name">UI/UX Dizayn</span>
                    <span className="skill-percent">95%</span>
                  </div>
                  <div className="skill-progress">
                    <div className="progress-fill" style={{ width: '95%', background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }}></div>
                  </div>
                </div>
                
                <div className="skill-item">
                  <div className="skill-info">
                    <span className="skill-name">Web Development</span>
                    <span className="skill-percent">85%</span>
                  </div>
                  <div className="skill-progress">
                    <div className="progress-fill" style={{ width: '85%', background: 'linear-gradient(90deg, #10B981, #3B82F6)' }}></div>
                  </div>
                </div>
                
                <div className="skill-item">
                  <div className="skill-info">
                    <span className="skill-name">Mobile Design</span>
                    <span className="skill-percent">92%</span>
                  </div>
                  <div className="skill-progress">
                    <div className="progress-fill" style={{ width: '92%', background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }}></div>
                  </div>
                </div>
                
                <div className="skill-item">
                  <div className="skill-info">
                    <span className="skill-name">Team Leadership</span>
                    <span className="skill-percent">88%</span>
                  </div>
                  <div className="skill-progress">
                    <div className="progress-fill" style={{ width: '88%', background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACHIEVEMENTS CARD */}
            <div className="card equal-card achievements-card">
              <div className="card-header">
                <h3 className="card-title">Yutuqlar</h3>
                <div className="badge-count">5</div>
              </div>
              
              <div className="badges-grid">
                <div className="badge-item">
                  <div className="badge-icon gold">
                    <span>🏆</span>
                  </div>
                  <div className="badge-info">
                    <span className="badge-title">Eng yaxshi dizayner</span>
                    <span className="badge-year">2023</span>
                  </div>
                </div>
                
                <div className="badge-item">
                  <div className="badge-icon silver">
                    <span>🥈</span>
                  </div>
                  <div className="badge-info">
                    <span className="badge-title">Innovatsion yechim</span>
                    <span className="badge-year">2022</span>
                  </div>
                </div>
                
                <div className="badge-item">
                  <div className="badge-icon bronze">
                    <span>🥉</span>
                  </div>
                  <div className="badge-info">
                    <span className="badge-title">Mijoz mamnuniyati</span>
                    <span className="badge-year">2023</span>
                  </div>
                </div>
                
                <div className="badge-item">
                  <div className="badge-icon blue">
                    <span>🚀</span>
                  </div>
                  <div className="badge-info">
                    <span className="badge-title">Tez o'zlashtirish</span>
                    <span className="badge-year">2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - PROJECTS & STATS */}
        <div className="right-column">
          {/* PROJECTS CARD */}
          <div className="card projects-card">
            <div className="card-header">
              <h3 className="card-title">Joriy loyihalar</h3>
              <div className="project-header-right">
                <span className="project-count">{projects.length} ta loyiha</span>
                <button 
                  className="edit-icon-btn"
                  onClick={() => setIsEditing(prev => ({ ...prev, projects: !prev.projects }))}
                >
                  <Edit size={18} />
                </button>
              </div>
            </div>
            
            <div className="projects-list">
              {projects.map(project => (
                <div key={project.id} className="project-item">
                  <div className="project-main">
                    <h4 className="project-name">{project.name}</h4>
                    <div className="project-dates">
                      <span className="project-deadline">{project.deadline}</span>
                    </div>
                    
                    <div className="project-progress-section">
                      <div className="progress-info">
                        <span className="progress-value">{project.progress}%</span>
                        {isEditing.projects && (
                          <div className="progress-controls">
                            <button 
                              className="progress-btn minus"
                              onClick={() => handleProjectProgress(project.id, project.progress - 5)}
                            >
                              -
                            </button>
                            <button 
                              className="progress-btn plus"
                              onClick={() => handleProjectProgress(project.id, project.progress + 5)}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${project.progress}%`,
                            background: project.color
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="project-team">
                    <Users size={16} />
                    <span>{project.team} kishi</span>
                  </div>
                </div>
              ))}
            </div>
            
            {isEditing.projects && (
              <div className="edit-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setIsEditing(prev => ({ ...prev, projects: false }))}
                >
                  Bekor qilish
                </button>
                <button 
                  className="save-btn"
                  onClick={() => handleSave('projects')}
                >
                  <Check size={18} />
                  Saqlash
                </button>
              </div>
            )}
          </div>

          {/* STATS CARDS */}
          <div className="stats-container">
            {stats.map(stat => (
              <div key={stat.id} className="card stat-card">
                <div className="stat-header">
                  <h3 className="stat-title">{stat.title}</h3>
                  <div className={`stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
                    {stat.icon}
                    <span>{stat.trend}</span>
                  </div>
                </div>
                
                <div className="stat-content">
                  <span className="stat-value">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* PERSONAL INFO CARD */}
          <div className="card info-card">
            <div className="card-header">
              <h3 className="card-title">Ma'lumotlar</h3>
              <button 
                className="edit-icon-btn"
                onClick={() => setIsEditing(prev => ({ ...prev, personal: !prev.personal }))}
              >
                <Edit size={18} />
              </button>
            </div>
            
            <div className="info-grid">
              <div className="info-row">
                <div className="info-icon">
                  <Mail size={16} />
                </div>
                <div className="info-content">
                  {isEditing.personal ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span className="info-value">{profileData.email}</span>
                  )}
                </div>
              </div>
              
              <div className="info-row">
                <div className="info-icon">
                  <Phone size={16} />
                </div>
                <div className="info-content">
                  {isEditing.personal ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span className="info-value">{profileData.phone}</span>
                  )}
                </div>
              </div>
              
              <div className="info-row">
                <div className="info-icon">
                  <MapPin size={16} />
                </div>
                <div className="info-content">
                  {isEditing.personal ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span className="info-value">{profileData.location}</span>
                  )}
                </div>
              </div>
              
              <div className="info-row">
                <div className="info-icon">
                  <Calendar size={16} />
                </div>
                <div className="info-content">
                  {isEditing.personal ? (
                    <input
                      type="text"
                      value={profileData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span className="info-value">{profileData.birthDate}</span>
                  )}
                </div>
              </div>
              
              <div className="info-row">
                <div className="info-icon">
                  <Globe size={16} />
                </div>
                <div className="info-content">
                  {isEditing.personal ? (
                    <input
                      type="text"
                      value={profileData.languages}
                      onChange={(e) => handleInputChange('languages', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span className="info-value">{profileData.languages}</span>
                  )}
                </div>
              </div>
              
              <div className="info-row">
                <div className="info-icon">
                  <Zap size={16} />
                </div>
                <div className="info-content">
                  {isEditing.personal ? (
                    <input
                      type="text"
                      value={profileData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    <span className="info-value">{profileData.experience}</span>
                  )}
                </div>
              </div>
            </div>
            
            {isEditing.personal && (
              <div className="edit-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setIsEditing(prev => ({ ...prev, personal: false }))}
                >
                  Bekor qilish
                </button>
                <button 
                  className="save-btn"
                  onClick={() => handleSave('personal')}
                >
                  <Check size={18} />
                  Saqlash
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;