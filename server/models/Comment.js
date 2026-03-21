import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    text: { type: String, required: true },
    postedBy: {
      uid: String,
      email: String,
      displayName: String,
      photoURL: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema);
