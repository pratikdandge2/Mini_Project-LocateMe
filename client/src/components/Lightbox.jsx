import { useEffect } from 'react';
import styles from './Lightbox.module.css';

export default function Lightbox({ imageUrl, altText, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.inner} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          × CLOSE
        </button>
        <img src={imageUrl} alt={altText || ''} className={styles.img} />
        {altText && <p className={styles.caption}>{altText}</p>}
      </div>
    </div>
  );
}
