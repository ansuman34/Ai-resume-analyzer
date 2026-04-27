import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resumeAPI } from "../services/api";
import Background from "../components/Background";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [activeResume, setActiveResume] = useState(0);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await resumeAPI.getResumes();
        setResumes(response.resumes || []);
      } catch (error) {
        console.error('Failed to fetch resumes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleAnalyzeResume = async (resumeId) => {
    setAnalyzing(resumeId);
    try {
      const response = await resumeAPI.analyzeResume(resumeId);
      // Update the resume in the local state with the new analysis
      setResumes(prevResumes =>
        prevResumes.map(resume =>
          resume._id === resumeId
            ? { ...resume, score: response.score, jobMatch: response.jobMatch, updatedAt: new Date().toISOString() }
            : resume
        )
      );
    } catch (error) {
      console.error('Failed to analyze resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(null);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await resumeAPI.deleteResume(resumeId);
      setResumes(prevResumes => prevResumes.filter(resume => resume._id !== resumeId));
    } catch (error) {
      console.error('Failed to delete resume:', error);
      alert('Failed to delete resume. Please try again.');
    }
  };

  const savedResumes = resumes.filter((resume) => resume.status === "saved");
  const draftResumes = resumes.filter((resume) => resume.status !== "saved");
  const averageScore = savedResumes.length
    ? Math.round(savedResumes.reduce((acc, resume) => acc + (resume.score || 0), 0) / savedResumes.length)
    : 0;

  const thisMonthCount = resumes.filter((resume) => {
    const createdAt = new Date(resume.createdAt || resume.updatedAt);
    const now = new Date();
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    { label: "Total Resumes", value: resumes.length.toString(), icon: "📄", change: `${thisMonthCount} created this month` },
    { label: "Saved Resumes", value: savedResumes.length.toString(), icon: "✅", change: `${draftResumes.length} drafts pending` },
    { label: "Average Score", value: `${averageScore}`, icon: "⭐", change: savedResumes.length ? "Based on saved resumes" : "No scored resumes yet" },
    { label: "Analyzed", value: resumes.filter((resume) => (resume.score || 0) > 0).length.toString(), icon: "📊", change: "Resumes with score" },
  ];

  const recentActivity = resumes
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6)
    .map((resume) => ({
      action: resume.status === "saved" ? "Resume saved" : "Draft updated",
      item: resume.name,
      time: new Date(resume.updatedAt).toLocaleString(),
      score: resume.score || null,
    }));

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
            <Link to="/resume-builder">
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create Resume
              </motion.button>
            </Link>
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
                <Link to="/resume-builder" className="section-link">
                  Build New Resume
                </Link>
              </div>
              
              <div className="resume-cards">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    Loading resumes...
                  </div>
                ) : resumes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No resumes yet. <Link to="/resume-builder" style={{ color: '#4cc9f0' }}>Create your first resume</Link>
                  </div>
                ) : (
                  resumes.map((resume, index) => (
                    <motion.div
                      key={resume._id}
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
                          {resume.score || 0}/100
                        </span>
                      </div>
                      <p className="resume-job-match">{resume.jobMatch || "Not analyzed yet"}</p>
                      <p className="resume-updated">Updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
                      <div className="resume-actions">
                        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); navigate(`/resume-view/${resume._id}`); }}>
                          📄 View
                        </button>
                        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); navigate(`/resume-edit/${resume._id}`); }}>
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-icon"
                          onClick={(e) => { e.stopPropagation(); handleAnalyzeResume(resume._id); }}
                          disabled={analyzing === resume._id}
                        >
                          {analyzing === resume._id ? "⏳" : "📊"} {analyzing === resume._id ? "Analyzing..." : "Analyze"}
                        </button>
                        <button
                          className="btn-icon delete-btn"
                          onClick={(e) => { e.stopPropagation(); handleDeleteResume(resume._id); }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}

                <motion.div
                  className="resume-card add-resume-card"
                  whileHover={{ scale: 1.02, y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <Link to="/resume-builder" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <p>Create New Resume</p>
                  </Link>
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
                {!recentActivity.length && (
                  <div style={{ color: "#94a3b8" }}>
                    No activity yet. Create your first resume to get started.
                  </div>
                )}
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
        </div>
      </div>
    </div>
  );
}
