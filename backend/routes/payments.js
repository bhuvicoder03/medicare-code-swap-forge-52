
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { LoanApplication, EmiPayment } = require('../models/Loan');
const Transaction = require('../models/Transaction');

// Mock payment gateway integration (replace with actual payment gateway)
const processPaymentGateway = async (paymentData) => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock payment response (replace with actual gateway response)
  return {
    success: Math.random() > 0.1, // 90% success rate for demo
    transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    gatewayResponse: {
      status: 'completed',
      amount: paymentData.amount,
      currency: 'INR',
      timestamp: new Date().toISOString()
    }
  };
};

// @route   POST api/payments/process-health-card
// @desc    Process health card payment
// @access  Private (Hospital only)
router.post('/process-health-card', [
  auth,
  [
    check('patientId', 'Patient ID is required').not().isEmpty(),
    check('amount', 'Amount is required').isNumeric(),
    check('description', 'Description is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (req.user.role !== 'hospital') {
    return res.status(401).json({ msg: 'Not authorized - Hospital access required' });
  }

  const { patientId, amount, description, paymentType } = req.body;

  try {
    // Process payment through gateway
    const paymentResult = await processPaymentGateway({
      amount,
      currency: 'INR',
      description,
      patientId,
      hospitalId: req.user.id
    });

    if (!paymentResult.success) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment processing failed',
        error: 'Gateway declined the transaction'
      });
    }

    // Create transaction record
    const transaction = new Transaction({
      user: patientId,
      amount,
      type: 'payment',
      description,
      status: 'completed',
      hospital: req.user.firstName ? `${req.user.firstName} ${req.user.lastName} Hospital` : 'Hospital'
    });

    await transaction.save();

    res.json({
      success: true,
      transactionId: paymentResult.transactionId,
      transaction,
      gatewayResponse: paymentResult.gatewayResponse
    });

  } catch (err) {
    console.error('Payment processing error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error during payment processing'
    });
  }
});

// @route   POST api/payments/process-loan-request
// @desc    Process loan request payment
// @access  Private (Hospital only)
router.post('/process-loan-request', [
  auth,
  [
    check('patientId', 'Patient ID is required').not().isEmpty(),
    check('amount', 'Amount is required').isNumeric(),
    check('purpose', 'Loan purpose is required').not().isEmpty(),
    check('tenure', 'Loan tenure is required').isNumeric()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (req.user.role !== 'hospital') {
    return res.status(401).json({ msg: 'Not authorized - Hospital access required' });
  }

  const { patientId, amount, purpose, tenure, description } = req.body;

  try {
    // Create loan application
    const loanData = {
      user: patientId,
      personalDetails: {
        fullName: 'Patient Name', // This should come from patient data
        email: 'patient@example.com',
        phone: '9999999999',
        dateOfBirth: new Date('1990-01-01'),
        address: 'Patient Address',
        panNumber: 'ABCDE1234F',
        aadhaarNumber: '123456789012'
      },
      employmentDetails: {
        type: 'salaried',
        companyName: 'Company Name',
        monthlyIncome: 50000
      },
      loanDetails: {
        amount,
        purpose,
        tenure,
        hospitalName: req.user.firstName ? `${req.user.firstName} ${req.user.lastName} Hospital` : 'Hospital',
        treatmentType: description
      },
      status: 'submitted',
      applicationNumber: `LA${Date.now()}`
    };

    const loan = new LoanApplication(loanData);
    await loan.save();

    // Create transaction record
    const transaction = new Transaction({
      user: patientId,
      amount,
      type: 'charge',
      description: `Loan request: ${purpose} - ${tenure} months`,
      status: 'completed',
      hospital: req.user.firstName ? `${req.user.firstName} ${req.user.lastName} Hospital` : 'Hospital'
    });

    await transaction.save();

    res.json({
      success: true,
      loan,
      transaction,
      message: 'Loan request submitted successfully'
    });

  } catch (err) {
    console.error('Loan request processing error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error during loan request processing'
    });
  }
});

