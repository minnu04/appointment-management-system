const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  bookAppointment,
  listStudentAppointments,
  listFacultyAppointments,
  approveAppointment,
  rejectAppointment,
  cancelAppointment,
  markCompleted,
} = require('../controllers/appointmentController');

const router = express.Router();

router.post(
  '/book',
  protect,
  authorizeRoles('student'),
  [
    body('facultyId').notEmpty().withMessage('Faculty is required'),
    body('slotId').notEmpty().withMessage('Slot is required'),
    body('reason').trim().notEmpty().withMessage('Reason is required'),
  ],
  validateRequest,
  bookAppointment,
);

router.get('/student', protect, authorizeRoles('student'), listStudentAppointments);
router.get('/faculty', protect, authorizeRoles('faculty'), listFacultyAppointments);
router.put('/:id/approve', protect, authorizeRoles('faculty'), approveAppointment);
router.put('/:id/reject', protect, authorizeRoles('faculty'), rejectAppointment);
router.put('/:id/cancel', protect, authorizeRoles('faculty'), cancelAppointment);
router.put('/:id/complete', protect, authorizeRoles('faculty'), markCompleted);

module.exports = router;