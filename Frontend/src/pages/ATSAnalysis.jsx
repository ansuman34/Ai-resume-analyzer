import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { resumeAPI } from "../services/api";
import Background from "../components/Background";
import "../styles/ats-analysis.css";

export default function ATSAnalysis() {
  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError("");
    setAnalysis(null);

    if (!resumeFile) {
      setError("Upload a resume PDF to continue.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        targetRole: targetRole.trim(),
        jobDescription: jobDescription.trim(),
      };

      const response = await resumeAPI.analyzePdf(resumeFile, payload);

      setAnalysis(response.analysis);
    } catch (err) {
      console.error("ATS analysis failed:", err);
      setError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ats-analysis-page">
      <Background />
      <div className="ats-content">
        <motion.section
          className="ats-hero"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="eyebrow">Protected Tool</p>
          <h1>ATS Resume Analysis</h1>
          <p>
            Upload your PDF resume to get a detailed ATS diagnosis: strengths, weaknesses,
            skills you have, missing job-required skills, score explanation, and targeted fixes.
          </p>
        </motion.section>

        <motion.form
          className="ats-form-card"
          onSubmit={handleAnalyze}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="ats-form-grid">
            <div className="form-group">
              <label htmlFor="targetRole">Target role</label>
              <input
                id="targetRole"
                type="text"
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                placeholder="Software Engineer, Data Analyst, Product Manager..."
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="resumeFile">Resume PDF</label>
            <input
              id="resumeFile"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setResumeFile(file);
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="jobDescription">Job description</label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the job description here for keyword matching."
              rows={7}
            />
          </div>

          {error && <div className="ats-error">{error}</div>}

          <div className="ats-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Analyzing..." : "Run ATS Analysis"}
            </button>
            <Link to="/resume-builder" className="ats-builder-link">
              Build a new resume instead
            </Link>
          </div>
        </motion.form>

        {analysis && (
          <motion.section
            className="ats-result-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="result-header">
              <div>
                <p className="eyebrow">Analysis Result</p>
                <h2>{analysis.grade}</h2>
                <p>{analysis.summary}</p>
              </div>
              <div className="result-score">
                <span>{analysis.score}</span>
                <small>/100</small>
              </div>
            </div>

            <div className="result-metrics">
              <div><strong>{analysis.metrics?.wordCount || 0}</strong><span>Words</span></div>
              <div><strong>{analysis.metrics?.bulletCount || 0}</strong><span>Bullets</span></div>
              <div><strong>{Math.round((analysis.metrics?.keywordMatchRate || 0) * 100)}%</strong><span>Keyword match</span></div>
              <div><strong>{Math.round((analysis.metrics?.quantifiedBulletRate || 0) * 100)}%</strong><span>Measured bullets</span></div>
            </div>

            {!!analysis.missingKeywords?.length && (
              <div className="result-section">
                <h3>Missing Required Skills</h3>
                <div className="keyword-cloud">
                  {analysis.missingKeywords.slice(0, 14).map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
              </div>
            )}

            {!!analysis.matchedKeywords?.length && (
              <div className="result-section">
                <h3>Matched Required Skills</h3>
                <div className="keyword-cloud">
                  {analysis.matchedKeywords.slice(0, 14).map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
              </div>
            )}

            {!!analysis.detectedSkills?.length && (
              <div className="result-section">
                <h3>Skills Found in Your Resume</h3>
                <div className="keyword-cloud">
                  {analysis.detectedSkills.slice(0, 20).map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {!!analysis.requiredSkills?.length && (
              <div className="result-section">
                <h3>Skills Required by Job Description</h3>
                <div className="keyword-cloud">
                  {analysis.requiredSkills.slice(0, 18).map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {analysis.sectionScores && (
              <div className="result-section">
                <h3>Section Scores</h3>
                <div className="result-metrics">
                  <div><strong>{analysis.sectionScores.readability || 0}%</strong><span>Readability</span></div>
                  <div><strong>{analysis.sectionScores.structure || 0}%</strong><span>Structure</span></div>
                  <div><strong>{analysis.sectionScores.keywordAlignment || 0}%</strong><span>Keyword alignment</span></div>
                  <div><strong>{analysis.sectionScores.impact || 0}%</strong><span>Impact</span></div>
                </div>
              </div>
            )}

            <div className="result-section">
              <h3>Priority Fixes</h3>
              <div className="fix-list">
                {analysis.suggestions?.slice(0, 6).map((suggestion, index) => (
                  <article key={`${suggestion.title}-${index}`} className={`fix-card priority-${suggestion.priority}`}>
                    <span>{suggestion.priority}</span>
                    <h4>{suggestion.title}</h4>
                    <p>{suggestion.detail}</p>
                  </article>
                ))}
              </div>
            </div>

            {!!analysis.strengths?.length && (
              <div className="result-section">
                <h3>Strengths</h3>
                <ul className="strength-list">
                  {analysis.strengths.slice(0, 5).map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {!!analysis.diagnosis?.weakPoints?.length && (
              <div className="result-section">
                <h3>Weak Points</h3>
                <ul className="strength-list">
                  {analysis.diagnosis.weakPoints.slice(0, 6).map((weakPoint) => (
                    <li key={weakPoint}>{weakPoint}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.diagnosisDetails && (
              <div className="result-section">
                <h3>Detailed Diagnosis</h3>
                <ul className="strength-list">
                  <li>{analysis.diagnosisDetails.keywordCoverage}</li>
                  <li>{analysis.diagnosisDetails.impactEvidence}</li>
                  <li>{analysis.diagnosisDetails.structureEvidence}</li>
                </ul>
              </div>
            )}

            {!!analysis.scoreReasons?.length && (
              <div className="result-section">
                <h3>Why This ATS Score</h3>
                <ul className="strength-list">
                  {analysis.scoreReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {!!analysis.improvementPlan?.length && (
              <div className="result-section">
                <h3>How to Improve This Resume</h3>
                <ul className="strength-list">
                  {analysis.improvementPlan.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {!!analysis.bestFitRoles?.length && (
              <div className="result-section">
                <h3>Best Suited Jobs</h3>
                <div className="fix-list">
                  {analysis.bestFitRoles.map((roleItem) => (
                    <article key={roleItem.role} className="fix-card priority-medium">
                      <span>{roleItem.fitScore}% fit</span>
                      <h4>{roleItem.role}</h4>
                      <p>{roleItem.rationale}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}
      </div>
    </div>
  );
}
