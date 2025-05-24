
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const HealthCard = require('../models/HealthCard');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @route   GET api/health-cards
// @desc    Get user's health card
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const healthCard = await HealthCard.findOne({ user: req.user.id });
    
    if (!healthCard) {
      return res.status(404).json({ msg: 'Health card not found' });
    }

    res.json(healthCard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/health-cards
// @desc    Create a health card
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    // Check if user already has a health card
    let existingCard = await HealthCard.findOne({ user: req.user.id });
    
    if (existingCard) {
      return res.status(400).json({ msg: 'Health card already exists' });
    }

    // Generate card number
    const cardNumber = `HC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    const healthCard = new HealthCard({
      user: req.user.id,
      cardNumber: cardNumber,
      balance: 0,
      status: 'active',
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    });

    await healthCard.save();
    res.json(healthCard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/health-cards/:id/topup
// @desc    Top up health card balance
// @access  Private
router.post('/:id/topup', [
  auth,
  [
    check('amount', 'Amount is required').isNumeric().isFloat({ min: 1 })
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, payment_method = 'razorpay' } = req.body;

  try {
    const healthCard = await HealthCard.findById(req.params.id);

    if (!healthCard) {
      return res.status(404).json({ success: false, message: 'Health card not found' });
    }

    if (healthCard.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (healthCard.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Health card is not active' });
    }

    // Update card balance
    healthCard.balance += parseFloat(amount);
    await healthCard.save();

    // Create top-up transaction
    const transaction = new Transaction({
      user: req.user.id,
      amount: amount,
      type: 'refund', // Credit to account
      description: `Health card top-up via ${payment_method}`,
      status: 'completed',
      hospital: 'Health Card Service'
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Health card topped up successfully',
      transaction_id: transaction._id,
      new_balance: healthCard.balance
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// @route   POST api/health-cards/payment
// @desc    Process health card payment
// @access  Private
router.post('/payment', [
  auth,
  [
    check('patient_id', 'Patient ID is required').not().isEmpty(),
    check('amount', 'Amount is required').isNumeric().isFloat({ min: 1 }),
    check('description', 'Description is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { patient_id, amount, description, hospital_id } = req.body;

  try {
    // Only hospitals and admins can process health card payments
    if (req.user.role !== 'hospital' && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to process payments' });
    }

    const healthCard = await HealthCard.findOne({ user: patient_id });

    if (!healthCard) {
      return res.status(404).json({ success: false, message: 'Patient health card not found' });
    }

    if (healthCard.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Health card is not active' });
    }

    if (healthCard.balance < parseFloat(amount)) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Available: ₹${healthCard.balance}, Required: ₹${amount}` 
      });
    }

    // Deduct amount from card balance
    healthCard.balance -= parseFloat(amount);
    await healthCard.save();

    // Create payment transaction
    const transaction = new Transaction({
      user: patient_id,
      amount: amount,
      type: 'payment',
      description: description,
      status: 'completed',
      hospital: hospital_id || req.user.id
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Health card payment processed successfully',
      transaction_id: transaction._id,
      remaining_balance: healthCard.balance
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// @route   GET api/health-cards/user/:userId
// @desc    Get health card by user ID (for hospitals)
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Only hospitals and admins can view other users' health cards
    if (req.user.role !== 'hospital' && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const healthCard = await HealthCard.findOne({ user: req.params.userId });
    
    if (!healthCard) {
      return res.status(404).json({ msg: 'Health card not found' });
    }

    res.json(healthCard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
