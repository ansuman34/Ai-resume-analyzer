const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { generateResetToken, hashToken, sendPasswordResetEmail } = require('../utils/mailer');

const router = express.Router();

// Generate JWT token helper
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Register user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      authProvider: 'local'
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Google OAuth
router.post('/google', async (req, res) => {
  try {
    const { email, displayName, firstName, lastName, photoURL, providerId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = await User.findOne({ email });

    if (user) {
      // If user exists but signed up with a different provider
      if (user.authProvider !== 'google') {
        // Update provider info to link Google auth
        user.authProvider = 'google';
        user.providerId = providerId || user.providerId;
        user.photoURL = photoURL || user.photoURL;
        user.displayName = displayName || user.displayName;
        await user.save();
      }
    } else {
      // Create new user from Google
      user = new User({
        email,
        firstName: firstName || 'User',
        lastName: lastName || '',
        displayName: displayName || firstName || 'User',
        photoURL: photoURL || '',
        profilePicture: photoURL || '',
        providerId: providerId || null,
        authProvider: 'google'
      });
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        photoURL: user.photoURL,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Server error during Google authentication' });
  }
});

// GitHub OAuth
router.post('/github', async (req, res) => {
  try {
    const { email, displayName, firstName, lastName, photoURL, providerId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = await User.findOne({ email });

    if (user) {
      // If user exists but signed up with a different provider
      if (user.authProvider !== 'github') {
        // Update provider info to link GitHub auth
        user.authProvider = 'github';
        user.providerId = providerId || user.providerId;
        user.photoURL = photoURL || user.photoURL;
        user.displayName = displayName || user.displayName;
        await user.save();
      }
    } else {
      // Create new user from GitHub
      user = new User({
        email,
        firstName: firstName || 'User',
        lastName: lastName || '',
        displayName: displayName || firstName || 'User',
        photoURL: photoURL || '',
        profilePicture: photoURL || '',
        providerId: providerId || null,
        authProvider: 'github'
      });
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      message: 'GitHub login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        photoURL: user.photoURL,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('GitHub auth error:', error);
    res.status(500).json({ error: 'Server error during GitHub authentication' });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        displayName: req.user.displayName,
        profilePicture: req.user.profilePicture,
        photoURL: req.user.photoURL,
        authProvider: req.user.authProvider,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    const allowedUpdates = ['firstName', 'lastName', 'email'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.email && updates.email !== req.user.email) {
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// Forgot Password - Request password reset
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      // Don't reveal if email exists for security
      return res.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
        success: true
      });
    }

    // OAuth users cannot reset password
    if (user.authProvider !== 'local') {
      return res.status(400).json({
        error: `This account uses ${user.authProvider} authentication. Please sign in with ${user.authProvider}.`
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);

    // Set token and expiration (1 hour)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Send email with reset token
    try {
      await sendPasswordResetEmail(email, resetToken, user.firstName);
    } catch (emailError) {
      console.log('Email sending failed:', emailError.message);
      // If email fails in production, clear the token
      if (process.env.NODE_ENV === 'production') {
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();
        return res.status(500).json({ error: 'Failed to send reset email' });
      }
    }

    res.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
      success: true
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error during password reset request' });
  }
});

// Reset Password - Reset with token
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Hash the token to compare with stored hash
    const hashedToken = hashToken(token);

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Reset token is invalid or has expired' });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    // Generate new JWT token for auto-login
    const jwtToken = generateToken(user._id);

    res.json({
      message: 'Password reset successfully',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

// Verify reset token
router.post('/verify-reset-token', [
  body('token').notEmpty().withMessage('Reset token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ valid: false, error: 'Token is invalid or has expired' });
    }

    res.json({ valid: true, email: user.email });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Server error verifying token' });
  }
});

module.exports = router;

