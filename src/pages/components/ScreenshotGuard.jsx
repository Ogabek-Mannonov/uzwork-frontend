import React, { useState, useEffect } from 'react';

/**
 * ScreenshotGuard component to protect sensitive content (images/videos).
 * Uses high-performance Vanilla JS to bypass React render cycle for instant blackout.
 */
const ScreenshotGuard = ({ children, enabled = true }) => {
  const [isInternalProtected, setIsInternalProtected] = useState(false);

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('is-screenshot-blur');
      return;
    }

    // Add global CSS for instant blackout
    if (!document.getElementById('screenshot-guard-css')) {
      const style = document.createElement('style');
      style.id = 'screenshot-guard-css';
      style.innerHTML = `
        .screenshot-guarded-content {
          transition: filter 0.1s ease-in-out;
        }
        body.is-screenshot-blur .screenshot-guarded-content {
          filter: blur(60px) brightness(0) !important;
          pointer-events: none !important;
        }
        body.is-screenshot-blur .screenshot-overlay-active {
          display: flex !important;
        }
      `;
      document.head.appendChild(style);
    }

    let lastFocusTime = Date.now();
    let checkInterval;

    const setBlackout = (active) => {
      if (active) {
        document.body.classList.add('is-screenshot-blur');
      } else {
        // Only remove if we've been focused for a bit to avoid flicker during snip
        if (Date.now() - lastFocusTime > 2000) {
          document.body.classList.remove('is-screenshot-blur');
        }
      }
    };

    const handleBlur = () => {
      setBlackout(true);
      lastFocusTime = 0;
    };

    const handleFocus = () => {
      lastFocusTime = Date.now();
      // Re-check after 2 seconds
      setTimeout(() => {
        if (document.hasFocus()) setBlackout(false);
      }, 2000);
    };

    const handleKeyDown = (e) => {
      const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if (
        e.key === 'PrintScreen' || 
        e.key === 'Snapshot' || 
        (e.shiftKey && (e.key === 'S' || e.key === 's') && !isTyping)
      ) {
        setBlackout(true);
        lastFocusTime = 0;
        setTimeout(() => { if (document.hasFocus()) setBlackout(false); }, 4000);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mouseleave', handleBlur);
    window.addEventListener('mouseenter', handleFocus);

    // Ultra-fast heartbeat check (every 50ms)
    checkInterval = setInterval(() => {
      if (!document.hasFocus() || document.visibilityState === 'hidden') {
        setBlackout(true);
        lastFocusTime = 0;
      }
    }, 50);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseleave', handleBlur);
      window.removeEventListener('mouseenter', handleFocus);
      clearInterval(checkInterval);
    };
  }, [enabled]);

  return (
    <div className="screenshot-guarded-content" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}
      <div 
        className="screenshot-overlay-active"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000',
          zIndex: 999999999,
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'all'
        }}
      >
        <div style={{ color: '#fff', fontSize: '14px' }}>
          {/* Content Protected */}
        </div>
      </div>
    </div>
  );
};

export default ScreenshotGuard;
