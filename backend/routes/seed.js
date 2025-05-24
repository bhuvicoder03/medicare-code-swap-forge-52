
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { LoanApplication, EmiPayment, LoanOffer } = require('../models/Loan');
const HealthCard = require('../models/HealthCard');

// @route   POST api/seed/all
// @desc    Seed database with sample data
// @access  Public (remove in production)
router.post('/all', async (req, res) => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await LoanApplication.deleteMany({});
    await EmiPayment.deleteMany({});
    await LoanOffer.deleteMany({});
    await HealthCard.deleteMany({});

    // Create sample users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        password: hashedPassword,
        role: 'patient'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@email.com',
        password: hashedPassword,
        role: 'patient'
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@rimedicare.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        firstName: 'Dr. Rajesh',
        lastName: 'Kumar',
        email: 'dr.rajesh@hospital.com',
        password: hashedPassword,
        role: 'hospital'
      }
    ]);

    console.log(`Created ${users.length} users`);

    // Create sample loan applications
    const loanApplications = await LoanApplication.insertMany([
      {
        user: users[0]._id,
        applicationNumber: 'LA23120112345',
        personalDetails: {
          fullName: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+91-9876543210',
          dateOfBirth: new Date('1990-05-15'),
          address: '123 Main Street, Mumbai, Maharashtra 400001',
          panNumber: 'ABCDE1234F',
          aadhaarNumber: '1234-5678-9012'
        },
        employmentDetails: {
          type: 'salaried',
          companyName: 'Tech Solutions Pvt Ltd',
          designation: 'Software Engineer',
          monthlyIncome: 75000,
          workExperience: 5,
          officeAddress: 'Bandra Kurla Complex, Mumbai'
        },
        loanDetails: {
          amount: 500000,
          purpose: 'Heart Surgery',
          tenure: 24,
          hospitalName: 'Apollo Hospitals',
          treatmentType: 'Cardiac Surgery'
        },
        creditDetails: {
          creditScore: 750,
          accountAggregatorScore: 85
        },
        status: 'approved',
        approvalDetails: {
          approvedAmount: 500000,
          interestRate: 10.5,
          processingFee: 10000,
          emi: 23094,
          approvedTenure: 24,
          approvedBy: users[2]._id,
          approvalDate: new Date(),
          disbursementDate: new Date()
        },
        emiDetails: {
          emiAmount: 23094,
          totalEmis: 24,
          paidEmis: 6,
          nextEmiDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          remainingBalance: 400000
        },
        applicationDate: new Date('2023-06-01')
      },
      {
        user: users[1]._id,
        applicationNumber: 'LA23120212346',
        personalDetails: {
          fullName: 'Jane Smith',
          email: 'jane.smith@email.com',
          phone: '+91-9876543211',
          dateOfBirth: new Date('1985-08-22'),
          address: '456 Park Avenue, Delhi 110001',
          panNumber: 'FGHIJ5678K',
          aadhaarNumber: '5678-9012-3456'
        },
        employmentDetails: {
          type: 'salaried',
          companyName: 'Financial Services Inc',
          designation: 'Manager',
          monthlyIncome: 95000,
          workExperience: 8,
          officeAddress: 'Connaught Place, New Delhi'
        },
        loanDetails: {
          amount: 300000,
          purpose: 'Knee Replacement Surgery',
          tenure: 18,
          hospitalName: 'Fortis Hospital',
          treatmentType: 'Orthopedic Surgery'
        },
        creditDetails: {
          creditScore: 780,
          accountAggregatorScore: 90
        },
        status: 'under_review',
        applicationDate: new Date('2023-11-15')
      },
      {
        user: users[0]._id,
        applicationNumber: 'LA23120312347',
        personalDetails: {
          fullName: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+91-9876543210',
          dateOfBirth: new Date('1990-05-15'),
          address: '123 Main Street, Mumbai, Maharashtra 400001',
          panNumber: 'ABCDE1234F',
          aadhaarNumber: '1234-5678-9012'
        },
        employmentDetails: {
          type: 'salaried',
          companyName: 'Tech Solutions Pvt Ltd',
          designation: 'Software Engineer',
          monthlyIncome: 75000,
          workExperience: 5,
          officeAddress: 'Bandra Kurla Complex, Mumbai'
        },
        loanDetails: {
          amount: 150000,
          purpose: 'Dental Treatment',
          tenure: 12,
          hospitalName: 'Smile Dental Clinic',
          treatmentType: 'Dental Surgery'
        },
        creditDetails: {
          creditScore: 750,
          accountAggregatorScore: 85
        },
        status: 'submitted',
        applicationDate: new Date('2023-12-01')
      }
    ]);

    console.log(`Created ${loanApplications.length} loan applications`);

    // Create EMI payments for the approved loan
    const approvedLoan = loanApplications[0];
    const emiPayments = [];
    let remainingBalance = approvedLoan.approvalDetails.approvedAmount;
    const monthlyRate = approvedLoan.approvalDetails.interestRate / 100 / 12;
    
    for (let i = 1; i <= approvedLoan.approvalDetails.approvedTenure; i++) {
      const interestAmount = remainingBalance * monthlyRate;
      const principalAmount = approvedLoan.emiDetails.emiAmount - interestAmount;
      remainingBalance -= principalAmount;
      
      const dueDate = new Date('2023-07-15');
      dueDate.setMonth(dueDate.getMonth() + i - 1);
      
      const status = i <= 6 ? 'paid' : 'pending';
      const paymentDate = status === 'paid' ? new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000) : null;
      
      emiPayments.push({
        loan: approvedLoan._id,
        emiNumber: i,
        emiAmount: approvedLoan.emiDetails.emiAmount,
        principalAmount: Math.round(principalAmount),
        interestAmount: Math.round(interestAmount),
        dueDate: dueDate,
        status: status,
        paymentDate: paymentDate,
        paymentMethod: status === 'paid' ? 'upi' : null,
        transactionId: status === 'paid' ? `TXN${Date.now()}${i}` : null,
        totalPaidAmount: status === 'paid' ? approvedLoan.emiDetails.emiAmount : null
      });
    }
    
    await EmiPayment.insertMany(emiPayments);
    console.log(`Created ${emiPayments.length} EMI payments`);

    // Create loan offers for pending application
    const pendingLoan = loanApplications[1];
    const loanOffers = await LoanOffer.insertMany([
      {
        application: pendingLoan._id,
        provider: 'QuickFinance Pro',
        offeredAmount: 300000,
        interestRate: 9.8,
        tenure: 18,
        emi: 18750,
        processingFee: 6000,
        description: 'Best rate for your profile',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        application: pendingLoan._id,
        provider: 'MediLoan Plus',
        offeredAmount: 280000,
        interestRate: 10.2,
        tenure: 18,
        emi: 17650,
        processingFee: 5600,
        description: 'Healthcare specialist lender',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        application: pendingLoan._id,
        provider: 'HealthCare Finance',
        offeredAmount: 300000,
        interestRate: 11.5,
        tenure: 24,
        emi: 14200,
        processingFee: 4500,
        description: 'Lower EMI with extended tenure',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log(`Created ${loanOffers.length} loan offers`);

    // Create health cards
    const healthCards = await HealthCard.insertMany([
      {
        cardNumber: 'HC-2023-001-12345',
        user: users[0]._id,
        availableCredit: 25000,
        usedCredit: 5000,
        status: 'active',
        expiryDate: new Date('2025-12-31')
      },
      {
        cardNumber: 'HC-2023-002-12346',
        user: users[1]._id,
        availableCredit: 30000,
        usedCredit: 2000,
        status: 'active',
        expiryDate: new Date('2025-12-31')
      }
    ]);

    console.log(`Created ${healthCards.length} health cards`);

    res.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        users: users.length,
        loanApplications: loanApplications.length,
        emiPayments: emiPayments.length,
        loanOffers: loanOffers.length,
        healthCards: healthCards.length
      }
    });

  } catch (err) {
    console.error('Seeding error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
