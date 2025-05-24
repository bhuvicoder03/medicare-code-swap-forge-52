
const mongoose = require('mongoose');

const HealthCardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'blocked'],
    default: 'active'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  lastUsed: {
    type: Date
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  totalTopups: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('healthcard', HealthCardSchema);
