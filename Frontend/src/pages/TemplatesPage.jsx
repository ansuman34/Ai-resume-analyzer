import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { templateAPI } from "../services/api";
import Navbar from "../components/Navbar";
import Background from "../components/Background";
import "../styles/templates-page.css";

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await templateAPI.getTemplates();
        const sorted = [...(response.templates || [])].sort((a, b) => a.name.localeCompare(b.name));
        setTemplates(sorted);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
        setError('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleUseTemplate = (templateId) => {
    navigate(`/resume-builder?template=${templateId}`);
  };

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "professional", label: "Professional" },
    { id: "tech", label: "Tech & IT" },
    { id: "creative", label: "Creative" },
    { id: "academic", label: "Academic" },
    { id: "executive", label: "Executive" },
    { id: "minimal", label: "Minimal" },
  ];

  const filteredTemplates = selectedCategory === "all"
    ? templates
    : templates.filter((template) => template.category === selectedCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="templates-page">
      <Background />
      <div className="templates-content">
        <Navbar />

        {/* Header Section */}
        <motion.section
          className="templates-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Professional Resume Templates</h1>
          <p>
            Choose from our collection of ATS-optimized templates designed by
            experts to help you land your dream job
          </p>
        </motion.section>

        {/* Category Filter */}
        <motion.section
          className="category-filter"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="filter-wrapper">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                className={`filter-btn ${selectedCategory === category.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Templates Grid */}
        <motion.section
          className="templates-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '50px',
              color: '#94a3b8',
              fontSize: '18px'
            }}>
              Loading templates...
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '50px',
              color: '#ef4444',
              fontSize: '18px'
            }}>
              {error}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px',
              color: '#94a3b8',
              fontSize: '18px'
            }}>
              No templates found for this category.
            </div>
          ) : (
            filteredTemplates.map((template, index) => (
              <motion.div
                key={template._id}
                className="template-item"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <div className="template-card-wrapper">
                  <div className="template-image-container">
                    <img
                      src={template.image}
                      alt={template.name}
                      className="template-image"
                    />
                    <div className="template-overlay">
                      <motion.button
                        className="btn-preview"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Preview Template
                      </motion.button>
                      <motion.button
                        className="btn-use"
                        onClick={() => handleUseTemplate(template._id)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Use This Template
                      </motion.button>
                    </div>
                  </div>
                  <div className="template-info">
                    <h3>{template.name}</h3>
                    <p className="template-description">{template.description}</p>
                    <div className="template-features">
                      {template.features.map((feature, i) => (
                        <span key={i} className="feature-tag">
                          ✓ {feature}
                        </span>
                      ))}
                    </div>
                    {template.isPremium && (
                      <div className="template-price">
                        ${template.price}/month
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.section>

        {/* Info Section */}
        <motion.section
          className="templates-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="info-container">
            <div className="info-card">
              <div className="info-icon">🎯</div>
              <h3>100% ATS Compatible</h3>
              <p>
                All templates are optimized to pass through Applicant Tracking
                Systems
              </p>
            </div>
            <div className="info-card">
              <div className="info-icon">✏️</div>
              <h3>Fully Customizable</h3>
              <p>
                Easy to edit colors, fonts, and layout to match your preferences
              </p>
            </div>
            <div className="info-card">
              <div className="info-icon">⚡</div>
              <h3>AI-Powered Suggestions</h3>
              <p>
                Get intelligent recommendations to improve your resume content
              </p>
            </div>
            <div className="info-card">
              <div className="info-icon">📱</div>
              <h3>Mobile Responsive</h3>
              <p>Look great on any device with our responsive design</p>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="templates-cta"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2>Ready to Boost Your Resume?</h2>
          <p>
            Start with a professional template and get personalized feedback
            from our AI analyzer
          </p>
          <div className="cta-buttons">
            <motion.button
              className="btn-primary-lg"
              onClick={() => navigate("/resume-builder")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free
            </motion.button>
            <motion.button
              className="btn-secondary-lg"
              onClick={() => navigate("/pricing")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Pricing
            </motion.button>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
