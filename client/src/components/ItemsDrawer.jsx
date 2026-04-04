import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchItemsPaged } from "../services/api";
import { formatDistanceToNow } from "../utils/date";
import { cloudinaryOptimize } from "../utils/cloudinary";
import "./ItemsDrawer.css";

const LOCATION_OPTIONS = [
  "all",
  "Library",
  "Cafeteria",
  "Lab Block",
  "Main Gate",
  "Parking",
  "Auditorium",
  "Ground Floor",
  "Admin Block",
  "Workshop",
];

export default function ItemsDrawer({ open, onClose }) {
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setPage(1);
    fetchItemsPaged({ type, page: 1, limit: 12, location, sort })
      .then((data) => {
        setItems(data?.items || []);
        setHasMore(Boolean(data?.hasMore));
      })
      .finally(() => setLoading(false));
  }, [open, type, location, sort]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const name = (it.name || "").toLowerCase();
      const loc = (it.location || "").toLowerCase();
      return name.includes(q) || loc.includes(q);
    });
  }, [items, search]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const data = await fetchItemsPaged({
        type,
        page: nextPage,
        limit: 12,
        location,
        sort,
      });
      setItems((prev) => [...prev, ...(data?.items || [])]);
      setHasMore(Boolean(data?.hasMore));
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true">
        <div className="drawer-header">
          <div className="drawer-title">ALL CAMPUS REPORTS</div>
          <button type="button" className="drawer-close" onClick={onClose}>
            × CLOSE
          </button>
        </div>

        <div className="drawer-controls">
          <input
            className="drawer-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search items..."
          />

          <div className="drawer-chips">
            <button
              type="button"
              className={type === "" ? "chip chip-active" : "chip"}
              onClick={() => setType("")}
            >
              ALL
            </button>
            <button
              type="button"
              className={type === "lost" ? "chip chip-active" : "chip"}
              onClick={() => setType("lost")}
            >
              LOST
            </button>
            <button
              type="button"
              className={type === "found" ? "chip chip-active" : "chip"}
              onClick={() => setType("found")}
            >
              FOUND
            </button>
            <button
              type="button"
              className={type === "resolved" ? "chip chip-active" : "chip"}
              onClick={() => setType("resolved")}
            >
              RESOLVED
            </button>
          </div>

          <div className="drawer-row">
            <div className="drawer-row-left">
              <label className="drawer-label">
                Sort by:
                <select
                  className="drawer-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">NEWEST</option>
                  <option value="oldest">OLDEST</option>
                  <option value="mostCommented">MOST COMMENTED</option>
                </select>
              </label>
            </div>

            <div className="drawer-row-right">
              <label className="drawer-label">
                Location:
                <select
                  className="drawer-select"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {LOCATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "all" ? "ALL" : opt.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="drawer-divider" />

        <div className="drawer-content">
          {loading && filteredItems.length === 0 ? (
            <div className="drawer-loading">Loading…</div>
          ) : filteredItems.length === 0 ? (
            <div className="drawer-empty">No items match your search.</div>
          ) : (
            filteredItems.map((item) => (
              <Link
                key={item._id}
                to={`/item/${item._id}`}
                className="drawer-item"
                onClick={onClose}
              >
                <div className="drawer-item-imgWrap">
                  {item.imageUrl ? (
                    <img
                      src={cloudinaryOptimize(item.imageUrl, { width: 220, quality: "auto" })}
                      alt={item.name}
                      className="drawer-item-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="drawer-item-imgPlaceholder">No image</div>
                  )}
                </div>

                <div className="drawer-item-body">
                  <div className="drawer-item-name">{item.name}</div>
                  <div className="drawer-item-meta">
                    📍 {item.location} • {formatDistanceToNow(item.createdAt)}
                  </div>
                  <div className="drawer-item-meta">
                    {(item.postedBy?.displayName || "Anonymous").toUpperCase()}
                  </div>
                  <div className="drawer-item-status">
                    <span
                      className={
                        item.resolved
                          ? "status-dot status-resolved"
                          : item.type === "lost"
                            ? "status-dot status-lost"
                            : "status-dot status-found"
                      }
                    />
                    {item.resolved
                      ? "RESOLVED"
                      : (item.type || "").toUpperCase()}
                  </div>
                </div>
              </Link>
            ))
          )}

          <div className="drawer-loadMoreWrap">
            <button
              type="button"
              className="drawer-loadMore"
              onClick={loadMore}
              disabled={!hasMore || loading}
            >
              {hasMore ? (loading ? "LOADING…" : "LOAD MORE") : "NO MORE"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

