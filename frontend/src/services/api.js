import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Customer API services
export const getCustomers = async () => {
  try {
    const response = await axios.get(`${API_URL}/customers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const getCustomerById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error);
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await axios.post(`${API_URL}/customers`, customerData);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const response = await axios.put(`${API_URL}/customers/${id}`, customerData);
    return response.data;
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error);
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error);
    throw error;
  }
};

export const getCustomerMeetings = async (customerId) => {
  try {
    const response = await axios.get(`${API_URL}/customers/${customerId}/meetings`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching meetings for customer ${customerId}:`, error);
    throw error;
  }
};

// Meeting API services
export const getMeetings = async () => {
  try {
    const response = await axios.get(`${API_URL}/meetings`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
};

export const getMeetingById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/meetings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching meeting ${id}:`, error);
    throw error;
  }
};

export const createMeeting = async (meetingData) => {
  try {
    const response = await axios.post(`${API_URL}/meetings`, meetingData);
    return response.data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

export const updateMeeting = async (id, meetingData) => {
  try {
    const response = await axios.put(`${API_URL}/meetings/${id}`, meetingData);
    return response.data;
  } catch (error) {
    console.error(`Error updating meeting ${id}:`, error);
    throw error;
  }
};

export const deleteMeeting = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/meetings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting meeting ${id}:`, error);
    throw error;
  }
};