const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bulkUploadController = require('../controllers/bulkUploadController');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'upload-' + Date.now() + path.extname(file.originalname));
  }
});

// File upload middleware
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (req, file, cb) => {
    // Accept only CSV and JSON files
    if (
      file.mimetype === 'text/csv' || 
      file.mimetype === 'application/vnd.ms-excel' || 
      file.mimetype === 'application/json'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and JSON files are allowed'), false);
    }
  }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Bulk upload routes
router.post('/customers', upload.single('file'), bulkUploadController.bulkUploadCustomers);
router.post('/meetings', upload.single('file'), bulkUploadController.bulkUploadMeetings);

module.exports = router;