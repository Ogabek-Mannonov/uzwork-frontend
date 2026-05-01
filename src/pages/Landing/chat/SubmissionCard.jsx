import React from 'react';
import { FileText, CheckCircle, Clock, ExternalLink, AlertCircle, Download } from 'lucide-react';
import i18n from '../../../i18n';
import { useTranslation } from 'react-i18next';

const BACKEND = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/api\/?$/, "");

function getFullUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND}${cleanUrl}`;
}

const SubmissionCard = ({ msg, isOwn, onApprove, onReject, isApproving, isRejecting, currentUser, onMediaClick }) => {
  const { t } = useTranslation();
  const metadata = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : (msg.metadata || {});
  const { description, files = [], milestone_id, status = 'pending' } = metadata;
  
  const statusConfig = {
    submitted: { label: t("chat.submitted", "Submitted"), color: '#3b82f6', icon: <Clock size={16} /> },
    pending: { label: t("chat.pending", "Pending"), color: '#f59e0b', icon: <Clock size={16} /> },
    approved: { label: t("chat.approved", "Approved"), color: '#10b981', icon: <CheckCircle size={16} /> },
    rejected: { 
      label: isOwn 
        ? t("chat.revisionRequested", "Revision Requested") 
        : t("chat.workReturned", "Work Returned"), 
      color: '#ef4444', 
      icon: <AlertCircle size={16} /> 
    }
  };
  
  const currentStatus = statusConfig[status] || statusConfig.submitted;

    const handleDownload = async (url, fileName) => {
      if (!url) return;
      try {
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName || url.split("/").pop() || "file";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Download error, falling back to direct link:", error);
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.download = fileName || "";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    return (
      <div className={`submission-card ${isOwn ? 'own' : ''}`}>
        <div className="submission-header">
          <div className="submission-icon-circle">
            <FileText size={24} />
          </div>
          <div className="submission-header-info">
            <h4 className="submission-label">
              {status === 'rejected' 
                ? currentStatus.label 
                : t("chat.workSubmitted", "Work Submitted")}
            </h4>
            <div className="submission-status" style={{ color: currentStatus.color }}>
              {currentStatus.icon}
              <span>{currentStatus.label}</span>
            </div>
          </div>
        </div>
        
        <div className="submission-content">
          <div className="submission-description">
            {description}
          </div>
          
          {files && files.length > 0 && (
            <div className="submission-attachments">
              <div className="attachments-title">{t("chat.attachments", "Attachments")}:</div>
              <div className="attachments-list">
                 {files.map((file, i) => {
                   const fileUri = file.url || file.file_url;
                   const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileUri || '');
                   const fullUrl = getFullUrl(fileUri);
                   const canDownload = isOwn || status === 'approved';

                   return (
                     <div key={i} className="attachment-item-wrapper">
                       <a 
                         href={fullUrl} 
                         target="_blank" 
                         rel="noreferrer" 
                         className={`attachment-item ${(!canDownload && currentUser?.role === "client") ? "view-only" : ""}`}
                         onClick={async (e) => {
                            if (currentUser?.role === 'client' && !isImage && !canDownload) return;
                            e.preventDefault();
                            if (isImage && onMediaClick) {
                              onMediaClick({ type: 'image', url: fileUri, canDownload, isSubmission: true });
                            } else {
                              await handleDownload(fullUrl, file.name);
                            }
                          }}
                       >
                         {canDownload ? <Download size={14} /> : <ExternalLink size={14} />}
                         <span className="attachment-name">{file.name || 'Document'}</span>
                       </a>
                     </div>
                   );
                 })}
              </div>
            </div>
          )}
        </div>
      
      {!isOwn && (status === 'submitted' || status === 'pending') && (
        <div className="submission-footer-actions">
          <button 
            className="submission-btn approve-btn" 
            onClick={() => onApprove(msg)}
            disabled={isApproving}
          >
            {isApproving ? <div className="btn-spinner" /> : <CheckCircle size={16} />}
            {t("chat.approveWork", "Approve")}
          </button>
          <button 
            className="submission-btn reject-btn" 
            onClick={() => onReject(msg)}
            disabled={isRejecting}
          >
            {isRejecting ? <div className="btn-spinner" /> : <AlertCircle size={16} />}
            {t("chat.requestRevision", "Request Revision")}
          </button>
        </div>
      )}
    </div>
  );
};

export default SubmissionCard;
