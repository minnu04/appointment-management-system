const User = require('../models/User');

const listUsers = async (req, res) => {
  const users = await User.find({ role: { $in: ['student', 'faculty'] } })
    .select('-password -otpHash')
    .sort({ createdAt: -1 });

  res.json({ users });
};

const listFacultyRequests = async (req, res) => {
  const faculty = await User.find({ role: 'faculty' }).select('-password -otpHash').sort({ createdAt: -1 });
  res.json({ faculty });
};

const approveFaculty = async (req, res) => {
  const faculty = await User.findOne({ _id: req.params.id, role: 'faculty' });

  if (!faculty) {
    return res.status(404).json({ message: 'Faculty member not found' });
  }

  faculty.approved = true;
  faculty.rejectedReason = undefined;
  await faculty.save();

  res.json({ message: 'Faculty approved successfully', faculty });
};

const rejectFaculty = async (req, res) => {
  const { reason } = req.body;
  const faculty = await User.findOne({ _id: req.params.id, role: 'faculty' });

  if (!faculty) {
    return res.status(404).json({ message: 'Faculty member not found' });
  }

  faculty.approved = false;
  faculty.rejectedReason = reason || 'Rejected by admin';
  await faculty.save();

  res.json({ message: 'Faculty rejected successfully', faculty });
};

const overview = async (req, res) => {
  const [students, faculty, approvedFaculty, pendingFaculty] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'faculty' }),
    User.countDocuments({ role: 'faculty', approved: true }),
    User.countDocuments({ role: 'faculty', approved: false }),
  ]);

  res.json({
    overview: {
      students,
      faculty,
      approvedFaculty,
      pendingFaculty,
    },
  });
};

module.exports = {
  listUsers,
  listFacultyRequests,
  approveFaculty,
  rejectFaculty,
  overview,
};