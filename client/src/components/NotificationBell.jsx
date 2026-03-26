import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from '../utils/date';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const { notifs, unreadCount, open, openPanel, closePanel, handleClear } = useNotifications();
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) closePanel();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closePanel]);

  const handleNotifClick = (notif) => {
    closePanel();
    if (notif.itemId) navigate(`/item/${notif.itemId}`);
  };

  return (
    <div className={styles.wrap} ref={panelRef}>
      <button
        type="button"
        className={styles.bellBtn}
        onClick={open ? closePanel : openPanel}
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>NOTIFICATIONS</span>
            <div className={styles.panelActions}>
              {notifs.length > 0 && (
                <button type="button" className={styles.clearBtn} onClick={handleClear}>
                  CLEAR ALL
                </button>
              )}
              <button type="button" className={styles.closeBtn} onClick={closePanel}>×</button>
            </div>
          </div>

          <div className={styles.list}>
            {notifs.length === 0 ? (
              <div className={styles.empty}>
                <p>No notifications yet.</p>
                <p className={styles.emptyHint}>You'll be notified when someone comments on your items.</p>
              </div>
            ) : (
              notifs.map(n => (
                <button
                  key={n._id}
                  type="button"
                  className={`${styles.item} ${!n.read ? styles.unread : ''}`}
                  onClick={() => handleNotifClick(n)}
                >
                  <div className={styles.itemIcon}>💬</div>
                  <div className={styles.itemBody}>
                    <p className={styles.itemMsg}>{n.message}</p>
                    <p className={styles.itemTime}>{formatDistanceToNow(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className={styles.dot} />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
