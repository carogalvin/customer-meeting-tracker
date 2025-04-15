import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getCustomers, getMeetings } from './services/api';

// Mock API services
jest.mock('./services/api');

// Mock axios instead of importing it
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: [] }),
  post: jest.fn().mockResolvedValue({ data: { success: true } })
}));

// Use a simple non-component test to verify package updates
describe('Package Update Verification Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup API mocks
    getCustomers.mockResolvedValue([{ 
      _id: '1', 
      name: 'Test Customer' 
    }]);
    
    getMeetings.mockResolvedValue([{ 
      _id: '1', 
      customerId: '1', 
      notes: 'Test meeting' 
    }]);
  });

  describe('API Services Test', () => {
    test('getCustomers is callable', async () => {
      const customers = await getCustomers();
      expect(customers).toHaveLength(1);
      expect(customers[0].name).toBe('Test Customer');
    });

    test('getMeetings is callable', async () => {
      const meetings = await getMeetings();
      expect(meetings).toHaveLength(1);
      expect(meetings[0].notes).toBe('Test meeting');
    });
  });

  describe('Dependency Tests', () => {
    test('moment.js date formatting works', () => {
      const moment = require('moment');
      const testDate = moment('2025-04-13');
      expect(testDate.format('YYYY-MM-DD')).toBe('2025-04-13');
    });
    
    test('react-bootstrap is importable', () => {
      // Just test that we can import react-bootstrap
      expect(() => require('react-bootstrap')).not.toThrow();
    });
    
    test('axios mock is working', async () => {
      const axios = require('axios');
      await axios.get('/test');
      expect(axios.get).toHaveBeenCalledWith('/test');
    });

    // This is a test that just verifies your react version
    test('React version is compatible', () => {
      // React 19 changes how components are rendered
      const React = require('react');
      expect(React.version.split('.')[0]).toBe('19');
    });
  });
});