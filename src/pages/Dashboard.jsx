import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import Background from "../components/Background";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [activeResume, setActiveResume] = useState(0);

  const resumes = [
    {
      id: 1,
      name: "Software Engineer Resume",
      score: 93,
      updated: "2 days ago",
      jobMatch: "Senior Developer at Google",
    },
    {
      id: 2,
      name: "Product Manager Resume",
      score: 87,
      updated: "1 week ago",
      jobMatch: "PM at Microsoft",
    },
    {
      id: 3,
      name: "Data Scientist Resume",
      score: 91,
      updated: "3 days ago",
      jobMatch: "DS at Amazon",
    },
  ];

  const stats = [
    { label: "Total Resumes", value: "12", icon: "📄", change: "+3 this month" },
    { label: "Avg Score", value: "89", icon: "⭐", change: "+5% improvement" },
    { label: "Cover Letters", value: "24", icon: "📝", change: "+1 this month" },
    { label: "Reviews", value: "6", icon: "💬", change: "+2 this month" },
  ];

  const recentActivity = [
    { action: "Resume analyzed", item: "Software Engineer Resume", time: "2 hours ago", score: 93 },
    { action: "Template applied", item: "Modern Professional", time: "1 day ago", score: null },
    { action: "Resume optimized", item: "Product Manager Resume", time: "2 days ago", score: 87 },
    { action: "Resume created", item: "Data Scientist Resume", time: "3 days ago", score: 91 },
  ];

  return (
    <div className="dashboard-container">
      <Background />
      <div className="content-wrapper">
        <Navbar />
        
        <div className="dashboard-content">
          {/* Dashboard Header */}
          <motion.div
            className="dashboard-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h1>Welcome back! 👋</h1>
              <p>Manage your resumes and track your progress</p>
            </div>
            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Upload Resume
            </motion.button>
          </motion.div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <p className="stat-label">{stat.label}</p>
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-change">{stat.change}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="dashboard-grid">
            {/* Resume Cards Section */}
            <motion.div
              className="dashboard-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="section-header">
                <h2>My Resumes</h2>
                <Link to="/templates" className="section-link">
                  Browse Templates
                </Link>
              </div>
              
              <div className="resume-cards">
                {resumes.map((resume, index) => (
                  <motion.div
                    key={resume.id}
                    className={`resume-card ${activeResume === index ? "active" : ""}`}
                    onClick={() => setActiveResume(index)}
                    whileHover={{ scale: 1.02, y: -4 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  >
                    <div className="resume-card-header">
                      <h3>{resume.name}</h3>
                      <span className={`score-badge score-${resume.score >= 90 ? "excellent" : resume.score >= 80 ? "good" : "fair"}`}>
                        {resume.score}/100
                      </span>
                    </div>
                    <p className="resume-job-match">{resume.jobMatch}</p>
                    <p className="resume-updated">Updated {resume.updated}</p>
                    <div className="resume-actions">
                      <button className="btn-icon">📄 View</button>
                      <button className="btn-icon">✏️ Edit</button>
                      <button className="btn-icon">📊 Analyze</button>
                    </div>
                  </motion.div>
                ))}
                
                <motion.div
                  className="resume-card add-resume-card"
                  whileHover={{ scale: 1.02, y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <p>Create New Resume</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Recent Activity Section */}
            <motion.div
              className="dashboard-section activity-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="section-header">
                <h2>Recent Activity</h2>
              </div>
              
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="activity-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  >
                    <div className="activity-icon">
                      {activity.score ? (
                        <div className={`activity-score score-${activity.score >= 90 ? "excellent" : activity.score >= 80 ? "good" : "fair"}`}>
                          {activity.score}
                        </div>
                      ) : (
                        <div className="activity-dot"></div>
                      )}
                    </div>
                    <div className="activity-content">
                      <p className="activity-action">{activity.action}</p>
                      <p className="activity-item-name">{activity.item}</p>
                      <p className="activity-time">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            className="quick-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <motion.button
                className="action-card"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="action-icon">📤</div>
                <h3>Upload Resume</h3>
                <p>Analyze your existing resume</p>
              </motion.button>
              
              <motion.button
                className="action-card"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="action-icon">✏️</div>
                <h3>Create New</h3>
                <p>Start from a template</p>
              </motion.button>
              
              <motion.button
                className="action-card"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="action-icon">🔍</div>
                <h3>ATS Check</h3>
                <p>Optimize for ATS systems</p>
              </motion.button>
              
              <motion.button
                className="action-card"
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="action-icon">📊</div>
                <h3>View Analytics</h3>
                <p>Track your progress</p>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
