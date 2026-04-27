const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Resume = require('../models/Resume');
const Template = require('../models/Template');
const auth = require('../middleware/auth');
const { analyzeResume } = require('../utils/resumeAnalyzer');
const { upload } = require('../middleware/multer');
const { analyzeResumePdf, buildResumeWithAI } = require('../controllers/resume.controller');

const router = express.Router();

const validateResumeId = [
  param('id').isMongoId().withMessage('Invalid resume ID')
];

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

// Get all resumes for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('name score jobMatch updatedAt createdAt template status templateName');

    res.json({ resumes });
  } catch (error) {
    console.error('Fetch resumes error:', error);
    res.status(500).json({ error: 'Server error fetching resumes' });
  }
});

// Analyze unsaved resume content. Useful for live builder checks before saving.
router.post('/analyze', auth, [
  body().custom((value) => {
    if (value.content && typeof value.content === 'object') return true;
    if (value.resumeText && typeof value.resumeText === 'string' && value.resumeText.trim().length >= 40) return true;
    throw new Error('Provide resume content or at least 40 characters of resume text');
  }),
  body('content').optional().isObject(),
  body('resumeText').optional().isString(),
  body('jobDescription').optional().isString(),
  body('targetRole').optional().isString()
], async (req, res) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const analysis = analyzeResume(
      {
        content: req.body.content || {},
        resumeText: req.body.resumeText
      },
      {
        jobDescription: req.body.jobDescription,
        targetRole: req.body.targetRole
      }
    );

    res.json({
      message: 'Resume analyzed successfully',
      score: analysis.score,
      jobMatch: analysis.jobMatch,
      analysis
    });
  } catch (error) {
    console.error('Analyze draft resume error:', error);
    res.status(500).json({ error: 'Server error analyzing resume' });
  }
});

// Analyze uploaded PDF resume for ATS score
router.post('/analyze/pdf', auth, upload.single('resume'), analyzeResumePdf);

// Generate resume content using OpenRouter and optionally create draft
router.post('/build-ai', auth, [
  body('targetRole').optional().isString(),
  body('jobDescription').optional().isString(),
  body('experienceLevel').optional().isString(),
  body('existingText').optional().isString(),
  body('templateId').optional().isString(),
  body('resumeName').optional().isString(),
  body('createDraft').optional().isBoolean()
], async (req, res) => {
  if (sendValidationErrors(req, res)) return;
  return buildResumeWithAI(req, res);
});

// Get single resume
router.get('/:id', auth, validateResumeId, async (req, res) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({ resume });
  } catch (error) {
    console.error('Fetch resume error:', error);
    res.status(500).json({ error: 'Server error fetching resume' });
  }
});

// Create new resume
router.post('/', auth, [
  body('name').trim().isLength({ min: 1 }),
  body('content').isObject(),
  body('status').optional().isIn(['draft', 'saved'])
], async (req, res) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const { name, content, status } = req.body;

    const resume = new Resume({
      user: req.user._id,
      name,
      template: 'default-standard',
      templateName: 'Default Standard',
      content,
      status: status || 'draft'
    });

    await resume.save();

    res.status(201).json({
      message: 'Resume created successfully',
      resume
    });
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({ error: 'Server error creating resume', details: error.message, stack: error.stack });
  }
});

// Update resume
router.put('/:id', auth, [
  ...validateResumeId,
  body('name').optional().trim().isLength({ min: 1 }),
  body('content').optional().isObject()
], async (req, res) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const updates = {};
    const allowedUpdates = ['name', 'template', 'content', 'score', 'analysis', 'jobMatch', 'status'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({
      message: 'Resume updated successfully',
      resume
    });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ error: 'Server error updating resume' });
  }
});

// Delete resume
router.delete('/:id', auth, validateResumeId, async (req, res) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Server error deleting resume' });
  }
});

// Analyze saved resume with ATS, content quality, impact, and optional job-description matching
router.post('/:id/analyze', auth, [
  ...validateResumeId,
  body('jobDescription').optional().isString(),
  body('targetRole').optional().isString()
], async (req, res) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const analysis = analyzeResume({
      content: resume.content || {}
    }, {
      jobDescription: req.body.jobDescription,
      targetRole: req.body.targetRole
    });

    resume.score = analysis.score;
    resume.analysis = analysis;
    resume.jobMatch = analysis.jobMatch;
    resume.lastAnalyzedAt = new Date();
    await resume.save();

    res.json({
      message: 'Resume analyzed successfully',
      score: analysis.score,
      jobMatch: analysis.jobMatch,
      analysis
    });
  } catch (error) {
    console.error('Analyze resume error:', error);
    res.status(500).json({ error: 'Server error analyzing resume' });
  }
});

module.exports = router;
