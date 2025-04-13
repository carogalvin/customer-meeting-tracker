const Customer = require('../models/Customer');
const Meeting = require('../models/Meeting');

// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a customer
exports.updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Delete all associated meetings
    await Meeting.deleteMany({ customer: req.params.id });
    
    // Delete the customer
    await Customer.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Customer and associated meetings deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all meetings for a customer
exports.getCustomerMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ customer: req.params.id })
                                 .sort({ meetingDate: -1 });
    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};