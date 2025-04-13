const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');

// GET all meetings
router.get('/', meetingController.getMeetings);

// GET a single meeting
router.get('/:id', meetingController.getMeetingById);

// POST create a new meeting
router.post('/', meetingController.createMeeting);

// PUT update a meeting
router.put('/:id', meetingController.updateMeeting);

// DELETE a meeting
router.delete('/:id', meetingController.deleteMeeting);

module.exports = router;