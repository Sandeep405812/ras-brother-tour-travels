const Message = require('../models/Message');

const setupChatSocket = (io) => {
  const onlineUsers = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log(`[Socket Connected]: ${socket.id}`);

    // User joins with their userId
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        onlineUsers.set(userId, socket.id);
        io.emit('online_users', Array.from(onlineUsers.keys()));
      }
    });

    // Join a specific booking chat room
    socket.on('join_booking_chat', (bookingId) => {
      if (bookingId) {
        socket.join(`booking_${bookingId}`);
      }
    });

    // Typing Indicator
    socket.on('typing', ({ receiverId, bookingId }) => {
      socket.to(`user_${receiverId}`).emit('user_typing', { senderId: socket.userId, bookingId });
    });

    socket.on('stop_typing', ({ receiverId, bookingId }) => {
      socket.to(`user_${receiverId}`).emit('user_stop_typing', { senderId: socket.userId, bookingId });
    });

    // Real-time Chat message
    socket.on('send_message', async (data) => {
      try {
        const { senderId, receiverId, bookingId, content } = data;
        if (!senderId || !receiverId || !content) return;

        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          booking: bookingId || undefined,
          content,
          read: false,
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'name avatar role')
          .populate('receiver', 'name avatar role');

        // Emit to receiver's private room
        io.to(`user_${receiverId}`).emit('receive_message', populated);
        // Emit back to sender
        socket.emit('message_sent', populated);

        // If in booking room
        if (bookingId) {
          socket.to(`booking_${bookingId}`).emit('receive_message', populated);
        }
      } catch (err) {
        console.error('[Socket send_message error]:', err.message);
      }
    });

    // Mark as read
    socket.on('mark_read', async ({ messageId, senderId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { read: true });
        io.to(`user_${senderId}`).emit('message_read_receipt', { messageId });
      } catch (err) {
        console.error('[Socket mark_read error]:', err.message);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      for (const [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(uid);
          break;
        }
      }
      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`[Socket Disconnected]: ${socket.id}`);
    });
  });
};

module.exports = setupChatSocket;
