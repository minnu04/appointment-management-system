const Appointment = require('../models/Appointment');
const Slot = require('../models/Slot');
const User = require('../models/User');
const { parseDateTime, isWithinHours } = require('../utils/dateHelpers');
const {
  sendBookingConfirmation,
  sendStatusEmail,
} = require('../utils/emailService');

const enrichAppointment = async (appointment) => {
  const appointmentId = appointment?._id || appointment;

  return Appointment.findById(appointmentId)
    .populate('studentId', 'name email rollNo department')
    .populate('facultyId', 'name email department designation')
    .populate('slotId', 'date time status');
};

const bookAppointment = async (req, res) => {
  const { facultyId, slotId, reason, emergencyRequest = false, emergencyReason } = req.body;

  const student = await User.findById(req.user.id || req.user._id);
  if (!student || student.role !== 'student') {
    return res.status(403).json({ message: 'Only students can book appointments' });
  }

  const faculty = await User.findOne({ _id: facultyId, role: 'faculty', approved: true });
  if (!faculty) {
    return res.status(404).json({ message: 'Approved faculty member not found' });
  }

  const slot = await Slot.findOne({ _id: slotId, facultyId: faculty._id });
  if (!slot || slot.status !== 'available') {
    return res.status(400).json({ message: 'Selected slot is no longer available' });
  }

  const dateTime = parseDateTime(slot.date, slot.time);
  if (!emergencyRequest && !isWithinHours(dateTime, 48)) {
    return res.status(400).json({
      message: 'Normal bookings must be within 48 hours. Select Emergency Request for later slots.',
    });
  }

  if (emergencyRequest && (!emergencyReason || emergencyReason.trim().length < 10)) {
    return res.status(400).json({ message: 'Emergency bookings require a valid reason' });
  }

  const existing = await Appointment.findOne({ studentId: student._id, slotId: slot._id, status: { $in: ['pending', 'approved'] } });
  if (existing) {
    return res.status(400).json({ message: 'You already have a booking for this slot' });
  }

  slot.status = 'booked';
  await slot.save();

  const appointment = await Appointment.create({
    studentId: student._id,
    facultyId: faculty._id,
    slotId: slot._id,
    date: slot.date,
    time: slot.time,
    reason,
    emergencyRequest,
    emergencyReason,
    status: 'pending',
  });

  const populated = await enrichAppointment(appointment);
  await sendBookingConfirmation(populated, student, faculty);

  res.status(201).json({ message: 'Appointment request submitted', appointment: populated });
};

const listStudentAppointments = async (req, res) => {
  const appointments = await Appointment.find({ studentId: req.user.id || req.user._id })
    .populate('studentId', 'name email rollNo department')
    .populate('facultyId', 'name email department designation')
    .populate('slotId', 'date time status')
    .sort({ createdAt: -1 });

  res.json({ appointments });
};

const listFacultyAppointments = async (req, res) => {
  const appointments = await Appointment.find({ facultyId: req.user.id || req.user._id })
    .populate('studentId', 'name email rollNo department')
    .populate('facultyId', 'name email department designation')
    .populate('slotId', 'date time status')
    .sort({ createdAt: -1 });

  res.json({ appointments });
};

const approveAppointment = async (req, res) => {
  const faculty = await User.findById(req.user.id || req.user._id);
  const appointment = await Appointment.findOne({ _id: req.params.id, facultyId: faculty._id });

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  appointment.status = 'approved';
  appointment.facultyDecisionBy = faculty._id;
  appointment.facultyDecisionAt = new Date();
  await appointment.save();

  const student = await User.findById(appointment.studentId);
  const populated = await enrichAppointment(appointment);
  await sendStatusEmail(populated, student, faculty, 'approved');

  res.json({ message: 'Appointment approved', appointment: populated });
};

const rejectAppointment = async (req, res) => {
  const { reason } = req.body;
  const faculty = await User.findById(req.user.id || req.user._id);
  const appointment = await Appointment.findOne({ _id: req.params.id, facultyId: faculty._id });

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  appointment.status = 'rejected';
  appointment.facultyDecisionBy = faculty._id;
  appointment.facultyDecisionAt = new Date();
  appointment.cancellationReason = reason || 'Rejected by faculty';
  await appointment.save();

  await Slot.findByIdAndUpdate(appointment.slotId, { status: 'available', appointmentId: null });

  const student = await User.findById(appointment.studentId);
  const populated = await enrichAppointment(appointment);
  await sendStatusEmail(populated, student, faculty, 'rejected');

  res.json({ message: 'Appointment rejected', appointment: populated });
};

const cancelAppointment = async (req, res) => {
  const { reason } = req.body;
  const faculty = await User.findById(req.user.id || req.user._id);
  const appointment = await Appointment.findOne({ _id: req.params.id, facultyId: faculty._id });

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  appointment.status = 'cancelled';
  appointment.cancellationReason = reason || 'Cancelled by faculty';
  appointment.facultyDecisionBy = faculty._id;
  appointment.facultyDecisionAt = new Date();
  await appointment.save();

  await Slot.findByIdAndUpdate(appointment.slotId, { status: 'cancelled', appointmentId: null });

  const student = await User.findById(appointment.studentId);
  const populated = await enrichAppointment(appointment);
  await sendStatusEmail(populated, student, faculty, 'cancelled');

  res.json({ message: 'Appointment cancelled', appointment: populated });
};

const markCompleted = async (req, res) => {
  const faculty = await User.findById(req.user.id || req.user._id);
  const appointment = await Appointment.findOne({ _id: req.params.id, facultyId: faculty._id });

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  appointment.status = 'completed';
  await appointment.save();

  res.json({ message: 'Appointment marked completed', appointment });
};

module.exports = {
  bookAppointment,
  listStudentAppointments,
  listFacultyAppointments,
  approveAppointment,
  rejectAppointment,
  cancelAppointment,
  markCompleted,
};