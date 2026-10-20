const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/borrowController');
const { protect } = require('../middleware/auth');

router.post('/request', protect, requestBorrow);
router.get('/my-requests', protect, getMyRequests);
router.post('/request/:id/respond', protect, respondRequest);
router.get('/my-borrowings', protect, getMyBorrowings);
router.post('/transaction/:id/verify-pickup', protect, verifyPickup);
router.post('/transaction/:id/verify-return', protect, verifyReturn);
router.post('/transaction/:id/pay-pickup/order', protect, createPickupPaymentOrder);
router.post('/transaction/:id/pay-return/order', protect, createReturnPaymentOrder);
router.post('/transaction/:id/pay-pickup/verify', protect, verifyPickupPayment);
router.post('/transaction/:id/pay-return/verify', protect, verifyReturnPayment);

module.exports = router;
