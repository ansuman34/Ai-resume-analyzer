import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { resumeAPI, templateAPI } from "../services/api";
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
  const resumeRef = useRef(null);
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

  const handleDownload = () => {
    window.print();
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

        <div className="resume-content" ref={resumeRef}>
          <div className="resume-header-custom">
            <h1>{personalInfo?.fullName || "Your Name"}</h1>
            {personalInfo?.location && <div>{personalInfo.location}</div>}
            <div className="contact-links">
              {personalInfo?.phone && <span>{personalInfo.phone}</span>}
              {personalInfo?.phone && personalInfo?.email && <span>|</span>}
              {personalInfo?.email && <span>{personalInfo.email}</span>}
              {personalInfo?.email && personalInfo?.linkedin && <span>|</span>}
              {personalInfo?.linkedin && <span><a href={personalInfo.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></span>}
              {personalInfo?.linkedin && personalInfo?.github && <span>|</span>}
              {personalInfo?.github && <span><a href={personalInfo.github} target="_blank" rel="noreferrer">GitHub</a></span>}
              {personalInfo?.github && personalInfo?.website && <span>|</span>}
              {personalInfo?.website && <span><a href={personalInfo.website} target="_blank" rel="noreferrer">Portfolio</a></span>}
            </div>
          </div>

          {personalInfo?.summary && (
            <div className="resume-summary-custom">
              {personalInfo.summary}
            </div>
          )}

          {education && education.length > 0 && (
            <div className="resume-section-custom">
              <h2>Education</h2>
              {education.map((edu, index) => (
                <div key={index} style={{ marginBottom: "10px" }}>
                  <div className="resume-item-row bold">
                    <span>{edu.school}</span>
                    <span>{edu.startDate} {edu.endDate ? `- ${edu.endDate}` : ""}</span>
                  </div>
                  <div className="resume-item-row italic">
                    <span>{edu.degree} {edu.field ? `in ${edu.field}` : ""}</span>
                  </div>
                  {edu.description && (
                    <div className="resume-item-row">
                      <span>{edu.description}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {skills && skills.length > 0 && (
            <div className="resume-section-custom">
              <h2>Skills</h2>
              <div className="resume-skills-block">
                <span className="bold">Technologies/Skills: </span>
                <span>{skills.map(s => s.skill || s).join(", ")}</span>
              </div>
            </div>
          )}

          {workExperience && workExperience.length > 0 && (
            <div className="resume-section-custom">
              <h2>Experience</h2>
              {workExperience.map((exp, index) => (
                <div key={index} style={{ marginBottom: "12px" }}>
                  <div className="resume-item-row bold">
                    <span>{exp.company}</span>
                    <span>{exp.startDate} {!exp.currentlyWorking && exp.endDate ? `- ${exp.endDate}` : exp.currentlyWorking ? "- Present" : ""}</span>
                  </div>
                  <div className="resume-item-row italic">
                    <span>{exp.position}</span>
                  </div>
                  {exp.description && <div style={{ fontSize: "14px", marginTop: "4px" }}>{exp.description}</div>}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="resume-bullets">
                      {exp.achievements.map((ach, i) => (
                        <li key={i}>{ach}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {projects && projects.length > 0 && (
            <div className="resume-section-custom">
              <h2>Projects</h2>
              {projects.map((proj, index) => (
                <div key={index} style={{ marginBottom: "12px" }}>
                  <div className="resume-item-row bold">
                    <span>{proj.name} {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{fontWeight: "normal", fontSize: "12px"}}>[Link]</a>}</span>
                    <span>{proj.startDate} {proj.endDate ? `- ${proj.endDate}` : ""}</span>
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="resume-item-row italic">
                      <span>{proj.technologies.join(", ")}</span>
                    </div>
                  )}
                  {proj.description && <div style={{ fontSize: "14px", marginTop: "4px" }}>{proj.description}</div>}
                </div>
              ))}
            </div>
          )}

          {certifications && certifications.length > 0 && (
            <div className="resume-section-custom">
              <h2>Certifications & Achievements</h2>
              <ul className="resume-bullets" style={{ listStyleType: "disc" }}>
                {certifications.map((cert, index) => (
                  <li key={index}>
                    <span className="bold">{cert.name}</span> - {cert.issuer} {cert.date ? `(${cert.date})` : ""}
                  </li>
                ))}
              </ul>
            </div>
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