// @route   POST api/payments/process-emi
// @desc    Process EMI payment
// @access  Private
router.post('/process-emi', [
  auth,
  [
    check('emiId', 'EMI ID is required').not().isEmpty(),
    check('paymentMethod', 'Payment method is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { emiId, paymentMethod, amountPaid } = req.body;

  try {
    const emi = await EmiPayment.findById(emiId).populate('loan');
    if (!emi) {
      return res.status(404).json({ msg: 'EMI not found' });
    }

    const loan = emi.loan;
    if (loan.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const paymentAmount = amountPaid || emi.emiAmount;

    // Process payment through gateway
    const paymentResult = await processPaymentGateway({
      amount: paymentAmount,
      currency: 'INR',
      description: `EMI Payment #${emi.emiNumber} for Loan ${loan.applicationNumber}`,
      userId: req.user.id
    });

    if (!paymentResult.success) {
      return res.status(400).json({ 
        success: false,
        message: 'EMI payment processing failed',
        error: 'Gateway declined the transaction'
      });
    }

    // Update EMI status
    emi.status = 'paid';
    emi.paymentDate = new Date();
    emi.paymentMethod = paymentMethod;
    emi.transactionId = paymentResult.transactionId;
    emi.totalPaidAmount = paymentAmount;
    await emi.save();

    // Update loan EMI details
    loan.emiDetails.paidEmis += 1;
    loan.emiDetails.remainingBalance -= emi.principalAmount;
    
    // Find next pending EMI
    const nextEmi = await EmiPayment.findOne({
      loan: loan._id,
      status: 'pending'
    }).sort({ emiNumber: 1 });
    
    if (nextEmi) {
      loan.emiDetails.nextEmiDate = nextEmi.dueDate;
    }
    
    await loan.save();

    // Create transaction record
    const transaction = new Transaction({
      user: req.user.id,
      amount: paymentAmount,
      type: 'payment',
      description: `EMI Payment #${emi.emiNumber}`,
      status: 'completed'
    });

    await transaction.save();

    res.json({
      success: true,
      transactionId: paymentResult.transactionId,
      emi,
      loan,
      transaction
    });

  } catch (err) {
    console.error('EMI payment processing error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error during EMI payment processing'
    });
  }
});

// @route   POST api/payments/process-prepayment
// @desc    Process loan prepayment
// @access  Private
router.post('/process-prepayment', [
  auth,
  [
    check('loanId', 'Loan ID is required').not().isEmpty(),
    check('amount', 'Amount is required').isNumeric(),
    check('paymentMethod', 'Payment method is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { loanId, amount, paymentMethod } = req.body;

  try {
    const loan = await LoanApplication.findById(loanId);
    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    if (loan.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Process payment through gateway
    const paymentResult = await processPaymentGateway({
      amount,
      currency: 'INR',
      description: `Prepayment for Loan ${loan.applicationNumber}`,
      userId: req.user.id
    });

    if (!paymentResult.success) {
      return res.status(400).json({ 
        success: false,
        message: 'Prepayment processing failed',
        error: 'Gateway declined the transaction'
      });
    }

    // Update loan balance
    loan.emiDetails.remainingBalance -= amount;
    
    if (loan.emiDetails.remainingBalance <= 0) {
      loan.status = 'closed';
      loan.emiDetails.remainingBalance = 0;
      
      // Mark all pending EMIs as paid
      await EmiPayment.updateMany(
        { loan: loan._id, status: 'pending' },
        { 
          status: 'paid', 
          paymentDate: new Date(), 
          paymentMethod,
          transactionId: paymentResult.transactionId
        }
      );
    }
    
    await loan.save();

    // Create transaction record
    const transaction = new Transaction({
      user: req.user.id,
      amount,
      type: 'payment',
      description: `Loan Prepayment`,
      status: 'completed'
    });

    await transaction.save();

    res.json({
      success: true,
      transactionId: paymentResult.transactionId,
      loan,
      transaction
    });

  } catch (err) {
    console.error('Prepayment processing error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error during prepayment processing'
    });
  }
});

module.exports = router;
