import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Briefcase, DollarSign, MoreHorizontal, CheckCircle, Info, AlertTriangle, AlertCircle, UserCheck, UserX, Lock, ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../../api/common';
import { getSocket, onSocketReady } from '../../../hooks/useSocket';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { t, i18n } = useTranslation();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();


  const showBrowserNotification = useCallback((notif) => {
    if (Notification.permission === "granted") {
      // Check if already shown in this session/device
      const shownIds = JSON.parse(localStorage.getItem('shown_notifications') || '[]');
      if (shownIds.includes(notif.id)) return;

      const title = i18n.language === 'en' && notif.title_en ? notif.title_en : 
                    i18n.language === 'ru' && notif.title_ru ? notif.title_ru : 
                    notif.title || "UzWork";
      const body = i18n.language === 'en' && notif.body_en ? notif.body_en : 
                   i18n.language === 'ru' && notif.body_ru ? notif.body_ru : 
                   notif.message;

      new Notification(title, {
        body: body,
        icon: "/logo192.png"
      });

      // Mark as shown
      shownIds.push(notif.id);
      // Keep only last 50 to avoid storage bloat
      localStorage.setItem('shown_notifications', JSON.stringify(shownIds.slice(-50)));
    }
  }, []);

  // Show missed notifications on mount
  const checkMissedNotifications = useCallback((notifs) => {
    if (Notification.permission !== "granted") return;
    
    const unread = notifs.filter(n => !n.is_read);
    if (unread.length === 0) return;

    // Faqat eng oxirgi 3 ta o'qilmagan xabarni ko'rsatamiz (foydalanuvchini bezovta qilmaslik uchun)
    const missed = unread.slice(0, 3).reverse(); 
    missed.forEach(n => {
      showBrowserNotification(n);
    });
  }, [showBrowserNotification]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    const res = await getNotifications({ limit: 20 });
    if (res?.success) {
      setNotifications(res.data.notifications);
      // Count unread
      const unread = res.data.notifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
      
      // Tekshiramiz: agar o'qilmagan xabarlar bo'lsa va ular hali browserda ko'rsatilmagan bo'lsa
      checkMissedNotifications(res.data.notifications);
    }
  }, [checkMissedNotifications]);

  // Notification sound
  const playSound = useCallback(() => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      console.warn("Sound play failed:", e);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Request browser notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Socket real-time updates
    const cleanup = onSocketReady((socket) => {
      const handleNewNotification = (notif) => {
        setNotifications(prev => [notif, ...prev].slice(0, 30));
        setUnreadCount(prev => prev + 1);
      };

      socket.on('newNotification', handleNewNotification);

      socket.on('notificationRead', ({ id }) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      });

      socket.on('notificationsAllRead', () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      });

      socket.on('notificationsAllReadByType', () => {
        fetchNotifications();
      });

      return () => {
        socket.off('newNotification', handleNewNotification);
        socket.off('notificationRead');
        socket.off('notificationsAllRead');
        socket.off('notificationsAllReadByType');
      };
    });

    return () => cleanup?.();
  }, [fetchNotifications, playSound, showBrowserNotification]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    const res = await markNotificationRead(id);
    if (res?.success) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleAllRead = async () => {
    const res = await markAllNotificationsRead();
    if (res?.success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'proposal_received': return { icon: <Briefcase size={18} />, color: 'purple' };
      case 'proposal_accepted': return { icon: <UserCheck size={18} />, color: 'green' };
      case 'proposal_rejected': return { icon: <UserX size={18} />, color: 'red' };
      case 'job_invitation': return { icon: <ArrowUpRight size={18} />, color: 'orange' };
      
      case 'contract_started': return { icon: <CheckCircle size={18} />, color: 'blue' };
      case 'contract_completed': return { icon: <Lock size={18} />, color: 'green' };
      case 'contract_cancelled': return { icon: <AlertTriangle size={18} />, color: 'red' };
      
      case 'milestone_submitted': return { icon: <Info size={18} />, color: 'orange' };
      case 'milestone_approved': return { icon: <CheckCircle size={18} />, color: 'green' };
      
      case 'payment_received': return { icon: <ArrowDownLeft size={18} />, color: 'green' };
      case 'payment_sent': return { icon: <ArrowUpRight size={18} />, color: 'blue' };
      case 'withdrawal_request': return { icon: <DollarSign size={18} />, color: 'orange' };
      case 'escrow_hold': return { icon: <Lock size={18} />, color: 'purple' };
      
      case 'dispute_opened': return { icon: <AlertCircle size={18} />, color: 'red' };
      case 'dispute_resolved': return { icon: <CheckCircle size={18} />, color: 'green' };
      
      case 'new_review': return { icon: <MoreHorizontal size={18} />, color: 'purple' };
      case 'security_update': return { icon: <Lock size={18} />, color: 'red' };
      case 'verification_status': return { icon: <UserCheck size={18} />, color: 'blue' };
      
      case 'new_job_posted': return { icon: <Briefcase size={18} />, color: 'blue' };
      case 'success': return { icon: <CheckCircle size={18} />, color: 'green' };
      case 'warning': return { icon: <AlertTriangle size={18} />, color: 'orange' };
      case 'error': return { icon: <AlertCircle size={18} />, color: 'red' };
      default: return { icon: <Bell size={18} />, color: 'blue' };
    }
  };

  const handleNotificationClick = (notif) => {
    // 1. O'qilgan deb belgilash
    if (!notif.is_read) {
      handleMarkRead(notif.id);
    }

    // 2. Turiga qarab navigatsiya qilish
    const type = notif.type;
    const related_id = notif.data?.related_id;
    
    switch (type) {
      case 'proposal_received':
        navigate('/client/proposals');
        break;
      case 'proposal_accepted':
      case 'proposal_rejected':
      case 'job_invitation':
        navigate('/my-proposals');
        break;
      case 'contract_started':
      case 'contract_completed':
      case 'contract_cancelled':
      case 'milestone_submitted':
      case 'milestone_approved':
        if (related_id) {
          navigate(`/contracts/${related_id}`);
        } else {
          navigate('/contracts');
        }
        break;
      case 'payment_received':
      case 'payment_sent':
      case 'withdrawal_request':
        navigate('/wallet');
        break;
      case 'dispute_opened':
      case 'dispute_resolved':
        if (related_id) {
          navigate(`/disputes/${related_id}`);
        } else {
          navigate('/disputes');
        }
        break;
      case 'message':
        if (related_id) {
          navigate(`/messages/${related_id}`);
        } else {
          navigate('/messages');
        }
        break;
      default:
        // Default holatda barcha bildirishnomalar sahifasiga
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isClientRole = user?.role === 'client';
        navigate(isClientRole ? '/profile/client?section=all-notifications' : '/profile?section=all-notifications');
        break;
    }
    
    setIsOpen(false);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    
    let date = new Date(dateStr);
    if (typeof dateStr === 'string' && !dateStr.includes('Z') && !dateStr.includes('+')) {
      const utcDate = new Date(dateStr.replace(' ', 'T') + 'Z');
      if (!isNaN(utcDate.getTime())) {
        date = utcDate;
      }
    }

    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return t('notifications.time.justNow');
    if (diffMin < 60) return t('notifications.time.minutesAgo', { count: diffMin });
    if (diffHour < 24) return t('notifications.time.hoursAgo', { count: diffHour });
    if (diffDay < 7) return t('notifications.time.daysAgo', { count: diffDay });
    return date.toLocaleDateString(i18n.language === 'uz' ? 'uz-UZ' : i18n.language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="uzwork-notif-wrapper" ref={dropdownRef}>
      <button 
        className={`uzwork-notif-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="uzwork-notif-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="uzwork-notif-dropdown">
          <div className="uzwork-notif-header">
            <h3>{t('notifications.title')}</h3>
            <button className="uzwork-notif-more" onClick={handleAllRead} title={t('notifications.markAllRead')}>
               <CheckCircle size={18} />
            </button>
          </div>

          <div className="uzwork-notif-tabs">
            <button className="tab active">{t('notifications.all')}</button>
          </div>

          <div className="uzwork-notif-list custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map(notif => {
                const { icon, color } = getIcon(notif.type);

                // Helper: get the best available body text, with real names from data field
                const getBody = () => {
                  // Parse stored data field (contains clientName, jobTitle etc.)
                  let d = {};
                  try {
                    d = typeof notif.data === 'string' ? JSON.parse(notif.data || '{}') : (notif.data || {});
                  } catch {}

                  const clientName = d.clientName || d.client_name || notif.sender_name || notif.senderName;
                  const jobTitle   = d.jobTitle   || d.job_title;
                  const amount     = d.amount;

                  const lang = i18n.language;

                  // For job_invitation: ALWAYS reconstruct with clientName if available
                  if (notif.type === 'job_invitation') {
                    if (clientName && jobTitle) {
                      if (lang === 'ru') return `${clientName} пригласил вас в проект "${jobTitle}".`;
                      if (lang === 'en') return `${clientName} invited you to the project "${jobTitle}".`;
                      return `${clientName} sizni "${jobTitle}" loyihasiga taklif qildi.`;
                    }
                    if (jobTitle) {
                      if (lang === 'ru') return `Вы получили приглашение в проект "${jobTitle}".`;
                      if (lang === 'en') return `You have been invited to the project "${jobTitle}".`;
                      return `"${jobTitle}" loyihasiga taklif qabul qildingiz.`;
                    }
                  }

                  // For proposal_accepted: reconstruct with jobTitle if available
                  if (notif.type === 'proposal_accepted' && jobTitle) {
                    if (lang === 'ru') return `Ваше предложение по проекту "${jobTitle}" было принято.`;
                    if (lang === 'en') return `Your proposal for "${jobTitle}" has been accepted.`;
                    return `"${jobTitle}" loyihasiga taklifingiz qabul qilindi.`;
                  }

                  // For proposal_rejected: reconstruct with jobTitle if available
                  if (notif.type === 'proposal_rejected' && jobTitle) {
                    if (lang === 'ru') return `Ваше предложение по проекту "${jobTitle}" было отклонено.`;
                    if (lang === 'en') return `Your proposal for "${jobTitle}" has been rejected.`;
                    return `"${jobTitle}" loyihasiga taklifingiz rad etildi.`;
                  }

                  // For new_job_posted: reconstruct with jobTitle if available
                  if (notif.type === 'new_job_posted' && jobTitle) {
                    if (lang === 'ru') return `Размещена новая вакансия по вашим навыкам: "${jobTitle}"`;
                    if (lang === 'en') return `A new job matching your skills: "${jobTitle}"`;
                    return `Ko'nikmalaringizga mos yangi loyiha: "${jobTitle}"`;
                  }

                  // For contract_started/completed: reconstruct with jobTitle
                  if (['contract_started', 'contract_completed', 'contract_cancelled'].includes(notif.type) && jobTitle) {
                    const msgs = {
                      contract_started:   { ru: `Контракт по "${jobTitle}" начат!`, en: `Contract for "${jobTitle}" started!`, uz: `"${jobTitle}" shartnomasi boshlandi!` },
                      contract_completed: { ru: `Контракт по "${jobTitle}" завершён.`, en: `Contract for "${jobTitle}" completed.`, uz: `"${jobTitle}" shartnomasi yakunlandi.` },
                      contract_cancelled: { ru: `Контракт по "${jobTitle}" отменён.`, en: `Contract for "${jobTitle}" cancelled.`, uz: `"${jobTitle}" shartnomasi bekor qilindi.` },
                    };
                    const m = msgs[notif.type];
                    if (m) return lang === 'ru' ? m.ru : lang === 'en' ? m.en : m.uz;
                  }

                  // Default: use stored translated body
                  const stored = lang === 'en' && notif.body_en ? notif.body_en
                               : lang === 'ru' && notif.body_ru ? notif.body_ru
                               : notif.message;
                  return stored || '';
                };

                const getTitle = () => {
                  const stored = i18n.language === 'en' && notif.title_en ? notif.title_en
                               : i18n.language === 'ru' && notif.title_ru ? notif.title_ru
                               : notif.title;
                  return stored || '';
                };

                return (
                  <div 
                    key={notif.id} 
                    className={`uzwork-notif-item ${notif.is_read ? '' : 'unread'}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className={`uzwork-notif-icon-box ${color}`}>
                      {icon}
                    </div>
                    <div className="uzwork-notif-info">
                        <h4 style={{ 
                          fontWeight: notif.is_read ? 600 : 700,
                          fontSize: '14px',
                          margin: '0 0 4px 0',
                          color: 'var(--text, #1e293b)'
                        }}>
                          {getTitle()}
                        </h4>
                        <p style={{ 
                          fontWeight: 400,
                          fontSize: '13px',
                          lineHeight: '1.4',
                          margin: 0,
                          color: 'var(--text-secondary, #64748b)'
                        }}>
                          {getBody()}
                        </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <span className="uzwork-notif-time">{formatTime(notif.created_at)}</span>
                        {!notif.is_read && <span className="unread-dot"></span>}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
                <div className="uzwork-notif-empty">
                    <Bell size={40} opacity={0.2} />
                    <p>{t('notifications.empty')}</p>
                </div>
            )}
          </div>

          <div className="uzwork-notif-footer">
            <button 
              className="view-all-btn"
              onClick={() => { 
                setIsOpen(false); 
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const isClientRole = user?.role === 'client';
                navigate(isClientRole ? '/profile/client?section=all-notifications' : '/profile?section=all-notifications'); 
              }}
            >
              <span>{t('notifications.allNotifications')}</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
