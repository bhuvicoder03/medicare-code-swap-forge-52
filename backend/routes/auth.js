const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  console.log('=== GET /api/auth ===');
  console.log('Authenticating request...');
  try {
    console.log(`Fetching user details for ID: ${req.user.id}`);
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log(`User not found for ID: ${req.user.id}`);
      return res.status(404).json({ msg: 'User not found' });
    }
    console.log(`Successfully retrieved user: ${user.email}`);
    console.log('=== End GET /api/auth ===');
    res.json(user);
  } catch (err) {
    console.error('Authentication error:', err.message);
    console.log('=== End GET /api/auth with error ===');
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/auth
// @desc    Auth user & get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    console.log('=== POST /api/auth ===');
    console.log(`Login attempt initiated for: ${req.body.email}`);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation failed:', errors.array());
      console.log('=== End POST /api/auth with validation error ===');
      return res.status(400).json({ msg: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
      console.log('Looking up user in database...');
      let user = await User.findOne({ email });

      if (!user) {
        console.log(`Login failed: No user found with email ${email}`);
        console.log('=== End POST /api/auth with invalid credentials ===');
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      console.log('User found, verifying password...');
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log(`Login failed: Invalid password for user ${email}`);
        console.log('=== End POST /api/auth with invalid credentials ===');
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      console.log(`Password verified for user ${email}`);
      console.log('Generating JWT token...');
      
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) {
            console.error('Token generation failed:', err);
            console.log('=== End POST /api/auth with token error ===');
            throw err;
          }
          console.log(`Login successful for user ${email}`);
          console.log('=== End POST /api/auth ===');
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Server error during authentication:', err);
      console.log('=== End POST /api/auth with server error ===');
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

module.exports = router;
