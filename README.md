# College Appointment Management System

A full-stack MERN application for managing college appointments between students and faculty with role-based access control, OTP verification, slot management, and email notifications.

## Features

- JWT authentication
- College email-only registration
- Email OTP verification during signup
- Role-based access for `student`, `faculty`, and `admin`
- Faculty approval workflow for admin
- Appointment booking with slot control
- Slot availability limited to the next 4 days
- Emergency booking support
- Email notifications for booking, cancellation, and reminders
- Cron-based reminder jobs

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Email: Nodemailer
- Scheduler: node-cron

## Project Structure

```text
booking/
  backend/
    config/
    controllers/
    jobs/
    middlewares/
    models/
    routes/
    utils/
    server.js
  frontend/
    src/
      components/
      context/
      pages/
      services/
```

## Environment Variables

### Backend

Create `backend/.env` with:

```dotenv
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
COLLEGE_EMAIL_DOMAIN=klu.ac.in
ADMIN_EMAIL=admin@college.edu
ADMIN_PASSWORD=ChangeMe123!
CLIENT_URL=http://localhost:5173,https://collegeappointmentbooking.netlify.app
EMAIL_FROM=College Appointment System <no-reply@college.edu>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

### Frontend

Create `frontend/.env` with:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

For deployment, set `VITE_API_URL` to your deployed backend URL (for example, Render).

## Local Development

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Backend

- Deploy on Render or Railway
- Set the backend environment variables in the platform dashboard
- Make sure `CLIENT_URL` includes your deployed frontend URL

### Frontend

- Deploy on Netlify or Vercel
- Set `VITE_API_URL` to the deployed backend API URL

### Database

- Use MongoDB Atlas for production

## Role Overview

### Student

- Register and login
- Verify email using OTP
- Book appointments with faculty
- View upcoming and past appointments

### Faculty

- Register and wait for admin approval
- Login after approval
- Create available slots for the next 4 days
- Approve, reject, cancel, or complete appointments

### Admin

- Login securely
- Approve or reject faculty registrations
- View all users

## API Base URL

For the deployed frontend, the backend API is expected at:

```text
https://appointment-management-system-ig4c.onrender.com/api
```

## Notes

- Use a Gmail App Password for `SMTP_PASS`.
- The frontend build reads `VITE_API_URL`, so update it before deploying.
- If you change the frontend domain, update `CLIENT_URL` in the backend env.
