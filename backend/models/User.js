const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      required: true,
      default: 'student',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    otpHash: String,
    otpExpiresAt: Date,
    department: String,
    designation: String,
    employeeId: String,
    rollNo: String,
    rejectedReason: String,
    lastLoginAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);