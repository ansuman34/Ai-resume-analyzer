import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  
  // Don't show navbar on auth pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

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
        
        <a href="#builder">AI Resume Builder</a>
        <a href="#analysis">ATS Analysis</a>
        <Link to="/templates">Templates</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {location.pathname === "/dashboard" ? (
          <Link to="/" className="nav-link-btn">Home</Link>
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
