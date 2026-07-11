import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ notifications }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <span style={styles.logo}>TaskFlow</span>

      <div style={styles.right}>
        {/* Notification bell — shows count if there are unread notifications */}
        {notifications.length > 0 && (
          <div style={styles.notifBadge}>
            🔔 {notifications.length}
          </div>
        )}

        <span style={styles.userEmail}>{user?.email}</span>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    height: "60px",
    background: "#1a1f2e",
    borderBottom: "1px solid #2d3748",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: { fontSize: "20px", fontWeight: "700", color: "#6366f1" },
  right: { display: "flex", alignItems: "center", gap: "16px" },
  notifBadge: {
    background: "#f87171",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  userEmail: { color: "#94a3b8", fontSize: "13px" },
  logoutBtn: {
    padding: "6px 14px",
    background: "transparent",
    border: "1px solid #4b5563",
    borderRadius: "6px",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "13px",
  },
};

export default Navbar;