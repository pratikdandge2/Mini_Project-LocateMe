import express from 'express';
import Notification from '../models/Notification.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// GET /api/notifications — current user's notifications (newest first, max 30)
router.get('/', verifyToken, async (req, res) => {
  const notifs = await Notification.find({ toUid: req.user.uid })
    .sort({ createdAt: -1 })
    .limit(30);
  res.json(notifs);
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', verifyToken, async (req, res) => {
  await Notification.updateMany({ toUid: req.user.uid }, { read: true });
  res.json({ ok: true });
});

// DELETE /api/notifications/clear — delete all notifications for user
router.delete('/clear', verifyToken, async (req, res) => {
  await Notification.deleteMany({ toUid: req.user.uid });
  res.json({ ok: true });
});

export default router;
