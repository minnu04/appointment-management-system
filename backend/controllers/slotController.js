const Slot = require('../models/Slot');
const User = require('../models/User');
const { parseDateTime, isWithinNextDays } = require('../utils/dateHelpers');

const createSlots = async (req, res) => {
  const { slots } = req.body;

  if (!Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json({ message: 'Slots array is required' });
  }

  const faculty = await User.findById(req.user.id || req.user._id);
  if (!faculty || faculty.role !== 'faculty') {
    return res.status(403).json({ message: 'Only faculty can create slots' });
  }

  if (!faculty.approved) {
    return res.status(403).json({ message: 'Faculty account is not approved yet' });
  }

  const createdSlots = [];

  for (const item of slots) {
    const dateTime = parseDateTime(item.date, item.time);

    if (!isWithinNextDays(dateTime, 4)) {
      return res.status(400).json({ message: 'Slots must be within the next 4 days' });
    }

    const exists = await Slot.findOne({ facultyId: faculty._id, date: item.date, time: item.time });
    if (exists) {
      continue;
    }

    const slot = await Slot.create({
      facultyId: faculty._id,
      date: item.date,
      time: item.time,
      startAt: dateTime,
      status: 'available',
    });

    createdSlots.push(slot);
  }

  res.status(201).json({ message: 'Slots saved successfully', slots: createdSlots });
};

const getAvailableSlots = async (req, res) => {
  const { facultyId, date } = req.query;
  const filters = { status: 'available', startAt: { $gte: new Date() } };

  if (facultyId) {
    filters.facultyId = facultyId;
  }

  if (date) {
    filters.date = date;
  }

  let slots = await Slot.find(filters)
    .populate('facultyId', 'name email department designation completedDates')
    .sort({ startAt: 1 });

  // Filter out slots from completed dates
  slots = slots.filter((slot) => !slot.facultyId.completedDates.includes(slot.date));

  res.json({ slots });
};

const getFacultySlots = async (req, res) => {
  const slots = await Slot.find({ facultyId: req.user.id || req.user._id }).sort({ startAt: 1 });
  res.json({ slots });
};

const markDateAsCompleted = async (req, res) => {
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  const faculty = await User.findById(req.user.id || req.user._id);
  if (!faculty || faculty.role !== 'faculty') {
    return res.status(403).json({ message: 'Only faculty can mark dates as completed' });
  }

  if (!faculty.completedDates.includes(date)) {
    faculty.completedDates.push(date);
    await faculty.save();
  }

  res.json({ message: 'Date marked as completed', completedDates: faculty.completedDates });
};

const unmarkDateAsCompleted = async (req, res) => {
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  const faculty = await User.findById(req.user.id || req.user._id);
  if (!faculty || faculty.role !== 'faculty') {
    return res.status(403).json({ message: 'Only faculty can unmark dates' });
  }

  faculty.completedDates = faculty.completedDates.filter((d) => d !== date);
  await faculty.save();

  res.json({ message: 'Date unmarked as completed', completedDates: faculty.completedDates });
};

module.exports = {
  createSlots,
  getAvailableSlots,
  getFacultySlots,
  markDateAsCompleted,
  unmarkDateAsCompleted,
};