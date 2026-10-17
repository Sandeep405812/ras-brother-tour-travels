const User = require('../models/User');
const OwnerProfile = require('../models/OwnerProfile');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ras_brother_tour_travels_jwt_secret_key_2026_99x', {
    expiresIn: '30d',
  });
};

// @desc Register User
// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, businessName, address, city, coordinates } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const assignedRole = role === 'admin' ? 'customer' : (role || 'customer'); // admin created via seed or dashboard

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: assignedRole,
      address: address || '',
      city: city || 'Delhi NCR',
      location: {
        type: 'Point',
        coordinates: coordinates || [77.2090, 28.6139],
      },
      isVerified: true,
    });

    // If registered as owner, create OwnerProfile
    let ownerProfile = null;
    if (assignedRole === 'owner') {
      ownerProfile = await OwnerProfile.create({
        user: user._id,
        businessName: businessName || `${user.name} Travels Fleet`,
        address: address || 'Main Market, Local City',
        city: city || 'Delhi NCR',
        location: {
          type: 'Point',
          coordinates: coordinates || [77.2090, 28.6139],
        },
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        city: user.city,
        ownerProfileId: ownerProfile ? ownerProfile._id : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login User
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    let ownerProfile = null;
    if (user.role === 'owner') {
      ownerProfile = await OwnerProfile.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        city: user.city,
        ownerProfileId: ownerProfile ? ownerProfile._id : null,
        ownerProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Current Logged In User
// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let ownerProfile = null;

    if (user.role === 'owner') {
      ownerProfile = await OwnerProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        address: user.address,
        city: user.city,
        location: user.location,
        ownerProfileId: ownerProfile ? ownerProfile._id : null,
        ownerProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update Profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city, avatar, coordinates } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (city) updates.city = city;
    if (avatar) updates.avatar = avatar;
    if (coordinates) {
      updates.location = {
        type: 'Point',
        coordinates,
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Forgot Password - Request 6-digit OTP
// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address or phone number.',
      });
    }

    const query = emailOrPhone.includes('@')
      ? { email: emailOrPhone.trim().toLowerCase() }
      : { phone: emailOrPhone.trim() };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email or phone number.',
      });
    }

    // Generate 6-digit verification code
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = resetOtp;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `Password reset OTP generated. Please use OTP: ${resetOtp} to reset your password.`,
      resetOtp,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Reset Password with OTP
// @route POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { emailOrPhone, otp, newPassword } = req.body;

    if (!emailOrPhone || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/phone, the 6-digit OTP, and a new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const query = emailOrPhone.includes('@')
      ? { email: emailOrPhone.trim().toLowerCase() }
      : { phone: emailOrPhone.trim() };

    const user = await User.findOne(query).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or incorrect reset OTP entered.',
      });
    }

    if (user.resetPasswordExpires && new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset OTP has expired. Please request a new code.',
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

