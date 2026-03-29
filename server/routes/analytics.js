import express from "express";
import Item from "../models/Item.js";
import Comment from "../models/Comment.js";

const router = express.Router();

// GET /api/analytics/summary
// Returns all data needed for the dashboard in a single request.
// Public endpoint — no auth required (aggregate counts only, no personal data).
router.get("/summary", async (req, res) => {
  try {
    // ── 1. Top-level counts ──────────────────────────────────────────────
    const [total, resolved, lost, found, totalComments] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ resolved: true }),
      Item.countDocuments({ type: "lost",  resolved: false }),
      Item.countDocuments({ type: "found", resolved: false }),
      Comment.countDocuments(),
    ]);

    const resolutionRate =
      total > 0 ? parseFloat(((resolved / total) * 100).toFixed(1)) : 0;

    // ── 2. Reports per day — last 30 days ────────────────────────────────
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyRaw = await Item.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          lost:  { $sum: { $cond: [{ $eq: ["$type", "lost"]  }, 1, 0] } },
          found: { $sum: { $cond: [{ $eq: ["$type", "found"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days with 0 so the chart line is continuous
    const dailyMap = {};
    dailyRaw.forEach((d) => { dailyMap[d._id] = d; });
    const daily = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      daily.push(
        dailyMap[key]
          ? { date: key, count: dailyMap[key].count, lost: dailyMap[key].lost, found: dailyMap[key].found }
          : { date: key, count: 0, lost: 0, found: 0 }
      );
    }

    // ── 3. Reports per week — last 12 weeks ──────────────────────────────
    const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000);
    const weeklyRaw = await Item.aggregate([
      { $match: { createdAt: { $gte: twelveWeeksAgo } } },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$createdAt" },
            week: { $isoWeek: "$createdAt" },
          },
          count: { $sum: 1 },
          lost:  { $sum: { $cond: [{ $eq: ["$type", "lost"]  }, 1, 0] } },
          found: { $sum: { $cond: [{ $eq: ["$type", "found"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ]);

    const weekly = weeklyRaw.map((w) => ({
      label: `W${w._id.week}`,
      count: w.count,
      lost:  w.lost,
      found: w.found,
    }));

    // ── 4. Reports per month — last 6 months ─────────────────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRaw = await Item.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          lost:  { $sum: { $cond: [{ $eq: ["$type", "lost"]  }, 1, 0] } },
          found: { $sum: { $cond: [{ $eq: ["$type", "found"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthly = monthlyRaw.map((m) => ({
      label: `${MONTHS[m._id.month - 1]} ${m._id.year}`,
      count: m.count,
      lost:  m.lost,
      found: m.found,
    }));

    // ── 5. Top campus locations by report count ───────────────────────────
    const topLocations = await Item.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $project: { location: "$_id", count: 1, _id: 0 } },
    ]);

    // ── 6. Resolution rate per location ───────────────────────────────────
    const locationResolution = await Item.aggregate([
      {
        $group: {
          _id:      "$location",
          total:    { $sum: 1 },
          resolved: { $sum: { $cond: ["$resolved", 1, 0] } },
        },
      },
      { $match: { total: { $gte: 2 } } }, // only locations with 2+ reports
      {
        $project: {
          location: "$_id",
          total: 1,
          resolved: 1,
          rate: {
            $round: [
              { $multiply: [{ $divide: ["$resolved", "$total"] }, 100] },
              1,
            ],
          },
          _id: 0,
        },
      },
      { $sort: { rate: -1 } },
      { $limit: 6 },
    ]);

    // ── 7. Average resolution time (in hours) ────────────────────────────
    const avgResolutionResult = await Item.aggregate([
      { $match: { resolved: true } },
      {
        $project: {
          diffHours: {
            $divide: [
              { $subtract: ["$updatedAt", "$createdAt"] },
              1000 * 60 * 60, // ms → hours
            ],
          },
        },
      },
      { $group: { _id: null, avgHours: { $avg: "$diffHours" } } },
    ]);
    const avgResolutionHours =
      avgResolutionResult.length > 0
        ? parseFloat(avgResolutionResult[0].avgHours.toFixed(1))
        : null;

    // ── 8. Lost vs Found vs Resolved breakdown (for pie chart) ───────────
    const breakdown = [
      { label: "Lost (active)",  value: lost,     color: "#ef5350" },
      { label: "Found (active)", value: found,    color: "#66bb6a" },
      { label: "Resolved",       value: resolved, color: "#9e9e9e" },
    ];

    // ── 9. Most active days of week ───────────────────────────────────────
    const dayOfWeekRaw = await Item.aggregate([
      {
        $group: {
          _id:   { $dayOfWeek: "$createdAt" }, // 1=Sun … 7=Sat
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOfWeek = Array.from({ length: 7 }, (_, i) => {
      const found = dayOfWeekRaw.find((d) => d._id === i + 1);
      return { day: DOW[i], count: found ? found.count : 0 };
    });

    // ── 10. Recent activity (last 5 resolved items) ───────────────────────
    const recentlyResolved = await Item.find({ resolved: true })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("name location type updatedAt imageUrl");

    res.json({
      summary: {
        total,
        resolved,
        active: lost + found,
        lost,
        found,
        totalComments,
        resolutionRate,
        avgResolutionHours,
      },
      breakdown,
      daily,
      weekly,
      monthly,
      topLocations,
      locationResolution,
      dayOfWeek,
      recentlyResolved,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Failed to load analytics" });
  }
});

export default router;
