const fs = require('fs');
const csv = require('csv-parser');
const Customer = require('../models/Customer');
const Meeting = require('../models/Meeting');

// Process a CSV file for bulk customer import
exports.bulkUploadCustomers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    let successCount = 0;

    // Process based on file type
    if (req.file.mimetype === 'application/json') {
      try {
        const jsonData = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
        
        // Validate JSON format
        if (!Array.isArray(jsonData)) {
          throw new Error('JSON file must contain an array of customer objects');
        }
        
        // Process each customer
        for (const [index, customer] of jsonData.entries()) {
          try {
            // Validate required fields
            if (!customer.name || !customer.email || !customer.organization) {
              throw new Error('Missing required fields (name, email, or organization)');
            }
            
            // Check if customer with this email already exists
            const existingCustomer = await Customer.findOne({ email: customer.email });
            if (existingCustomer) {
              throw new Error(`Customer with email ${customer.email} already exists`);
            }
            
            // Create customer
            const newCustomer = new Customer({
              name: customer.name,
              email: customer.email,
              organization: customer.organization,
              topicsOfInterest: customer.topicsOfInterest || [],
              interestedInFeedback: customer.interestedInFeedback === 'true' || customer.interestedInFeedback === true,
              interestedInPrivateBetas: customer.interestedInPrivateBetas === 'true' || customer.interestedInPrivateBetas === true,
              dateOfLastMeeting: customer.dateOfLastMeeting || null
            });
            
            await newCustomer.save();
            successCount++;
            results.push(newCustomer);
          } catch (err) {
            errors.push({ row: index + 1, error: err.message });
          }
        }
      } catch (err) {
        return res.status(400).json({ message: `Invalid JSON: ${err.message}` });
      }
    } else {
      // Process CSV file
      await new Promise((resolve) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', async (row) => {
            try {
              // Validate required fields
              if (!row.name || !row.email || !row.organization) {
                throw new Error('Missing required fields (name, email, or organization)');
              }
              
              // Process topics of interest from string to array
              let topicsArray = [];
              if (row.topicsOfInterest) {
                topicsArray = row.topicsOfInterest.split(',').map(topic => topic.trim());
              }
              
              // Create customer object
              const customer = {
                name: row.name,
                email: row.email,
                organization: row.organization,
                topicsOfInterest: topicsArray,
                interestedInFeedback: row.interestedInFeedback === 'true' || row.interestedInFeedback === 'yes',
                interestedInPrivateBetas: row.interestedInPrivateBetas === 'true' || row.interestedInPrivateBetas === 'yes',
                dateOfLastMeeting: row.dateOfLastMeeting || null
              };
              
              // Check if customer with this email already exists
              const existingCustomer = await Customer.findOne({ email: row.email });
              if (existingCustomer) {
                throw new Error(`Customer with email ${row.email} already exists`);
              }
              
              // Save to database
              const newCustomer = new Customer(customer);
              await newCustomer.save();
              successCount++;
              results.push(newCustomer);
            } catch (err) {
              errors.push({ email: row.email, error: err.message });
            }
          })
          .on('end', () => {
            resolve();
          });
      });
    }

    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    return res.status(200).json({
      message: `Processed ${successCount} customers successfully with ${errors.length} errors`,
      successCount,
      errorCount: errors.length,
      results,
      errors
    });
  } catch (err) {
    console.error('Error processing file:', err);
    return res.status(500).json({ message: 'Error processing upload' });
  }
};

// Process a CSV file for bulk meeting import
exports.bulkUploadMeetings = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    let successCount = 0;

    // Process based on file type
    if (req.file.mimetype === 'application/json') {
      try {
        const jsonData = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
        
        // Validate JSON format
        if (!Array.isArray(jsonData)) {
          throw new Error('JSON file must contain an array of meeting objects');
        }
        
        // Process each meeting
        for (const [index, meeting] of jsonData.entries()) {
          try {
            // Validate required fields
            if (!meeting.customerEmail && !meeting.customerId) {
              throw new Error('Meeting must have either customerEmail or customerId');
            }
            
            if (!meeting.meetingDate) {
              throw new Error('Meeting must have a meetingDate');
            }
            
            // Find the customer
            let customer;
            if (meeting.customerId) {
              customer = await Customer.findById(meeting.customerId);
            } else {
              customer = await Customer.findOne({ email: meeting.customerEmail });
            }
            
            if (!customer) {
              throw new Error(`Customer not found for email: ${meeting.customerEmail || 'N/A'} or id: ${meeting.customerId || 'N/A'}`);
            }
            
            // Create meeting
            const newMeeting = new Meeting({
              customer: customer._id,
              meetingDate: new Date(meeting.meetingDate),
              notesLink: meeting.notesLink || '',
              notes: meeting.notes || ''
            });
            
            await newMeeting.save();
            
            // Update customer's last meeting date if newer
            if (!customer.dateOfLastMeeting || new Date(meeting.meetingDate) > new Date(customer.dateOfLastMeeting)) {
              customer.dateOfLastMeeting = new Date(meeting.meetingDate);
              await customer.save();
            }
            
            successCount++;
            results.push(newMeeting);
          } catch (err) {
            errors.push({ row: index + 1, error: err.message });
          }
        }
      } catch (err) {
        return res.status(400).json({ message: `Invalid JSON: ${err.message}` });
      }
    } else {
      // Process CSV file
      await new Promise((resolve) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', async (row) => {
            try {
              // Validate required fields
              if (!row.customerEmail && !row.customerId) {
                throw new Error('Meeting must have either customerEmail or customerId');
              }
              
              if (!row.meetingDate) {
                throw new Error('Meeting must have a meetingDate');
              }
              
              // Find the customer
              let customer;
              if (row.customerId) {
                customer = await Customer.findById(row.customerId);
              } else {
                customer = await Customer.findOne({ email: row.customerEmail });
              }
              
              if (!customer) {
                throw new Error(`Customer not found for email: ${row.customerEmail || 'N/A'} or id: ${row.customerId || 'N/A'}`);
              }
              
              // Create meeting
              const newMeeting = new Meeting({
                customer: customer._id,
                meetingDate: new Date(row.meetingDate),
                notesLink: row.notesLink || '',
                notes: row.notes || ''
              });
              
              await newMeeting.save();
              
              // Update customer's last meeting date if newer
              if (!customer.dateOfLastMeeting || new Date(row.meetingDate) > new Date(customer.dateOfLastMeeting)) {
                customer.dateOfLastMeeting = new Date(row.meetingDate);
                await customer.save();
              }
              
              successCount++;
              results.push(newMeeting);
            } catch (err) {
              errors.push({ 
                customerEmail: row.customerEmail || 'N/A',
                customerId: row.customerId || 'N/A',
                error: err.message 
              });
            }
          })
          .on('end', () => {
            resolve();
          });
      });
    }

    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    return res.status(200).json({
      message: `Processed ${successCount} meetings successfully with ${errors.length} errors`,
      successCount,
      errorCount: errors.length,
      results,
      errors
    });
  } catch (err) {
    console.error('Error processing file:', err);
    return res.status(500).json({ message: 'Error processing upload' });
  }
};