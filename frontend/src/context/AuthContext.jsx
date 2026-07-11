import { createContext, useContext, useState, useEffect } from "react";
import api, { setToken, clearToken } from "../api/client";

// Step 1: Create the Context — this is the "wall socket"
const AuthContext = createContext(null);

// Step 2: Create the Provider — this is the "power plant"
// It wraps your entire app and makes the user state available everywhere
export const AuthProvider = ({ children }) => {
  // useState holds the current user object (or null if not logged in)
  const [user, setUser] = useState(null);

  // Are we currently checking if the user is already logged in?
  // We show a loading screen during this check so components
  // don't flash "logged out" state before we've confirmed the session
  const [loading, setLoading] = useState(true);

  // ── Check if user is already logged in on app load ──────────────────────
  // When the user refreshes the page, our in-memory token is gone.
  // We stored the token in sessionStorage as a backup.
  // sessionStorage persists through page refresh but clears when
  // the browser tab is closed — a reasonable security balance.
  useEffect(() => {
    const savedToken = sessionStorage.getItem("taskflow_token");

    if (savedToken) {
      // Restore the token to our in-memory store
      setToken(savedToken);

      // Verify it's still valid by hitting /auth/me
      api.get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          // Token is expired or invalid — clean up
          sessionStorage.removeItem("taskflow_token");
          clearToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []); // Empty array = run only once when the component first mounts

  // ── Login function ────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { user, accessToken } = res.data;

    // Store token in memory (for API calls) AND sessionStorage (for refresh)
    setToken(accessToken);
    sessionStorage.setItem("taskflow_token", accessToken);
    setUser(user);

    return user;
  };

  // ── Register function ─────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    const { user, accessToken } = res.data;

    setToken(accessToken);
    sessionStorage.setItem("taskflow_token", accessToken);
    setUser(user);

    return user;
  };

  // ── Logout function ───────────────────────────────────────────────────────
  const logout = () => {
    clearToken();
    sessionStorage.removeItem("taskflow_token");
    setUser(null);
  };

  // Step 3: Provide the values to all children
  // Any component wrapped by AuthProvider can access:
  // user, login, register, logout, loading
  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {loading ? (
        // Show nothing while we check the session
        // This prevents a flash of "logged out" content
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          height: "100vh",
          color: "#94a3b8"
        }}>
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// Step 4: Custom hook — makes it easy to use the context
// Instead of: const { user } = useContext(AuthContext)
// Any component can do: const { user } = useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};