const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../utils/nodemailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_super_secret_key_here', {
    expiresIn: '30d',
  });
};

// @desc    Register a new student & send OTP
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, registerNumber, department, year, password } = req.body;

    if (!name || !email || !registerNumber || !department || !year || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const emailLower = email.toLowerCase();
    const collegeDomainRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.in|org|com)$/;
    if (!collegeDomainRegex.test(emailLower)) {
      return res.status(400).json({ success: false, message: 'Please register with a valid college email address' });
    }

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ email: emailLower }, { registerNumber }]
    });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'Student with this email or register number already exists and is verified' });
      } else {
        // Update existing unverified user registration details
        user.name = name;
        user.registerNumber = registerNumber;
        user.department = department;
        user.year = year;
        user.password = password; // pre-save hook hashes password
      }
    } else {
      // Create new unverified user
      const role = (emailLower === 'admin@college.edu' || name.toLowerCase().includes('admin')) ? 'admin' : 'student';

      user = new User({
        name,
        email: emailLower,
        registerNumber,
        department,
        year,
        password,
        role,
        profileImage: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
        isVerified: false
      });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save();

    // Send email using Nodemailer helper
    await sendOTP(emailLower, code);

    res.status(201).json({
      success: true,
      message: 'Verification code sent to college email. Please verify to complete registration.',
      email: emailLower,
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Student account not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Student account already verified' });
    }

    // Validate code match
    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    // Validate expiration
    if (user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Verification code expired' });
    }

    // Set verified status
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registerNumber: user.registerNumber,
        department: user.department,
        year: user.year,
        role: user.role,
        rating: user.rating,
        profileImage: user.profileImage,
        wishlist: user.wishlist,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    console.error('OTP Verification Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Resend OTP code
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified' });
    }

    // Generate new OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Send email using Nodemailer helper
    await sendOTP(user.email, code);
    console.log(code);

    res.status(200).json({
      success: true,
      message: 'New verification code sent to email',
      email: user.email,
    });
  } catch (error) {
    console.error('Resend OTP Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // If account is unverified, trigger OTP verify flow
    if (!user.isVerified) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = code;
      user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
      await user.save();

      // Send email using Nodemailer helper
      await sendOTP(user.email, code);

      return res.status(403).json({
        success: false,
        message: 'Account not verified. A verification code has been sent to your email.',
        requiresVerification: true,
        email: user.email,
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registerNumber: user.registerNumber,
        department: user.department,
        year: user.year,
        role: user.role,
        rating: user.rating,
        profileImage: user.profileImage,
        wishlist: user.wishlist,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registerNumber: user.registerNumber,
        department: user.department,
        year: user.year,
        role: user.role,
        rating: user.rating,
        profileImage: user.profileImage,
        wishlist: user.wishlist,
        wallet: user.wallet,
        withdrawals: user.withdrawals,
      },
    });
  } catch (error) {
    console.error('GetMe Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/auth/user/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registerNumber: user.registerNumber,
        department: user.department,
        year: user.year,
        role: user.role,
        rating: user.rating,
        profileImage: user.profileImage,
        wishlist: user.wishlist,
        wallet: user.wallet,
        withdrawals: user.withdrawals,
      }
    });
  } catch (error) {
    console.error('GetUserById Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, department, year, registerNumber, profileImage } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (year) user.year = year;
    if (registerNumber) user.registerNumber = registerNumber;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registerNumber: user.registerNumber,
        department: user.department,
        year: user.year,
        role: user.role,
        rating: user.rating,
        profileImage: user.profileImage,
        wishlist: user.wishlist,
        wallet: user.wallet,
        withdrawals: user.withdrawals,
      }
    });
  } catch (error) {
    console.error('UpdateProfile Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    console.error('ChangePassword Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Withdraw money from wallet
// @route   POST /api/auth/wallet/withdraw
// @access  Private
const withdrawWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Please specify a valid withdrawal amount' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.wallet < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    user.wallet -= parseFloat(amount);
    user.withdrawals.push({ amount: parseFloat(amount), date: Date.now() });
    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully withdrew ₹${amount} from your wallet!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registerNumber: user.registerNumber,
        department: user.department,
        year: user.year,
        role: user.role,
        rating: user.rating,
        profileImage: user.profileImage,
        wishlist: user.wishlist,
        wallet: user.wallet,
        withdrawals: user.withdrawals,
      }
    });
  } catch (error) {
    console.error('WithdrawWallet Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  getMe,
  getUserById,
  updateProfile,
  changePassword,
  withdrawWallet,
};
