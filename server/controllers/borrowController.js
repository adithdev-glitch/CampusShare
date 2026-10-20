const BorrowRequest = require('../models/BorrowRequest');
const Transaction = require('../models/Transaction');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Submit a borrow request
// @route   POST /api/borrows/request
// @access  Private
const requestBorrow = async (req, res) => {
  try {
    const { resourceId, expectedReturnDate, purpose, message, agreedToTerms } = req.body;

    if (!resourceId || !expectedReturnDate || !purpose) {
      return res.status(400).json({ success: false, message: 'Please provide resource ID, expected return date, and purpose' });
    }

    if (agreedToTerms === undefined || agreedToTerms === false) {
      return res.status(400).json({ success: false, message: 'You must agree to the terms of damage responsibility' });
    }

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (!resource.availability) {
      return res.status(400).json({ success: false, message: 'This resource is currently unavailable' });
    }

    // Check if user is trying to borrow their own resource
    if (resource.ownerId.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot borrow your own resource' });
    }

    // Create Request
    const borrowRequest = await BorrowRequest.create({
      resourceId,
      borrowerId: req.user.id,
      ownerId: resource.ownerId,
      expectedReturnDate,
      purpose,
      message,
      agreedToTerms: !!agreedToTerms
    });

    // Create Notification for resource owner
    await Notification.create({
      userId: resource.ownerId,
      type: 'request',
      message: `${req.user.name} sent a request to borrow your "${resource.name}".`,
    });

    res.status(201).json({ success: true, message: 'Your borrow request has been sent.', borrowRequest });
  } catch (error) {
    console.error('Request Borrow Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get sent and received borrow requests
// @route   GET /api/borrows/my-requests
// @access  Private
const getMyRequests = async (req, res) => {
  try {
    const sent = await BorrowRequest.find({ borrowerId: req.user.id })
      .populate('resourceId', 'name images condition location isPaid price')
      .populate('ownerId', 'name email profileImage department');

    const received = await BorrowRequest.find({ ownerId: req.user.id })
      .populate('resourceId', 'name images condition location isPaid price')
      .populate('borrowerId', 'name email profileImage department year registerNumber');

    res.status(200).json({ success: true, sent, received });
  } catch (error) {
    console.error('Get Requests Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Accept or reject borrow request
// @route   POST /api/borrows/request/:id/respond
// @access  Private
const respondRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const requestId = req.params.id;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide valid status response' });
    }

    const borrowRequest = await BorrowRequest.findById(requestId).populate('resourceId');

    if (!borrowRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Verify owner status
    if (borrowRequest.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to respond to this request' });
    }

    if (borrowRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This request has already been processed' });
    }

    borrowRequest.status = status;
    await borrowRequest.save();

    if (status === 'approved') {
      // Generate a unique token for QR code
      const qrToken = crypto.randomBytes(16).toString('hex');

      // Create borrowing transaction
      await Transaction.create({
        resourceId: borrowRequest.resourceId._id,
        borrowerId: borrowRequest.borrowerId,
        ownerId: req.user.id,
        status: 'approved',
        qrCode: qrToken,
        conditionBefore: borrowRequest.resourceId.condition,
        expectedReturnDate: borrowRequest.expectedReturnDate,
      });

      // Set resource availability to false
      await Resource.findByIdAndUpdate(borrowRequest.resourceId._id, { availability: false });

      // Reject all other pending requests for the same resource
      await BorrowRequest.updateMany(
        { resourceId: borrowRequest.resourceId._id, status: 'pending', _id: { $ne: requestId } },
        { status: 'rejected' }
      );
    }

    // Send notification to borrower
    await Notification.create({
      userId: borrowRequest.borrowerId,
      type: 'status_change',
      message: `Your request for "${borrowRequest.resourceId.name}" has been ${status}.`,
    });

    res.status(200).json({ success: true, message: `Request successfully ${status}!`, borrowRequest });
  } catch (error) {
    console.error('Respond Request Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user's transactions (active borrowings & lendings)
// @route   GET /api/borrows/my-borrowings
// @access  Private
const getMyBorrowings = async (req, res) => {
  try {
    const borrowings = await Transaction.find({ borrowerId: req.user.id })
      .populate('resourceId', 'name images condition location maxBorrowDuration isPaid price')
      .populate('ownerId', 'name email profileImage department');

    const lendings = await Transaction.find({ ownerId: req.user.id })
      .populate('resourceId', 'name images condition location maxBorrowDuration isPaid price')
      .populate('borrowerId', 'name email profileImage department registerNumber year');

    res.status(200).json({ success: true, borrowings, lendings });
  } catch (error) {
    console.error('Get Borrowings Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify Pickup QR scan (updates status to Borrowed)
// @route   POST /api/borrows/transaction/:id/verify-pickup
// @access  Private
const verifyPickup = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('resourceId');
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction record not found' });
    }

    // Only lender or borrower can scan/update (or simulate)
    if (transaction.ownerId.toString() !== req.user.id && transaction.borrowerId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized verification attempt' });
    }

    if (transaction.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Transaction must be approved to start pickup' });
    }

    const resource = transaction.resourceId;
    if (resource.isPaid) {
      if (!transaction.isPaid) {
        return res.status(400).json({ success: false, message: 'Rental fee must be paid before pickup verification can be completed' });
      }

      const totalAmount = transaction.pickupAmountPaid || 0;
      const commission = Math.round(totalAmount * 0.1 * 100) / 100;
      const lenderAmount = totalAmount - commission;

      // Credit the lender's wallet
      const owner = await User.findById(transaction.ownerId);
      if (owner) {
        owner.wallet = (owner.wallet || 0) + lenderAmount;
        await owner.save();
      }

      // Credit admin wallet (10% commission)
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        admin.wallet = (admin.wallet || 0) + commission;
        await admin.save();
      }
    }

    transaction.status = 'borrowed';
    transaction.pickupTime = Date.now();
    await transaction.save();

    // Create notifications for both
    await Notification.create({
      userId: transaction.borrowerId,
      type: 'status_change',
      message: `Pickup verified! You have successfully borrowed "${transaction.resourceId.name}".`,
    });

    await Notification.create({
      userId: transaction.ownerId,
      type: 'status_change',
      message: `Pickup verified! "${transaction.resourceId.name}" has been collected by the borrower.`,
    });

    res.status(200).json({ success: true, message: 'Pickup successfully verified!', transaction });
  } catch (error) {
    console.error('Verify Pickup Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify Return QR scan (updates status to Returned)
// @route   POST /api/borrows/transaction/:id/verify-return
// @access  Private
const verifyReturn = async (req, res) => {
  try {
    const { conditionAfter } = req.body;
    const transaction = await Transaction.findById(req.params.id).populate('resourceId');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction record not found' });
    }

    if (transaction.ownerId.toString() !== req.user.id && transaction.borrowerId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized verification attempt' });
    }

    if (transaction.status !== 'borrowed') {
      return res.status(400).json({ success: false, message: 'Resource must be in borrowed status to return' });
    }

    const resource = transaction.resourceId;
    const overdueMs = Date.now() - new Date(transaction.expectedReturnDate);
    const overdueDays = overdueMs > 0 ? Math.ceil(overdueMs / (1000 * 60 * 60 * 24)) : 0;
    
    if (overdueDays > 0 && resource.isPaid) {
      if (!transaction.isOverduePaid) {
        return res.status(400).json({ success: false, message: 'Overdue late payment is required to return this resource' });
      }

      const totalAmount = transaction.overdueAmountPaid || 0;
      const commission = Math.round(totalAmount * 0.1 * 100) / 100;
      const lenderAmount = totalAmount - commission;

      // Credit late fee to lender's wallet
      const owner = await User.findById(transaction.ownerId);
      if (owner) {
        owner.wallet = (owner.wallet || 0) + lenderAmount;
        await owner.save();
      }

      // Credit admin wallet (10% commission)
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        admin.wallet = (admin.wallet || 0) + commission;
        await admin.save();
      }
    }

    transaction.status = 'returned';
    transaction.returnTime = Date.now();
    if (conditionAfter) {
      transaction.conditionAfter = conditionAfter;
    }
    await transaction.save();

    // Re-enable Resource availability
    await Resource.findByIdAndUpdate(transaction.resourceId._id, { 
      availability: true,
      condition: conditionAfter || transaction.resourceId.condition
    });

    // Create notifications
    await Notification.create({
      userId: transaction.borrowerId,
      type: 'status_change',
      message: `Return verified! You returned "${transaction.resourceId.name}". Please rate your lending experience.`,
    });

    await Notification.create({
      userId: transaction.ownerId,
      type: 'status_change',
      message: `Return verified! "${transaction.resourceId.name}" is back in your inventory. Please rate the borrower.`,
    });

    res.status(200).json({ success: true, message: 'Return successfully verified!', transaction });
  } catch (error) {
    console.error('Verify Return Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const Razorpay = require('razorpay');

// @desc    Create Razorpay Order for Pickup
// @route   POST /api/borrows/transaction/:id/pay-pickup/order
// @access  Private
const createPickupPaymentOrder = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('resourceId');
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction record not found' });
    }

    if (transaction.borrowerId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const resource = transaction.resourceId;
    if (!resource.isPaid) {
      return res.status(400).json({ success: false, message: 'This resource is free' });
    }

    // Calculate duration (days)
    const rentDurationMs = new Date(transaction.expectedReturnDate) - new Date(transaction.createdAt);
    const rentDays = Math.max(1, Math.ceil(rentDurationMs / (1000 * 60 * 60 * 24)));
    const totalAmount = rentDays * resource.price;

    if (totalAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount calculated' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY || 'rzp_test_poYEepsrFEzetS',
      key_secret: process.env.RAZORPAY_SECRET || 'OixSGiwvX6gkOczrwcCANbPT'
    });

    const options = {
      amount: totalAmount * 100, // amount in paisa
      currency: 'INR',
      receipt: `pickup_${transaction._id}`
    };

    const order = await razorpay.orders.create(options);

    transaction.pickupOrderId = order.id;
    await transaction.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: totalAmount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY || 'rzp_test_poYEepsrFEzetS'
    });
  } catch (error) {
    console.error('Create Pickup Order Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// @desc    Create Razorpay Order for Return/Overdue
// @route   POST /api/borrows/transaction/:id/pay-return/order
// @access  Private
const createReturnPaymentOrder = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('resourceId');
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction record not found' });
    }

    if (transaction.borrowerId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const resource = transaction.resourceId;
    if (!resource.isPaid) {
      return res.status(400).json({ success: false, message: 'This resource is free' });
    }

    // Calculate overdue duration (days)
    const overdueMs = Date.now() - new Date(transaction.expectedReturnDate);
    const overdueDays = overdueMs > 0 ? Math.ceil(overdueMs / (1000 * 60 * 60 * 24)) : 0;
    const overdueAmount = overdueDays * resource.price;

    if (overdueAmount <= 0) {
      return res.status(400).json({ success: false, message: 'No overdue fee pending' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY || 'rzp_test_poYEepsrFEzetS',
      key_secret: process.env.RAZORPAY_SECRET || 'OixSGiwvX6gkOczrwcCANbPT'
    });

    const options = {
      amount: overdueAmount * 100, // in paisa
      currency: 'INR',
      receipt: `return_${transaction._id}`
    };

    const order = await razorpay.orders.create(options);

    transaction.returnOrderId = order.id;
    await transaction.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: overdueAmount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY || 'rzp_test_poYEepsrFEzetS'
    });
  } catch (error) {
    console.error('Create Return Order Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// @desc    Verify Razorpay Payment for Pickup
// @route   POST /api/borrows/transaction/:id/pay-pickup/verify
// @access  Private
const verifyPickupPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Please provide all payment verification details' });
    }

    const transaction = await Transaction.findById(req.params.id).populate('resourceId');
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction record not found' });
    }

    if (transaction.borrowerId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET || 'OixSGiwvX6gkOczrwcCANbPT');
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    const resource = transaction.resourceId;
    const rentDurationMs = new Date(transaction.expectedReturnDate) - new Date(transaction.createdAt);
    const rentDays = Math.max(1, Math.ceil(rentDurationMs / (1000 * 60 * 60 * 24)));
    
    transaction.isPaid = true;
    transaction.pickupPaymentId = razorpay_payment_id;
    transaction.pickupOrderId = razorpay_order_id;
    transaction.pickupAmountPaid = rentDays * resource.price;
    await transaction.save();

    res.status(200).json({ success: true, message: 'Payment verified successfully!', transaction });
  } catch (error) {
    console.error('Verify Pickup Payment Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// @desc    Verify Razorpay Payment for Return/Overdue
// @route   POST /api/borrows/transaction/:id/pay-return/verify
// @access  Private
const verifyReturnPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Please provide all payment verification details' });
    }

    const transaction = await Transaction.findById(req.params.id).populate('resourceId');
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction record not found' });
    }

    if (transaction.borrowerId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET || 'OixSGiwvX6gkOczrwcCANbPT');
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    const resource = transaction.resourceId;
    const overdueMs = Date.now() - new Date(transaction.expectedReturnDate);
    const overdueDays = overdueMs > 0 ? Math.ceil(overdueMs / (1000 * 60 * 60 * 24)) : 0;

    transaction.isOverduePaid = true;
    transaction.returnPaymentId = razorpay_payment_id;
    transaction.returnOrderId = razorpay_order_id;
    transaction.overdueAmountPaid = overdueDays * resource.price;
    await transaction.save();

    res.status(200).json({ success: true, message: 'Overdue late payment verified successfully!', transaction });
  } catch (error) {
    console.error('Verify Return Payment Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = {
  requestBorrow,
  getMyRequests,
  respondRequest,
  getMyBorrowings,
  verifyPickup,
  verifyReturn,
  createPickupPaymentOrder,
  createReturnPaymentOrder,
  verifyPickupPayment,
  verifyReturnPayment,
};
