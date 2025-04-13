const Meeting = require('../models/Meeting');
const Customer = require('../models/Customer');

// Get all meetings
exports.getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate('customer', 'name email organization')
      .sort({ meetingDate: -1 });
    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single meeting by ID
exports.getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('customer', 'name email organization');
      
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new meeting
exports.createMeeting = async (req, res) => {
  try {
    // Check if customer exists
    const customer = await Customer.findById(req.body.customer);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const newMeeting = new Meeting(req.body);
    const savedMeeting = await newMeeting.save();
    
    // Update the customer's last meeting date
    await Customer.findByIdAndUpdate(
      req.body.customer,
      { dateOfLastMeeting: req.body.meetingDate || new Date() }
    );
    
    res.status(201).json(savedMeeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a meeting
exports.updateMeeting = async (req, res) => {
  try {
    // If customer is being changed, check if new customer exists
    if (req.body.customer) {
      const customer = await Customer.findById(req.body.customer);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
    }
    
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedMeeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    // If meeting date is updated, update customer's last meeting date if this is their most recent meeting
    if (req.body.meetingDate) {
      const customer = await Customer.findById(updatedMeeting.customer);
      if (customer) {
        const latestMeeting = await Meeting.findOne({ customer: updatedMeeting.customer })
          .sort({ meetingDate: -1 });
          
        if (latestMeeting && latestMeeting._id.toString() === updatedMeeting._id.toString()) {
          await Customer.findByIdAndUpdate(
            updatedMeeting.customer,
            { dateOfLastMeeting: updatedMeeting.meetingDate }
          );
        }
      }
    }
    
    res.status(200).json(updatedMeeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a meeting
exports.deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    const customerId = meeting.customer;
    
    await Meeting.findByIdAndDelete(req.params.id);
    
    // Update the customer's last meeting date to be the most recent remaining meeting
    const latestMeeting = await Meeting.findOne({ customer: customerId })
      .sort({ meetingDate: -1 });
      
    await Customer.findByIdAndUpdate(
      customerId,
      { dateOfLastMeeting: latestMeeting ? latestMeeting.meetingDate : null }
    );
    
    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};