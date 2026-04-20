import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Briefcase, DollarSign, MoreHorizontal, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';
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

  useEffect(() => {
    fetchNotifications();

    // Socket real-time updates
    const cleanup = onSocketReady((socket) => {
      const handleNewNotification = (notif) => {
        setNotifications(prev => [notif, ...prev].slice(0, 30));
        setUnreadCount(prev => prev + 1);
      };

      socket.on('newNotification', handleNewNotification);
      return () => socket.off('newNotification', handleNewNotification);
    });

    return () => cleanup?.();
  }, [fetchNotifications]);

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
      case 'payment': return { icon: <DollarSign size={18} />, color: 'green' };
      case 'project': 
      case 'job': return { icon: <Briefcase size={18} />, color: 'purple' };
      case 'success': return { icon: <CheckCircle size={18} />, color: 'green' };
      case 'warning': return { icon: <AlertTriangle size={18} />, color: 'orange' };
      case 'error': return { icon: <AlertCircle size={18} />, color: 'red' };
      default: return { icon: <Info size={18} />, color: 'blue' };
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Hozir';
    if (diffMin < 60) return `${diffMin} daqiqa oldin`;
    if (diffHour < 24) return `${diffHour} soat oldin`;
    if (diffDay < 7) return `${diffDay} kun oldin`;
    return date.toLocaleDateString();
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
                    onClick={() => handleMarkRead(notif.id)}
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
