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
import { useTranslation } from "react-i18next";
import "./footerCss/footer.css";

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-column">
            <h3 className="footer-title">UzWork</h3>
            <p className="footer-description">{t("footer.desc")}</p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" className="social-link" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" className="social-link" aria-label="LinkedIn"><FaLinkedinIn /></a>
              <a href="#" className="social-link" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" className="social-link" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">{t("footer.forClients")}</h4>
            <ul className="footer-links">
              <li><a href="#">{t("footer.postProject")}</a></li>
              <li><a href="#">{t("footer.findFreelancer")}</a></li>
              <li><a href="#">{t("footer.pricing")}</a></li>
              <li><a href="#">{t("footer.enterprise")}</a></li>
              <li><a href="#">{t("footer.guide")}</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">{t("footer.forFreelancers")}</h4>
            <ul className="footer-links">
              <li><a href="#">{t("footer.findWork")}</a></li>
              <li><a href="#">{t("footer.createProfile")}</a></li>
              <li><a href="#">{t("footer.portfolio")}</a></li>
              <li><a href="#">{t("footer.successStories")}</a></li>
              <li><a href="#">{t("footer.resources")}</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">{t("footer.company")}</h4>
            <ul className="footer-links">
              <li><a href="#">{t("footer.aboutUs")}</a></li>
              <li><a href="#">{t("footer.blog")}</a></li>
              <li><a href="#">{t("footer.team")}</a></li>
              <li><a href="#">{t("footer.jobs")}</a></li>
              <li><a href="#">{t("footer.contact")}</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">{t("footer.contact")}</h4>
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

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>{t("footer.copyright")}</p>
          </div>
          <div className="footer-bottom-right">
            <a href="#">{t("footer.privacy")}</a>
            <span className="separator">|</span>
            <a href="#">{t("footer.terms")}</a>
            <span className="separator">|</span>
            <a href="#">{t("footer.cookies")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
