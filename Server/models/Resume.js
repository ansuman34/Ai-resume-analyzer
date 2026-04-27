const mongoose = require('mongoose');

// Personal Information subdocument
const personalInfoSchema = new mongoose.Schema({
  fullName: { type: String, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
  location: { type: String, trim: true },
  website: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  github: { type: String, trim: true },
  summary: { type: String, trim: true }
}, { _id: false });

// Work Experience subdocument
const workExperienceSchema = new mongoose.Schema({
  company: { type: String, trim: true },
  position: { type: String, trim: true },
  startDate: { type: String, trim: true },
  endDate: { type: String, trim: true },
  currentlyWorking: { type: Boolean, default: false },
  description: { type: String, trim: true },
  achievements: [{ type: String, trim: true }]
}, { _id: false });

// Education subdocument
const educationSchema = new mongoose.Schema({
  school: { type: String, trim: true },
  degree: { type: String, trim: true },
  field: { type: String, trim: true },
  startDate: { type: String, trim: true },
  endDate: { type: String, trim: true },
  description: { type: String, trim: true }
}, { _id: false });

// Certification subdocument
const certificationSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  issuer: { type: String, trim: true },
  date: { type: String, trim: true },
  credentialUrl: { type: String, trim: true }
}, { _id: false });

// Project subdocument
const projectSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  description: { type: String, trim: true },
  technologies: [{ type: String, trim: true }],
  link: { type: String, trim: true },
  startDate: { type: String, trim: true },
  endDate: { type: String, trim: true }
}, { _id: false });

// Language subdocument
const languageSchema = new mongoose.Schema({
  language: { type: String, trim: true },
  proficiency: { type: String, enum: ['Basic', 'Intermediate', 'Advanced', 'Fluent', 'Expert'], default: 'Intermediate' }
}, { _id: false });

// Skill subdocument
const skillSchema = new mongoose.Schema({
  skill: { type: String, trim: true },
  proficiency: { type: String, enum: ['Basic', 'Intermediate', 'Advanced', 'Fluent', 'Expert'], default: 'Intermediate' }
}, { _id: false });

// Main Resume Schema
const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  template: {
    type: String,
    required: true
  },
  templateName: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    personalInfo: personalInfoSchema,
    workExperience: [workExperienceSchema],
    education: [educationSchema],
    skills: [skillSchema],
    certifications: [certificationSchema],
    projects: [projectSchema],
    languages: [languageSchema]
  },
  fileUrl: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  analysis: {
    type: Object,
    default: {}
  },
  lastAnalyzedAt: {
    type: Date,
    default: null
  },
  jobMatch: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'saved'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
resumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

resumeSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Index for faster queries
resumeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
