import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "myapp_auth"; // Namespaced key for localStorage
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ user: null, token: null });
  const [loading, setLoading] = useState(true);

  // Load auth from localStorage on mount.
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.user && parsed?.token) {
          setAuth(parsed);
        }
      } catch (err) {
        console.warn("Malformed auth data in localStorage, ignoring.", err);
      }
    }
    // Set loading to false after the initial check is complete
    setLoading(false);
  }, []);

  // Persist auth to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  /**
   * Log in user: store user and token.
   * This assumes the user object returned from the backend's
   * login endpoint already contains the roles.
   * @param {object} user - user object returned from backend
   * @param {string} token - API token
   */
  const login = (user, token) => {
    setAuth({ user, token });
  };

  /**
   * Log out user: clear user and token
   */
  const logout = () => {
    setAuth({ user: null, token: null });
  };

  /**
   * Memoized context value to avoid unnecessary re-renders
   */
  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      isAuthenticated: !!auth.user && !!auth.token,
      loading,
      login,
      logout,
    }),
    [auth, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to consume AuthContext
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
