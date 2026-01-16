import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="nav"
    >
      <h2 className="logo">ResuMax</h2>
      <div className="nav-links">
        <a>AI Resume Builder</a>
        <a>ATS Analysis</a>
        <a>Templates</a>
        <a>Pricing</a>
      </div>
      <button className="btn-primary">Get Started Free</button>
    </motion.nav>
  );
}
