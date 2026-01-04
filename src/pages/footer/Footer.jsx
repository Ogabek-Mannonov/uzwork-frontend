// src/components/Footer.jsx
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "../footer/footerCss/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Top */}
        <div className="footer-top">
          <div className="footer-column">
            <h3 className="footer-title">UzWork</h3>
            <p className="footer-description">
              O'zbekistondagi eng yirik freelance platformasi. Professionallar
              va mijozlarni bir-biriga bog'laymiz.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Mijozlar uchun</h4>
            <ul className="footer-links">
              <li>
                <a href="#">Loyiha joylashtirish</a>
              </li>
              <li>
                <a href="#">Freelancer topish</a>
              </li>
              <li>
                <a href="#">Narxlar</a>
              </li>
              <li>
                <a href="#">Enterprise</a>
              </li>
              <li>
                <a href="#">Qo'llanma</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Freelancerlar uchun</h4>
            <ul className="footer-links">
              <li>
                <a href="#">Ish topish</a>
              </li>
              <li>
                <a href="#">Profil yaratish</a>
              </li>
              <li>
                <a href="#">Portfolio</a>
              </li>
              <li>
                <a href="#">Muvaffaqiyat hikoyalari</a>
              </li>
              <li>
                <a href="#">Resurslar</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Kompaniya</h4>
            <ul className="footer-links">
              <li>
                <a href="#">Biz haqimizda</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Jamoamiz</a>
              </li>
              <li>
                <a href="#">Ish o'rinlari</a>
              </li>
              <li>
                <a href="#">Aloqa</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Aloqa</h4>
            <ul className="footer-contact">
              <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>Toshkent, O'zbekiston</span>
              </li>
              <li>
                <FaPhone className="contact-icon" />
                <span>+998 90 123 45 67</span>
              </li>
              <li>
                <FaEnvelope className="contact-icon" />
                <span>info@uzwork.uz</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>&copy; 2025 UzWork. Barcha huquqlar himoyalangan.</p>
          </div>
          <div className="footer-bottom-right">
            <a href="#">Maxfiylik siyosati</a>
            <span className="separator">|</span>
            <a href="#">Foydalanish shartlari</a>
            <span className="separator">|</span>
            <a href="#">Cookie siyosati</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
