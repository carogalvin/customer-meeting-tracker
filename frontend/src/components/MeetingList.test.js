// MeetingList.test.js
// Testing the meeting listing filtering and display logic

import '@testing-library/jest-dom';

// Mock data for testing
const mockMeetings = [
  {
    _id: '1',
    customer: {
      _id: 'c1',
      name: 'John Doe',
      organization: 'Acme Inc'
    },
    date: '2025-04-10T10:00:00.000Z',
    summary: 'Discussed new product features',
    tags: ['product', 'roadmap'],
    followUpActions: ['Send feature list', 'Schedule demo next month']
  },
  {
    _id: '2',
    customer: {
      _id: 'c2',
      name: 'Jane Smith',
      organization: 'XYZ Corp'
    },
    date: '2025-03-15T14:30:00.000Z',
    summary: 'Security concerns and implementation',
    tags: ['security', 'implementation'],
    followUpActions: ['Send security whitepaper']
  },
  {
    _id: '3',
    customer: {
      _id: 'c1',
      name: 'John Doe',
      organization: 'Acme Inc'
    },
    date: '2025-02-20T09:15:00.000Z',
    summary: 'Quarterly business review',
    tags: ['qbr', 'planning'],
    followUpActions: ['Update roadmap document', 'Invoice for services']
  }
];

// These filter functions mimic the logic in MeetingList component
const filterMeetingsByCustomer = (meetings, customerId) => {
  if (!customerId) return meetings;
  return meetings.filter(meeting => meeting.customer._id === customerId);
};

const filterMeetingsBySearch = (meetings, searchTerm) => {
  if (!searchTerm) return meetings;
  searchTerm = searchTerm.toLowerCase();
  
  return meetings.filter(meeting => 
    meeting.customer.name.toLowerCase().includes(searchTerm) ||
    meeting.customer.organization.toLowerCase().includes(searchTerm) ||
    meeting.summary.toLowerCase().includes(searchTerm) ||
    meeting.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    meeting.followUpActions.some(action => action.toLowerCase().includes(searchTerm))
  );
};

const filterMeetingsByDateRange = (meetings, startDate, endDate) => {
  return meetings.filter(meeting => {
    const meetingDate = new Date(meeting.date);
    const isAfterStart = !startDate || meetingDate >= new Date(startDate);
    const isBeforeEnd = !endDate || meetingDate <= new Date(endDate);
    return isAfterStart && isBeforeEnd;
  });
};

const sortMeetingsByDate = (meetings, ascending = false) => {
  return [...meetings].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

describe('Meeting Filtering and Sorting Logic', () => {
  test('filters meetings by customer ID', () => {
    const filtered = filterMeetingsByCustomer(mockMeetings, 'c1');
    
    expect(filtered.length).toBe(2);
    expect(filtered[0].customer.name).toBe('John Doe');
    expect(filtered[1].customer.name).toBe('John Doe');
  });

  test('filters meetings by search term in summary', () => {
    const filtered = filterMeetingsBySearch(mockMeetings, 'security');
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].customer.name).toBe('Jane Smith');
  });

  test('filters meetings by search term in customer name', () => {
    const filtered = filterMeetingsBySearch(mockMeetings, 'Jane');
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].customer.name).toBe('Jane Smith');
  });

  test('filters meetings by search term in organization', () => {
    const filtered = filterMeetingsBySearch(mockMeetings, 'Acme');
    
    expect(filtered.length).toBe(2);
    expect(filtered[0].customer.organization).toBe('Acme Inc');
    expect(filtered[1].customer.organization).toBe('Acme Inc');
  });

  test('filters meetings by search term in tags', () => {
    const filtered = filterMeetingsBySearch(mockMeetings, 'product');
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].tags).toContain('product');
  });

  test('filters meetings by search term in follow-up actions', () => {
    const filtered = filterMeetingsBySearch(mockMeetings, 'whitepaper');
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].followUpActions).toContain('Send security whitepaper');
  });

  test('filters meetings by date range - end date only', () => {
    const filtered = filterMeetingsByDateRange(mockMeetings, null, '2025-03-01T00:00:00.000Z');
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].summary).toBe('Quarterly business review');
  });

  test('filters meetings by date range - start date only', () => {
    const filtered = filterMeetingsByDateRange(mockMeetings, '2025-04-01T00:00:00.000Z', null);
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].summary).toBe('Discussed new product features');
  });

  test('filters meetings by date range - both start and end date', () => {
    const filtered = filterMeetingsByDateRange(
      mockMeetings, 
      '2025-03-01T00:00:00.000Z', 
      '2025-04-15T00:00:00.000Z'
    );
    
    expect(filtered.length).toBe(2);
    // Should include the April and March meetings but not February
    expect(filtered.some(m => m.summary.includes('Discussed new product features'))).toBe(true);
    expect(filtered.some(m => m.summary.includes('Security concerns'))).toBe(true);
    expect(filtered.some(m => m.summary.includes('Quarterly business review'))).toBe(false);
  });

  test('sorts meetings by date in ascending order', () => {
    const sorted = sortMeetingsByDate(mockMeetings, true);
    
    expect(sorted.length).toBe(3);
    expect(sorted[0].date).toBe('2025-02-20T09:15:00.000Z');
    expect(sorted[1].date).toBe('2025-03-15T14:30:00.000Z');
    expect(sorted[2].date).toBe('2025-04-10T10:00:00.000Z');
  });

  test('sorts meetings by date in descending order', () => {
    const sorted = sortMeetingsByDate(mockMeetings, false);
    
    expect(sorted.length).toBe(3);
    expect(sorted[0].date).toBe('2025-04-10T10:00:00.000Z');
    expect(sorted[1].date).toBe('2025-03-15T14:30:00.000Z');
    expect(sorted[2].date).toBe('2025-02-20T09:15:00.000Z');
  });

  test('combines filtering and sorting operations', () => {
    // First filter by customer, then by date range, then sort
    let result = filterMeetingsByCustomer(mockMeetings, 'c1');
    result = filterMeetingsByDateRange(result, '2025-02-01T00:00:00.000Z', '2025-03-31T00:00:00.000Z');
    result = sortMeetingsByDate(result, true);
    
    expect(result.length).toBe(1);
    expect(result[0].summary).toBe('Quarterly business review');
  });
});