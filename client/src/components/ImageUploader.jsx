import { useRef, useState } from "react";
import styles from "./ImageUploader.module.css";

export default function ImageUploader({ onImageSelected, preview }) {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(preview || null);

  const handleFile = (file) => {
    if (!file) return;
    onImageSelected?.(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleCameraChange = (e) => handleFile(e.target.files?.[0]);
  const handleGalleryChange = (e) => handleFile(e.target.files?.[0]);

  const handleRemove = () => {
    onImageSelected?.(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  if (previewUrl) {
    return (
      <div className={styles.wrap}>
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
        <p className={styles.changeHint}>
          Tap × to remove and choose a different image
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {/* Hidden inputs — one forces camera, one opens gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraChange}
        className={styles.hiddenInput}
        tabIndex={-1}
        aria-hidden="true"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleGalleryChange}
        className={styles.hiddenInput}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className={styles.uploadArea}>
        <span className={styles.uploadIcon}>🖼️</span>
        <p className={styles.uploadLabel}>Add a photo of the item</p>
        <p className={styles.uploadHint}>
          Choose how you want to add the image
        </p>

        <div className={styles.btnRow}>
          <button
            type="button"
            className={styles.cameraBtn}
            onClick={() => cameraInputRef.current?.click()}
          >
            <span className={styles.btnIcon}>📷</span>
            TAKE PHOTO
          </button>

          <button
            type="button"
            className={styles.galleryBtn}
            onClick={() => galleryInputRef.current?.click()}
          >
            <span className={styles.btnIcon}>🗂️</span>
            CHOOSE FROM GALLERY
          </button>
        </div>
      </div>
    </div>
  );
}
