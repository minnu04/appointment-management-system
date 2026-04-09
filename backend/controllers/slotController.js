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
  const filters = { status: 'available' };

  if (facultyId) {
    filters.facultyId = facultyId;
  }

  if (date) {
    filters.date = date;
  }

  const slots = await Slot.find(filters)
    .populate('facultyId', 'name email department designation')
    .sort({ startAt: 1 });

  res.json({ slots });
};

const getFacultySlots = async (req, res) => {
  const slots = await Slot.find({ facultyId: req.user.id || req.user._id }).sort({ startAt: 1 });
  res.json({ slots });
};

module.exports = {
  createSlots,
  getAvailableSlots,
  getFacultySlots,
};