import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  toUid:    { type: String, required: true, index: true },
  type:     { type: String, enum: ['comment'], required: true },
  message:  { type: String, required: true },
  itemId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  itemName: { type: String },
  fromName: { type: String },
  read:     { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
