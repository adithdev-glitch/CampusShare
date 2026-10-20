const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyOTP, resendOTP, getUserById, updateProfile, changePassword, withdrawWallet } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/me', protect, getMe);
router.get('/user/:id', protect, getUserById);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/wallet/withdraw', protect, withdrawWallet);

module.exports = router;
