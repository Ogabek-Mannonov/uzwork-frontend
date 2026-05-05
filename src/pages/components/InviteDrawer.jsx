import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import InviteForm from "./InviteForm";
import "../../assets/style/InviteDrawer.css";

export default function InviteDrawer({ isOpen, onClose, freelancer, onInviteSuccess }) {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        document.body.style.overflow = "unset";
      }, 400);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div className={`id-overlay ${isOpen ? "is-open" : ""}`} onClick={onClose}>
      <div className={`id-drawer ${isOpen ? "is-open" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="id-header">
          <button className="id-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
          <h2>{t("findTalent.drawer.title", "Ishga taklif qilish")}</h2>
        </div>

        <div className="id-content-wrapper">
          <InviteForm 
            freelancer={freelancer} 
            onInviteSuccess={(name, success) => {
              onInviteSuccess(name, success);
              if (success) onClose();
            }}
            onBack={onClose}
          />
        </div>
      </div>
    </div>
  );
}
