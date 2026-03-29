import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    type:        { type: String, enum: ["lost", "found"], required: true },
    name:        { type: String, required: true },
    description: { type: String, default: "" },
    location:    { type: String, required: true },
    imageUrl:    { type: String, default: "" },
    postedBy: {
      uid:         String,
      email:       String,
      displayName: String,
      photoURL:    String,
    },
    resolved:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────

// Feed filters: type + resolved + createdAt covers every combination
// the feed uses (All, Lost, Found, Resolved, sorted by newest/oldest)
ItemSchema.index({ type: 1, createdAt: -1 });
ItemSchema.index({ resolved: 1, createdAt: -1 });
ItemSchema.index({ type: 1, resolved: 1, createdAt: -1 });

// Location filter on the feed
ItemSchema.index({ location: 1 });

// My Reports page: fetch all items by a specific user
ItemSchema.index({ "postedBy.uid": 1, createdAt: -1 });

// Analytics aggregations (group by date, count by type/resolved)
ItemSchema.index({ createdAt: -1 });

// ── Text Search Index ──────────────────────────────────────────────────────
// Replaces the current RegExp scan on name + description + location.
// MongoDB uses this index for $text queries — much faster than regex.
// Weights: name is most important (10), location second (5), description last (1)
ItemSchema.index(
  { name: "text", description: "text", location: "text" },
  {
    name: "item_text_search",
    weights: { name: 10, location: 5, description: 1 },
    default_language: "english",
  }
);

export default mongoose.model("Item", ItemSchema);
