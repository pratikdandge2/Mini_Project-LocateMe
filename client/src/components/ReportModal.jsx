import { useState } from "react";
import { uploadImageToCloudinary, createItem } from "../services/api";
import ImageUploader from "./ImageUploader";
import styles from "./ReportModal.module.css";

export default function ReportModal({ type: typeProp, onClose, onSuccess }) {
  const [selectedType, setSelectedType] = useState(
    typeProp === "lost" || typeProp === "found" ? typeProp : null
  );
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const needsTypePicker = !typeProp || typeProp === "";
  const type = selectedType || typeProp;
  const title =
    type === "lost" ? "REPORT LOST ITEM" : "REPORT FOUND ITEM";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Item name is required.");
      return;
    }
    if (!location.trim()) {
      setError("Location is required.");
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }
      await createItem({
        type,
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        imageUrl,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (needsTypePicker && !selectedType) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close"
          >
            ×
          </button>
          <h2 className={styles.title}>POST AN ITEM</h2>
          <p className={styles.typePrompt}>What would you like to report?</p>
          <div className={styles.typeChoices}>
            <button
              type="button"
              onClick={() => setSelectedType("lost")}
              className={styles.typeBtnLost}
            >
              REPORT LOST
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("found")}
              className={styles.typeBtnFound}
            >
              REPORT FOUND
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className={styles.closeBtn}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className={styles.title}>{title}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Item Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Blue water bottle"
            className={styles.input}
            required
          />
          <label className={styles.label}>
            Location <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Library, Cafeteria"
            className={styles.input}
            required
          />
          <label className={styles.label}>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any extra details..."
            className={styles.textarea}
            rows={3}
          />
          <label className={styles.label}>Image</label>
          <ImageUploader onImageSelected={setImageFile} />
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={styles.submitBtn}
            >
              {submitting ? "SUBMITTING…" : "SUBMIT REPORT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
