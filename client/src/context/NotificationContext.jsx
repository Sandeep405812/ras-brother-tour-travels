import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, token]);

  // Listen for socket notifications
  useEffect(() => {
    if (!socket) return;

    socket.on('new_notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
      showToast(`${notif.title}: ${notif.message}`, 'info');
    });

    socket.on('receive_message', (msg) => {
      showToast(`New message from ${msg.sender?.name || 'Partner'}: "${msg.content}"`, 'info');
    });

    return () => {
      socket.off('new_notification');
      socket.off('receive_message');
    };
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllRead,
        refreshNotifications: fetchNotifications,
        showToast,
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-2xl border text-sm flex items-start gap-3 transition-all transform animate-bounce-short ${
              toast.type === 'success'
                ? 'bg-emerald-900/95 text-emerald-100 border-emerald-700'
                : toast.type === 'error'
                ? 'bg-red-900/95 text-red-100 border-red-700'
                : 'bg-slate-900/95 text-amber-200 border-amber-600/50'
            }`}
          >
            <span className="text-base">
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : '🔔'}
            </span>
            <div className="flex-1 font-medium leading-snug">{toast.message}</div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
