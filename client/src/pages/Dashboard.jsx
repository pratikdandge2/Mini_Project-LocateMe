import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import Navbar from "../components/Navbar";
import ReportModal from "../components/ReportModal";
import { fetchAnalytics } from "../services/api";
import styles from "./Dashboard.module.css";

// ── Custom tooltip that matches the brutalist design ──────────────────────
function BrutalTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      {label && <p className={styles.tooltipLabel}>{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className={styles.tooltipRow} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ── Time range tabs ────────────────────────────────────────────────────────
const RANGES = [
  { label: "30 DAYS",  key: "daily"   },
  { label: "12 WEEKS", key: "weekly"  },
  { label: "6 MONTHS", key: "monthly" },
];

const CHART_COLORS = {
  lost:     "#ef5350",
  found:    "#66bb6a",
  resolved: "#9e9e9e",
  total:    "#F97316",
  comments: "#7986cb",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [range, setRange]       = useState("daily");
  const [reportModal, setReportModal] = useState(null);

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar onPostItem={() => setReportModal("")} />
        <main className={styles.main}>
          <div className={styles.loadingGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`${styles.skeleton} ${styles.shimmer}`} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Navbar onPostItem={() => setReportModal("")} />
        <main className={styles.main}>
          <p className={styles.errorMsg}>{error}</p>
        </main>
      </div>
    );
  }

  const { summary, breakdown, daily, weekly, monthly,
          topLocations, locationResolution, dayOfWeek, recentlyResolved } = data;

  const chartData = range === "daily" ? daily : range === "weekly" ? weekly : monthly;
  const xKey      = range === "daily" ? "date" : "label";

  // Shorten daily date labels to "MM/DD"
  const formatXAxis = (val) => {
    if (range !== "daily") return val;
    const [, m, d] = val.split("-");
    return `${m}/${d}`;
  };

  return (
    <div className={styles.page}>
      <Navbar onPostItem={() => setReportModal("")} />
      <main className={styles.main}>

        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.heading}>CAMPUS ANALYTICS</h1>
            <p className={styles.subheading}>VCET Lost & Found — live statistics</p>
          </div>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate("/")}
          >
            ← BACK TO FEED
          </button>
        </div>

        {/* ── Stat cards row ── */}
        <div className={styles.statsGrid}>
          {[
            { label: "TOTAL REPORTS",    value: summary.total,           color: "#F97316" },
            { label: "ACTIVE",           value: summary.active,          color: "#1a1a1a" },
            { label: "RESOLVED",         value: summary.resolved,        color: "#66bb6a" },
            { label: "RESOLUTION RATE",  value: `${summary.resolutionRate}%`, color: "#F97316" },
            { label: "LOST",             value: summary.lost,            color: "#ef5350" },
            { label: "FOUND",            value: summary.found,           color: "#66bb6a" },
            { label: "TOTAL COMMENTS",   value: summary.totalComments,   color: "#7986cb" },
            {
              label: "AVG RESOLVE TIME",
              value: summary.avgResolutionHours != null
                ? summary.avgResolutionHours < 24
                  ? `${summary.avgResolutionHours}h`
                  : `${(summary.avgResolutionHours / 24).toFixed(1)}d`
                : "—",
              color: "#F97316",
            },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <span className={styles.statValue} style={{ color: s.color }}>
                {s.value}
              </span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Row 1: Pie + Trend chart ── */}
        <div className={styles.row2}>

          {/* Pie chart — Lost / Found / Resolved breakdown */}
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>BREAKDOWN</h2>
            <p className={styles.chartSub}>Lost · Found · Resolved</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ label, percent }) =>
                    `${label.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {breakdown.map((entry) => (
                    <Cell key={entry.label} fill={entry.color} stroke="#1a1a1a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<BrutalTooltip />} />
                <Legend
                  formatter={(val) => (
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
                      {val}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Area chart — reports over time */}
          <div className={styles.chartCard}>
            <div className={styles.chartTitleRow}>
              <div>
                <h2 className={styles.chartTitle}>REPORTS OVER TIME</h2>
                <p className={styles.chartSub}>Lost vs Found per period</p>
              </div>
              <div className={styles.rangeTabs}>
                {RANGES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    className={range === r.key ? styles.rangeTabActive : styles.rangeTab}
                    onClick={() => setRange(r.key)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradLost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef5350" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef5350" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradFound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#66bb6a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#66bb6a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e8e5e0" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey={xKey}
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 11, fontFamily: "DM Sans, sans-serif" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fontFamily: "DM Sans, sans-serif" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<BrutalTooltip />} />
                <Legend
                  formatter={(val) => (
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
                      {val}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="lost"
                  name="Lost"
                  stroke="#ef5350"
                  strokeWidth={2}
                  fill="url(#gradLost)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="found"
                  name="Found"
                  stroke="#66bb6a"
                  strokeWidth={2}
                  fill="url(#gradFound)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Row 2: Top locations bar + Day of week radar ── */}
        <div className={styles.row2}>

          {/* Horizontal bar chart — top locations */}
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>TOP LOCATIONS</h2>
            <p className={styles.chartSub}>Most reports by campus spot</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topLocations}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
              >
                <CartesianGrid stroke="#e8e5e0" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fontFamily: "DM Sans, sans-serif" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="location"
                  type="category"
                  width={90}
                  tick={{ fontSize: 11, fontFamily: "DM Sans, sans-serif" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<BrutalTooltip />} />
                <Bar dataKey="count" name="Reports" fill="#F97316" radius={0} barSize={16}>
                  {topLocations.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? "#1a1a1a" : "#F97316"}
                      stroke="#1a1a1a"
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar chart — activity by day of week */}
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>ACTIVITY BY DAY</h2>
            <p className={styles.chartSub}>Which days see most reports</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={dayOfWeek} cx="50%" cy="50%" outerRadius={90}>
                <PolarGrid stroke="#e8e5e0" />
                <PolarAngleAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fontFamily: "DM Sans, sans-serif" }}
                />
                <Radar
                  name="Reports"
                  dataKey="count"
                  stroke="#F97316"
                  fill="#F97316"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Tooltip content={<BrutalTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Row 3: Total reports bar chart (full width) ── */}
        <div className={styles.chartCardFull}>
          <div className={styles.chartTitleRow}>
            <div>
              <h2 className={styles.chartTitle}>DAILY REPORT VOLUME</h2>
              <p className={styles.chartSub}>Total reports per day — last 30 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={daily} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="#e8e5e0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => { const [,m,d] = v.split("-"); return `${m}/${d}`; }}
                tick={{ fontSize: 10, fontFamily: "DM Sans, sans-serif" }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 11, fontFamily: "DM Sans, sans-serif" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<BrutalTooltip />} />
              <Bar dataKey="count" name="Total" fill="#1a1a1a" radius={0} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Row 4: Resolution rate by location + Recently resolved ── */}
        <div className={styles.row2}>

          {/* Resolution rate bar chart */}
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>RESOLUTION RATE BY LOCATION</h2>
            <p className={styles.chartSub}>% of items resolved per spot</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={locationResolution}
                layout="vertical"
                margin={{ top: 0, right: 24, bottom: 0, left: 8 }}
              >
                <CartesianGrid stroke="#e8e5e0" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11, fontFamily: "DM Sans, sans-serif" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="location"
                  type="category"
                  width={90}
                  tick={{ fontSize: 11, fontFamily: "DM Sans, sans-serif" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={<BrutalTooltip />}
                  formatter={(v) => [`${v}%`, "Rate"]}
                />
                <Bar dataKey="rate" name="Resolution %" fill="#66bb6a"
                  radius={0} barSize={14} stroke="#1a1a1a" strokeWidth={1} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recently resolved list */}
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>RECENTLY RESOLVED</h2>
            <p className={styles.chartSub}>Last 5 items claimed</p>
            <ul className={styles.resolvedList}>
              {recentlyResolved.length === 0 ? (
                <li className={styles.resolvedEmpty}>No resolved items yet</li>
              ) : (
                recentlyResolved.map((item) => (
                  <li key={item._id} className={styles.resolvedItem}>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className={styles.resolvedThumb}
                      />
                    ) : (
                      <div className={styles.resolvedThumbPlaceholder}>?</div>
                    )}
                    <div className={styles.resolvedInfo}>
                      <span className={styles.resolvedName}>{item.name}</span>
                      <span className={styles.resolvedMeta}>
                        📍 {item.location} ·{" "}
                        <span
                          className={
                            item.type === "lost"
                              ? styles.badgeLost
                              : styles.badgeFound
                          }
                        >
                          {item.type.toUpperCase()}
                        </span>
                      </span>
                    </div>
                    <span className={styles.resolvedCheck}>✅</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

      </main>

      {reportModal !== null && (
        <ReportModal
          type={reportModal || null}
          onClose={() => setReportModal(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
