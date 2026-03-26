import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyItems, resolveItem, deleteItem } from '../services/api';
import { formatDistanceToNow } from '../utils/date';
import Navbar from '../components/Navbar';
import ReportModal from '../components/ReportModal';
import styles from './MyReports.module.css';

const FILTERS = [
  { label: 'ALL', value: '' },
  { label: 'ACTIVE', value: 'active' },
  { label: 'RESOLVED', value: 'resolved' },
];

export default function MyReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null); // item._id being actioned
  const [reportModal, setReportModal] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchMyItems(filter)
      .then(data => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleResolve = async (item) => {
    setActioning(item._id);
    try {
      const updated = await resolveItem(item._id);
      setItems(prev => prev.map(i => i._id === updated._id ? updated : i));
    } finally { setActioning(null); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    setActioning(item._id);
    try {
      await deleteItem(item._id);
      setItems(prev => prev.filter(i => i._id !== item._id));
    } finally { setActioning(null); }
  };

  // Stats
  const total    = items.length;
  const resolved = items.filter(i => i.resolved).length;
  const active   = total - resolved;
  const rate     = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className={styles.page}>
      <Navbar onPostItem={() => setReportModal('')} />
      <main className={styles.main}>
        <h1 className={styles.heading}>MY REPORTS</h1>

        {/* Stats row */}
        <div className={styles.statsRow}>
          {[
            { label: 'TOTAL POSTED', value: total },
            { label: 'ACTIVE', value: active },
            { label: 'RESOLVED', value: resolved },
            { label: 'RESOLUTION %', value: `${rate}%` },
          ].map(s => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className={styles.tabs}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              type="button"
              className={filter === f.value ? styles.tabActive : styles.tab}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <p className={styles.muted}>Loading…</p>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <p>No items found.</p>
            <button type="button" className={styles.postBtn} onClick={() => setReportModal('')}>
              POST AN ITEM →
            </button>
          </div>
        ) : (
          <ul className={styles.list}>
            {items.map(item => (
              <li key={item._id} className={styles.row}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className={styles.thumb} />
                ) : (
                  <div className={styles.thumbPlaceholder}>?</div>
                )}
                <div className={styles.rowBody}>
                  <div className={styles.rowTop}>
                    <span className={`${styles.badge} ${item.resolved ? styles.badgeResolved : item.type === 'lost' ? styles.badgeLost : styles.badgeFound}`}>
                      ● {item.resolved ? 'RESOLVED' : item.type.toUpperCase()}
                    </span>
                    <span className={styles.rowTime}>{formatDistanceToNow(item.createdAt)}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.rowName}
                    onClick={() => navigate(`/item/${item._id}`)}
                  >
                    {item.name}
                  </button>
                  <p className={styles.rowLocation}>📍 {item.location}</p>
                </div>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    disabled={actioning === item._id}
                    className={item.resolved ? styles.btnUnresolve : styles.btnResolve}
                    onClick={() => handleResolve(item)}
                  >
                    {item.resolved ? '↩ UNRESOLVED' : '✅ RESOLVED'}
                  </button>
                  <button
                    type="button"
                    disabled={actioning === item._id}
                    className={styles.btnDelete}
                    onClick={() => handleDelete(item)}
                  >
                    🗑 DELETE
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {reportModal !== null && (
        <ReportModal
          type={reportModal || null}
          onClose={() => setReportModal(null)}
          onSuccess={load}
        />
      )}
    </div>
  );
}
