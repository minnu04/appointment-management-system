const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    emergencyRequest: {
      type: Boolean,
      default: false,
    },
    emergencyReason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    reminderSentAt: Date,
    facultyDecisionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    facultyDecisionAt: Date,
    cancellationReason: String,
    notes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model('Appointment', appointmentSchema);