const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const app = express();
const meetingRoutes = require('../routes/meetingRoutes');
const Meeting = require('../models/Meeting');
const Customer = require('../models/Customer');

let mongoServer;

// Configure Express app for testing
app.use(express.json());
app.use('/api/meetings', meetingRoutes);

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Connect to the in-memory database before running tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clean up the database between tests
beforeEach(async () => {
  await Meeting.deleteMany({});
  await Customer.deleteMany({});
});

// Disconnect and close the in-memory database after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Meeting Controller Tests', () => {
  // Sample test data
  let testCustomer;
  
  const sampleCustomer = {
    name: 'Test Customer',
    email: 'test@example.com',
    organization: 'Test Org',
    topicsOfInterest: ['Testing', 'API']
  };
  
  // Create a test customer before each test
  beforeEach(async () => {
    testCustomer = await Customer.create(sampleCustomer);
  });
  
  const createSampleMeeting = (customizations = {}) => {
    return {
      customer: testCustomer._id,
      meetingDate: new Date('2025-04-10T10:00:00Z'),
      notes: 'Test meeting notes',
      ...customizations
    };
  };
  
  describe('GET /api/meetings', () => {
    it('should return an empty array when no meetings exist', async () => {
      const response = await request(app).get('/api/meetings');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
    
    it('should return all meetings with populated customer data', async () => {
      // Create test meetings
      const meeting1 = await Meeting.create(createSampleMeeting());
      const meeting2 = await Meeting.create(createSampleMeeting({
        meetingDate: new Date('2025-04-15T14:00:00Z'),
        notes: 'Different meeting notes'
      }));
      
      const response = await request(app).get('/api/meetings');
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      
      // Check customer data is populated
      expect(response.body[0].customer).toHaveProperty('name');
      expect(response.body[0].customer).toHaveProperty('email');
      expect(response.body[0].customer).toHaveProperty('organization');
      
      // Check meetings are sorted by date (most recent first)
      expect(new Date(response.body[0].meetingDate).getTime())
        .toBeGreaterThan(new Date(response.body[1].meetingDate).getTime());
    });
  });
  
  describe('GET /api/meetings/:id', () => {
    it('should return a 404 for non-existent meeting', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/meetings/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Meeting not found');
    });
    
    it('should return a single meeting by ID with populated customer data', async () => {
      const meeting = await Meeting.create(createSampleMeeting());
      
      const response = await request(app).get(`/api/meetings/${meeting._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', meeting._id.toString());
      expect(response.body).toHaveProperty('notes', 'Test meeting notes');
      
      // Check customer data is populated
      expect(response.body.customer).toHaveProperty('name', sampleCustomer.name);
      expect(response.body.customer).toHaveProperty('email', sampleCustomer.email);
    });
  });
  
  describe('POST /api/meetings', () => {
    it('should create a new meeting', async () => {
      const meetingData = createSampleMeeting();
      
      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('customer', testCustomer._id.toString());
      expect(response.body).toHaveProperty('notes', meetingData.notes);
      
      // Verify it was saved to the database
      const meetingInDb = await Meeting.findById(response.body._id);
      expect(meetingInDb).not.toBeNull();
      
      // Verify customer's last meeting date was updated
      const updatedCustomer = await Customer.findById(testCustomer._id);
      expect(updatedCustomer.dateOfLastMeeting).toEqual(new Date(meetingData.meetingDate));
    });
    
    it('should return 404 if customer does not exist', async () => {
      const nonExistentCustomerId = new mongoose.Types.ObjectId();
      const meetingData = createSampleMeeting({ customer: nonExistentCustomerId });
      
      const response = await request(app)
        .post('/api/meetings')
        .send(meetingData);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Customer not found');
    });
    
    it('should return 400 for missing required fields', async () => {
      const invalidMeeting = { customer: testCustomer._id }; // Missing meetingDate
      
      const response = await request(app)
        .post('/api/meetings')
        .send(invalidMeeting);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
  
  describe('PUT /api/meetings/:id', () => {
    it('should update an existing meeting', async () => {
      const meeting = await Meeting.create(createSampleMeeting());
      
      const updatedData = {
        notes: 'Updated meeting notes',
        meetingDate: new Date('2025-05-01T09:00:00Z')
      };
      
      const response = await request(app)
        .put(`/api/meetings/${meeting._id}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('notes', updatedData.notes);
      expect(new Date(response.body.meetingDate)).toEqual(new Date(updatedData.meetingDate));
      
      // Customer reference should remain unchanged
      expect(response.body).toHaveProperty('customer', testCustomer._id.toString());
      
      // Verify customer's last meeting date was updated
      const updatedCustomer = await Customer.findById(testCustomer._id);
      expect(updatedCustomer.dateOfLastMeeting).toEqual(new Date(updatedData.meetingDate));
    });
    
    it('should return 404 for non-existent meeting', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/meetings/${nonExistentId}`)
        .send({ notes: 'New notes' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Meeting not found');
    });
    
    it('should return 404 if new customer does not exist', async () => {
      const meeting = await Meeting.create(createSampleMeeting());
      const nonExistentCustomerId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/meetings/${meeting._id}`)
        .send({ customer: nonExistentCustomerId });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Customer not found');
    });
  });
  
  describe('DELETE /api/meetings/:id', () => {
    it('should delete an existing meeting', async () => {
      const meeting = await Meeting.create(createSampleMeeting());
      
      const response = await request(app).delete(`/api/meetings/${meeting._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Meeting deleted successfully');
      
      // Verify meeting was deleted from database
      const meetingInDb = await Meeting.findById(meeting._id);
      expect(meetingInDb).toBeNull();
      
      // Verify customer's last meeting date was updated to null (since there are no more meetings)
      const updatedCustomer = await Customer.findById(testCustomer._id);
      expect(updatedCustomer.dateOfLastMeeting).toBeNull();
    });
    
    it('should return 404 for non-existent meeting', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app).delete(`/api/meetings/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Meeting not found');
    });
    
    it('should update customer last meeting date to next most recent meeting when deleting', async () => {
      // Create two meetings with different dates
      const olderMeeting = await Meeting.create(createSampleMeeting({
        meetingDate: new Date('2025-03-01T10:00:00Z')
      }));
      const newerMeeting = await Meeting.create(createSampleMeeting({
        meetingDate: new Date('2025-04-01T10:00:00Z')
      }));
      
      // Update the customer's last meeting date manually to simulate the behavior
      await Customer.findByIdAndUpdate(
        testCustomer._id,
        { dateOfLastMeeting: new Date(newerMeeting.meetingDate) }
      );
      
      // Verify customer's last meeting date is set to the newer meeting date
      let customer = await Customer.findById(testCustomer._id);
      expect(customer.dateOfLastMeeting).toEqual(new Date(newerMeeting.meetingDate));
      
      // Delete the newer meeting
      await request(app).delete(`/api/meetings/${newerMeeting._id}`);
      
      // Verify customer's last meeting date was updated to the older meeting date
      customer = await Customer.findById(testCustomer._id);
      expect(customer.dateOfLastMeeting).toEqual(new Date(olderMeeting.meetingDate));
    });
  });
});