const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/customer-meetings-app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const customerRoutes = require('./routes/customerRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const bulkUploadRoutes = require('./routes/bulkUploadRoutes');

// Use routes
app.use('/api/customers', customerRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/bulk-upload', bulkUploadRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Customer Meetings API is running');
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});