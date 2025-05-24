const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { LoanApplication, EmiPayment, LoanOffer } = require('../models/Loan');
const User = require('../models/User');

// Generate application number
const generateApplicationNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `LA${year}${month}${day}${random}`;
};

// @route   GET api/loans/patient/:patientId
// @desc    Get loans by patient ID (public access for guarantor)
// @access  Public
router.get('/patient/:patientId', async (req, res) => {
  try {
    const loans = await LoanApplication.find({ patientId: req.params.patientId })
      .populate('loanDetails.hospitalId', 'name')
      .populate('user', 'firstName lastName')
      .sort({ applicationDate: -1 });
    
    res.json(loans);
  } catch (err) {
    console.error('Error fetching loans by patient ID:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/loans/verify-patient/:patientId
// @desc    Verify patient ID exists
// @access  Public
router.post('/verify-patient/:patientId', async (req, res) => {
  try {
    const patient = await User.findOne({ 
      $or: [
        { _id: req.params.patientId },
        { patientId: req.params.patientId }
      ],
      role: 'patient' 
    });
    
    if (!patient) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Patient ID not found' 
      });
    }
    
    res.json({ 
      valid: true, 
      patient: {
        id: patient._id,
        name: `${patient.firstName} ${patient.lastName}`,
        email: patient.email
      }
    });
  } catch (err) {
    console.error('Error verifying patient ID:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/loans
// @desc    Get all loans for a user or all loans for admin/hospital
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let loans;
    if (req.user.role === 'admin' || req.user.role === 'hospital') {
      // Admin & hospital: get all loans
      loans = await LoanApplication.find({})
        .populate('user', 'firstName lastName email')
        .populate('loanDetails.hospitalId', 'name')
        .sort({ applicationDate: -1 });
    } else if (req.user.role === 'patient') {
      // Patient: get only own loans using patientId on user profile (match by patientId)
      // Find user's patientId
      const user = await User.findById(req.user.id);
      loans = await LoanApplication.find({ patientId: user.patientId || user._id })
        .populate('loanDetails.hospitalId', 'name')
        .sort({ applicationDate: -1 });
    } else {
      // Default empty
      loans = [];
    }
    res.json(loans);
  } catch (err) {
    console.error('Error fetching loans:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/loans/:id
// @desc    Get specific loan application
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const loan = await LoanApplication.findById(req.params.id)
      .populate('loanDetails.hospitalId', 'name')
      .populate('approvalDetails.approvedBy', 'firstName lastName')
      .populate('comments.author', 'firstName lastName role');
    
    if (!loan) {
      return res.status(404).json({ msg: 'Loan application not found' });
    }

    // Check if user owns the loan or is admin
    if (loan.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(loan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/loans/apply
// @desc    Create new loan application (patient or guarantor)
// @access  Public/Private
router.post('/apply', [
  [
    check('personalDetails.fullName', 'Full name is required').not().isEmpty(),
    check('personalDetails.email', 'Valid email is required').isEmail(),
    check('personalDetails.phone', 'Phone number is required').not().isEmpty(),
    check('loanDetails.amount', 'Loan amount is required').isNumeric(),
    check('loanDetails.purpose', 'Loan purpose is required').not().isEmpty(),
    check('loanDetails.tenure', 'Loan tenure is required').isNumeric(),
    check('employmentDetails.type', 'Employment type is required').not().isEmpty(),
    check('employmentDetails.monthlyIncome', 'Monthly income is required').isNumeric(),
    check('patientId', 'Patient ID is required').not().isEmpty(),
    check('applicantType', 'Applicant type is required').isIn(['patient', 'guarantor'])
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { patientId, applicantType } = req.body;
    
    // Verify patient exists
    const patient = await User.findOne({ 
      $or: [
        { _id: patientId },
        { patientId: patientId }
      ],
      role: 'patient' 
    });
    
    if (!patient) {
      return res.status(404).json({ msg: 'Patient not found' });
    }

    const applicationNumber = generateApplicationNumber();
    
    const newLoan = new LoanApplication({
      user: patient._id,
      patientId: patient._id,
      applicationNumber,
      applicantType,
      ...req.body,
      status: 'submitted'
    });

    const loan = await newLoan.save();

    // Generate loan offers based on credit profile
    await generateLoanOffers(loan._id, req.body);

    res.json({ loan, applicationNumber });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/loans/:id/update-status
// @desc    Update loan application status with comments
// @access  Private (Admin/Hospital only)
router.put('/:id/update-status', auth, async (req, res) => {
  try {
    if (!['admin', 'hospital'].includes(req.user.role)) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const { status, approvalDetails, rejectionDetails, comment } = req.body;
    
    const loan = await LoanApplication.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ msg: 'Loan application not found' });
    }

    const oldStatus = loan.status;
    loan.status = status;
    loan.lastUpdated = new Date();

    // Add comment for status change
    if (comment || oldStatus !== status) {
      loan.comments.push({
        message: comment || `Status changed from ${oldStatus} to ${status}`,
        author: req.user.id,
        statusChange: `${oldStatus} -> ${status}`
      });
    }

    if (status === 'approved' && approvalDetails) {
      loan.approvalDetails = {
        ...approvalDetails,
        approvedBy: req.user.id,
        approvalDate: new Date()
      };
      
      // Generate EMI schedule
      await generateEmiSchedule(loan);
    }

    if (status === 'rejected' && rejectionDetails) {
      loan.rejectionDetails = {
        ...rejectionDetails,
        rejectedBy: req.user.id,
        rejectionDate: new Date()
      };
    }

    if (status === 'disbursed') {
      loan.approvalDetails.disbursementDate = new Date();
      // Here you would integrate with wallet system
      await disburseLoanToWallet(loan);
    }

    await loan.save();
    res.json(loan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/loans/:id/add-comment
// @desc    Add comment to loan application
// @access  Private
router.post('/:id/add-comment', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    const loan = await LoanApplication.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ msg: 'Loan application not found' });
    }

    loan.comments.push({
      message,
      author: req.user.id
    });
    
    await loan.save();
    
    const updatedLoan = await LoanApplication.findById(req.params.id)
      .populate('comments.author', 'firstName lastName role');
    
    res.json(updatedLoan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/loans/:id/offers
// @desc    Get loan offers for application
// @access  Private
router.get('/:id/offers', auth, async (req, res) => {
  try {
    const offers = await LoanOffer.find({ 
      application: req.params.id,
      status: 'active',
      validUntil: { $gt: new Date() }
    });
    
    res.json(offers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/loans/:id/select-offer
// @desc    Select loan offer
// @access  Private
router.post('/:id/select-offer', auth, async (req, res) => {
  try {
    const { offerId } = req.body;
    
    const loan = await LoanApplication.findById(req.params.id);
    const offer = await LoanOffer.findById(offerId);
    
    if (!loan || !offer) {
      return res.status(404).json({ msg: 'Loan or offer not found' });
    }

    if (loan.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update loan with selected offer details
    loan.approvalDetails = {
      approvedAmount: offer.offeredAmount,
      interestRate: offer.interestRate,
      processingFee: offer.processingFee,
      emi: offer.emi,
      approvedTenure: offer.tenure
    };
    
    loan.status = 'approved';
    await loan.save();

    // Mark offer as selected
    offer.status = 'selected';
    await offer.save();

    // Mark other offers as expired
    await LoanOffer.updateMany(
      { application: req.params.id, _id: { $ne: offerId } },
      { status: 'expired' }
    );

    res.json({ loan, selectedOffer: offer });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/loans/:id/emis
// @desc    Get EMI schedule for loan
// @access  Private
router.get('/:id/emis', auth, async (req, res) => {
  try {
    const loan = await LoanApplication.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    if (loan.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const emis = await EmiPayment.find({ loan: req.params.id }).sort({ emiNumber: 1 });
    res.json(emis);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/loans/emi/:emiId/pay
// @desc    Pay EMI
// @access  Private
router.post('/emi/:emiId/pay', auth, async (req, res) => {
  try {
    const { paymentMethod, transactionId, amountPaid } = req.body;
    
    const emi = await EmiPayment.findById(req.params.emiId).populate('loan');
    if (!emi) {
      return res.status(404).json({ msg: 'EMI not found' });
    }

    const loan = emi.loan;
    if (loan.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update EMI payment
    emi.status = 'paid';
    emi.paymentDate = new Date();
    emi.paymentMethod = paymentMethod;
    emi.transactionId = transactionId;
    emi.totalPaidAmount = amountPaid || emi.emiAmount;
    
    await emi.save();

    // Update loan EMI details
    loan.emiDetails.paidEmis += 1;
    loan.emiDetails.remainingBalance -= emi.principalAmount;
    
    // Calculate next EMI date
    const nextEmi = await EmiPayment.findOne({
      loan: loan._id,
      status: 'pending'
    }).sort({ emiNumber: 1 });
    
    if (nextEmi) {
      loan.emiDetails.nextEmiDate = nextEmi.dueDate;
    }
    
    await loan.save();

    res.json({ emi, loan });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/loans/:id/prepay
// @desc    Make prepayment on loan
// @access  Private
router.post('/:id/prepay', auth, async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId } = req.body;
    
    const loan = await LoanApplication.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    if (loan.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update remaining balance
    loan.emiDetails.remainingBalance -= amount;
    
    if (loan.emiDetails.remainingBalance <= 0) {
      loan.status = 'closed';
      loan.emiDetails.remainingBalance = 0;
      
      // Mark all pending EMIs as paid
      await EmiPayment.updateMany(
        { loan: loan._id, status: 'pending' },
        { status: 'paid', paymentDate: new Date(), paymentMethod, transactionId }
      );
    } else {
      // Recalculate EMI schedule for remaining amount
      await recalculateEmiSchedule(loan, amount);
    }
    
    await loan.save();
    res.json(loan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Helper function to generate loan offers
const generateLoanOffers = async (applicationId, applicationData) => {
  const baseAmount = applicationData.loanDetails.amount;
  const income = applicationData.employmentDetails.monthlyIncome;
  
  // Calculate offers based on income and loan amount
  const offers = [
    {
      application: applicationId,
      provider: 'QuickFinance Pro',
      offeredAmount: Math.min(baseAmount, income * 50),
      interestRate: 10.5,
      tenure: 12,
      processingFee: baseAmount * 0.02,
      description: 'Quick approval with competitive rates',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      application: applicationId,
      provider: 'MediLoan Plus',
      offeredAmount: Math.min(baseAmount, income * 60),
      interestRate: 9.8,
      tenure: 18,
      processingFee: baseAmount * 0.025,
      description: 'Extended tenure with lower EMI',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      application: applicationId,
      provider: 'HealthCare Finance',
      offeredAmount: Math.min(baseAmount, income * 45),
      interestRate: 11.2,
      tenure: 24,
      processingFee: baseAmount * 0.015,
      description: 'Healthcare specialist with low processing fee',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  ];

  // Calculate EMI for each offer
  offers.forEach(offer => {
    const monthlyRate = offer.interestRate / 100 / 12;
    const emi = (offer.offeredAmount * monthlyRate * Math.pow(1 + monthlyRate, offer.tenure)) / 
                 (Math.pow(1 + monthlyRate, offer.tenure) - 1);
    offer.emi = Math.round(emi);
  });

  await LoanOffer.insertMany(offers);
};

// Helper function to generate EMI schedule
const generateEmiSchedule = async (loan) => {
  const { approvedAmount, interestRate, approvedTenure, emi } = loan.approvalDetails;
  const monthlyRate = interestRate / 100 / 12;
  let remainingBalance = approvedAmount;
  
  const emis = [];
  const startDate = new Date();
  
  for (let i = 1; i <= approvedTenure; i++) {
    const interestAmount = remainingBalance * monthlyRate;
    const principalAmount = emi - interestAmount;
    remainingBalance -= principalAmount;
    
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    emis.push({
      loan: loan._id,
      emiNumber: i,
      emiAmount: emi,
      principalAmount: Math.round(principalAmount),
      interestAmount: Math.round(interestAmount),
      dueDate: dueDate
    });
  }
  
  await EmiPayment.insertMany(emis);
  
  // Update loan EMI details
  loan.emiDetails = {
    emiAmount: emi,
    totalEmis: approvedTenure,
    paidEmis: 0,
    nextEmiDate: emis[0].dueDate,
    remainingBalance: approvedAmount
  };
  
  await loan.save();
};

// Helper function to recalculate EMI schedule after prepayment
const recalculateEmiSchedule = async (loan, prepaidAmount) => {
  // This is a simplified recalculation - in real implementation, 
  // you might want more sophisticated logic
  const pendingEmis = await EmiPayment.find({
    loan: loan._id,
    status: 'pending'
  }).sort({ emiNumber: 1 });
  
  // Reduce the principal amount proportionally
  const totalPendingPrincipal = pendingEmis.reduce((sum, emi) => sum + emi.principalAmount, 0);
  const reductionRatio = prepaidAmount / totalPendingPrincipal;
  
  for (const emi of pendingEmis) {
    emi.principalAmount = Math.round(emi.principalAmount * (1 - reductionRatio));
    emi.emiAmount = emi.principalAmount + emi.interestAmount;
    await emi.save();
  }
};

// Helper function to disburse loan to wallet
const disburseLoanToWallet = async (loan) => {
  // This would integrate with your wallet system
  console.log(`Disbursing ₹${loan.approvalDetails.approvedAmount} to patient wallet for loan ${loan.applicationNumber}`);
  // Implementation depends on your wallet system
};

module.exports = router;
