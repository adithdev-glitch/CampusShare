const express = require('express');
const router = express.Router();
const { getAdminStats, getUsers, deleteUser, getReviews, deleteReview, getTransactions, getRequests } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/users', protect, adminOnly, getUsers);
router.delete('/user/:id', protect, adminOnly, deleteUser);
router.get('/reviews', protect, adminOnly, getReviews);
router.delete('/review/:id', protect, adminOnly, deleteReview);
router.get('/transactions', protect, adminOnly, getTransactions);
router.get('/requests', protect, adminOnly, getRequests);

module.exports = router;
