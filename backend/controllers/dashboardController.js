const Appointment = require('../models/Appointment');

const buildDashboard = async (userId, role) => {
  const appointments = await Appointment.find(
    role === 'student' ? { studentId: userId } : { facultyId: userId },
  )
    .populate('studentId', 'name email rollNo department')
    .populate('facultyId', 'name email department designation')
    .sort({ date: 1, time: 1 });

  const now = new Date();

  const upcoming = appointments.filter((appointment) => {
    const appointmentTime = new Date(`${appointment.date}T${appointment.time}:00`);
    return ['pending', 'approved'].includes(appointment.status) && appointmentTime >= now;
  });

  const past = appointments.filter((appointment) => {
    const appointmentTime = new Date(`${appointment.date}T${appointment.time}:00`);
    return appointmentTime < now || ['completed', 'cancelled', 'rejected'].includes(appointment.status);
  });

  return {
    upcoming,
    past,
    completedCount: appointments.filter((appointment) => appointment.status === 'completed').length,
    totalCount: appointments.length,
  };
};

const getDashboard = async (req, res) => {
  const dashboard = await buildDashboard(req.user.id || req.user._id, req.user.role);
  res.json({ dashboard });
};

module.exports = { getDashboard };