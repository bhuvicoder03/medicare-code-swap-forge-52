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
    await LoanApplication.deleteMany({}); // Changed from Loan to LoanApplication
    await Transaction.deleteMany({});
    await Notification.deleteMany({});
    
    console.log('Cleared existing data');

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`Inserted ${createdUsers.length} users`);
    
    // Map user emails to their IDs for reference
    const userMap = {};
    createdUsers.forEach(user => {
      userMap[user.email] = user._id;
    });

    // Insert hospitals and assign users
    const hospitalData = hospitals.map((hospital, index) => {
      // Map each hospital to its corresponding user by email
      let userEmail;
      
      if (hospital.name === "City General Hospital") {
        userEmail = "rajesh@cityhospital.com";
      } else if (hospital.name === "Wellness Multispecialty Hospital") {
        userEmail = "priya@wellnesshospital.com";
      } else if (hospital.name === "LifeCare Medical Center") {
        userEmail = "anand@lifecaremedical.com";
      } else {
        // Fallback to a default hospital user
        userEmail = "hospital@demo.com";
      }
      
      // Assign the hospital to the corresponding user
      return {
        ...hospital,
        user: userMap[userEmail]
      };
    });
    
    const createdHospitals = await Hospital.insertMany(hospitalData);
    console.log(`Inserted ${createdHospitals.length} hospitals`);

    // Create hospital ID to record mapping for referencing
    const hospitalMap = {};
    createdHospitals.forEach(hospital => {
      hospitalMap[hospital.name] = hospital._id;
    });

    // Assign a default user to health cards if not specified
    // This fixes the validation error by ensuring all health cards have a user
    const healthCardData = healthCards.map(card => {
      if (!card.user) {
        // Find the first patient user to associate with the health card
        const patientUser = createdUsers.find(user => user.role === 'patient');
        card.user = patientUser ? patientUser._id : createdUsers[0]._id;
      }
      return card;
    });
    
    const createdHealthCards = await HealthCard.insertMany(healthCardData);
    console.log(`Inserted ${createdHealthCards.length} health cards`);

    // Update the loans section to use LoanApplication
    const loanData = loans.map(loan => {
      const applicationNumber = `LA${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Ensure we have a valid user ID
      if (!userMap[loan.userEmail]) {
        console.warn(`No user found for email: ${loan.userEmail}, using first user as fallback`);
      }
      
      // Map status to valid enum value
      let mappedStatus;
      switch (loan.status) {
        case 'pending':
          mappedStatus = 'draft';
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
        default:
          mappedStatus = 'draft';
      }

      return {
        user: userMap[loan.userEmail] || Object.values(userMap)[0], // Fallback to first user if email not found
        applicationNumber,
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
    });
    
    const createdLoans = await LoanApplication.insertMany(loanData); // Changed from Loan to LoanApplication
    console.log(`Inserted ${createdLoans.length} loans`);

    // Insert transactions with proper user references
    const transactionData = transactions.map(transaction => {
      // Ensure we have a valid user ID
      if (!userMap[transaction.userEmail]) {
        console.warn(`No user found for email: ${transaction.userEmail}, using first user as fallback`);
      }
      
      return {
        ...transaction,
        user: userMap[transaction.userEmail] || Object.values(userMap)[0], // Fallback to first user if email not found
        hospital: transaction.hospital || 'Unknown Hospital'
      };
    });
    
    const createdTransactions = await Transaction.insertMany(transactionData);
    console.log(`Inserted ${createdTransactions.length} transactions`);

    // Update the notifications section
    const notificationData = notifications.map(notification => {
      // Ensure we have a valid user ID
      if (!userMap[notification.userEmail]) {
        console.warn(`No user found for email: ${notification.userEmail}, using first user as fallback`);
      }

      // Create new notification object with required user field
      return {
        ...notification,
        user: userMap[notification.userEmail] || Object.values(userMap)[0], // Fallback to first user if email not found
        message: notification.message || 'System notification',
        type: notification.type || 'info',
        createdAt: notification.createdAt || new Date()
      };
    });
    
    const createdNotifications = await Notification.insertMany(notificationData);
    console.log(`Inserted ${createdNotifications.length} notifications`);

    console.log('Database seeding completed successfully');
    
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
};

seedDatabase();
