import { useState, useEffect } from "react";
import { fetchItems, fetchItemsPaged } from "../services/api";
import ItemCard from "./ItemCard";
import SkeletonCard from "./SkeletonCard";
import styles from "./Feed.module.css";

export default function Feed({
  typeFilter,
  refreshTrigger,
  searchQuery = "",
  locationFilter = "all",
  sortOption = "newest",
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);

    const timer = setTimeout(() => {
      fetchItemsPaged({
        type: typeFilter,
        page: 1,
        limit: 20,
        search: searchQuery.trim(),
        location: locationFilter,
        sort: sortOption,
      })
        .then((data) => {
          if (cancelled) return;
          if (Array.isArray(data)) {
            setItems(data);
            setHasMore(data.length === 20);
          } else {
            setItems(data?.items || []);
            setHasMore(Boolean(data?.hasMore));
          }
        })
        .catch(() => {
          if (cancelled) return;
          fetchItems(typeFilter, 1).then((legacyItems) => {
            if (cancelled) return;
            setItems(legacyItems);
            setHasMore(legacyItems.length === 20);
          });
        })
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [typeFilter, refreshTrigger, searchQuery, locationFilter, sortOption]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoading(true);
    fetchItemsPaged({
      type: typeFilter,
      page: nextPage,
      limit: 20,
      search: searchQuery.trim(),
      location: locationFilter,
      sort: sortOption,
    })
      .then((data) => {
        const newItems = Array.isArray(data) ? data : data?.items || [];
        const more = Array.isArray(data)
          ? newItems.length === 20
          : Boolean(data?.hasMore);
        setItems((prev) => [...prev, ...newItems]);
        setHasMore(more);
        setPage(nextPage);
      })
      .finally(() => setLoading(false));
  };

  if (loading && items.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.wrap}>
        <p className={styles.muted}>No items yet. Be the first to report one!</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {items.map((item) => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>
      <div className={styles.loadMoreWrap}>
        <button
          type="button"
          onClick={loadMore}
          className={styles.loadMoreBtn}
          disabled={!hasMore || loading}
        >
          {hasMore ? (loading ? "Loading…" : "Load more") : "No more"}
        </button>
      </div>
    </div>
  );
}
