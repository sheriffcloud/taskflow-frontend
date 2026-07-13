import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  // Track which tab is active: "login" or "register"
  const [mode, setMode] = useState("login");

  // Form field values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error message to show if something goes wrong
  const [error, setError] = useState("");

  // Loading state so we can disable the button while waiting
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  // useNavigate lets us programmatically change the URL
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    // Prevent the browser's default form submission
    // (which would refresh the page — we don't want that in React)
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      // On success, redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      // Show the error message from the server, or a fallback
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>TaskFlow</h1>
        <p style={styles.subtitle}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </p>

        {/* Tab switcher */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(mode === "login" ? styles.activeTab : {}) }}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Login
          </button>
          <button
            style={{ ...styles.tab, ...(mode === "register" ? styles.activeTab : {}) }}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "register" && (
            <div style={styles.field}>
              <label style={styles.label}>Name</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f1117",
  },
  card: {
    background: "#1a1f2e",
    border: "1px solid #2d3748",
    borderRadius: "12px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
  },
  logo: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#6366f1",
    textAlign: "center",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: "32px",
    fontSize: "14px",
  },
  tabs: {
    display: "flex",
    background: "#0f1117",
    borderRadius: "8px",
    padding: "4px",
    marginBottom: "24px",
  },
  tab: {
    flex: 1,
    padding: "8px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    background: "transparent",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "500",
  },
  activeTab: {
    background: "#6366f1",
    color: "#ffffff",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", color: "#94a3b8", fontWeight: "500" },
  input: {
    padding: "10px 14px",
    background: "#0f1117",
    border: "1px solid #2d3748",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "14px",
    outline: "none",
  },
  error: {
    color: "#f87171",
    fontSize: "13px",
    textAlign: "center",
  },
  button: {
    padding: "12px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
};

export default LoginPage;