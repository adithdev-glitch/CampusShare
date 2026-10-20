const Review = require('../models/Review');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// @desc    Publish a review for a user (after returning resource)
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { transactionId, reviewedUserId, rating, comment } = req.body;

    if (!transactionId || !reviewedUserId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Missing transaction details, rating, or comment' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Double check transaction status is returned
    if (transaction.status !== 'returned') {
      return res.status(400).json({ success: false, message: 'Cannot review before resource return is verified' });
    }

    // Verify req.user is part of transaction
    if (transaction.borrowerId.toString() !== req.user.id && transaction.ownerId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized review attempt' });
    }

    // Create review
    const review = await Review.create({
      reviewerId: req.user.id,
      reviewedUserId,
      transactionId,
      rating: parseInt(rating),
      comment,
    });

    // Recalculate average rating of target student
    const reviews = await Review.find({ reviewedUserId });
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);

    await User.findByIdAndUpdate(reviewedUserId, { rating: parseFloat(averageRating) });

    // Send notification
    await Notification.create({
      userId: reviewedUserId,
      type: 'review',
      message: `${req.user.name} rated you ${rating} ⭐: "${comment.substring(0, 30)}..."`,
    });

    res.status(201).json({ success: true, message: 'Review published successfully!', review });
  } catch (error) {
    console.error('Create Review Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all reviews of a student
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedUserId: req.params.userId })
      .populate('reviewerId', 'name profileImage department year')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Get Reviews Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createReview,
  getUserReviews,
};
