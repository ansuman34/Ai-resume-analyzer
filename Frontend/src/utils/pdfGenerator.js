import jsPDF from 'jspdf';
import { resolveTemplateTheme } from './resumeTemplateTheme';

export const generateResumePDF = async (resumeData, templateOrName = 'Professional Classic') => {
  const template = resolveTemplateTheme(templateOrName, resumeData.templateName || 'Professional Classic');

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const htmlContent = buildResumeHTML(resumeData, template);
    await pdf.html(htmlContent, {
      callback: function (pdfInstance) {
        const fileName = `${(resumeData.name || 'resume').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        pdfInstance.save(fileName);
      },
      x: 10,
      y: 10,
      width: 190,
      windowWidth: 800
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

const buildResumeHTML = (resumeData, template) => {
  const { content } = resumeData;
  const { personalInfo, workExperience, education, skills, certifications, projects, languages } = content;

  const styles = `
    <style>
      body { font-family: ${template.fontFamily}; margin: 0; padding: 20px; color: ${template.primaryColor}; }
      h1 { font-size: ${template.fontSize.header}px; color: ${template.primaryColor}; margin-bottom: 8px; font-weight: bold; text-align: center; }
      h2 { font-size: ${template.fontSize.subheader}px; color: ${template.secondaryColor}; margin: ${template.sectionSpacing}px 0 8px 0; border-bottom: 2px solid ${template.accentColor}; padding-bottom: 4px; }
      h3 { font-size: ${template.fontSize.body}px; color: ${template.primaryColor}; margin: 6px 0 4px 0; font-weight: bold; }
      p, li { font-size: ${template.fontSize.body}px; line-height: 1.4; margin: 4px 0; }
      .contact-info { margin-bottom: ${template.sectionSpacing}px; padding: 15px; background: ${template.headerBg}; border-radius: 4px; text-align: center; }
      .contact-info p { margin: 5px 0; }
      .section { margin-bottom: ${template.sectionSpacing}px; }
      .skill-item { display: inline-block; background: ${template.accentColor}; color: white; padding: 4px 8px; margin: 2px 4px 2px 0; border-radius: 12px; font-size: ${template.fontSize.small}px; }
      .experience-item, .education-item { margin-bottom: 12px; padding-left: 10px; border-left: 3px solid ${template.accentColor}; }
      .date-range { color: ${template.secondaryColor}; font-size: ${template.fontSize.small}px; font-style: italic; }
      ul { margin: 8px 0; padding-left: 20px; }
      a { color: ${template.accentColor}; text-decoration: none; }
    </style>
  `;

  return `
    ${styles}
    <div>
      <div class="contact-info">
        <h1>${personalInfo.fullName || 'Your Name'}</h1>
        <p>
          ${personalInfo.email ? personalInfo.email : ''}${personalInfo.phone ? ' | ' + personalInfo.phone : ''}${personalInfo.location ? ' | ' + personalInfo.location : ''}
        </p>
        ${personalInfo.website ? `<p><a href="${personalInfo.website}">${personalInfo.website}</a></p>` : ''}
        ${personalInfo.linkedin ? `<p>LinkedIn: <a href="${personalInfo.linkedin}">${personalInfo.linkedin}</a></p>` : ''}
        ${personalInfo.github ? `<p>GitHub: <a href="${personalInfo.github}">${personalInfo.github}</a></p>` : ''}
        ${personalInfo.summary ? `<p>${personalInfo.summary}</p>` : ''}
      </div>

      ${workExperience && workExperience.length > 0 ? `
        <div class="section">
          <h2>Work Experience</h2>
          ${workExperience.map(exp => `
            <div class="experience-item">
              <h3>${exp.position || 'Position'} at ${exp.company || 'Company'}</h3>
              <p class="date-range">${exp.startDate || ''} - ${exp.endDate || (exp.currentlyWorking ? 'Present' : '')}</p>
              ${exp.description ? `<p>${exp.description}</p>` : ''}
              ${exp.achievements && exp.achievements.length > 0 ? `
                <ul>
                  ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${education && education.length > 0 ? `
        <div class="section">
          <h2>Education</h2>
          ${education.map(edu => `
            <div class="education-item">
              <h3>${edu.degree || 'Degree'} in ${edu.field || 'Field'}</h3>
              <p>${edu.school || 'School'}</p>
              <p class="date-range">${edu.startDate || ''} - ${edu.endDate || ''}</p>
              ${edu.description ? `<p>${edu.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${skills && skills.length > 0 ? `
        <div class="section">
          <h2>Skills</h2>
          ${skills.map(skill => `
            <span class="skill-item">${skill.skill || skill} ${skill.proficiency ? `(${skill.proficiency})` : ''}</span>
          `).join('')}
        </div>
      ` : ''}

      ${projects && projects.length > 0 ? `
        <div class="section">
          <h2>Projects</h2>
          ${projects.map(project => `
            <div class="experience-item">
              <h3>${project.name || 'Project Name'}</h3>
              ${project.link ? `<p><a href="${project.link}">${project.link}</a></p>` : ''}
              ${project.description ? `<p>${project.description}</p>` : ''}
              ${project.technologies && project.technologies.length > 0 ? `
                <p><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${certifications && certifications.length > 0 ? `
        <div class="section">
          <h2>Certifications</h2>
          ${certifications.map(cert => `
            <div class="experience-item">
              <h3>${cert.name || 'Certification'}</h3>
              <p>${cert.issuer || 'Issuer'}</p>
              <p class="date-range">${cert.date || ''}</p>
              ${cert.credentialUrl ? `<p><a href="${cert.credentialUrl}">${cert.credentialUrl}</a></p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${languages && languages.length > 0 ? `
        <div class="section">
          <h2>Languages</h2>
          ${languages.map(lang => `
            <span class="skill-item">${lang.language || lang} ${lang.proficiency ? `(${lang.proficiency})` : ''}</span>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
};