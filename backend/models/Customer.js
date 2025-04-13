const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  organization: {
    type: String,
    required: true
  },
  topicsOfInterest: {
    type: [String],
    default: []
  },
  interestedInFeedback: {
    type: Boolean,
    default: false
  },
  interestedInPrivateBetas: {
    type: Boolean,
    default: false
  },
  dateOfLastMeeting: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', CustomerSchema);