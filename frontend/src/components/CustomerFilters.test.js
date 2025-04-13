// CustomerFilters.test.js
// This file tests the filtering logic without needing to import the actual component

import '@testing-library/jest-dom';

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
    email: 'jane@company.com',
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

// These filter functions mimic the logic in CustomerList component
const filterCustomersBySearch = (customers, searchTerm) => {
  if (!searchTerm) return customers;
  searchTerm = searchTerm.toLowerCase();
  
  return customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm) ||
    customer.organization.toLowerCase().includes(searchTerm) ||
    customer.topicsOfInterest.some(topic => 
      topic.toLowerCase().includes(searchTerm)
    )
  );
};

const filterCustomersByInterest = (customers, interestFilter) => {
  if (!interestFilter) return customers;
  
  return customers.filter(customer => 
    customer.topicsOfInterest.includes(interestFilter)
  );
};

const filterCustomersByFeedback = (customers, feedbackFilter) => {
  if (feedbackFilter === 'all') return customers;
  const interestedInFeedback = feedbackFilter === 'yes';
  
  return customers.filter(customer => 
    customer.interestedInFeedback === interestedInFeedback
  );
};

const filterCustomersByBeta = (customers, betaFilter) => {
  if (betaFilter === 'all') return customers;
  const interestedInBeta = betaFilter === 'yes';
  
  return customers.filter(customer => 
    customer.interestedInPrivateBetas === interestedInBeta
  );
};

describe('Customer Filtering Logic', () => {
  test('filters by search term', () => {
    const searchTerm = 'jane';
    const filtered = filterCustomersBySearch(mockCustomers, searchTerm);
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Jane Smith');
  });
  
  test('filters by topic of interest', () => {
    const interestFilter = 'Security';
    const filtered = filterCustomersByInterest(mockCustomers, interestFilter);
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Jane Smith');
  });
  
  test('filters by feedback preference', () => {
    const filtered = filterCustomersByFeedback(mockCustomers, 'yes');
    
    expect(filtered.length).toBe(2);
    expect(filtered[0].name).toBe('John Doe');
    expect(filtered[1].name).toBe('Bob Johnson');
  });
  
  test('filters by beta participation preference', () => {
    const filtered = filterCustomersByBeta(mockCustomers, 'yes');
    
    expect(filtered.length).toBe(2);
    expect(filtered[0].name).toBe('Jane Smith');
    expect(filtered[1].name).toBe('Bob Johnson');
  });
  
  test('combines multiple filters', () => {
    const searchTerm = 'tech';
    let filtered = filterCustomersBySearch(mockCustomers, searchTerm);
    filtered = filterCustomersByInterest(filtered, 'Cloud');
    filtered = filterCustomersByFeedback(filtered, 'yes');
    filtered = filterCustomersByBeta(filtered, 'yes');
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Bob Johnson');
  });
  
  test('returns all customers when no filters are applied', () => {
    let filtered = filterCustomersBySearch(mockCustomers, '');
    filtered = filterCustomersByInterest(filtered, '');
    filtered = filterCustomersByFeedback(filtered, 'all');
    filtered = filterCustomersByBeta(filtered, 'all');
    
    expect(filtered.length).toBe(3);
  });
  
  test('handles case insensitive search', () => {
    const filtered = filterCustomersBySearch(mockCustomers, 'JANE');
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Jane Smith');
  });
  
  test('can search by email domain', () => {
    const filtered = filterCustomersBySearch(mockCustomers, 'example.com');
    
    expect(filtered.length).toBe(2);
    expect(filtered[0].name).toBe('John Doe');
    expect(filtered[1].name).toBe('Bob Johnson');
  });
  
  test('can search by organization', () => {
    const filtered = filterCustomersBySearch(mockCustomers, 'tech');
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].organization).toBe('Tech Solutions');
  });
  
  test('can search by topic of interest', () => {
    const filtered = filterCustomersBySearch(mockCustomers, 'cloud');
    
    expect(filtered.length).toBe(2);
    expect(filtered[0].name).toBe('John Doe');
    expect(filtered[1].name).toBe('Bob Johnson');
  });
});