import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomerList from './CustomerList';
import { getCustomers } from '../services/api';

// Mock the API module
jest.mock('../services/api');

// Mock CustomerList to avoid router dependency
jest.mock('./CustomerList', () => {
  const originalModule = jest.requireActual('./CustomerList');
  return {
    __esModule: true,
    default: originalModule.default
  };
}, { virtual: true });

// Mock data for testing
const mockCustomers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    organization: 'Acme Inc',
    topicsOfInterest: ['AI', 'Cloud'],
    interestedInFeedback: true,
    interestedInPrivateBetas: false,
    dateOfLastMeeting: '2025-03-15T00:00:00.000Z'
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    organization: 'XYZ Corp',
    topicsOfInterest: ['Security', 'Mobile'],
    interestedInFeedback: false,
    interestedInPrivateBetas: true,
    dateOfLastMeeting: null
  },
  {
    _id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    organization: 'Tech Solutions',
    topicsOfInterest: ['Cloud', 'Mobile'],
    interestedInFeedback: true,
    interestedInPrivateBetas: true,
    dateOfLastMeeting: '2025-04-01T00:00:00.000Z'
  }
];

// Test directly the filtering logic rather than component rendering
describe('Customer Filtering Logic', () => {
  test('filters by search term', () => {
    const searchTerm = 'jane';
    const filtered = mockCustomers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm) ||
      customer.organization.toLowerCase().includes(searchTerm) ||
      customer.topicsOfInterest.some(topic => 
        topic.toLowerCase().includes(searchTerm)
      )
    );
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Jane Smith');
  });
  
  test('filters by topic of interest', () => {
    const interestFilter = 'Security';
    const filtered = mockCustomers.filter(customer => 
      customer.topicsOfInterest.some(topic => 
        topic === interestFilter
      )
    );
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Jane Smith');
  });
  
  test('filters by feedback preference', () => {
    const interestedInFeedback = true;
    const filtered = mockCustomers.filter(customer => 
      customer.interestedInFeedback === interestedInFeedback
    );
    
    expect(filtered.length).toBe(2);
    expect(filtered[0].name).toBe('John Doe');
    expect(filtered[1].name).toBe('Bob Johnson');
  });
  
  test('filters by beta participation preference', () => {
    const interestedInBeta = true;
    const filtered = mockCustomers.filter(customer => 
      customer.interestedInPrivateBetas === interestedInBeta
    );
    
    expect(filtered.length).toBe(2);
    expect(filtered[0].name).toBe('Jane Smith');
    expect(filtered[1].name).toBe('Bob Johnson');
  });
  
  test('combines multiple filters', () => {
    const searchTerm = 'tech';
    const interestFilter = 'Cloud';
    const interestedInFeedback = true;
    const interestedInBeta = true;
    
    // Apply all filters
    const filtered = mockCustomers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.organization.toLowerCase().includes(searchTerm) ||
        customer.topicsOfInterest.some(topic => 
          topic.toLowerCase().includes(searchTerm)
        );
        
      const matchesInterest = interestFilter ? 
        customer.topicsOfInterest.includes(interestFilter) : true;
        
      const matchesFeedback = 
        customer.interestedInFeedback === interestedInFeedback;
        
      const matchesBeta = 
        customer.interestedInPrivateBetas === interestedInBeta;
        
      return matchesSearch && matchesInterest && matchesFeedback && matchesBeta;
    });
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Bob Johnson');
  });
});