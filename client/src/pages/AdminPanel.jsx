import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchAdminItems, adminDeleteItem } from "../services/api";
import { formatDistanceToNow } from "../utils/date";
import Navbar from "../components/Navbar";
import ReportModal from "../components/ReportModal";
import styles from "./AdminPanel.module.css";

const TYPE_FILTERS = [
  { label: "ALL",    value: "" },
  { label: "LOST",   value: "lost" },
  { label: "FOUND",  value: "found" },
];

const RESOLVED_FILTERS = [
  { label: "ALL",      value: "" },
  { label: "ACTIVE",   value: "false" },
  { label: "RESOLVED", value: "true" },
];

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [resolvedFilter, setResolvedFilter] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [reportModal, setReportModal] = useState(null);
  const [confirmId, setConfirmId]   = useState(null); // item pending confirmation

  // Redirect non-admins immediately
  useEffect(() => {
    if (!loading && !isAdmin) navigate("/", { replace: true });
  }, [isAdmin, loading, navigate]);

  const load = useCallback(() => {
    setLoading(true);
    const filters = {};
    if (typeFilter)     filters.type     = typeFilter;
    if (resolvedFilter) filters.resolved = resolvedFilter;
    fetchAdminItems(filters)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [typeFilter, resolvedFilter]);

  useEffect(() => { if (isAdmin) load(); }, [load, isAdmin]);

  const handleDelete = async (item) => {
    setConfirmId(null);
    setDeletingId(item._id);
    try {
      await adminDeleteItem(item._id);
      setItems((prev) => prev.filter((i) => i._id !== item._id));
    } catch {
      alert("Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAdmin) return null; // redirect handled by useEffect

  const total    = items.length;
  const active   = items.filter((i) => !i.resolved).length;
  const resolved = items.filter((i) =>  i.resolved).length;

  return (
    <div className={styles.page}>
      <Navbar onPostItem={() => setReportModal("")} />
      <main className={styles.main}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.adminBadgeRow}>
              <span className={styles.adminBadge}>🛡️ ADMIN</span>
            </div>
            <h1 className={styles.heading}>ADMIN PANEL</h1>
            <p className={styles.sub}>
              Logged in as <strong>{user?.email}</strong>
            </p>
          </div>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate("/")}
          >
            ← BACK TO FEED
          </button>
        </div>

        {/* Stat cards */}
        <div className={styles.statsRow}>
          {[
            { label: "TOTAL REPORTS", value: total,    color: "#F97316" },
            { label: "ACTIVE",        value: active,   color: "#1a1a1a" },
            { label: "RESOLVED",      value: resolved, color: "#66bb6a" },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statValue} style={{ color: s.color }}>
                {s.value}
              </span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={styles.filtersRow}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>TYPE</span>
            <div className={styles.tabs}>
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={typeFilter === f.value ? styles.tabActive : styles.tab}
                  onClick={() => setTypeFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>STATUS</span>
            <div className={styles.tabs}>
              {RESOLVED_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={resolvedFilter === f.value ? styles.tabActive : styles.tab}
                  onClick={() => setResolvedFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Items table */}
        {loading ? (
          <div className={styles.loadingWrap}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${styles.skeletonRow} ${styles.shimmer}`} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className={styles.empty}>No items match these filters.</p>
        ) : (
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item._id} className={styles.row}>
                {/* Thumbnail */}
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className={styles.thumb} />
                ) : (
                  <div className={styles.thumbPlaceholder}>?</div>
                )}

                {/* Info */}
                <div className={styles.info}>
                  <div className={styles.infoTop}>
                    <span
                      className={`${styles.badge} ${
                        item.resolved
                          ? styles.badgeResolved
                          : item.type === "lost"
                          ? styles.badgeLost
                          : styles.badgeFound
                      }`}
                    >
                      ● {item.resolved ? "RESOLVED" : item.type.toUpperCase()}
                    </span>
                    <span className={styles.time}>
                      {formatDistanceToNow(item.createdAt)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.itemName}
                    onClick={() => navigate(`/item/${item._id}`)}
                  >
                    {item.name}
                  </button>
                  <p className={styles.itemMeta}>
                    📍 {item.location} · Posted by{" "}
                    <span className={styles.posterEmail}>
                      {item.postedBy?.email || "Unknown"}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.viewBtn}
                    onClick={() => navigate(`/item/${item._id}`)}
                  >
                    VIEW
                  </button>

                  {/* Show confirmation inline instead of window.confirm */}
                  {confirmId === item._id ? (
                    <div className={styles.confirmWrap}>
                      <span className={styles.confirmText}>Delete?</span>
                      <button
                        type="button"
                        className={styles.confirmYes}
                        disabled={deletingId === item._id}
                        onClick={() => handleDelete(item)}
                      >
                        YES
                      </button>
                      <button
                        type="button"
                        className={styles.confirmNo}
                        onClick={() => setConfirmId(null)}
                      >
                        NO
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      disabled={deletingId === item._id}
                      onClick={() => setConfirmId(item._id)}
                    >
                      {deletingId === item._id ? "…" : "🗑 DELETE"}
                    </button>
                  )}
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
