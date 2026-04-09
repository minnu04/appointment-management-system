const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { sendReminderEmail } = require('../utils/emailService');

let jobStarted = false;

const startReminderJob = () => {
  if (jobStarted) {
    return;
  }

  jobStarted = true;

  cron.schedule('*/10 * * * *', async () => {
    try {
      const now = new Date();
      const reminderWindowStart = new Date(now.getTime() + 20 * 60 * 60 * 1000);
      const reminderWindowEnd = new Date(now.getTime() + 28 * 60 * 60 * 1000);

      const appointments = await Appointment.find({
        status: 'approved',
        reminderSentAt: { $exists: false },
      })
        .populate('studentId', 'name email')
        .populate('facultyId', 'name email name')
        .populate('slotId', 'date time startAt');

      for (const appointment of appointments) {
        const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`);

        if (appointmentDateTime >= reminderWindowStart && appointmentDateTime <= reminderWindowEnd) {
          const student = appointment.studentId;
          const faculty = appointment.facultyId;

          await sendReminderEmail(appointment, student, faculty);
          appointment.reminderSentAt = new Date();
          await appointment.save();
        }
      }
    } catch (error) {
      console.error('Reminder job failed:', error.message);
    }
  });

  console.log('Reminder job scheduled');
};

module.exports = { startReminderJob };