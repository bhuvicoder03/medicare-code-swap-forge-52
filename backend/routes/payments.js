
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const Transaction = require('../models/Transaction');
const User = require('../models/User');
const HealthCard = require('../models/HealthCard');

// Initialize Razorpay (you'll need to set these in environment variables)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_SECRET || 'dummy_secret'
});

// @route   POST api/payments/razorpay/initiate
// @desc    Initiate Razorpay payment
// @access  Private
router.post('/razorpay/initiate', [
  auth,
  [
    check('amount', 'Amount is required').isNumeric(),
    check('description', 'Description is required').not().isEmpty(),
    check('user_id', 'User ID is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, currency = 'INR', description, user_id, metadata } = req.body;

  try {
    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        user_id,
        description,
        ...metadata
      }
    };

    const order = await razorpay.orders.create(options);
    
    // Create pending transaction
    const transaction = new Transaction({
      user: user_id,
      amount: amount,
      type: 'payment',
      description: description,
      status: 'pending',
      hospital: metadata?.hospital || 'Online Payment'
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Razorpay order created successfully',
      order_id: order.id,
      transaction_id: transaction._id,
      gateway_response: order
    });

  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message
    });
  }
});

// @route   POST api/payments/razorpay/verify
// @desc    Verify Razorpay payment
// @access  Private
router.post('/razorpay/verify', [
  auth,
  [
    check('payment_id', 'Payment ID is required').not().isEmpty(),
    check('order_id', 'Order ID is required').not().isEmpty(),
    check('signature', 'Signature is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { payment_id, order_id, signature } = req.body;

  try {
    // Verify signature
    const body = order_id + '|' + payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET || 'dummy_secret')
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === signature;

    if (isSignatureValid) {
      // Update transaction status
      const transaction = await Transaction.findOneAndUpdate(
        { 'gateway_response.id': order_id },
        { 
          status: 'completed',
          gateway_response: { payment_id, order_id, signature }
        },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Payment verified successfully',
        transaction_id: transaction?._id
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// @route   POST api/payments/fallback
// @desc    Fallback payment processing (for testing)
// @access  Private
router.post('/fallback', [
  auth,
  [
    check('amount', 'Amount is required').isNumeric(),
    check('description', 'Description is required').not().isEmpty(),
    check('user_id', 'User ID is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, description, user_id, metadata } = req.body;

  try {
    // Create fallback transaction
    const transaction = new Transaction({
      user: user_id,
      amount: amount,
      type: 'payment',
      description: `[FALLBACK] ${description}`,
      status: 'completed',
      hospital: metadata?.hospital || 'Online Payment'
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Fallback payment processed successfully',
      transaction_id: transaction._id,
      fallback_used: true
    });

  } catch (error) {
    console.error('Fallback payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Fallback payment failed',
      error: error.message
    });
  }
});

module.exports = router;
