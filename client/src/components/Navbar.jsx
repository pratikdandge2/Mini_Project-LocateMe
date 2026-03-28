import { useState } from "react";
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
  const { user, logout, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const firstName = displayName.split(" ")[0].slice(0, 12);
  const photoURL = user?.photoURL;

  const handlePostItem = () => {
    setMenuOpen(false);
    if (onPostItem) onPostItem();
    else navigate("/", { state: { openReport: true } });
  };

  const handleLogout = () => {
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

            <div className={styles.userChip}>
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
              <div className={styles.bellWrap}>
                <NotificationBell />
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className={styles.logoutBtn}
            >
              LOG OUT
            </button>

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
