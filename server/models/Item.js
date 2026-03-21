import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["lost", "found"], required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    location: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    postedBy: {
      uid: String,
      email: String,
      displayName: String,
      photoURL: String,
    },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Item", ItemSchema);
