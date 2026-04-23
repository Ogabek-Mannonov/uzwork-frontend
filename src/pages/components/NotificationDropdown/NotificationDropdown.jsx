import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Briefcase, DollarSign, MoreHorizontal, CheckCircle, Info, AlertTriangle, AlertCircle, UserCheck, UserX, Lock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../../api/common';
import { getSocket, onSocketReady } from '../../../hooks/useSocket';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    const res = await getNotifications({ limit: 20 });
    if (res?.success) {
      setNotifications(res.data.notifications);
      // Count unread
      const unread = res.data.notifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    }
  }, []);

  // Notification sound (using a clean public URL)
  const playSound = useCallback(() => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      console.warn("Sound play failed:", e);
    }
  }, []);

  const showBrowserNotification = useCallback((notif) => {
    if (Notification.permission === "granted") {
      new Notification(notif.title || "UzWork", {
        body: notif.message,
        icon: "/logo192.png" // Use project logo if available
      });
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
        
        // Browser alert & sound
        playSound();
        showBrowserNotification(notif);
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

      return () => {
        socket.off('newNotification', handleNewNotification);
        socket.off('notificationRead');
        socket.off('notificationsAllRead');
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
        // Default holatda bildirishnomalar sahifasiga
        navigate('/profile?section=notifications');
        break;
    }
    
    setIsOpen(false);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    
    // Serverdan kelgan vaqtni UTC deb hisoblash uchun 'Z' qo'shamiz (agar yo'q bo'lsa)
    let date = new Date(dateStr);
    if (typeof dateStr === 'string' && !dateStr.includes('Z') && !dateStr.includes('+')) {
      // Ba'zan Postgres '2024-01-01 12:00:00' formatida qaytaradi, buni UTC deb ko'rsatish kerak
      const utcDate = new Date(dateStr.replace(' ', 'T') + 'Z');
      if (!isNaN(utcDate.getTime())) {
        date = utcDate;
      }
    }

    const now = new Date();
    const diffMs = now - date;
    
    // Agar vaqt kelajakda bo'lib qolsa (server/client vaqti farqi), 'Hozir' deb ko'rsatamiz
    if (diffMs < 0) return 'Hozir';

    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Hozir';
    if (diffMin < 60) return `${diffMin} daqiqa oldin`;
    if (diffHour < 24) return `${diffHour} soat oldin`;
    if (diffDay < 7) return `${diffDay} kun oldin`;
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="uzwork-notif-wrapper" ref={dropdownRef}>
      <button 
        className={`uzwork-notif-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <Bell size={18} strokeWidth={2} />
        {unreadCount > 0 && <span className="uzwork-notif-dot"></span>}
      </button>

      {isOpen && (
        <div className="uzwork-notif-dropdown">
          <div className="uzwork-notif-header">
            <h3>Bildirishnomalar</h3>
            <button className="uzwork-notif-more" onClick={handleAllRead} title="Hammasini o'qilgan deb belgilash">
               <CheckCircle size={18} />
            </button>
          </div>

          <div className="uzwork-notif-tabs">
            <button className="tab active">Barchasi</button>
          </div>

          <div className="uzwork-notif-list custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map(notif => {
                const { icon, color } = getIcon(notif.type);
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
                      <p style={{ fontWeight: notif.is_read ? 400 : 600, color: notif.is_read ? '#64748b' : '#1e293b' }}>
                        {notif.message}
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
                    <p>Hozircha bildirishnomalar yo'q</p>
                </div>
            )}
          </div>

          <div className="uzwork-notif-footer">
            <button onClick={() => { setIsOpen(false); navigate('/profile?section=notifications'); }}>
              Barcha bildirishnomalar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
