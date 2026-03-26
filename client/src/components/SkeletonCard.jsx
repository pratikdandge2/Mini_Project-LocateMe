import styles from './SkeletonCard.module.css';

export default function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={`${styles.img} ${styles.shimmer}`} />
      <div className={styles.body}>
        <div className={`${styles.badge} ${styles.shimmer}`} />
        <div className={`${styles.title} ${styles.shimmer}`} />
        <div className={`${styles.line} ${styles.shimmer}`} />
        <div className={`${styles.line} ${styles.short} ${styles.shimmer}`} />
      </div>
    </div>
  );
}
