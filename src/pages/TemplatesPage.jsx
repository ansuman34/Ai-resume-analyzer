import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Background from "../components/Background";
import "../styles/templates-page.css";

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  // eslint-disable-next-line no-unused-vars
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  const templates = [
    {
      id: 1,
      name: "Professional Classic",
      category: "professional",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx4jZKBrPlzSrwPKIy2-VXEy7F4GMuZr6Sgw&s",
      description: "Clean and professional design with modern layout",
      features: ["ATS Compatible", "Minimalist Design", "Easy to Customize"],
    },
    {
      id: 2,
      name: "Modern Tech",
      category: "tech",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl6g1lSI1C3hgLJCR0n5xxW6U-qgAK1p-3xw&s",
      description: "Perfect for tech and creative professionals",
      features: ["Tech-Optimized", "Visually Modern", "Code-Friendly"],
    },
    {
      id: 3,
      name: "Executive Premium",
      category: "executive",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsoBI4Qz_sBfv9xmgebGxsxSTNQFFTbvud_g&s",
      description: "Premium template for senior-level positions",
      features: ["Premium Design", "Leadership Focus", "Elegant Layout"],
    },
    {
      id: 4,
      name: "Creative Minimal",
      category: "creative",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx4jZKBrPlzSrwPKIy2-VXEy7F4GMuZr6Sgw&s",
      description: "Minimal design with creative flair",
      features: ["Creative Style", "Minimal Colors", "Modern Fonts"],
    },
    {
      id: 5,
      name: "Academic Focus",
      category: "academic",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl6g1lSI1C3hgLJCR0n5xxW6U-qgAK1p-3xw&s",
      description: "Ideal for recent graduates and students",
      features: ["Education-Focused", "Clear Structure", "Research Ready"],
    },
    {
      id: 6,
      name: "Corporate Bold",
      category: "professional",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsoBI4Qz_sBfv9xmgebGxsxSTNQFFTbvud_g&s",
      description: "Bold corporate template with strong impact",
      features: ["Corporate Style", "Bold Headers", "Professional Tone"],
    },
  ];

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "professional", label: "Professional" },
    { id: "tech", label: "Tech & IT" },
    { id: "creative", label: "Creative" },
    { id: "academic", label: "Academic" },
    { id: "executive", label: "Executive" },
  ];

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

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
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              className="template-item"
              variants={itemVariants}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
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
                </div>
              </div>
            </motion.div>
          ))}
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free
            </motion.button>
            <motion.button
              className="btn-secondary-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Pricing
            </motion.button>
          </div>
        </motion.section>

        <Footer />
      </div>
    </div>
  );
}
