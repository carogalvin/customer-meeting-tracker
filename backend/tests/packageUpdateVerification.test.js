const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cors = require('cors');
const csvParser = require('csv-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Import app components
let app;
let mongoServer;
let Customer;
let Meeting;

describe('Backend Package Update Verification Tests', () => {
  beforeAll(async () => {
    // Setup in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
    
    // Import models after connecting to prevent mongoose errors
    Customer = require('../models/Customer');
    Meeting = require('../models/Meeting');
    
    // Create express app with minimal configuration to test dependencies
    app = express();
    app.use(express.json());
    app.use(cors());
    
    // Set up a simple route for testing express
    app.get('/api/test', (req, res) => {
      res.json({ message: 'Express is working' });
    });
    
    // Set up a simple route for testing customer model
    app.get('/api/customers/test', async (req, res) => {
      try {
        const customers = await Customer.find({}).limit(5);
        res.json(customers);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Set up a simple route for testing meeting model
    app.get('/api/meetings/test', async (req, res) => {
      try {
        const meetings = await Meeting.find({}).limit(5);
        res.json(meetings);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Set up a simple route for testing multer and csv-parser
    const storage = multer.memoryStorage();
    const upload = multer({ storage });
    
    app.post('/api/bulk-upload/test', upload.single('file'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const results = [];
      const bufferStream = require('stream').Readable.from(req.file.buffer);
      
      bufferStream
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          res.json({ message: 'CSV parsing successful', count: results.length });
        })
        .on('error', (error) => {
          res.status(500).json({ message: 'CSV parsing failed', error: error.message });
        });
    });
  });
  
  afterAll(async () => {
    // Disconnect and stop MongoDB server
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  // Test that all required dependencies can be loaded without errors
  describe('Dependency Loading Tests', () => {
    test('express loads correctly', () => {
      expect(express).toBeDefined();
      expect(typeof express).toBe('function');
    });
    
    test('mongoose loads correctly', () => {
      expect(mongoose).toBeDefined();
      expect(mongoose.connect).toBeDefined();
      expect(typeof mongoose.connect).toBe('function');
    });
    
    test('cors loads correctly', () => {
      expect(cors).toBeDefined();
      expect(typeof cors).toBe('function');
    });
    
    test('multer loads correctly', () => {
      expect(multer).toBeDefined();
      expect(typeof multer).toBe('function');
    });
    
    test('csv-parser loads correctly', () => {
      expect(csvParser).toBeDefined();
      expect(typeof csvParser).toBe('function');
    });
    
    test('mongodb-memory-server loads correctly', () => {
      expect(MongoMemoryServer).toBeDefined();
      expect(typeof MongoMemoryServer.create).toBe('function');
    });
  });
  
  // Test Express basic functionality
  describe('Express API Tests', () => {
    test('express server responds to basic request', async () => {
      const response = await request(app).get('/api/test');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Express is working');
    });
  });
  
  // Test Mongoose is working correctly
  describe('Mongoose Tests', () => {
    test('can create and query documents', async () => {
      // Create a test customer
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        organization: 'Test Org',
        topicsOfInterest: ['Testing'],
        interestedInFeedback: true,
        interestedInPrivateBetas: false
      };
      
      const customer = new Customer(customerData);
      await customer.save();
      
      // Create a test meeting with all required fields
      const meetingData = {
        customerId: customer._id,
        customer: customer._id, // Add this required field
        meetingDate: new Date(), // Add this required field
        date: new Date(),
        notes: 'Test meeting notes',
        topics: ['Package testing'],
        followUpItems: ['Verify everything works']
      };
      
      const meeting = new Meeting(meetingData);
      await meeting.save();
      
      // Verify we can retrieve the data
      const savedCustomer = await Customer.findById(customer._id);
      expect(savedCustomer).toBeTruthy();
      expect(savedCustomer.name).toBe(customerData.name);
      
      const savedMeeting = await Meeting.findById(meeting._id);
      expect(savedMeeting).toBeTruthy();
      expect(savedMeeting.notes).toBe(meetingData.notes);
    });
  });
  
  // Test file upload functionality
  describe('File Upload Tests', () => {
    test('multer and csv-parser can handle CSV file', async () => {
      // Create a simple CSV content in memory
      const csvContent = 
        'name,email,organization\n' +
        'John Doe,john@example.com,Acme Inc\n' +
        'Jane Smith,jane@example.com,XYZ Corp';
      
      // Test the upload endpoint
      const response = await request(app)
        .post('/api/bulk-upload/test')
        .attach('file', Buffer.from(csvContent), {
          filename: 'test.csv',
          contentType: 'text/csv'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'CSV parsing successful');
      expect(response.body).toHaveProperty('count', 2);
    });
  });
});