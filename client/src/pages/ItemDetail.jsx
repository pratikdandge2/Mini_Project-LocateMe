import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  fetchItem,
  resolveItem,
  deleteItem,
  invalidateFeedCache,
} from "../services/api";
import { formatDistanceToNow } from "../utils/date";
import { cloudinaryOptimize } from "../utils/cloudinary";
import Navbar from "../components/Navbar";
import CommentSection from "../components/CommentSection";
import Lightbox from "../components/Lightbox";
import styles from "./ItemDetail.module.css";

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const isOwner = user && item?.postedBy?.uid === user.uid;

  useEffect(() => {
    fetchItem(id)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleResolve = async () => {
    if (!item || actioning) return;
    setActioning(true);
    try {
      const updated = await resolveItem(item._id);
      invalidateFeedCache();
      setItem(updated);
      addToast(updated.resolved ? '✅ Item marked as resolved!' : '↩ Item marked as active.', 'success');
    } finally {
      setActioning(false);
    }
  };

  const handleDelete = async () => {
    if (!item || actioning) return;
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    setActioning(true);
    try {
      await deleteItem(item._id);
      invalidateFeedCache();
      navigate("/");
      addToast('🗑 Item deleted.', 'info');
    } finally {
      setActioning(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <p className={styles.muted}>Loading…</p>
        </main>
      </div>
    );
  }

  if (!item) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <p className={styles.muted}>Item not found.</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className={styles.backBtn}
          >
            ← Back to Feed
          </button>
        </main>
      </div>
    );
  }

  const badgeClass = item.resolved
    ? styles.badgeResolved
    : item.type === "lost"
      ? styles.badgeLost
      : styles.badgeFound;
  const badgeLabel = item.resolved ? "RESOLVED" : item.type.toUpperCase();

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <button
          type="button"
          onClick={() => navigate("/")}
          className={styles.backLink}
        >
          ← Back to Feed
        </button>
        <div className={styles.cardWrap}>
        <article className={styles.article}>
          <div className={styles.imageWrap}>
            {item.imageUrl ? (
              <img
                src={cloudinaryOptimize(item.imageUrl, { width: 900, quality: "auto" })}
                alt={item.name}
                className={styles.image}
                onClick={() => item.imageUrl && setLightbox(true)}
                style={{ cursor: item.imageUrl ? 'zoom-in' : 'default' }}
              />
            ) : (
              <div className={styles.imagePlaceholder}>No image</div>
            )}
            {item.resolved && (
              <div className={styles.resolvedBanner}>RESOLVED</div>
            )}
          </div>
          <div className={styles.content}>
            <span className={`${styles.badge} ${badgeClass}`}>
              ● {badgeLabel}
            </span>
            <p className={styles.reportedAt}>
              REPORTED {formatDistanceToNow(item.createdAt).toUpperCase()}
            </p>
            <h1 className={styles.title}>{item.name}</h1>
            <p className={styles.location}>📍 {item.location}</p>
            {item.description && (
              <p className={styles.description}>{item.description}</p>
            )}
            <p className={styles.posterLabel}>
              Posted by: {item.postedBy?.displayName || "Anonymous"}{" "}
              {item.postedBy?.email && (
                <span className={styles.posterEmail}>({item.postedBy.email})</span>
              )}
            </p>
            {isOwner && (
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={handleResolve}
                  disabled={actioning}
                  className={item.resolved ? styles.unresolveBtn : styles.resolveBtn}
                >
                  {item.resolved ? "↩ MARK AS UNRESOLVED" : "✅ MARK AS RESOLVED"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={actioning}
                  className={styles.deleteBtn}
                >
                  🗑 DELETE
                </button>
              </div>
            )}
          </div>
        </article>
        <CommentSection itemId={id} />
        </div>

        {lightbox && item.imageUrl && (
          <Lightbox imageUrl={item.imageUrl} altText={item.name} onClose={() => setLightbox(false)} />
        )}
      </main>
    </div>
  );
}
