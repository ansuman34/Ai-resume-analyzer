import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  // Don't show navbar on auth pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="nav"
    >
      <Link to="/" style={{ textDecoration: "none" }}>
        <h2 className="logo">ResuMax</h2>
      </Link>
      <div className="nav-links">
        <Link to="/resume-builder">AI Resume Builder</Link>
        <Link to="/ats-analysis">ATS Analysis</Link>
        <Link to="/pricing">Pricing</Link>
        {isAuthenticated && (
          <>
            <Link to="/dashboard">Dashboard</Link>
          </>
        )}
      </div>
      <div className="nav-actions">
        {isAuthenticated ? (
          <div className="nav-user">
            <span className="nav-user-text">
              Welcome, {user?.firstName || "User"}
            </span>
            <button
              onClick={handleLogout}
              className="nav-link-btn"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="nav-link-btn">Sign In</Link>
            <Link to="/register">
              <button className="btn-primary">Get Started Free</button>
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}
