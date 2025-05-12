
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

// Load env vars
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/health-cards', require('./routes/healthCards'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/notifications', require('./routes/notifications'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
