const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { validateRequest } = require('../middlewares/validateRequest');
const { createSlots, getAvailableSlots, getFacultySlots, markDateAsCompleted, unmarkDateAsCompleted } = require('../controllers/slotController');

const router = express.Router();

router.get('/available', getAvailableSlots);
router.get('/faculty', protect, authorizeRoles('faculty'), getFacultySlots);
router.post(
  '/',
  protect,
  authorizeRoles('faculty'),
  [body('slots').isArray({ min: 1 }).withMessage('At least one slot is required')],
  validateRequest,
  createSlots,
);
router.post('/mark-completed', protect, authorizeRoles('faculty'), markDateAsCompleted);
router.post('/unmark-completed', protect, authorizeRoles('faculty'), unmarkDateAsCompleted);

module.exports = router;