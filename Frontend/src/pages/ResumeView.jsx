import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { resumeAPI, templateAPI } from "../services/api";
import { generateResumePDF } from "../utils/pdfGenerator";
import { resolveTemplateTheme } from "../utils/resumeTemplateTheme";
import Navbar from "../components/Navbar";
import Background from "../components/Background";
import "../styles/resume-view.css";

export default function ResumeView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const showDraftActions = searchParams.get("draft") === "1" || resume?.status === "draft";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumeResponse, templatesResponse] = await Promise.all([
          resumeAPI.getResume(id),
          templateAPI.getTemplates()
        ]);
        setResume(resumeResponse.resume);
        setTemplates(templatesResponse.templates || []);
      } catch (err) {
        setError("Failed to load resume");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDownload = async () => {
    if (!resume) return;

    setDownloading(true);
    try {
      // Find the template name from the templates list by ID or name match
      const template = templates.find(t => t._id?.toString() === resume.template?.toString());
      await generateResumePDF(resume, template || (resume.templateName || 'Professional Classic'));
    } catch (error) {
      console.error('Failed to download resume:', error);
      alert('Failed to download resume. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!resume?._id) return;
    setSaving(true);
    try {
      await resumeAPI.updateResume(resume._id, { status: "saved" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save resume:", error);
      alert("Failed to save resume. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!resume?._id) return;
    if (!window.confirm("Delete this resume draft?")) return;
    setDeleting(true);
    try {
      await resumeAPI.deleteResume(resume._id);
      navigate("/resume-builder");
    } catch (error) {
      console.error("Failed to delete resume:", error);
      alert("Failed to delete resume. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resume?._id) return;

    const targetRole = window.prompt("Target role (optional)", "");
    const jobDescription = window.prompt("Paste the job description for a sharper keyword match (optional)", "");

    setAnalyzing(true);
    try {
      const response = await resumeAPI.analyzeResume(resume._id, {
        targetRole: targetRole || "",
        jobDescription: jobDescription || "",
      });

      setResume((prev) => ({
        ...prev,
        score: response.score,
        jobMatch: response.jobMatch,
        analysis: response.analysis,
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Failed to analyze resume:", error);
      alert("Failed to analyze resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="resume-view-container">
        <Background />
        <Navbar />
        <div className="content-wrapper">
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            Loading resume...
          </div>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="resume-view-container">
        <Background />
        <Navbar />
        <div className="content-wrapper">
          <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
            {error || "Resume not found"}
          </div>
        </div>
      </div>
    );
  }

  const { content, name, score, jobMatch } = resume;
  const { personalInfo, workExperience, education, skills, certifications, projects, languages } = content;
  const analysis = resume.analysis || {};
  const hasAnalysis = analysis && Object.keys(analysis).length > 0 && Array.isArray(analysis.suggestions);
  const selectedTemplate = templates.find(t => t._id?.toString() === resume.template?.toString()) || { name: resume.templateName };
  const theme = resolveTemplateTheme(selectedTemplate || resume.templateName || 'Professional Classic');

  return (
    <div className="resume-view-container">
      <Background />
      <Navbar />
      <div className="content-wrapper">
        <motion.div
          className="resume-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="header-content">
            <h1>{name}</h1>
            <div className="header-actions">
              <button className="btn-primary" onClick={() => navigate(`/resume-edit/${id}`)}>
                ✏️ Edit Resume
              </button>
              <button
                className="btn-secondary"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? "Analyzing..." : "Analyze Resume"}
              </button>
              {showDraftActions && (
                <button
                  className="btn-secondary"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "🗑️ Delete"}
                </button>
              )}
              <button
                className="btn-secondary"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? '⏳' : '📄'} {downloading ? 'Downloading...' : 'Download PDF'}
              </button>
              {showDraftActions && (
                <button
                  className="btn-primary"
                  onClick={handleSaveDraft}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "💾 Save Resume"}
                </button>
              )}
              <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
                ← Back to Dashboard
              </button>
            </div>
          </div>
          {score > 0 && (
            <div className="resume-score">
              <span className={`score-badge score-${score >= 90 ? "excellent" : score >= 80 ? "good" : "fair"}`}>
                Score: {score}/100
              </span>
              {jobMatch && <span className="job-match">{jobMatch}</span>}
            </div>
          )}
        </motion.div>

        {hasAnalysis && (
          <motion.section
            className="analysis-panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="analysis-heading">
              <div>
                <p className="eyebrow">AI Resume Analysis</p>
                <h2>{analysis.grade || "Resume Review"}</h2>
                <p>{analysis.summary}</p>
              </div>
              <div className="analysis-score">
                <span>{analysis.score || score || 0}</span>
                <small>/100</small>
              </div>
            </div>

            <div className="analysis-metrics">
              <div>
                <strong>{analysis.metrics?.wordCount || 0}</strong>
                <span>Meaningful words</span>
              </div>
              <div>
                <strong>{Math.round((analysis.metrics?.keywordMatchRate || 0) * 100)}%</strong>
                <span>Keyword match</span>
              </div>
              <div>
                <strong>{Math.round((analysis.metrics?.quantifiedBulletRate || 0) * 100)}%</strong>
                <span>Measured bullets</span>
              </div>
            </div>

            {!!analysis.missingKeywords?.length && (
              <div className="analysis-block">
                <h3>Missing Target Keywords</h3>
                <div className="keyword-list">
                  {analysis.missingKeywords.slice(0, 12).map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
              </div>
            )}

            {!!analysis.suggestions?.length && (
              <div className="analysis-block">
                <h3>Priority Fixes</h3>
                <div className="suggestion-list">
                  {analysis.suggestions.slice(0, 5).map((suggestion, index) => (
                    <div key={`${suggestion.title}-${index}`} className={`suggestion-card priority-${suggestion.priority}`}>
                      <div>
                        <span>{suggestion.priority}</span>
                        <h4>{suggestion.title}</h4>
                      </div>
                      <p>{suggestion.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!!analysis.strengths?.length && (
              <div className="analysis-block">
                <h3>Strengths</h3>
                <ul className="strength-list">
                  {analysis.strengths.slice(0, 4).map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.section>
        )}

        <div
          className="resume-content"
          style={{
            borderColor: `${theme.accentColor}33`,
            background: theme.backgroundColor,
            color: theme.primaryColor,
            fontFamily: theme.fontFamily,
          }}
        >
          {/* Personal Information */}
          <motion.section
            className="resume-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="section-title" style={{ borderBottomColor: theme.accentColor, color: "black" }}>
              <h2>Contact Information</h2>
            </div>
            <div className="personal-info-grid">
              {personalInfo?.fullName && (
                <div className="info-item">
                  <strong>Name:</strong> {personalInfo.fullName}
                </div>
              )}
              {personalInfo?.email && (
                <div className="info-item">
                  <strong>Email:</strong> <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
                </div>
              )}
              {personalInfo?.phone && (
                <div className="info-item">
                  <strong>Phone:</strong> <a href={`tel:${personalInfo.phone}`}>{personalInfo.phone}</a>
                </div>
              )}
              {personalInfo?.location && (
                <div className="info-item">
                  <strong>Location:</strong> {personalInfo.location}
                </div>
              )}
              {personalInfo?.website && (
                <div className="info-item">
                  <strong>Website:</strong> <a href={personalInfo.website} target="_blank" rel="noopener noreferrer">{personalInfo.website}</a>
                </div>
              )}
              {personalInfo?.linkedin && (
                <div className="info-item">
                  <strong>LinkedIn:</strong> <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer">Profile</a>
                </div>
              )}
              {personalInfo?.github && (
                <div className="info-item">
                  <strong>GitHub:</strong> <a href={personalInfo.github} target="_blank" rel="noopener noreferrer">Profile</a>
                </div>
              )}
            </div>

            {personalInfo?.summary && (
              <div className="summary-section">
                <h3>Professional Summary</h3>
                <p>{personalInfo.summary}</p>
              </div>
            )}
          </motion.section>

          {/* Work Experience */}
          {workExperience && workExperience.length > 0 && (
            <motion.section
              className="resume-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="section-title" style={{ borderBottomColor: theme.accentColor }}>
                <h2>Work Experience</h2>
              </div>
              {workExperience.map((exp, index) => (
                <div key={index} className="experience-entry">
                  <div className="entry-header">
                    <div>
                      <h3>{exp.position}</h3>
                      <p className="company-name">{exp.company}</p>
                    </div>
                    <span className="date-range">
                      {exp.startDate} {!exp.currentlyWorking && exp.endDate ? `- ${exp.endDate}` : exp.currentlyWorking ? "- Present" : ""}
                    </span>
                  </div>
                  {exp.description && <p className="entry-description">{exp.description}</p>}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="achievements-list">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </motion.section>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <motion.section
              className="resume-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="section-title" style={{ borderBottomColor: theme.accentColor }}>
                <h2>Education</h2>
              </div>
              {education.map((edu, index) => (
                <div key={index} className="education-entry">
                  <div className="entry-header">
                    <div>
                      <h3>{edu.degree}</h3>
                      <p className="school-name">{edu.school}</p>
                      {edu.field && <p className="field-name">{edu.field}</p>}
                    </div>
                    <span className="date-range">
                      {edu.startDate} {edu.endDate ? `- ${edu.endDate}` : ""}
                    </span>
                  </div>
                  {edu.description && <p className="entry-description">{edu.description}</p>}
                </div>
              ))}
            </motion.section>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <motion.section
              className="resume-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="section-title" style={{ borderBottomColor: theme.accentColor }}>
                <h2>Skills</h2>
              </div>
              <div className="skills-display">
                {skills.map((skillObj, index) => (
                  <div key={index} className="skill-badge">
                    <span className="skill-name">{skillObj.skill || skillObj}</span>
                    {skillObj.proficiency && <span className={`proficiency-badge proficiency-${skillObj.proficiency.toLowerCase()}`}>{skillObj.proficiency}</span>}
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <motion.section
              className="resume-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="section-title" style={{ borderBottomColor: theme.accentColor }}>
                <h2>Certifications</h2>
              </div>
              {certifications.map((cert, index) => (
                <div key={index} className="cert-entry">
                  <div className="entry-header">
                    <div>
                      <h3>{cert.name}</h3>
                      <p className="issuer-name">{cert.issuer}</p>
                    </div>
                    {cert.date && <span className="date-range">{cert.date}</span>}
                  </div>
                  {cert.credentialUrl && (
                    <p>
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                        View Credential →
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </motion.section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <motion.section
              className="resume-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="section-title" style={{ borderBottomColor: theme.accentColor }}>
                <h2>Projects</h2>
              </div>
              {projects.map((project, index) => (
                <div key={index} className="project-entry">
                  <div className="entry-header">
                    <div>
                      <h3>{project.name}</h3>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="tech-stack">
                          {project.technologies.map((tech, i) => (
                            <span key={i} className="tech">{tech}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="date-range">
                      {project.startDate} {project.endDate ? `- ${project.endDate}` : ""}
                    </span>
                  </div>
                  {project.description && <p className="entry-description">{project.description}</p>}
                  {project.link && (
                    <p>
                      <a href={project.link} target="_blank" rel="noopener noreferrer">
                        View Project →
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </motion.section>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <motion.section
              className="resume-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="section-title" style={{ borderBottomColor: theme.accentColor }}>
                <h2>Languages</h2>
              </div>
              <div className="languages-grid">
                {languages.map((lang, index) => (
                  <div key={index} className="language-item">
                    <span className="language-name">{lang.language}</span>
                    <span className={`proficiency-badge proficiency-${lang.proficiency.toLowerCase()}`}>
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        <motion.div
          className="resume-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <button className="btn-primary" onClick={() => navigate(`/resume-edit/${id}`)}>
            ✏️ Edit Resume
          </button>
          <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
