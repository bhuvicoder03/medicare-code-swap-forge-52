
const mongoose = require('mongoose');

const LoanApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  applicationNumber: {
    type: String,
    unique: true,
    required: true
  },
  personalDetails: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true },
    panNumber: { type: String, required: true },
    aadhaarNumber: { type: String, required: true }
  },
  employmentDetails: {
    type: { type: String, enum: ['salaried', 'self_employed', 'business'], required: true },
    companyName: { type: String, required: true },
    designation: { type: String },
    monthlyIncome: { type: Number, required: true },
    workExperience: { type: Number },
    officeAddress: { type: String }
  },
  loanDetails: {
    amount: { type: Number, required: true },
    purpose: { type: String, required: true },
    tenure: { type: Number, required: true }, // in months
    hospitalName: { type: String },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'hospital' },
    treatmentType: { type: String }
  },
  creditDetails: {
    creditScore: { type: Number },
    creditBureauResponse: { type: Object },
    accountAggregatorScore: { type: Number },
    bankStatements: [{
      bankName: String,
      accountNumber: String,
      averageBalance: Number,
      monthlyCredits: Number
    }]
  },
  documents: {
    aadhaarCard: { type: String },
    panCard: { type: String },
    salarySlips: [{ type: String }],
    bankStatements: [{ type: String }],
    addressProof: { type: String },
    employmentLetter: { type: String }
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'credit_check', 'approved', 'rejected', 'disbursed'],
    default: 'draft'
  },
  approvalDetails: {
    approvedAmount: { type: Number },
    interestRate: { type: Number },
    processingFee: { type: Number },
    emi: { type: Number },
    approvedTenure: { type: Number },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    approvalDate: { type: Date },
    disbursementDate: { type: Date }
  },
  rejectionDetails: {
    reason: { type: String },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    rejectionDate: { type: Date }
  },
  emiDetails: {
    emiAmount: { type: Number },
    totalEmis: { type: Number },
    paidEmis: { type: Number, default: 0 },
    nextEmiDate: { type: Date },
    remainingBalance: { type: Number }
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const EmiPaymentSchema = new mongoose.Schema({
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanApplication',
    required: true
  },
  emiNumber: {
    type: Number,
    required: true
  },
  emiAmount: {
    type: Number,
    required: true
  },
  principalAmount: {
    type: Number,
    required: true
  },
  interestAmount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'partially_paid'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'cash']
  },
  transactionId: {
    type: String
  },
  penaltyAmount: {
    type: Number,
    default: 0
  },
  totalPaidAmount: {
    type: Number
  }
}, {
  timestamps: true
});

const LoanOfferSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanApplication',
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  offeredAmount: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    required: true
  },
  tenure: {
    type: Number,
    required: true
  },
  emi: {
    type: Number,
    required: true
  },
  processingFee: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  terms: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'selected', 'expired'],
    default: 'active'
  },
  validUntil: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

const LoanApplication = mongoose.model('LoanApplication', LoanApplicationSchema);
const EmiPayment = mongoose.model('EmiPayment', EmiPaymentSchema);
const LoanOffer = mongoose.model('LoanOffer', LoanOfferSchema);

module.exports = { LoanApplication, EmiPayment, LoanOffer };
