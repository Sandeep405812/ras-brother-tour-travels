const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMyNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/mark-all-read', protect, markAllRead);

module.exports = router;
