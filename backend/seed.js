
const mongoose = require('mongoose');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const HealthCard = require('./models/HealthCard');
const { LoanApplication } = require('./models/Loan');
const Transaction = require('./models/Transaction');
const Notification = require('./models/Notification');
const fs = require('fs');

// Read seed data files
const users = JSON.parse(fs.readFileSync('./seed/demoUsers.json', 'utf8'));
const hospitals = JSON.parse(fs.readFileSync('./seed/demoHospitals.json', 'utf8'));
const healthCards = JSON.parse(fs.readFileSync('./seed/demoHealthCards.json', 'utf8'));
const loans = JSON.parse(fs.readFileSync('./seed/demoLoans.json', 'utf8'));
const transactions = JSON.parse(fs.readFileSync('./seed/demoTransactions.json', 'utf8'));
const notifications = JSON.parse(fs.readFileSync('./seed/demoNotifications.json', 'utf8'));

// Connect to MongoDB
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await HealthCard.deleteMany({});
    await LoanApplication.deleteMany({});
    await Transaction.deleteMany({});
    await Notification.deleteMany({});
    
    console.log('Cleared existing data');

    // Insert users with patientId for patients
    const userData = users.map((user, index) => {
      if (user.role === 'patient') {
        return {
          ...user,
          patientId: `P${String(index + 1).padStart(3, '0')}`
        };
      }
      return user;
    });
    
    const createdUsers = await User.insertMany(userData);
    console.log(`Inserted ${createdUsers.length} users`);
    
    // Map user emails to their IDs and patientIds for reference
    const userMap = {};
    const patientIdMap = {};
    createdUsers.forEach(user => {
      userMap[user.email] = user._id;
      if (user.role === 'patient' && user.patientId) {
        patientIdMap[user.patientId] = user._id;
      }
    });

    // Insert hospitals and assign users
    const hospitalData = hospitals.map((hospital, index) => {
      let userEmail;
      
      if (hospital.name === "City General Hospital") {
        userEmail = "rajesh@cityhospital.com";
      } else if (hospital.name === "Wellness Multispecialty Hospital") {
        userEmail = "priya@wellnesshospital.com";
      } else if (hospital.name === "LifeCare Medical Center") {
        userEmail = "anand@lifecaremedical.com";
      } else {
        userEmail = "hospital@demo.com";
      }
      
      return {
        ...hospital,
        user: userMap[userEmail]
      };
    });
    
    const createdHospitals = await Hospital.insertMany(hospitalData);
    console.log(`Inserted ${createdHospitals.length} hospitals`);

    const hospitalMap = {};
    createdHospitals.forEach(hospital => {
      hospitalMap[hospital.name] = hospital._id;
    });

    // Assign a default user to health cards if not specified
    const healthCardData = healthCards.map(card => {
      if (!card.user) {
        const patientUser = createdUsers.find(user => user.role === 'patient');
        card.user = patientUser ? patientUser._id : createdUsers[0]._id;
      }
      return card;
    });
    
    const createdHealthCards = await HealthCard.insertMany(healthCardData);
    console.log(`Inserted ${createdHealthCards.length} health cards`);

    // Update the loans section to use the new structure
    const loanData = loans.map((loan, index) => {
      const applicationNumber = `LA${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Get user ID for the loan
      let userId = userMap[loan.userEmail];
      if (!userId) {
        console.warn(`No user found for email: ${loan.userEmail}, using first user as fallback`);
        userId = Object.values(userMap)[0];
      }

      // Map status to valid enum value
      let mappedStatus;
      switch (loan.status) {
        case 'pending':
          mappedStatus = 'submitted';
          break;
        case 'submitted':
          mappedStatus = 'submitted';
          break;
        case 'approved':
          mappedStatus = 'approved';
          break;
        case 'rejected':
          mappedStatus = 'rejected';
          break;
        case 'disbursed':
          mappedStatus = 'disbursed';
          break;
        case 'under_review':
          mappedStatus = 'under_review';
          break;
        case 'additional_documents_needed':
          mappedStatus = 'additional_documents_needed';
          break;
        default:
          mappedStatus = 'submitted';
      }

      const loanObject = {
        user: userId,
        patientId: loan.patientId || userId, // Use patientId if provided, otherwise user ID
        applicationNumber,
        applicantType: loan.applicantType || 'patient',
        personalDetails: {
          fullName: loan.fullName || 'John Doe',
          email: loan.userEmail || 'john@example.com', 
          phone: loan.phone || '9876543210',
          dateOfBirth: new Date(loan.dateOfBirth || '1990-01-01'),
          address: loan.address || '123 Main Street, Mumbai',
          panNumber: loan.panNumber || 'ABCDE1234F',
          aadhaarNumber: loan.aadhaarNumber || '123456789012'
        },
        employmentDetails: {
          type: loan.employmentType || 'salaried',
          companyName: loan.companyName || 'Tech Corp Ltd',
          designation: loan.designation || 'Software Engineer', 
          monthlyIncome: loan.monthlyIncome || 75000,
          workExperience: loan.workExperience || 5,
          officeAddress: loan.officeAddress || 'Tech Park, Mumbai'
        },
        loanDetails: {
          amount: loan.amount || 500000,
          purpose: loan.purpose || 'Medical Treatment',
          tenure: loan.tenure || 24,
          hospitalName: loan.hospitalName,
          hospitalId: hospitalMap[loan.hospitalName],
          treatmentType: loan.treatmentType || 'General'
        },
        status: mappedStatus
      };

      // Add guarantor details if applicant type is guarantor
      if (loan.applicantType === 'guarantor') {
        loanObject.guarantorDetails = {
          fullName: loan.guarantorName || 'Guarantor Name',
          email: loan.guarantorEmail || 'guarantor@example.com',
          phone: loan.guarantorPhone || '9876543210',
          relationship: loan.guarantorRelationship || 'friend',
          address: loan.guarantorAddress || '123 Guarantor Street',
          panNumber: loan.guarantorPan || 'GRTEE1234F',
          aadhaarNumber: loan.guarantorAadhaar || '987654321012'
        };
      }

      // Add approval details for approved/disbursed loans
      if (mappedStatus === 'approved' || mappedStatus === 'disbursed') {
        loanObject.approvalDetails = {
          approvedAmount: loan.amount || 500000,
          interestRate: 10.5,
          processingFee: Math.round((loan.amount || 500000) * 0.02),
          emi: Math.round((loan.amount || 500000) / (loan.tenure || 24) * 1.15),
          approvedTenure: loan.tenure || 24,
          approvalDate: new Date(),
          ...(mappedStatus === 'disbursed' && { disbursementDate: new Date() })
        };

        // Add EMI details for disbursed loans
        if (mappedStatus === 'disbursed') {
          loanObject.emiDetails = {
            emiAmount: Math.round((loan.amount || 500000) / (loan.tenure || 24) * 1.15),
            totalEmis: loan.tenure || 24,
            paidEmis: Math.floor(Math.random() * 6), // Random paid EMIs
            nextEmiDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
            remainingBalance: (loan.amount || 500000) * 0.8 // 80% remaining
          };
        }
      }

      return loanObject;
    });
    
    const createdLoans = await LoanApplication.insertMany(loanData);
    console.log(`Inserted ${createdLoans.length} loans`);

    // Insert transactions with proper user references
    const transactionData = transactions.map(transaction => {
      if (!userMap[transaction.userEmail]) {
        console.warn(`No user found for email: ${transaction.userEmail}, using first user as fallback`);
      }
      
      return {
        ...transaction,
        user: userMap[transaction.userEmail] || Object.values(userMap)[0],
        hospital: transaction.hospital || 'Unknown Hospital'
      };
    });
    
    const createdTransactions = await Transaction.insertMany(transactionData);
    console.log(`Inserted ${createdTransactions.length} transactions`);

    // Update the notifications section
    const notificationData = notifications.map(notification => {
      if (!userMap[notification.userEmail]) {
        console.warn(`No user found for email: ${notification.userEmail}, using first user as fallback`);
      }

      return {
        ...notification,
        user: userMap[notification.userEmail] || Object.values(userMap)[0],
        message: notification.message || 'System notification',
        type: notification.type || 'info',
        createdAt: notification.createdAt || new Date()
      };
    });
    
    const createdNotifications = await Notification.insertMany(notificationData);
    console.log(`Inserted ${createdNotifications.length} notifications`);

    console.log('Database seeding completed successfully');
    console.log(`\nSample Patient IDs for testing:`);
    createdUsers.filter(user => user.role === 'patient').forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName}: ID = ${user._id} | Patient ID = ${user.patientId}`);
    });
    
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
};

seedDatabase();
