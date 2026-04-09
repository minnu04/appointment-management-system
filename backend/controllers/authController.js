const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/tokenService');
const { generateOtp, hashOtp } = require('../utils/otpService');
const { sendOtpEmail } = require('../utils/emailService');

const allowedDomains = String(process.env.COLLEGE_EMAIL_DOMAIN || 'college.edu')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const hasAllowedCollegeDomain = (email) => {
  return allowedDomains.some((domain) => email.endsWith(`@${domain}`));
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  verified: user.verified,
  approved: user.approved,
  department: user.department,
  designation: user.designation,
  employeeId: user.employeeId,
  rollNo: user.rollNo,
});

const register = async (req, res) => {
  const { name, email, password, role, department, designation, employeeId, rollNo } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!hasAllowedCollegeDomain(normalizedEmail)) {
    const domainHint = allowedDomains.map((domain) => `@${domain}`).join(' or ');
    return res.status(400).json({
      message: `Use a valid college email ending with ${domainHint}`,
    });
  }

  if (!['student', 'faculty'].includes(role)) {
    return res.status(400).json({ message: 'Only student and faculty registration is allowed' });
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  const otp = generateOtp();
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role,
    verified: false,
    approved: role === 'student',
    otpHash: hashOtp(otp),
    otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    department,
    designation,
    employeeId,
    rollNo,
  });

  try {
    await sendOtpEmail(user.email, user.name, otp);
    return res.status(201).json({
      message: 'Registration successful. Verify your email with the OTP sent to your inbox.',
      user: sanitizeUser(user),
    });
  } catch (emailError) {
    console.error('OTP email send failed during register:', emailError.message);

    // Keep registration atomic: if OTP email fails, remove user so they can retry cleanly.
    await User.findByIdAndDelete(user._id);

    return res.status(502).json({
      message: 'Unable to deliver OTP email. Please check SMTP configuration and try again.',
    });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
  }

  if (user.otpHash !== hashOtp(otp)) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  user.verified = true;
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const token = generateToken(user._id);

  res.json({
    message: 'Email verified successfully',
    token,
    user: sanitizeUser(user),
  });
};

const resendOtp = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const otp = generateOtp();
  user.otpHash = hashOtp(otp);
  user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  try {
    await sendOtpEmail(user.email, user.name, otp);
    return res.json({ message: 'OTP resent successfully' });
  } catch (emailError) {
    console.error('OTP email send failed during resend:', emailError.message);
    return res.status(502).json({
      message: 'Unable to deliver OTP email. Please check SMTP configuration and try again.',
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.verified) {
    return res.status(403).json({ message: 'Please verify your email before logging in' });
  }

  if (user.role === 'faculty' && !user.approved) {
    return res.status(403).json({ message: 'Faculty account is awaiting admin approval' });
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user._id);

  res.json({
    message: 'Login successful',
    token,
    user: sanitizeUser(user),
  });
};

const me = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  me,
};