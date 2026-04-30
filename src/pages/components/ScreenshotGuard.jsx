import React, { useState, useEffect } from 'react';

/**
 * ScreenshotGuard component to protect sensitive content (images/videos).
 * Uses high-performance Vanilla JS to bypass React render cycle for instant blackout.
 * Note: It's technically impossible to 100% block OS-level tools like Win+Shift+S 
 * on fully visible static elements in a browser, but this provides the fastest possible mitigation.
 */
const ScreenshotGuard = ({ children, enabled = true }) => {
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
          /* No transition for maximum speed */
        }
        body.is-screenshot-blur .screenshot-guarded-content {
          filter: blur(60px) brightness(0) !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(style);
    }
    let checkInterval;
    let focusTimeout;
    let screenshotLockTime = 0;

    const setBlackout = (active) => {
      if (active) {
        document.body.classList.add('is-screenshot-blur');
      } else {
        document.body.classList.remove('is-screenshot-blur');
      }
    };

    const handleBlur = () => {
      clearTimeout(focusTimeout);
      setBlackout(true);
    };

    const handleFocus = () => {
      clearTimeout(focusTimeout);
      // Snipping tool has closed, so we don't need a huge delay.
      // 300ms is enough to safely unblack without flashing.
      focusTimeout = setTimeout(() => {
        if (document.hasFocus()) setBlackout(false);
      }, 300);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        screenshotLockTime = 0;
        clearTimeout(focusTimeout);
        setBlackout(false);
        return;
      }

      if (
        e.key === 'Meta' || e.metaKey || 
        e.key === 'Control' || e.ctrlKey || 
        e.key === 'Alt' || e.altKey ||
        e.key === 'Shift' || e.shiftKey ||
        e.key === 'PrintScreen' || e.key === 'Snapshot'
      ) {
        setBlackout(true);

        if (e.key === 'Meta' || e.metaKey || e.key === 'PrintScreen' || e.key === 'Snapshot') {
          screenshotLockTime = Date.now();
        }

        if (e.key === 'PrintScreen' || e.key === 'Snapshot') {
          navigator.clipboard.writeText(''); // Attempt to clear clipboard
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Escape') {
        screenshotLockTime = 0;
        clearTimeout(focusTimeout);
        setBlackout(false);
        return;
      }

      if (!e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        if (document.hasFocus()) {
          // If keys are released quickly before Snipping Tool fully opens,
          // we MUST wait 3000ms to ensure Snipping Tool catches the black screen.
          // If Snipping Tool opens, 'blur' will cancel this timeout anyway.
          const timeSinceLock = Date.now() - screenshotLockTime;
          const delay = timeSinceLock < 5000 ? 3000 : 300; 
          
          clearTimeout(focusTimeout);
          focusTimeout = setTimeout(() => {
            if (document.hasFocus()) setBlackout(false);
          }, delay);
        }
      }
    };

    const handleCopy = (e) => {
      e.preventDefault();
      setBlackout(true);
      setTimeout(() => { if (document.hasFocus()) setBlackout(false); }, 2000);
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('mouseleave', handleBlur);
    window.addEventListener('mouseenter', handleFocus);

    // Ultra-fast heartbeat check (every 50ms)
    checkInterval = setInterval(() => {
      if (!document.hasFocus() || document.visibilityState === 'hidden') {
        setBlackout(true);
      }
    }, 50);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('mouseleave', handleBlur);
      window.removeEventListener('mouseenter', handleFocus);
      clearInterval(checkInterval);
      clearTimeout(focusTimeout);
    };
  }, [enabled]);

  return (
    <div 
      className="screenshot-guarded-content" 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
};

export default ScreenshotGuard;
