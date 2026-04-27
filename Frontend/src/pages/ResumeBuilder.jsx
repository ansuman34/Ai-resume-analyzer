import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { resumeAPI, templateAPI } from "../services/api";
import Navbar from "../components/Navbar";
import Background from "../components/Background";
import "../styles/resume-builder.css";

export default function ResumeBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState({
    targetRole: "",
    experienceLevel: "",
    jobDescription: "",
    existingText: "",
  });
  const [currentStep, setCurrentStep] = useState(1); // 1: template selection, 2: form filling

  const [resumeData, setResumeData] = useState({
    name: "",
    template: "",
    content: {
      personalInfo: {
        fullName: user?.firstName + " " + user?.lastName || "",
        email: user?.email || "",
        phone: "",
        location: "",
        website: "",
        linkedin: "",
        github: "",
        summary: "",
      },
      workExperience: [],
      education: [],
      skills: [],
      certifications: [],
      projects: [],
      languages: [],
    },
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await templateAPI.getTemplates();
        const sortedTemplates = [...(response.templates || [])].sort((a, b) => a.name.localeCompare(b.name));
        setTemplates(sortedTemplates);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    const templateId = searchParams.get("template");
    if (!templateId || !templates.length || selectedTemplate) return;

    const template = templates.find((item) => item._id === templateId);
    if (template) {
      handleTemplateSelect(template);
    }
  }, [searchParams, selectedTemplate, templates]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setResumeData(prev => ({
      ...prev,
      template: template._id,
      name: `${template.name} Resume`,
    }));
    setCurrentStep(2);
  };

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

  const handleNestedArrayChange = (section, itemIndex, arrayField, arrayIndex, value) => {
    setResumeData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [section]: prev.content[section].map((item, i) =>
          i === itemIndex
            ? {
                ...item,
                [arrayField]: item[arrayField].map((elem, j) =>
                  j === arrayIndex ? value : elem
                ),
              }
            : item
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
    console.log('Submitting resume data:', resumeData);

    // Validation
    if (!resumeData.name.trim()) {
      alert("Please enter a resume name.");
      return;
    }

    if (!resumeData.template) {
      alert("Please select a template.");
      return;
    }

    if (!resumeData.content.personalInfo.fullName.trim() || !resumeData.content.personalInfo.email.trim()) {
      alert("Please fill in your full name and email address.");
      return;
    }

    setLoading(true);

    try {
      console.log('Sending resume data to API:', resumeData);
      const response = await resumeAPI.createResume({
        ...resumeData,
        status: "draft",
      });
      navigate(`/resume-view/${response.resume._id}?draft=1`);
    } catch (error) {
      console.error("Failed to create resume:", error);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Access denied') || error.message?.includes('Invalid token')) {
        alert("Your session has expired. Please log in again.");
        // You could also call logout here to clear the session
        // logout();
        navigate("/login");
      } else {
        alert("Failed to create resume. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!selectedTemplate?._id) {
      alert("Please select a template first.");
      return;
    }

    setAiLoading(true);
    try {
      const response = await resumeAPI.buildResumeWithAI({
        targetRole: aiInput.targetRole.trim(),
        experienceLevel: aiInput.experienceLevel.trim(),
        jobDescription: aiInput.jobDescription.trim(),
        existingText: aiInput.existingText.trim(),
        templateId: selectedTemplate._id,
        createDraft: false,
        resumeName: resumeData.name,
      });

      const generated = response.generatedResume;
      if (generated?.content) {
        setResumeData((prev) => ({
          ...prev,
          name: generated.name || prev.name,
          content: generated.content,
        }));
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      alert(error.message || "Failed to generate resume with AI.");
    } finally {
      setAiLoading(false);
    }
  };

  if (currentStep === 1) {
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
            <h1>Choose a Template</h1>
            <p>Select a professional template to get started with your resume</p>
          </motion.div>

          <motion.div
            className="template-categories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`template-category-btn ${selectedCategory === category.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </motion.div>

          <motion.div
            className="templates-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {filteredTemplates.map((template) => (
              <motion.div
                key={template._id}
                className="template-card"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="template-image">
                  <img src={template.image} alt={template.name} />
                </div>
                <div className="template-info">
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                  <div className="template-features">
                    {template.features.slice(0, 2).map((feature, i) => (
                      <span key={i} className="feature-tag">✓ {feature}</span>
                    ))}
                  </div>
                  {template.isPremium && (
                    <div className="premium-badge">${template.price}/month</div>
                  )}
                </div>
              </motion.div>
            ))}
            {!filteredTemplates.length && (
              <div style={{ color: "#94a3b8", textAlign: "center", gridColumn: "1 / -1" }}>
                No templates found for this category.
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Ensure template is selected before showing form
  if (!selectedTemplate) {
    return (
      <div className="resume-builder-container">
        <Background />
        <Navbar />
        <div className="content-wrapper">
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            Please select a template first.
            <br />
            <button
              onClick={() => setCurrentStep(1)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#4cc9f0',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Go Back to Templates
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <h1>Build Your Resume</h1>
          <p>Fill in your information to create a professional resume</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="resume-form">
          <div className="form-section">
            <h2>AI Resume Builder (OpenRouter)</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Target Role</label>
                <input
                  type="text"
                  value={aiInput.targetRole}
                  onChange={(e) => setAiInput((prev) => ({ ...prev, targetRole: e.target.value }))}
                  placeholder="Software Engineer, Data Analyst..."
                />
              </div>
              <div className="form-group">
                <label>Experience Level</label>
                <input
                  type="text"
                  value={aiInput.experienceLevel}
                  onChange={(e) => setAiInput((prev) => ({ ...prev, experienceLevel: e.target.value }))}
                  placeholder="Fresher, 2 years, Senior..."
                />
              </div>
            </div>
            <div className="form-group">
              <label>Job Description</label>
              <textarea
                value={aiInput.jobDescription}
                onChange={(e) => setAiInput((prev) => ({ ...prev, jobDescription: e.target.value }))}
                rows={4}
                placeholder="Paste the job description to generate a tailored resume..."
              />
            </div>
            <div className="form-group">
              <label>Existing Resume Text (optional)</label>
              <textarea
                value={aiInput.existingText}
                onChange={(e) => setAiInput((prev) => ({ ...prev, existingText: e.target.value }))}
                rows={3}
                placeholder="Paste existing resume text for better personalization..."
              />
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleAIGenerate}
              disabled={aiLoading}
            >
              {aiLoading ? "Generating with AI..." : "Generate Resume Content with AI"}
            </button>
          </div>

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
                  value={resumeData.content.personalInfo.fullName}
                  onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={resumeData.content.personalInfo.email}
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
                  value={resumeData.content.personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={resumeData.content.personalInfo.location}
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
                  value={resumeData.content.personalInfo.website}
                  onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="url"
                  value={resumeData.content.personalInfo.linkedin}
                  onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
            <div className="form-group">
              <label>GitHub</label>
              <input
                type="url"
                value={resumeData.content.personalInfo.github}
                onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                placeholder="https://github.com/yourprofile"
              />
            </div>
            <div className="form-group">
              <label>Professional Summary</label>
              <textarea
                value={resumeData.content.personalInfo.summary}
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
            {resumeData.content.workExperience.map((exp, index) => (
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
                <div className="sub-section">
                  <div className="section-header">
                    <label>Key Achievements</label>
                    <button
                      type="button"
                      className="btn-small"
                      onClick={() => {
                        const newAchievements = [...(exp.achievements || []), ''];
                        handleArrayItemChange('workExperience', index, 'achievements', newAchievements);
                      }}
                    >
                      + Add Achievement
                    </button>
                  </div>
                  {(exp.achievements || []).map((achievement, achIndex) => (
                    <div key={achIndex} className="achievement-item">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => handleNestedArrayChange('workExperience', index, 'achievements', achIndex, e.target.value)}
                        placeholder="e.g., Increased sales by 30%"
                      />
                      <button
                        type="button"
                        className="btn-remove-small"
                        onClick={() => {
                          const newAchievements = (exp.achievements || []).filter((_, j) => j !== achIndex);
                          handleArrayItemChange('workExperience', index, 'achievements', newAchievements);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
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

          {/* Skills Section */}
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
            {resumeData.content.skills.map((skillObj, index) => (
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
            {resumeData.content.education.map((edu, index) => (
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
            {resumeData.content.certifications.map((cert, index) => (
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
            {resumeData.content.projects.map((project, index) => (
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
                <div className="form-group">
                  <label>Technologies Used</label>
                  <div className="tech-tags">
                    {project.technologies.map((tech, techIndex) => (
                      <div key={techIndex} className="tech-tag">
                        <input
                          type="text"
                          value={tech}
                          onChange={(e) => handleNestedArrayChange('projects', index, 'technologies', techIndex, e.target.value)}
                          placeholder="e.g., React, Node.js"
                        />
                        <button
                          type="button"
                          className="btn-remove-small"
                          onClick={() => {
                            const newTechs = project.technologies.filter((_, j) => j !== techIndex);
                            handleArrayItemChange('projects', index, 'technologies', newTechs);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() => {
                      const newTechs = [...project.technologies, ''];
                      handleArrayItemChange('projects', index, 'technologies', newTechs);
                    }}
                  >
                    + Add Technology
                  </button>
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
            {resumeData.content.languages.map((lang, index) => (
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
              onClick={() => setCurrentStep(1)}
            >
              Back to Templates
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !resumeData.name || !resumeData.content.personalInfo.fullName}
            >
              {loading ? "Creating..." : "Create Draft & Preview"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
