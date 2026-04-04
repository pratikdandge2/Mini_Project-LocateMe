import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import styles from "./Navbar.module.css";

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function Navbar({ onPostItem }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, loginWithGoogle, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const firstName = displayName.split(" ")[0].slice(0, 12);
  const photoURL = user?.photoURL;

  // Handle outside click for profile menu
  useEffect(() => {
    if (!profileMenuOpen) return;
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileMenuOpen]);

  const handlePostItem = () => {
    setMenuOpen(false);
    if (onPostItem) onPostItem();
    else navigate("/", { state: { openReport: true } });
  };

  const handleLogout = () => {
    setProfileMenuOpen(false);
    setMenuOpen(false);
    logout();
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logoWrap}>
        <span className={styles.logoIcon}><MapPinIcon /></span>
        <span className={styles.logoText}>LOCATEME</span>
      </Link>

      <button
        type="button"
        className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ""}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>

      <div className={`${styles.right} ${menuOpen ? styles.rightOpen : ""}`}>
        {user ? (
          <>
            <Link
              to="/my-reports"
              className={styles.myReportsBtn}
              onClick={() => setMenuOpen(false)}
            >
              MY REPORTS
            </Link>

            <Link
              to="/dashboard"
              className={styles.myReportsBtn}
              onClick={() => setMenuOpen(false)}
            >
              📊 STATS
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={styles.adminNavBtn}
                onClick={() => setMenuOpen(false)}
              >
                🛡️ ADMIN
              </Link>
            )}

            <div className={styles.userChip} ref={profileRef}>
              <div
                className={styles.profileTrigger}
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                role="button"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={profileMenuOpen}
              >
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt=""
                    className={styles.avatar}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className={styles.avatarPlaceholder}>
                    {firstName.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className={styles.userName}>{firstName}</span>
                <span className={styles.chevron}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className={profileMenuOpen ? styles.chevronUp : ""}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </div>

              {profileMenuOpen && (
                <div className={styles.profileDropdown}>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={styles.dropdownItem}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    LOG OUT
                  </button>
                </div>
              )}

              <div className={styles.bellWrap}>
                <NotificationBell />
              </div>
            </div>

            <button
              type="button"
              onClick={handlePostItem}
              className={styles.ctaBtn}
            >
              POST ITEM →
            </button>
          </>
        ) : (
          <button type="button" onClick={loginWithGoogle} className={styles.ctaBtn}>
            LOGIN
          </button>
        )}
      </div>
    </nav>
  );
}
