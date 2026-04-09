const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const {
  listUsers,
  listFacultyRequests,
  approveFaculty,
  rejectFaculty,
  overview,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/users', listUsers);
router.get('/faculty', listFacultyRequests);
router.get('/overview', overview);
router.put('/faculty/:id/approve', approveFaculty);
router.put('/faculty/:id/reject', rejectFaculty);

module.exports = router;