const User = require('../models/User');
const Resource = require('../models/Resource');
const Transaction = require('../models/Transaction');
const BorrowRequest = require('../models/BorrowRequest');
const Review = require('../models/Review');

// @desc    Get Admin Panel Statistics and charts datasets
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalResources = await Resource.countDocuments({});
    const activeBorrowings = await Transaction.countDocuments({ status: 'borrowed' });
    const completedTransactions = await Transaction.countDocuments({ status: 'returned' });
    const pendingRequests = await BorrowRequest.countDocuments({ status: 'pending' });
    const overdueResources = await Transaction.countDocuments({ status: 'overdue' });

    // Calculate actual financial metrics
    const allPaidTransactions = await Transaction.find({ $or: [{ isPaid: true }, { isOverduePaid: true }] });
    let totalPaymentsVolume = 0;
    allPaidTransactions.forEach(tx => {
      if (tx.isPaid) totalPaymentsVolume += (tx.pickupAmountPaid || 0);
      if (tx.isOverduePaid) totalPaymentsVolume += (tx.overdueAmountPaid || 0);
    });

    const adminUser = await User.findOne({ role: 'admin' });
    const adminCommissionEarned = adminUser ? adminUser.wallet : 0;

    // Category aggregations
    const resourcesByCategory = await Resource.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Format for frontend
    const categoryData = resourcesByCategory.map(item => ({
      name: item._id,
      value: item.count
    }));

    // Department aggregations
    const resourcesByDept = await Resource.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const deptData = resourcesByDept.map(item => ({
      name: item._id,
      value: item.count
    }));

    // Simulate monthly transaction logs (last 6 months)
    const monthlyStats = [
      { month: 'Jan', count: 12 },
      { month: 'Feb', count: 19 },
      { month: 'Mar', count: 32 },
      { month: 'Apr', count: 45 },
      { month: 'May', count: 58 },
      { month: 'Jun', count: 72 }
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalResources,
        activeBorrowings,
        completedTransactions,
        pendingRequests,
        overdueResources,
        totalPaymentsVolume,
        adminCommissionEarned
      },
      charts: {
        categoryData,
        deptData,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Get Admin Stats Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Admin Get Users Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete administrator profiles' });
    }

    await User.findByIdAndDelete(req.params.id);
    // Delete their listings and requests too
    await Resource.deleteMany({ ownerId: req.params.id });
    await BorrowRequest.deleteMany({ $or: [{ borrowerId: req.params.id }, { ownerId: req.params.id }] });
    await Transaction.deleteMany({ $or: [{ borrowerId: req.params.id }, { ownerId: req.params.id }] });

    res.status(200).json({ success: true, message: 'User and all related records deleted' });
  } catch (error) {
    console.error('Admin Delete User Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all reviews for moderation
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('reviewerId', 'name email profileImage department')
      .populate('reviewedUserId', 'name email profileImage department')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Admin Get Reviews Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete review
// @route   DELETE /api/admin/review/:id
// @access  Private/Admin
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Review successfully deleted and moderated' });
  } catch (error) {
    console.error('Admin Delete Review Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all transactions (for admin explorer)
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('resourceId', 'name category price isPaid')
      .populate('borrowerId', 'name email department year profileImage')
      .populate('ownerId', 'name email department year profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    console.error('Admin Get Transactions Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all borrow requests (for admin explorer)
// @route   GET /api/admin/requests
// @access  Private/Admin
const getRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.find({})
      .populate('resourceId', 'name category price isPaid')
      .populate('borrowerId', 'name email department year profileImage')
      .populate('ownerId', 'name email department year profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Admin Get Requests Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  deleteUser,
  getReviews,
  deleteReview,
  getTransactions,
  getRequests,
};
