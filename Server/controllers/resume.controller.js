const fs = require('fs');

const { askAi } = require('../services/openRouter.service');
const { analyzeResume } = require('../utils/resumeAnalyzer');
const Resume = require('../models/Resume');
const Template = require('../models/Template');

const safeJsonParse = (content) => {
  if (!content || typeof content !== 'string') return null;

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleaned = content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Some models wrap JSON in backticks without newlines, try extracting between first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const analyzeResumePdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF uploaded.' });
    }

    const { PDFParse } = require('pdf-parse');

    const filePath = req.file.path;
    const buffer = await fs.promises.readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    await parser.destroy().catch(() => {});

    const resumeText = (data?.text || '').replace(/\s+/g, ' ').trim();

    if (!resumeText || resumeText.length < 40) {
      return res.status(400).json({ error: 'Could not extract enough text from PDF.' });
    }

    const analysis = analyzeResume(
      { resumeText },
      {
        jobDescription: req.body.jobDescription || '',
        targetRole: req.body.targetRole || ''
      }
    );

    // Optional AI extraction metadata. ATS scoring still works even if AI call fails.
    let extracted = null;
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const aiResponse = await askAi([
          {
            role: 'system',
            content: 'Extract role, experience summary, education summary, and skills array from this resume text. Return strict JSON only.'
          },
          {
            role: 'user',
            content: resumeText
          }
        ]);
        extracted = safeJsonParse(aiResponse);
      } catch (aiError) {
        console.warn('AI extraction skipped:', aiError.message);
      }
    }

    await fs.promises.unlink(filePath).catch(() => {});

    return res.json({
      message: 'Resume analyzed successfully',
      resumeText,
      analysis,
      score: analysis.score,
      jobMatch: analysis.jobMatch,
      extracted
    });
  } catch (error) {
    console.error('Error analyzing resume PDF:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      await fs.promises.unlink(req.file.path).catch(() => {});
    }
    return res.status(500).json({ error: 'Failed to analyze resume PDF. Please try again later.' });
  }
};

const normalizeArray = (arr) => (Array.isArray(arr) ? arr : []);

const normalizeResumeContent = (content = {}) => ({
  personalInfo: {
    fullName: content?.personalInfo?.fullName || '',
    email: content?.personalInfo?.email || '',
    phone: content?.personalInfo?.phone || '',
    location: content?.personalInfo?.location || '',
    website: content?.personalInfo?.website || '',
    linkedin: content?.personalInfo?.linkedin || '',
    github: content?.personalInfo?.github || '',
    summary: content?.personalInfo?.summary || ''
  },
  workExperience: normalizeArray(content?.workExperience).map((item) => ({
    company: item?.company || '',
    position: item?.position || '',
    startDate: item?.startDate || '',
    endDate: item?.endDate || '',
    currentlyWorking: Boolean(item?.currentlyWorking),
    description: item?.description || '',
    achievements: normalizeArray(item?.achievements).map((a) => String(a || '').trim()).filter(Boolean)
  })),
  education: normalizeArray(content?.education).map((item) => ({
    school: item?.school || '',
    degree: item?.degree || '',
    field: item?.field || '',
    startDate: item?.startDate || '',
    endDate: item?.endDate || '',
    description: item?.description || ''
  })),
  skills: normalizeArray(content?.skills).map((item) => ({
    skill: item?.skill || '',
    proficiency: item?.proficiency || 'Intermediate'
  })),
  certifications: normalizeArray(content?.certifications).map((item) => ({
    name: item?.name || '',
    issuer: item?.issuer || '',
    date: item?.date || '',
    credentialUrl: item?.credentialUrl || ''
  })),
  projects: normalizeArray(content?.projects).map((item) => ({
    name: item?.name || '',
    description: item?.description || '',
    technologies: normalizeArray(item?.technologies).map((t) => String(t || '').trim()).filter(Boolean),
    link: item?.link || '',
    startDate: item?.startDate || '',
    endDate: item?.endDate || ''
  })),
  languages: normalizeArray(content?.languages).map((item) => ({
    language: item?.language || '',
    proficiency: item?.proficiency || 'Intermediate'
  }))
});

const buildResumeWithAI = async (req, res) => {
  try {
    const {
      targetRole = '',
      jobDescription = '',
      experienceLevel = '',
      existingText = '',
      templateId = '',
      createDraft = false,
      resumeName = ''
    } = req.body || {};

    if (!targetRole.trim() && !jobDescription.trim() && !existingText.trim()) {
      return res.status(400).json({ error: 'Provide target role, job description, or existing resume text.' });
    }

    const prompt = [
      'Generate a professional ATS-friendly resume as strict JSON only.',
      'JSON shape:',
      '{',
      '  "name": "string",',
      '  "content": {',
      '    "personalInfo": {"fullName":"", "email":"", "phone":"", "location":"", "website":"", "linkedin":"", "github":"", "summary":""},',
      '    "workExperience":[{"company":"","position":"","startDate":"","endDate":"","currentlyWorking":false,"description":"","achievements":[""]}],',
      '    "education":[{"school":"","degree":"","field":"","startDate":"","endDate":"","description":""}],',
      '    "skills":[{"skill":"","proficiency":"Intermediate"}],',
      '    "certifications":[{"name":"","issuer":"","date":"","credentialUrl":""}],',
      '    "projects":[{"name":"","description":"","technologies":[""],"link":"","startDate":"","endDate":""}],',
      '    "languages":[{"language":"","proficiency":"Intermediate"}]',
      '  }',
      '}',
      `Target role: ${targetRole}`,
      `Experience level: ${experienceLevel}`,
      `Job description: ${jobDescription}`,
      `Existing resume text/context: ${existingText}`
    ].join('\n');

    const aiResponse = await askAi([
      { role: 'system', content: 'You are an expert resume writer. Return only valid JSON.' },
      { role: 'user', content: prompt }
    ]);

    const parsed = safeJsonParse(aiResponse);
    if (!parsed || typeof parsed !== 'object') {
      return res.status(422).json({ error: 'AI response could not be parsed into resume JSON.' });
    }

    const generatedName = (resumeName || parsed.name || `${targetRole || 'Generated'} Resume`).trim();
    const content = normalizeResumeContent(parsed.content || {});

    if (createDraft) {
      const resume = new Resume({
        user: req.user._id,
        name: generatedName,
        template: 'default-standard',
        templateName: 'Default Standard',
        content,
        status: 'draft'
      });

      await resume.save();
      return res.status(201).json({
        message: 'AI resume generated and saved as draft',
        resume
      });
    }

    return res.json({
      message: 'AI resume generated successfully',
      generatedResume: {
        name: generatedName,
        content
      }
    });
  } catch (error) {
    console.error('Error building resume with AI:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate resume with AI.' });
  }
};

module.exports = { analyzeResumePdf, buildResumeWithAI };
