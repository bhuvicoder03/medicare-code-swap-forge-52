
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');

// @route   GET api/loans
// @desc    Get all loans for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id }).sort({ applicationDate: -1 });
    res.json(loans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/loans
// @desc    Apply for a loan
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('amount', 'Amount is required').not().isEmpty(),
      check('termMonths', 'Term in months is required').not().isEmpty(),
      check('purpose', 'Loan purpose is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, termMonths, purpose, description, hospital_id } = req.body;

    try {
      // Calculate interest rate based on amount and term
      let interestRate = 12; // Base rate 12%
      if (amount > 100000) interestRate = 10; // Lower rate for higher amounts
      if (termMonths > 12) interestRate += 2; // Higher rate for longer terms
      
      // Calculate monthly payment
      const monthlyInterestRate = interestRate / 100 / 12;
      const monthlyPayment = 
        (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termMonths)) / 
        (Math.pow(1 + monthlyInterestRate, termMonths) - 1);

      const newLoan = new Loan({
        amount,
        termMonths,
        interestRate,
        user: req.user.id,
        purpose,
        description,
        hospital_id,
        monthlyPayment: Math.round(monthlyPayment),
        remainingBalance: amount,
        status: amount > 50000 ? 'pending' : 'approved', // Auto-approve smaller loans
        approvalDate: amount <= 50000 ? Date.now() : undefined
      });

      const loan = await newLoan.save();

      // Create loan disbursement transaction if auto-approved
      if (loan.status === 'approved') {
        const transaction = new Transaction({
          user: req.user.id,
          amount: amount,
          type: 'refund', // Loan disbursement
          description: `Loan disbursement - ${purpose}`,
          status: 'completed',
          hospital: hospital_id || 'Loan Department'
        });
        await transaction.save();
      }

      res.json({
        success: true,
        message: loan.status === 'approved' ? 'Loan approved and disbursed' : 'Loan application submitted',
        loan_id: loan._id,
        status: loan.status,
        monthly_payment: loan.monthlyPayment,
        interest_rate: loan.interestRate
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/loans/:id/pay-emi
// @desc    Pay EMI for a loan
// @access  Private
router.post('/:id/pay-emi', [
  auth,
  [
    check('amount', 'Amount is required').isNumeric()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount } = req.body;

  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (loan.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Loan not approved for payments' });
    }

    // Calculate interest and principal components
    const monthlyInterestRate = loan.interestRate / 100 / 12;
    const interestComponent = loan.remainingBalance * monthlyInterestRate;
    const principalComponent = amount - interestComponent;

    // Update loan balance
    loan.remainingBalance = Math.max(0, loan.remainingBalance - principalComponent);
    
    // Mark as completed if fully paid
    if (loan.remainingBalance === 0) {
      loan.status = 'completed';
    }

    await loan.save();

    // Create EMI payment transaction
    const transaction = new Transaction({
      user: req.user.id,
      amount: amount,
      type: 'payment',
      description: `EMI payment for loan ${loan._id}`,
      status: 'completed',
      hospital: 'Loan Department'
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'EMI payment processed successfully',
      transaction_id: transaction._id,
      remaining_balance: loan.remainingBalance,
      loan_status: loan.status
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// @route   POST api/loans/:id/prepay
// @desc    Prepay loan (partial or full)
// @access  Private
router.post('/:id/prepay', [
  auth,
  [
    check('amount', 'Amount is required').isNumeric(),
    check('type', 'Prepayment type is required').isIn(['partial', 'full'])
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, type } = req.body;

  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (loan.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Loan not approved for payments' });
    }

    const maxPrepayAmount = loan.remainingBalance;
    
    if (amount > maxPrepayAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Prepayment amount cannot exceed remaining balance of ₹${maxPrepayAmount}` 
      });
    }

    // Update loan balance
    loan.remainingBalance = Math.max(0, loan.remainingBalance - amount);
    
    // Mark as completed if fully paid
    if (loan.remainingBalance === 0 || type === 'full') {
      loan.remainingBalance = 0;
      loan.status = 'completed';
    }

    await loan.save();

    // Create prepayment transaction
    const transaction = new Transaction({
      user: req.user.id,
      amount: amount,
      type: 'payment',
      description: `${type === 'full' ? 'Full' : 'Partial'} prepayment for loan ${loan._id}`,
      status: 'completed',
      hospital: 'Loan Department'
    });

    await transaction.save();

    res.json({
      success: true,
      message: `${type === 'full' ? 'Full' : 'Partial'} prepayment processed successfully`,
      transaction_id: transaction._id,
      remaining_balance: loan.remainingBalance,
      loan_status: loan.status
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
});

// @route   PUT api/loans/:id/approve
// @desc    Approve a loan application (admin only)
// @access  Private
router.put('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hospital') {
      return res.status(401).json({ msg: 'Not authorized to approve loans' });
    }

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    if (loan.status === 'approved') {
      return res.status(400).json({ msg: 'Loan already approved' });
    }

    loan.status = 'approved';
    loan.approvalDate = Date.now();

    await loan.save();

    // Create loan disbursement transaction
    const transaction = new Transaction({
      user: loan.user,
      amount: loan.amount,
      type: 'refund', // Loan disbursement
      description: `Loan disbursement - ${loan.purpose}`,
      status: 'completed',
      hospital: 'Loan Department'
    });
    await transaction.save();

    res.json({
      success: true,
      message: 'Loan approved and disbursed',
      loan: loan
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
