import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { resumeAPI, templateAPI } from "../services/api";
import { generateResumePDF } from "../utils/pdfGenerator";
import Navbar from "../components/Navbar";
import Background from "../components/Background";
import "../styles/resume-builder.css";

export default function ResumeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumeResponse, templatesResponse] = await Promise.all([
          resumeAPI.getResume(id),
          templateAPI.getTemplates()
        ]);
        setResumeData(resumeResponse.resume);
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

  const handlePersonalInfoChange = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        personalInfo: {
          ...prev.content.personalInfo,
          [field]: value,
        },
      },
    }));
  };

  const handleArrayItemChange = (section, index, field, value) => {
    setResumeData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [section]: prev.content[section].map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const addArrayItem = (section, template = {}) => {
    setResumeData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [section]: [...prev.content[section], template],
      },
    }));
  };

  const removeArrayItem = (section, index) => {
    setResumeData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [section]: prev.content[section].filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await resumeAPI.updateResume(id, resumeData);
      navigate(`/resume-view/${id}`);
    } catch (error) {
      console.error("Failed to update resume:", error);
      setError("Failed to save resume. Please try again.");
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <div className="resume-builder-container">
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

  if (!resumeData) {
    return (
      <div className="resume-builder-container">
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

  const { content } = resumeData;

  return (
    <div className="resume-builder-container">
      <Background />
      <Navbar />
      <div className="content-wrapper">
        <motion.div
          className="builder-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Edit Resume</h1>
          <p>Update your resume information</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="resume-form">
          {/* Resume Name */}
          <div className="form-section">
            <h2>Resume Details</h2>
            <div className="form-group">
              <label>Resume Name</label>
              <input
                type="text"
                value={resumeData.name}
                onChange={(e) => setResumeData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Software Engineer Resume"
                required
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={content.personalInfo.fullName}
                  onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={content.personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={content.personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={content.personalInfo.location}
                  onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                  placeholder="City, State/Country"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={content.personalInfo.website}
                  onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="url"
                  value={content.personalInfo.linkedin}
                  onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
            <div className="form-group">
              <label>GitHub</label>
              <input
                type="url"
                value={content.personalInfo.github}
                onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                placeholder="https://github.com/yourprofile"
              />
            </div>
            <div className="form-group">
              <label>Professional Summary</label>
              <textarea
                value={content.personalInfo.summary}
                onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                placeholder="Brief summary of your professional background and goals..."
                rows={3}
              />
            </div>
          </div>

          {/* Work Experience */}
          <div className="form-section">
            <div className="section-header">
              <h2>Work Experience</h2>
              <button
                type="button"
                className="btn-add"
                onClick={() => addArrayItem('workExperience', {
                  company: '',
                  position: '',
                  startDate: '',
                  endDate: '',
                  currentlyWorking: false,
                  description: '',
                  achievements: [],
                })}
              >
                + Add Experience
              </button>
            </div>
            {content.workExperience.map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleArrayItemChange('workExperience', index, 'company', e.target.value)}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleArrayItemChange('workExperience', index, 'position', e.target.value)}
                      placeholder="Job title"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => handleArrayItemChange('workExperience', index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => handleArrayItemChange('workExperience', index, 'endDate', e.target.value)}
                      disabled={exp.currentlyWorking}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={exp.currentlyWorking}
                      onChange={(e) => handleArrayItemChange('workExperience', index, 'currentlyWorking', e.target.checked)}
                    />
                    I currently work here
                  </label>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleArrayItemChange('workExperience', index, 'description', e.target.value)}
                    placeholder="Describe your responsibilities..."
                    rows={2}
                  />
                </div>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeArrayItem('workExperience', index)}
                >
                  Remove Experience
                </button>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="form-section">
            <div className="section-header">
              <h2>Education</h2>
              <button
                type="button"
                className="btn-add"
                onClick={() => addArrayItem('education', {
                  school: '',
                  degree: '',
                  field: '',
                  startDate: '',
                  endDate: '',
                  description: '',
                })}
              >
                + Add Education
              </button>
            </div>
            {content.education.map((edu, index) => (
              <div key={index} className="education-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>School/University</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => handleArrayItemChange('education', index, 'school', e.target.value)}
                      placeholder="e.g., University of California"
                    />
                  </div>
                  <div className="form-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleArrayItemChange('education', index, 'degree', e.target.value)}
                      placeholder="e.g., Bachelor of Science"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Field of Study</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => handleArrayItemChange('education', index, 'field', e.target.value)}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="month"
                      value={edu.startDate}
                      onChange={(e) => handleArrayItemChange('education', index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="month"
                      value={edu.endDate}
                      onChange={(e) => handleArrayItemChange('education', index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Additional Info</label>
                  <textarea
                    value={edu.description}
                    onChange={(e) => handleArrayItemChange('education', index, 'description', e.target.value)}
                    placeholder="GPA, honors, activities, etc."
                    rows={2}
                  />
                </div>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeArrayItem('education', index)}
                >
                  Remove Education
                </button>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="form-section">
            <div className="section-header">
              <h2>Skills</h2>
              <button
                type="button"
                className="btn-add"
                onClick={() => addArrayItem('skills', {
                  skill: '',
                  proficiency: 'Intermediate',
                })}
              >
                + Add Skill
              </button>
            </div>
            {content.skills.map((skillObj, index) => (
              <div key={index} className="skill-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Skill</label>
                    <input
                      type="text"
                      value={skillObj.skill || ''}
                      onChange={(e) => handleArrayItemChange('skills', index, 'skill', e.target.value)}
                      placeholder="e.g., JavaScript, React, Node.js"
                    />
                  </div>
                  <div className="form-group">
                    <label>Proficiency</label>
                    <select
                      value={skillObj.proficiency || 'Intermediate'}
                      onChange={(e) => handleArrayItemChange('skills', index, 'proficiency', e.target.value)}
                    >
                      <option value="Basic">Basic</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeArrayItem('skills', index)}
                >
                  Remove Skill
                </button>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="form-section">
            <div className="section-header">
              <h2>Certifications</h2>
              <button
                type="button"
                className="btn-add"
                onClick={() => addArrayItem('certifications', {
                  name: '',
                  issuer: '',
                  date: '',
                  credentialUrl: '',
                })}
              >
                + Add Certification
              </button>
            </div>
            {content.certifications.map((cert, index) => (
              <div key={index} className="cert-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Certification Name</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleArrayItemChange('certifications', index, 'name', e.target.value)}
                      placeholder="e.g., AWS Certified Solutions Architect"
                    />
                  </div>
                  <div className="form-group">
                    <label>Issuer</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleArrayItemChange('certifications', index, 'issuer', e.target.value)}
                      placeholder="e.g., Amazon Web Services"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date Obtained</label>
                    <input
                      type="month"
                      value={cert.date}
                      onChange={(e) => handleArrayItemChange('certifications', index, 'date', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Credential URL</label>
                    <input
                      type="url"
                      value={cert.credentialUrl}
                      onChange={(e) => handleArrayItemChange('certifications', index, 'credentialUrl', e.target.value)}
                      placeholder="Link to verify credential"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeArrayItem('certifications', index)}
                >
                  Remove Certification
                </button>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="form-section">
            <div className="section-header">
              <h2>Projects</h2>
              <button
                type="button"
                className="btn-add"
                onClick={() => addArrayItem('projects', {
                  name: '',
                  description: '',
                  technologies: [],
                  link: '',
                  startDate: '',
                  endDate: '',
                })}
              >
                + Add Project
              </button>
            </div>
            {content.projects.map((project, index) => (
              <div key={index} className="project-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Project Name</label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => handleArrayItemChange('projects', index, 'name', e.target.value)}
                      placeholder="e.g., E-commerce Platform"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => handleArrayItemChange('projects', index, 'description', e.target.value)}
                    placeholder="Describe your project..."
                    rows={2}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="month"
                      value={project.startDate}
                      onChange={(e) => handleArrayItemChange('projects', index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="month"
                      value={project.endDate}
                      onChange={(e) => handleArrayItemChange('projects', index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Project Link</label>
                  <input
                    type="url"
                    value={project.link}
                    onChange={(e) => handleArrayItemChange('projects', index, 'link', e.target.value)}
                    placeholder="https://github.com/yourproject"
                  />
                </div>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeArrayItem('projects', index)}
                >
                  Remove Project
                </button>
              </div>
            ))}
          </div>

          {/* Languages */}
          <div className="form-section">
            <div className="section-header">
              <h2>Languages</h2>
              <button
                type="button"
                className="btn-add"
                onClick={() => addArrayItem('languages', {
                  language: '',
                  proficiency: 'Intermediate',
                })}
              >
                + Add Language
              </button>
            </div>
            {content.languages.map((lang, index) => (
              <div key={index} className="language-item">
                <div className="form-row">
                  <div className="form-group">
                    <label>Language</label>
                    <input
                      type="text"
                      value={lang.language}
                      onChange={(e) => handleArrayItemChange('languages', index, 'language', e.target.value)}
                      placeholder="e.g., Spanish, Mandarin"
                    />
                  </div>
                  <div className="form-group">
                    <label>Proficiency</label>
                    <select
                      value={lang.proficiency}
                      onChange={(e) => handleArrayItemChange('languages', index, 'proficiency', e.target.value)}
                    >
                      <option value="Basic">Basic</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Fluent">Fluent</option>
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeArrayItem('languages', index)}
                >
                  Remove Language
                </button>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(`/resume-view/${id}`)}
            >
              ← Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
