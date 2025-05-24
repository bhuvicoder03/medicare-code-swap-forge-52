
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'hospital', 'admin', 'sales', 'crm'],
    default: 'patient'
  },
  patientId: {
    type: String,
    unique: true,
    sparse: true // Only for patients
  },
  profile: {
    phone: String,
    dateOfBirth: Date,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate patientId before saving for patient users
UserSchema.pre('save', async function(next) {
  if (this.role === 'patient' && !this.patientId) {
    const count = await mongoose.model('user').countDocuments({ role: 'patient' });
    this.patientId = `P${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('user', UserSchema);
