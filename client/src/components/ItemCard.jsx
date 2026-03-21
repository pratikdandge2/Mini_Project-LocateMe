import { Link } from "react-router-dom";
import { formatDistanceToNow } from "../utils/date";
import styles from "./ItemCard.module.css";

export default function ItemCard({ item }) {
  const badgeClass =
    item.resolved
      ? styles.badgeResolved
      : item.type === "lost"
        ? styles.badgeLost
        : styles.badgeFound;

  const badgeLabel = item.resolved ? "RESOLVED" : item.type.toUpperCase();

  return (
    <Link to={`/item/${item._id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>No image</div>
        )}
        <span className={`${styles.badge} ${badgeClass}`}>{badgeLabel}</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.location}>📍 {item.location}</p>
        <p className={styles.meta}>
          {item.postedBy?.displayName || "Anonymous"} ·{" "}
          {formatDistanceToNow(item.createdAt)}
        </p>
      </div>
    </Link>
  );
}
