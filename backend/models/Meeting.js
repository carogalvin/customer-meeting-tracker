const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MeetingSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  notesLink: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  meetingDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meeting', MeetingSchema);