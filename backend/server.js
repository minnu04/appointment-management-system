const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const { seedAdmin } = require('./utils/seedAdmin');
const { startReminderJob } = require('./jobs/reminderJob');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const slotRoutes = require('./routes/slotRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const normalizePort = (value) => {
  if (!value) {
    return 5000;
  }

  const trimmed = String(value).trim();
  const parsed = Number.parseInt(trimmed, 10);

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  try {
    const parsedUrl = new URL(trimmed);
    const fromUrl = Number.parseInt(parsedUrl.port, 10);

    if (Number.isInteger(fromUrl) && fromUrl > 0) {
      return fromUrl;
    }
  } catch (error) {
    return 5000;
  }

  return 5000;
};

const app = express();

const allowedOrigins = String(process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: false,
};

app.use(
  cors(corsOptions),
);
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'college-appointment-management' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();
    startReminderJob();

    const port = normalizePort(process.env.PORT);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();