import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { fetchNotifications, markNotificationsRead, clearNotifications } from '../services/api';

const NotifCtx = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const socketRef = useRef(null);

  const unreadCount = notifs.filter(n => !n.read).length;

  // Load on mount / user change
  useEffect(() => {
    if (!user) { setNotifs([]); return; }
    fetchNotifications().then(data => setNotifs(Array.isArray(data) ? data : []));
  }, [user]);

  // Join personal socket room for live notifications
  useEffect(() => {
    if (!user) return;
    const socket = io(import.meta.env.VITE_API_URL);
    socketRef.current = socket;
    socket.emit('join_user', user.uid);
    socket.on('notification', (notif) => {
      setNotifs(prev => [notif, ...prev]);
    });
    return () => {
      socket.emit('leave_user', user.uid);
      socket.disconnect();
    };
  }, [user]);

  const openPanel = useCallback(async () => {
    setOpen(true);
    if (unreadCount > 0) {
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      await markNotificationsRead();
    }
  }, [unreadCount]);

  const closePanel = useCallback(() => setOpen(false), []);

  const handleClear = useCallback(async () => {
    await clearNotifications();
    setNotifs([]);
  }, []);

  return (
    <NotifCtx.Provider value={{ notifs, unreadCount, open, openPanel, closePanel, handleClear }}>
      {children}
    </NotifCtx.Provider>
  );
}

export const useNotifications = () => useContext(NotifCtx);
