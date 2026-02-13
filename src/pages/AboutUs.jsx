import { motion } from "framer-motion";
import Background from "../components/Background";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/about.css";

export default function AboutUs() {
  const teamMembers = [
    {
      name: "Omkarnath mohapatra",
      role: "CEO & Founder",
      image: "🤵‍♂️"
    },
    {
      name: "Dr. Anil kumar meher",
      role: "Chief Advisor",
      image: "🧑‍💼"
    },
    {
      name: "Ansuman mohapatra",
      role: "Lead Developer",
      image: "🧑‍💻"
    },
  ];

  const values = [
    {
      icon: "🎯",
      title: "Mission-Driven",
      description: "We're committed to helping every job seeker land their dream job.",
    },
    {
      icon: "💡",
      title: "Innovation",
      description: "Constantly pushing boundaries with cutting-edge AI technology.",
    },
    {
      icon: "🤝",
      title: "User-First",
      description: "Your success is our success. We build with you in mind.",
    },
    {
      icon: "🔒",
      title: "Privacy & Security",
      description: "Your data is safe with us. We take security seriously.",
    },
  ];

  const stats = [
    { number: "500K+", label: "Resumes Analyzed" },
    { number: "50K+", label: "Happy Users" },
    { number: "95%", label: "Success Rate" },
    { number: "4.9/5", label: "User Rating" },
  ];

  return (
    <div className="about-container">
      <Background />
      <div className="content-wrapper">
        <Navbar />

        {/* Hero Section */}
        <motion.section
          className="about-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>About ResuMax</h1>
          <p className="hero-subtitle">
            We're on a mission to democratize career success through AI-powered resume optimization.
          </p>
        </motion.section>

        {/* Our Story Section */}
        <motion.section
          className="about-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-content">
            <h2>Our Story</h2>
            <div className="story-text">
              <p>
                ResuMax was born from a simple observation: talented professionals were being overlooked
                because their resumes weren't optimized for modern Applicant Tracking Systems (ATS).
                We saw brilliant candidates struggling to get past automated screening, and we knew
                there had to be a better way.
              </p>
              <p>
                Founded in 2026, ResuMax combines cutting-edge AI technology with deep expertise in
                recruitment and resume writing. Our platform analyzes resumes against industry standards,
                ATS compatibility, and job-specific requirements to give you actionable insights that
                actually work.
              </p>
              <p>
                Today, we've helped over 500,000 professionals improve their resumes and land interviews
                at top companies. But we're just getting started. Our vision is to make professional
                resume optimization accessible to everyone, regardless of their background or budget.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          className="stats-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="stat-item"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <h3>{stat.number}</h3>
                <p>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section
          className="about-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="value-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          className="about-section team-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Meet Our Team</h2>
          <p className="section-subtitle">
            The passionate people behind ResuMax
          </p>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="team-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -8 }}
              >
                <div className="team-avatar">{member.image}</div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-bio">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          className="mission-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mission-content">
            <h2>Our Mission</h2>
            <p>
              To empower every professional with the tools and insights they need to create
              resumes that get noticed, pass ATS screening, and land interviews at their
              dream companies. We believe that career success shouldn't depend on knowing
              the right resume format or keywords—it should be accessible to everyone.
            </p>
            <div className="mission-highlights">
              <div className="highlight-item">
                <span className="highlight-icon">✨</span>
                <span>Free AI-powered analysis</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">🚀</span>
                <span>Real-time optimization</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-icon">🎓</span>
                <span>Expert-designed templates</span>
              </div>
            </div>
          </div>
        </motion.section>
        <Footer />
      </div>
    </div>
  );
}
