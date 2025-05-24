
const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1000
  },
  termMonths: {
    type: Number,
    required: true,
    min: 3,
    max: 60
  },
  interestRate: {
    type: Number,
    required: true,
    min: 8,
    max: 25
  },
  purpose: {
    type: String,
    required: true,
    enum: ['treatment', 'surgery', 'maternity', 'emergency', 'dental', 'other']
  },
  description: {
    type: String
  },
  hospital_id: {
    type: String
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected', 'completed'],
    default: 'pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  monthlyPayment: {
    type: Number
  },
  remainingBalance: {
    type: Number
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  lastPaymentDate: {
    type: Date
  },
  nextPaymentDue: {
    type: Date
  }
});

// Calculate next payment due date before saving
LoanSchema.pre('save', function(next) {
  if (this.isNew && this.status === 'approved' && !this.nextPaymentDue) {
    this.nextPaymentDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  }
  next();
});

module.exports = mongoose.model('loan', LoanSchema);
