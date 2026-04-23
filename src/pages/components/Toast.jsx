// components/Toast.jsx
import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export function Toast({ message, type = 'error', onClose, onClick }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'linear-gradient(135deg, #10b981, #059669)',
          icon: <CheckCircle size={24} />,
          border: 'rgba(16, 185, 129, 0.5)'
        };
      case 'warning':
        return {
          bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
          icon: <AlertTriangle size={24} />,
          border: 'rgba(245, 158, 11, 0.5)'
        };
      case 'info':
        return {
          bg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          icon: <Info size={24} />,
          border: 'rgba(59, 130, 246, 0.5)'
        };
      case 'error':
      default:
        return {
          bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
          icon: <AlertCircle size={24} />,
          border: 'rgba(239, 68, 68, 0.5)'
        };
    }
  };

  const config = getConfig();

  return (
    <>
      <div
        className="uzwork-toast-wrapper"
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          zIndex: 9999,
          animation: 'slideInRight 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          pointerEvents: 'auto',
          cursor: onClick ? 'pointer' : 'default'
        }}
        onClick={onClick}
      >
        <div
          style={{
            background: config.bg,
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '320px',
            maxWidth: '450px',
            border: `1px solid ${config.border}`,
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Icon */}
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {config.icon}
          </div>

          {/* Message */}
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              flexShrink: 0,
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              padding: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(500px) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
}