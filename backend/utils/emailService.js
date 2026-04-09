const nodemailer = require('nodemailer');

let cachedTransporter;

const buildTransporter = async () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP is not fully configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = await buildTransporter();
  const from = process.env.EMAIL_FROM || 'College Appointment System <no-reply@college.edu>';
  const result = await transporter.sendMail({ from, to, subject, html, text });

  console.log(`Email sent to ${to}: ${subject}`);

  return result;
};

const sendOtpEmail = async (email, name, otp) => {
  return sendEmail({
    to: email,
    subject: 'Verify your college account',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Verify your account</h2>
        <p>Hello ${name},</p>
        <p>Your verification code is:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</div>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
  });
};

const sendBookingConfirmation = async (appointment, student, faculty) => {
  const subject = `Appointment request received for ${appointment.date} ${appointment.time}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>Appointment booked</h2>
      <p>Student: ${student.name}</p>
      <p>Faculty: ${faculty.name}</p>
      <p>Date: ${appointment.date}</p>
      <p>Time: ${appointment.time}</p>
      <p>Status: ${appointment.status}</p>
      <p>Reason: ${appointment.reason}</p>
    </div>
  `;

  await Promise.all([
    sendEmail({ to: student.email, subject, html }),
    sendEmail({ to: faculty.email, subject: `New appointment request from ${student.name}`, html }),
  ]);
};

const sendStatusEmail = async (appointment, student, faculty, action) => {
  const title = action.charAt(0).toUpperCase() + action.slice(1);
  return sendEmail({
    to: student.email,
    subject: `Appointment ${action} - ${appointment.date} ${appointment.time}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Appointment ${title}</h2>
        <p>Faculty: ${faculty.name}</p>
        <p>Date: ${appointment.date}</p>
        <p>Time: ${appointment.time}</p>
        <p>Status: ${appointment.status}</p>
        <p>${appointment.cancellationReason || appointment.notes || ''}</p>
      </div>
    `,
  });
};

const sendReminderEmail = async (appointment, student, faculty) => {
  return sendEmail({
    to: student.email,
    subject: `Reminder: appointment tomorrow at ${appointment.time}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Appointment reminder</h2>
        <p>Your appointment with ${faculty.name} is scheduled for ${appointment.date} at ${appointment.time}.</p>
        <p>Reason: ${appointment.reason}</p>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendBookingConfirmation,
  sendStatusEmail,
  sendReminderEmail,
};