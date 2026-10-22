const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Helper to generate unique ticket ID: TKT-2026-XXXX
const generateTicketId = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `TKT-${year}-${rand}`;
};

// @desc Create a new Support / Problem Ticket (Flipkart-like Help Desk)
// @route POST /api/support/tickets
exports.createTicket = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      category,
      subject,
      description,
      priority = 'medium',
      bookingId,
      carId,
      attachments = [],
    } = req.body;

    if (!name || !phone || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number, subject, and problem description are required.',
      });
    }

    const ticketId = generateTicketId();
    const userId = req.user ? req.user.id : undefined;
    const userRole = req.user ? req.user.role : 'guest';

    // Link booking if bookingId provided
    let bookingRef;
    if (bookingId) {
      const foundBooking = await Booking.findOne({
        $or: [{ bookingId: bookingId.trim() }, { _id: bookingId }],
      });
      if (foundBooking) {
        bookingRef = foundBooking._id;
      }
    }

    const extractUrl = (val) => {
      if (!val) return '';
      if (typeof val === 'string') return val.trim();
      if (typeof val === 'object' && val.url) return String(val.url).trim();
      return String(val).trim();
    };

    const ticket = await SupportTicket.create({
      ticketId,
      user: userId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : req.user?.email || '',
      userRole,
      category: category || 'Booking Issue',
      subject: subject.trim(),
      description: description.trim(),
      priority,
      status: 'open',
      bookingId: bookingId || '',
      booking: bookingRef,
      car: carId || undefined,
      attachments: Array.isArray(attachments) ? attachments.map(extractUrl).filter(Boolean) : [],
      messages: [
        {
          sender: userId,
          senderName: name.trim(),
          senderRole: userRole,
          message: description.trim(),
          attachment: attachments[0] || '',
          createdAt: new Date(),
        },
      ],
    });

    // Notify all admins immediately
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map((admin) => ({
      user: admin._id,
      title: `🚨 Help Ticket #${ticket.ticketId}: ${category || 'Query'}`,
      message: `Problem from ${name} (${phone}): "${subject} - ${description.substring(0, 80)}..."`,
      type: 'query',
      link: '/admin',
      data: { ticketId: ticket.ticketId, id: ticket._id },
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Format pre-filled WhatsApp alert text for the user / admin
    const encodedProblem = encodeURIComponent(
      `🆘 *RAS BROTHER HELP DESK - TICKET #${ticket.ticketId}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *User:* ${name} (${phone})\n` +
      `📂 *Category:* ${category || 'Help Query'}\n` +
      `🎯 *Subject:* ${subject}\n` +
      `📝 *Problem Details:* ${description}\n` +
      (bookingId ? `📋 *Booking Ref:* #${bookingId}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Priority: ${priority.toUpperCase()} • Status: OPEN`
    );

    res.status(201).json({
      success: true,
      message: `Your support ticket #${ticket.ticketId} has been registered! Admin team has been notified.`,
      ticket,
      whatsAppShareUrl: `https://wa.me/919918272164?text=${encodedProblem}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get My Support Tickets (Customer or Owner)
// @route GET /api/support/my-tickets
exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({
      $or: [{ user: req.user.id }, { phone: req.user.phone }],
    })
      .sort({ createdAt: -1 })
      .populate('booking', 'bookingId status startDate')
      .populate('car', 'brand name images');

    res.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Single Ticket Details with Message Thread
// @route GET /api/support/tickets/:id
exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name phone email avatar role')
      .populate('booking', 'bookingId status pricing startDate car')
      .populate('adminRespondedBy', 'name');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    // Authorization check
    if (
      req.user.role !== 'admin' &&
      ticket.user &&
      ticket.user._id.toString() !== req.user.id &&
      ticket.phone !== req.user.phone
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Add Follow-up Message to Ticket
// @route POST /api/support/tickets/:id/message
exports.addTicketMessage = async (req, res, next) => {
  try {
    const { message, attachment } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const senderRole = req.user.role === 'admin' ? 'admin' : (ticket.userRole || 'customer');

    const newMsg = {
      sender: req.user.id,
      senderName: req.user.name || (req.user.role === 'admin' ? 'Support Desk' : 'User'),
      senderRole,
      message: message.trim(),
      attachment: attachment || '',
      createdAt: new Date(),
    };

    ticket.messages.push(newMsg);
    ticket.updatedAt = new Date();

    if (req.user.role === 'admin') {
      ticket.adminResponse = message.trim();
      ticket.adminRespondedAt = new Date();
      ticket.adminRespondedBy = req.user.id;
      if (ticket.status === 'open') ticket.status = 'in_progress';

      // Notify user
      if (ticket.user) {
        await Notification.create({
          user: ticket.user,
          title: `💬 Support Reply on Ticket #${ticket.ticketId}`,
          message: `Admin replied: "${message.substring(0, 90)}..."`,
          type: 'query',
          link: '/customer-dashboard',
        });
      }
    } else {
      if (ticket.status === 'resolved' || ticket.status === 'closed') {
        ticket.status = 'open'; // Re-open if user responds
      }
      // Notify Admin
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          title: `💬 New Reply on Ticket #${ticket.ticketId}`,
          message: `${req.user.name} replied on ticket #${ticket.ticketId}: "${message.substring(0, 80)}"`,
          type: 'query',
          link: '/admin',
        });
      }
    }

    await ticket.save();

    res.json({
      success: true,
      message: 'Message added to ticket.',
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get All Support Tickets for Admin Helpdesk
// @route GET /api/support/admin/tickets
exports.getAllTicketsAdmin = async (req, res, next) => {
  try {
    const { status, category, priority, search } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (search) {
      const s = search.toLowerCase();
      query.$or = [
        { ticketId: { $regex: s, $options: 'i' } },
        { name: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { subject: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { bookingId: { $regex: s, $options: 'i' } },
      ];
    }

    const tickets = await SupportTicket.find(query)
      .populate('user', 'name phone email avatar role')
      .populate('booking', 'bookingId status startDate')
      .sort({ createdAt: -1 });

    const totalCount = await SupportTicket.countDocuments();
    const openCount = await SupportTicket.countDocuments({ status: 'open' });
    const inProgressCount = await SupportTicket.countDocuments({ status: 'in_progress' });
    const resolvedCount = await SupportTicket.countDocuments({ status: 'resolved' });
    const urgentCount = await SupportTicket.countDocuments({ priority: 'urgent', status: { $ne: 'resolved' } });

    res.json({
      success: true,
      count: tickets.length,
      metrics: {
        totalCount,
        openCount,
        inProgressCount,
        resolvedCount,
        urgentCount,
      },
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Admin Update Ticket Status & Send Official Resolution
// @route PUT /api/support/admin/tickets/:id
exports.updateTicketAdmin = async (req, res, next) => {
  try {
    const { status, adminResponse, priority } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;

    if (adminResponse && adminResponse.trim()) {
      ticket.adminResponse = adminResponse.trim();
      ticket.adminRespondedAt = new Date();
      ticket.adminRespondedBy = req.user.id;

      ticket.messages.push({
        sender: req.user.id,
        senderName: req.user.name || 'RAS Concierge Admin',
        senderRole: 'admin',
        message: adminResponse.trim(),
        createdAt: new Date(),
      });
    }

    ticket.updatedAt = new Date();
    await ticket.save();

    // Notify user
    if (ticket.user) {
      await Notification.create({
        user: ticket.user,
        title: `Support Ticket #${ticket.ticketId} Status: ${ticket.status.toUpperCase()}`,
        message: adminResponse
          ? `Resolution from Admin: ${adminResponse}`
          : `Your support ticket has been updated to ${ticket.status}.`,
        type: 'query',
        link: ticket.userRole === 'owner' ? '/owner-dashboard' : '/customer-dashboard',
      });
    }

    res.json({
      success: true,
      message: `Ticket #${ticket.ticketId} updated to ${ticket.status}.`,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};
