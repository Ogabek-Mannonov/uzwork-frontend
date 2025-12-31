// components/Toast.jsx
import { useEffect } from 'react';

export function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          animation: 'slideInRight 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          pointerEvents: 'auto'
        }}
      >
        <div
          style={{
            background: 'linear-gradient(to right, #ef4444, #dc2626)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '320px',
            maxWidth: '450px',
            border: '1px solid rgba(248, 113, 113, 0.5)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Warning Icon */}
          <div
            style={{
              flexShrink: 0,
              animation: 'bounce 1s infinite'
            }}
          >
            <svg
              style={{ width: '28px', height: '28px' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Message */}
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
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
              e.currentTarget.style.background = 'rgba(185, 28, 28, 0.8)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg
              style={{ width: '20px', height: '20px' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
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