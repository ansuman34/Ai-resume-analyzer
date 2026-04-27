import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { resolveTemplateTheme } from './resumeTemplateTheme';

export const generatePDFFromElement = async (element, filename = 'resume') => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

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
      body { font-family: "Times New Roman", Times, serif; margin: 0; padding: 0; color: black; background: white; }
      .resume-header-custom { text-align: center; margin-bottom: 15px; }
      .resume-header-custom h1 { font-size: 24px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; color: black; }
      .contact-links { font-size: 14px; margin-top: 5px; color: black; }
      .contact-links span { margin: 0 4px; }
      .resume-summary-custom { font-size: 14px; text-align: justify; margin-bottom: 20px; }
      .resume-section-custom { margin-bottom: 15px; }
      .resume-section-custom h2 { font-size: 16px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid black; padding-bottom: 2px; margin-bottom: 8px; color: black; }
      .resume-item-row { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 14px; }
      .resume-item-row.bold { font-weight: bold; }
      .resume-item-row.italic { font-style: italic; }
      .resume-bullets { margin: 4px 0 10px 0; padding-left: 20px; font-size: 14px; }
      .resume-bullets li { margin-bottom: 2px; }
      .resume-skills-block { font-size: 14px; margin-bottom: 5px; }
      .resume-skills-block span.bold { font-weight: bold; }
      a { color: black; text-decoration: none; }
    </style>
  `;

  const contactArray = [];
  if (personalInfo.phone) contactArray.push(`<span>${personalInfo.phone}</span>`);
  if (personalInfo.email) contactArray.push(`<span>${personalInfo.email}</span>`);
  if (personalInfo.linkedin) contactArray.push(`<span><a href="${personalInfo.linkedin}">LinkedIn</a></span>`);
  if (personalInfo.github) contactArray.push(`<span><a href="${personalInfo.github}">GitHub</a></span>`);
  if (personalInfo.website) contactArray.push(`<span><a href="${personalInfo.website}">Portfolio</a></span>`);
  
  const contactHTML = contactArray.join(' <span>|</span> ');

  return `
    ${styles}
    <div>
      <div class="resume-header-custom">
        <h1>${personalInfo.fullName || 'Your Name'}</h1>
        ${personalInfo.location ? `<div>${personalInfo.location}</div>` : ''}
        <div class="contact-links">${contactHTML}</div>
      </div>

      ${personalInfo.summary ? `<div class="resume-summary-custom">${personalInfo.summary}</div>` : ''}

      ${education && education.length > 0 ? `
        <div class="resume-section-custom">
          <h2>Education</h2>
          ${education.map(edu => `
            <div style="margin-bottom: 10px;">
              <div class="resume-item-row bold">
                <span>${edu.school || ''}</span>
                <span>${edu.startDate || ''} ${edu.endDate ? `- ${edu.endDate}` : ''}</span>
              </div>
              <div class="resume-item-row italic">
                <span>${edu.degree || ''} ${edu.field ? `in ${edu.field}` : ''}</span>
              </div>
              ${edu.description ? `
              <div class="resume-item-row">
                <span>${edu.description}</span>
              </div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${skills && skills.length > 0 ? `
        <div class="resume-section-custom">
          <h2>Skills</h2>
          <div class="resume-skills-block">
            <span class="bold">Technologies/Skills: </span>
            <span>${skills.map(s => s.skill || s).join(", ")}</span>
          </div>
        </div>
      ` : ''}

      ${workExperience && workExperience.length > 0 ? `
        <div class="resume-section-custom">
          <h2>Experience</h2>
          ${workExperience.map(exp => `
            <div style="margin-bottom: 12px;">
              <div class="resume-item-row bold">
                <span>${exp.company || ''}</span>
                <span>${exp.startDate || ''} ${!exp.currentlyWorking && exp.endDate ? `- ${exp.endDate}` : exp.currentlyWorking ? "- Present" : ""}</span>
              </div>
              <div class="resume-item-row italic">
                <span>${exp.position || ''}</span>
              </div>
              ${exp.description ? `<div style="font-size: 14px; margin-top: 4px;">${exp.description}</div>` : ''}
              ${exp.achievements && exp.achievements.length > 0 ? `
                <ul class="resume-bullets">
                  ${exp.achievements.map(ach => `<li>${ach}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${projects && projects.length > 0 ? `
        <div class="resume-section-custom">
          <h2>Projects</h2>
          ${projects.map(proj => `
            <div style="margin-bottom: 12px;">
              <div class="resume-item-row bold">
                <span>${proj.name || ''} ${proj.link ? `<a href="${proj.link}" style="font-weight: normal; font-size: 12px;">[Link]</a>` : ''}</span>
                <span>${proj.startDate || ''} ${proj.endDate ? `- ${proj.endDate}` : ''}</span>
              </div>
              ${proj.technologies && proj.technologies.length > 0 ? `
                <div class="resume-item-row italic">
                  <span>${proj.technologies.join(", ")}</span>
                </div>
              ` : ''}
              ${proj.description ? `<div style="font-size: 14px; margin-top: 4px;">${proj.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${certifications && certifications.length > 0 ? `
        <div class="resume-section-custom">
          <h2>Certifications & Achievements</h2>
          <ul class="resume-bullets" style="list-style-type: disc;">
            ${certifications.map(cert => `
              <li>
                <span class="bold">${cert.name || ''}</span> - ${cert.issuer || ''} ${cert.date ? `(${cert.date})` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
};