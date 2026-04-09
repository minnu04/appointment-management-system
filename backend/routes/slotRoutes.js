const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { validateRequest } = require('../middlewares/validateRequest');
const { createSlots, getAvailableSlots, getFacultySlots } = require('../controllers/slotController');

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

module.exports = router;