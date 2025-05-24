
const mongoose = require('mongoose');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const HealthCard = require('./models/HealthCard');
const Loan = require('./models/Loan');
const Transaction = require('./models/Transaction');
const comprehensiveData = require('./seed/comprehensiveData.json');

// Connect to MongoDB
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedComprehensiveData = async () => {
  try {
    console.log('Starting comprehensive database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await HealthCard.deleteMany({});
    await Loan.deleteMany({});
    await Transaction.deleteMany({});
    
    console.log('Cleared existing data');

    // Insert users
    const createdUsers = await User.insertMany(comprehensiveData.users);
    console.log(`Inserted ${createdUsers.length} users`);
    
    // Create user mapping by email
    const userMap = {};
    createdUsers.forEach(user => {
      userMap[user.email] = user._id;
    });

    // Insert health cards with proper user references
    const healthCardData = comprehensiveData.healthCards.map((card, index) => {
      const userEmails = ['patient@demo.com', 'rahul@demo.com', 'sneha@demo.com'];
      return {
        ...card,
        user: userMap[userEmails[index]]
      };
    });
    
    const createdHealthCards = await HealthCard.insertMany(healthCardData);
    console.log(`Inserted ${createdHealthCards.length} health cards`);

    // Insert loans with proper user references
    const loanData = comprehensiveData.loans.map((loan, index) => {
      const userEmails = ['patient@demo.com', 'rahul@demo.com', 'sneha@demo.com'];
      return {
        ...loan,
        user: userMap[userEmails[index]]
      };
    });
    
    const createdLoans = await Loan.insertMany(loanData);
    console.log(`Inserted ${createdLoans.length} loans`);

    // Insert transactions with proper user references
    const transactionData = comprehensiveData.transactions.map((transaction, index) => {
      // Distribute transactions among users
      const userEmails = ['patient@demo.com', 'patient@demo.com', 'patient@demo.com', 'patient@demo.com', 'rahul@demo.com', 'rahul@demo.com', 'sneha@demo.com', 'patient@demo.com'];
      return {
        ...transaction,
        user: userMap[userEmails[index % userEmails.length]]
      };
    });
    
    const createdTransactions = await Transaction.insertMany(transactionData);
    console.log(`Inserted ${createdTransactions.length} transactions`);

    // Create sample hospitals
    const hospitalData = [
      {
        name: "City General Hospital",
        address: "123 Medical Street",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        contactPerson: "Dr. Rajesh Sharma",
        contactEmail: "rajesh@cityhospital.com",
        contactPhone: "+91-9876543210",
        status: "active",
        specialties: ["Cardiology", "Neurology", "Orthopedics"],
        services: ["Emergency Care", "Surgery", "Diagnostics"],
        hospitalType: "private",
        bedCount: 150,
        user: userMap['rajesh@cityhospital.com']
      },
      {
        name: "Wellness Multispecialty Hospital",
        address: "456 Health Avenue",
        city: "Delhi",
        state: "Delhi",
        zipCode: "110001",
        contactPerson: "Dr. Priya Patel",
        contactEmail: "priya@wellnesshospital.com",
        contactPhone: "+91-9876543211",
        status: "active",
        specialties: ["General Medicine", "Pediatrics", "Gynecology"],
        services: ["Outpatient Care", "Lab Tests", "Pharmacy"],
        hospitalType: "private",
        bedCount: 100,
        user: userMap['priya@wellnesshospital.com']
      }
    ];

    const createdHospitals = await Hospital.insertMany(hospitalData);
    console.log(`Inserted ${createdHospitals.length} hospitals`);

    console.log('Comprehensive database seeding completed successfully');
    console.log('\nDemo Login Credentials:');
    console.log('Patient: patient@demo.com / demo123');
    console.log('Hospital: rajesh@cityhospital.com / demo123');
    console.log('Admin: admin@demo.com / demo123');
    
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
};

seedComprehensiveData();
