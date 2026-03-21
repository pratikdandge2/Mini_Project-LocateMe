import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Feed from "../components/Feed";
import ReportModal from "../components/ReportModal";
import ItemsDrawer from "../components/ItemsDrawer";
import FloatingShapes from "../components/FloatingShapes";
import styles from "./Home.module.css";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: "📷",
    title: "PHOTO-FIRST REPORTING",
    desc: "Upload a clear photo of the item so owners can identify it.",
  },
  {
    icon: "📍",
    title: "LOCATION-BASED TAGGING",
    desc: "Tag exact campus locations like Library, Canteen or Main Gate.",
  },
  {
    icon: "💬",
    title: "REAL-TIME COMMENTS",
    desc: "Comment on any post instantly via live WebSocket feed.",
  },
  {
    icon: "🏷️",
    title: "LOST & FOUND FEED",
    desc: "Filter all campus items by Lost or Found status.",
  },
  {
    icon: "✅",
    title: "MARK RESOLVED",
    desc: "Once an item is claimed, mark it resolved to clear the feed.",
  },
  {
    icon: "🔒",
    title: "VCET-ONLY ACCESS",
    desc: "Only @vcet.edu.in emails can post or comment.",
  },
];

export default function Home() {
  const location = useLocation();
  const { user, loginWithGoogle } = useAuth();
  const [typeFilter, setTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [reportModal, setReportModal] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [itemsDrawerOpen, setItemsDrawerOpen] = useState(false);

  useEffect(() => {
    if (location.state?.openReport) {
      setReportModal("");
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location.state?.openReport, location.pathname]);

  const openReport = (type) => setReportModal(type);
  const closeReport = () => setReportModal(null);
  const onReportSuccess = useCallback(() => {
    setRefreshTrigger((t) => t + 1);
  }, []);

  return (
    <div className={styles.page}>
      <Navbar onPostItem={() => setReportModal("")} />

      {/* Hero — full-width, outside the max-width wrapper */}
      <section className={`${styles.hero} halftone-bg`}>
        <FloatingShapes />
        <div className={styles.heroContent}>

          {/* Widget — 128×128 with hard drop shadow */}
          <div className={styles.heroWidget}>
            <span className={styles.heroWidgetBadge}>LIVE</span>
            <div className={styles.waveform}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span
                  key={i}
                  className={styles.waveBar}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>

          <h1 className={styles.heroTitle}>
            FIND WHAT YOU
            <br />
            LOST ON CAMPUS.
            <br />
            <span className={styles.heroHighlight}>REPORT WHAT YOU FOUND.</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Experience a campus-wide lost &amp; found board where students report
            lost and found items instantly. Upload a photo, describe where you
            found it, and help someone get it back.
          </p>

          <div className={styles.heroCtas}>
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => openReport("")}
                  className={styles.heroBtnPrimary}
                >
                  📍 POST AN ITEM →
                </button>
                <a href="#feed" className={styles.heroBtnSecondary}>
                  VIEW RECENT REPORTS
                </a>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className={styles.heroGoogleBtn}
                >
                  <GoogleIcon />
                  CONTINUE WITH GOOGLE
                </button>
                <a href="#feed" className={styles.heroBtnSecondary}>
                  VIEW RECENT REPORTS
                </a>
              </>
            )}
          </div>

          <div className={styles.heroBanner}>
            VCET CAMPUS ONLY • SIGN IN WITH YOUR COLLEGE EMAIL TO POST &amp; COMMENT
          </div>

        </div>
      </section>

      <main className={styles.main}>

        {/* Features */}
        <section className={styles.features}>
          <span className={styles.featuresBadge}>FEATURES</span>
          <h2 className={styles.featuresTitle}>HOW LOCATEME WORKS</h2>
          <p className={styles.featuresIntro}>
            Our campus-wide platform lets you instantly report lost and found
            items with photos, location, and real-time comments — restricted to
            VCET students only.
          </p>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIconBox}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feed */}
        <section id="feed" className={styles.feedSection}>
          <span className={styles.feedBadge}>FEED</span>
          <h2 className={styles.feedTitle}>RECENT REPORTS FROM VCET CAMPUS</h2>

          {user ? (
            <>
              <div className={styles.feedSearchWrap}>
                <input
                  className={styles.feedSearchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍  Search items by name or location..."
                />
                <div className={styles.feedFiltersRow}>
                  <label className={styles.feedSelectLabel}>
                    Location:
                    <select
                      className={styles.feedSelect}
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="Library">Library</option>
                      <option value="Cafeteria">Cafeteria</option>
                      <option value="Lab Block">Lab Block</option>
                      <option value="Main Gate">Main Gate</option>
                      <option value="Parking">Parking</option>
                      <option value="Auditorium">Auditorium</option>
                      <option value="Ground Floor">Ground Floor</option>
                      <option value="Admin Block">Admin Block</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </label>

                  <label className={styles.feedSelectLabel}>
                    Sort:
                    <select
                      className={styles.feedSelect}
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="mostCommented">Most Commented</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className={styles.tabs}>
                <button
                  type="button"
                  onClick={() => setTypeFilter("")}
                  className={typeFilter === "" ? styles.tabActive : styles.tab}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("lost")}
                  className={typeFilter === "lost" ? styles.tabActive : styles.tab}
                >
                  Lost
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("found")}
                  className={typeFilter === "found" ? styles.tabActive : styles.tab}
                >
                  Found
                </button>
              </div>
              <Feed
                typeFilter={typeFilter}
                refreshTrigger={refreshTrigger}
                searchQuery={searchQuery}
                locationFilter={locationFilter}
                sortOption={sortOption}
              />
              <div className={styles.viewAllWrap}>
                <a
                  href="#feed"
                  className={styles.viewAllLink}
                  onClick={(e) => {
                    e.preventDefault();
                    setItemsDrawerOpen(true);
                  }}
                >
                  VIEW ALL ITEMS →
                </a>
              </div>
            </>
          ) : (
            /* ── Guest: blurred placeholder feed ── */
            <div className={styles.feedBlurContainer}>
              <div className={styles.feedPlaceholderGrid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={styles.feedPlaceholderCard} />
                ))}
              </div>
              <div className={styles.feedBlurOverlay}>
                <div className={styles.feedBlurContent}>
                  <span className={styles.feedLockIcon}>🔒</span>
                  <h3 className={styles.feedBlurTitle}>Login to see the content</h3>
                  <p className={styles.feedBlurSubtitle}>
                    Sign in with your VCET email to view lost &amp; found reports
                  </p>
                  <button
                    type="button"
                    onClick={loginWithGoogle}
                    className={styles.heroGoogleBtn}
                  >
                    <GoogleIcon />
                    CONTINUE WITH GOOGLE
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <ItemsDrawer
        open={itemsDrawerOpen}
        onClose={() => setItemsDrawerOpen(false)}
      />
      {reportModal !== null && (
        <ReportModal
          type={reportModal || null}
          onClose={closeReport}
          onSuccess={onReportSuccess}
        />
      )}
    </div>
  );
}
