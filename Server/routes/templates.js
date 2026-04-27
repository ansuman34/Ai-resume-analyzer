const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Template = require('../models/Template');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const defaultTemplates = require('../data/defaultTemplates');

const router = express.Router();

const validateTemplateId = [
  param('id').isMongoId().withMessage('Invalid template ID')
];

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

const ensureDefaultTemplates = async () => {
  await Promise.all(defaultTemplates.map((template) => (
    Template.updateOne(
      { name: template.name },
      { $setOnInsert: template },
      { upsert: true }
    )
  )));
};

// Get all templates
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    const templates = await Template.find(query).sort({ createdAt: -1 });
    res.json({ templates });
  } catch (error) {
    console.error('Fetch templates error:', error);
    res.status(500).json({ error: 'Server error fetching templates' });
  }
});

// Get single template
router.get('/:id', validateTemplateId, async (req, res) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Fetch template error:', error);
    res.status(500).json({ error: 'Server error fetching template' });
  }
});

// Create template (admin only)
router.post('/', auth, requireAdmin, [
  body('name').trim().isLength({ min: 2 }),
  body('category').isIn(['professional', 'tech', 'executive', 'creative', 'minimal', 'academic']),
  body('image').trim().isLength({ min: 1 }),
  body('description').trim().isLength({ min: 10 }),
  body('features').optional().isArray(),
  body('isPremium').optional().isBoolean(),
  body('price').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const { name, category, image, description, features, isPremium, price } = req.body;

    const template = new Template({
      name,
      category,
      image,
      description,
      features,
      isPremium,
      price
    });

    await template.save();

    res.status(201).json({
      message: 'Template created successfully',
      template
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Server error creating template' });
  }
});

// Update template (admin only)
router.put('/:id', auth, requireAdmin, [
  ...validateTemplateId,
  body('name').optional().trim().isLength({ min: 2 }),
  body('category').optional().isIn(['professional', 'tech', 'executive', 'creative', 'minimal', 'academic']),
  body('image').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('features').optional().isArray(),
  body('isPremium').optional().isBoolean(),
  body('price').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const updates = {};
    const allowedUpdates = ['name', 'category', 'image', 'description', 'features', 'isPremium', 'price'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const template = await Template.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      message: 'Template updated successfully',
      template
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Server error updating template' });
  }
});

// Delete template (admin only)
router.delete('/:id', auth, requireAdmin, validateTemplateId, async (req, res) => {
  try {
    if (sendValidationErrors(req, res)) return;

    const template = await Template.findByIdAndDelete(req.params.id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Server error deleting template' });
  }
});

module.exports = router;
module.exports.ensureDefaultTemplates = ensureDefaultTemplates;
