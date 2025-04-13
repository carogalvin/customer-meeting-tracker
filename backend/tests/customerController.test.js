const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const app = express();
const customerRoutes = require('../routes/customerRoutes');
const Customer = require('../models/Customer');

let mongoServer;

// Configure Express app for testing
app.use(express.json());
app.use('/api/customers', customerRoutes);

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

// Clear the database between tests
beforeEach(async () => {
  await Customer.deleteMany({});
});

// Disconnect and close the in-memory database after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Customer Controller Tests', () => {
  const sampleCustomer = {
    name: 'Test Customer',
    email: 'test@example.com',
    organization: 'Test Org',
    topicsOfInterest: ['Testing', 'API'],
    interestedInFeedback: true,
    interestedInPrivateBetas: false
  };

  describe('GET /api/customers', () => {
    it('should return an empty array when no customers exist', async () => {
      const response = await request(app).get('/api/customers');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all customers', async () => {
      // Create some test customers first
      await Customer.create(sampleCustomer);
      await Customer.create({
        ...sampleCustomer,
        name: 'Second Customer',
        email: 'second@example.com'
      });

      const response = await request(app).get('/api/customers');
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).toHaveProperty('organization');
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should return a 404 for non-existent customer', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/customers/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Customer not found');
    });

    it('should return a single customer by ID', async () => {
      const customer = await Customer.create(sampleCustomer);
      
      const response = await request(app).get(`/api/customers/${customer._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', customer._id.toString());
      expect(response.body).toHaveProperty('name', sampleCustomer.name);
      expect(response.body).toHaveProperty('email', sampleCustomer.email);
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const response = await request(app)
        .post('/api/customers')
        .send(sampleCustomer);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', sampleCustomer.name);
      expect(response.body).toHaveProperty('email', sampleCustomer.email);
      
      // Verify it was saved to the database
      const customerInDb = await Customer.findById(response.body._id);
      expect(customerInDb).not.toBeNull();
    });

    it('should return 400 for missing required fields', async () => {
      const invalidCustomer = { name: 'Invalid Customer' }; // Missing email and organization
      
      const response = await request(app)
        .post('/api/customers')
        .send(invalidCustomer);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should not allow duplicate email addresses', async () => {
      // Create a customer
      await Customer.create(sampleCustomer);
      
      // Try to create another with the same email
      const duplicateCustomer = {
        ...sampleCustomer,
        name: 'Another Name'
      };
      
      const response = await request(app)
        .post('/api/customers')
        .send(duplicateCustomer);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('should update an existing customer', async () => {
      const customer = await Customer.create(sampleCustomer);
      
      const updatedData = {
        name: 'Updated Name',
        organization: 'Updated Org',
        topicsOfInterest: ['Updated', 'Topics']
      };
      
      const response = await request(app)
        .put(`/api/customers/${customer._id}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', updatedData.name);
      expect(response.body).toHaveProperty('organization', updatedData.organization);
      expect(response.body.topicsOfInterest).toEqual(updatedData.topicsOfInterest);
      
      // Email should remain unchanged
      expect(response.body).toHaveProperty('email', sampleCustomer.email);
    });

    it('should return 404 for non-existent customer', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/customers/${nonExistentId}`)
        .send({ name: 'New Name' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Customer not found');
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should delete an existing customer', async () => {
      const customer = await Customer.create(sampleCustomer);
      
      const response = await request(app).delete(`/api/customers/${customer._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Customer and associated meetings deleted successfully');
      
      // Verify customer was deleted from database
      const customerInDb = await Customer.findById(customer._id);
      expect(customerInDb).toBeNull();
    });

    it('should return 404 for non-existent customer', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app).delete(`/api/customers/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Customer not found');
    });
  });
});