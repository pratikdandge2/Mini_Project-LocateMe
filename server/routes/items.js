import express from "express";
import Item from "../models/Item.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { io } from "../server.js";

const router = express.Router();

// GET all items (public)
// Back-compat: when only ?type and ?page are used, returns an array (legacy).
// New: supports search/location/sort/limit and can return meta envelope via ?includeMeta=true.
router.get("/", async (req, res) => {
  const {
    type,
    page = 1,
    limit,
    search,
    location,
    sort = "newest",
    includeMeta,
  } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Math.min(50, Number(limit) || 20));

  const filter = {};
  if (type === "resolved") {
    filter.resolved = true;
  } else if (type) {
    filter.type = type;
  }
  if (location && location !== "all") filter.location = new RegExp(location, "i");
  if (search) {
    // Use MongoDB text index for fast full-text search.
    // $text cannot be combined with $or on the same filter, so we use
    // it standalone. The text index weights (name:10, location:5, desc:1)
    // ensure the most relevant results rank first.
    filter.$text = { $search: search };
  }

  const wantsMeta =
    includeMeta === "true" ||
    Boolean(search) ||
    Boolean(location) ||
    sort !== "newest" ||
    Boolean(limit);

  if (sort === "mostCommented") {
    const skip = (pageNum - 1) * pageSize;
    const [items, totalArr] = await Promise.all([
      Item.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "itemId",
            as: "comments",
          },
        },
        { $addFields: { commentCount: { $size: "$comments" } } },
        { $sort: { commentCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: pageSize },
        { $project: { comments: 0 } },
      ]),
      Item.aggregate([{ $match: filter }, { $count: "total" }]),
    ]);

    if (!wantsMeta) return res.json(items);

    const total = totalArr?.[0]?.total || 0;
    return res.json({
      items,
      total,
      page: pageNum,
      hasMore: pageNum * pageSize < total,
    });
  }

  const sortOrder = sort === "oldest" ? 1 : -1;
  const skip = (pageNum - 1) * pageSize;

  const [items, total] = await Promise.all([
    Item.find(filter)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(pageSize),
    wantsMeta ? Item.countDocuments(filter) : Promise.resolve(0),
  ]);

  if (!wantsMeta) return res.json(items);

  return res.json({
    items,
    total,
    page: pageNum,
    hasMore: pageNum * pageSize < total,
  });
});

// GET /api/items/mine — items posted by current user
router.get('/mine', verifyToken, async (req, res) => {
  const { status } = req.query; // 'active' | 'resolved' | '' (all)
  const filter = { 'postedBy.uid': req.user.uid };
  if (status === 'resolved') filter.resolved = true;
  if (status === 'active')   filter.resolved = false;
  const items = await Item.find(filter).sort({ createdAt: -1 });
  res.json(items);
});

// GET single item
router.get("/:id", async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// POST create item (protected)
router.post("/", verifyToken, async (req, res) => {
  const { type, name, description, location, imageUrl } = req.body;
  const item = await Item.create({
    type,
    name,
    description,
    location,
    imageUrl,
    postedBy: {
      uid: req.user.uid,
      email: req.user.email,
      displayName: req.user.name || req.user.email.split("@")[0],
      photoURL: req.user.picture || "",
    },
  });
  res.status(201).json(item);
});

// PATCH mark as resolved (owner only)
router.patch("/:id/resolve", verifyToken, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  if (item.postedBy.uid !== req.user.uid)
    return res.status(403).json({ error: "Not authorized" });
  item.resolved = !item.resolved;
  await item.save();
  res.json(item);
});

// DELETE item (owner only)
router.delete("/:id", verifyToken, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  if (item.postedBy.uid !== req.user.uid)
    return res.status(403).json({ error: "Not authorized" });
  await item.deleteOne();
  res.json({ message: "Deleted" });
});

// GET comments for item
router.get("/:id/comments", async (req, res) => {
  const comments = await Comment.find({ itemId: req.params.id }).sort({
    createdAt: 1,
  });
  res.json(comments);
});

// POST comment (protected) — also emits Socket.IO event
router.post("/:id/comments", verifyToken, async (req, res) => {
  const { text } = req.body;
  const comment = await Comment.create({
    itemId: req.params.id,
    text,
    postedBy: {
      uid: req.user.uid,
      email: req.user.email,
      displayName: req.user.name || req.user.email.split("@")[0],
      photoURL: req.user.picture || "",
    },
  });
  io.to(req.params.id).emit("new_comment", comment);

  // Notify item owner (only if commenter is not the owner)
  try {
    const item = await Item.findById(req.params.id).select('postedBy name');
    if (item && item.postedBy?.uid && item.postedBy.uid !== req.user.uid) {
      const notif = await Notification.create({
        toUid:    item.postedBy.uid,
        type:     'comment',
        message:  `${req.user.name || req.user.email.split('@')[0]} commented on your item "${item.name}"`,
        itemId:   item._id,
        itemName: item.name,
        fromName: req.user.name || req.user.email.split('@')[0],
      });
      // Send to owner's personal socket room
      io.to(`user:${item.postedBy.uid}`).emit('notification', notif);
    }
  } catch (e) {
    // Non-critical — don't fail the comment response
    console.error('Notification error:', e.message);
  }

  res.status(201).json(comment);
});

// DELETE comment (owner only) — emits Socket.IO event
router.delete("/:id/comments/:commentId", verifyToken, async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ error: "Not found" });
  if (comment.postedBy.uid !== req.user.uid)
    return res.status(403).json({ error: "Not authorized" });
  
  await comment.deleteOne();
  io.to(req.params.id).emit("delete_comment", req.params.commentId);
  res.json({ message: "Deleted" });
});

export default router;
