import { useRef, useState } from "react";
import styles from "./ImageUploader.module.css";

export default function ImageUploader({ onImageSelected, preview }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(preview || null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImageSelected?.(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemove = () => {
    onImageSelected?.(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={styles.wrap}>
      {previewUrl ? (
        <div className={styles.previewWrap}>
          <img src={previewUrl} alt="Preview" className={styles.preview} />
          <button
            type="button"
            onClick={handleRemove}
            className={styles.removeBtn}
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      ) : (
        <label className={styles.uploadBox}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleChange}
            className={styles.input}
          />
          <span className={styles.icon}>📷</span>
          <span className={styles.label}>Drop image or click to upload</span>
        </label>
      )}
    </div>
  );
}
