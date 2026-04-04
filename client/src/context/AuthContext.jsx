import { createContext, useContext, useEffect, useState } from "react";
import { auth, loginWithGoogle, logout } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.email.endsWith("@vcet.edu.in")) {
          await logout();
          setAuthError(
            "Only VCET students can access LocateMe. Please use your college email."
          );
          setUser(null);
        } else {
          setUser(firebaseUser);
          setAuthError("");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Derived — never stored in state so it always reflects the current env var
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();
  const isAdmin = Boolean(
    user?.email &&
    adminEmail &&
    user.email.trim().toLowerCase() === adminEmail
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, authError, loginWithGoogle, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
