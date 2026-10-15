const Message = require('../models/Message');
const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc Get Messages Between Current User and Another User
// @route GET /api/chat/:userId
exports.getMessages = async (req, res, next) => {
  try {
    const otherUserId = req.params.userId;
    const { bookingId } = req.query;

    const query = {
      $or: [
        { sender: req.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.id },
      ],
    };

    if (bookingId) {
      query.booking = bookingId;
    }

    const messages = await Message.find(query)
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .populate('booking', 'bookingId eventType')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Send Message
// @route POST /api/chat
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, bookingId } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: 'Receiver and content are required.' });
    }

    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      booking: bookingId || undefined,
      content,
      read: false,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role');

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get User's Active Conversations List
// @route GET /api/chat/conversations/all
exports.getConversations = async (req, res, next) => {
  try {
    const myId = req.user.id;

    // Find all distinct users that chatted with myId
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name avatar role phone')
      .populate('receiver', 'name avatar role phone')
      .populate('booking', 'bookingId eventType status');

    const conversationMap = new Map();

    messages.forEach((msg) => {
      const isSender = msg.sender._id.toString() === myId;
      const otherUser = isSender ? msg.receiver : msg.sender;
      const otherId = otherUser._id.toString();

      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, {
          user: otherUser,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: (!isSender && !msg.read) ? 1 : 0,
          booking: msg.booking,
        });
      } else if (!isSender && !msg.read) {
        const item = conversationMap.get(otherId);
        item.unreadCount += 1;
      }
    });

    const conversations = Array.from(conversationMap.values());

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};
