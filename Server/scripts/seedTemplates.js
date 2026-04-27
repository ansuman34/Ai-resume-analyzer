const mongoose = require('mongoose');
const Template = require('../models/Template');
const defaultTemplates = require('../data/defaultTemplates');
require('dotenv').config();

async function seedTemplates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resumax');

    console.log('Connected to MongoDB');

    // Clear existing templates
    await Template.deleteMany({});
    console.log('Cleared existing templates');

    // Insert new templates
    const insertedTemplates = await Template.insertMany(defaultTemplates);
    console.log(`Seeded ${insertedTemplates.length} templates`);

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedTemplates();
