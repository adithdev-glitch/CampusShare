const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pickupTime: {
      type: Date,
    },
    returnTime: {
      type: Date,
    },
    expectedReturnDate: {
      type: Date,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    pickupPaymentId: {
      type: String,
    },
    pickupOrderId: {
      type: String,
    },
    pickupAmountPaid: {
      type: Number,
      default: 0,
    },
    isOverduePaid: {
      type: Boolean,
      default: false,
    },
    returnPaymentId: {
      type: String,
    },
    returnOrderId: {
      type: String,
    },
    overdueAmountPaid: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['requested', 'approved', 'borrowed', 'returned', 'overdue'],
      default: 'requested',
    },
    qrCode: {
      type: String,
      unique: true,
      required: true,
    },
    conditionBefore: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Needs Repair'],
      default: 'Good',
    },
    conditionAfter: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Needs Repair'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
