const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a resource name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    images: {
      type: [String],
      default: ['https://images.unsplash.com/photo-1517055720730-0766be088582?auto=format&fit=crop&q=80&w=400'],
    },
    condition: {
      type: String,
      required: [true, 'Please specify the condition of the resource'],
      enum: ['Excellent', 'Good', 'Fair', 'Needs Repair'],
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide a pickup location'],
    },
    maxBorrowDuration: {
      type: Number,
      default: 7, // Default in days
    },
    accessories: {
      type: [String],
      default: [],
    },
    suitableFor: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    department: {
      type: String,
      default: 'General',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resource', ResourceSchema);
