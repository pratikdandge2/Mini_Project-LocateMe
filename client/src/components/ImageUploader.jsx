import { useRef, useState, useEffect } from "react";
import styles from "./ImageUploader.module.css";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsMobile(
        window.matchMedia("(hover: none) and (pointer: coarse)").matches
      );
    check();
    window.matchMedia("(hover: none) and (pointer: coarse)")
      .addEventListener("change", check);
    return () =>
      window.matchMedia("(hover: none) and (pointer: coarse)")
        .removeEventListener("change", check);
  }, []);
  return isMobile;
}

export default function ImageUploader({ onImageSelected, preview }) {
  const desktopInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(preview || null);
  const isMobile = useIsMobile();

  const handleFile = (file) => {
    if (!file) return;
    onImageSelected?.(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemove = () => {
    onImageSelected?.(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    [desktopInputRef, cameraInputRef, galleryInputRef].forEach((r) => {
      if (r.current) r.current.value = "";
    });
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
        <p className={styles.changeHint}>Tap × to remove and choose a different image</p>
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div className={styles.wrap}>
        <label className={styles.uploadBox}>
          <input
            ref={desktopInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className={styles.hiddenInput}
          />
          <span className={styles.icon}>📷</span>
          <span className={styles.label}>Click to upload an image</span>
          <span className={styles.hint}>PNG, JPG, WEBP supported</span>
        </label>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className={styles.hiddenInput}
        tabIndex={-1}
        aria-hidden="true"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className={styles.hiddenInput}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className={styles.mobileUploadArea}>
        <span className={styles.icon}>🖼️</span>
        <p className={styles.label}>Add a photo of the item</p>
        <p className={styles.hint}>Choose how you want to add the image</p>

        <div className={styles.btnRow}>
          <button
            type="button"
            className={styles.cameraBtn}
            onClick={() => cameraInputRef.current?.click()}
          >
            📷 TAKE PHOTO
          </button>
          <button
            type="button"
            className={styles.galleryBtn}
            onClick={() => galleryInputRef.current?.click()}
          >
            🗂️ FROM GALLERY
          </button>
        </div>
      </div>
    </div>
  );
}