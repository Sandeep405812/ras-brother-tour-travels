const Notification = require('../models/Notification');

// @desc Get User Notifications
// @route GET /api/notifications
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mark Notification as Read
// @route PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mark All Notifications as Read
// @route PUT /api/notifications/mark-all-read
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id }, { read: true });

    res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};
