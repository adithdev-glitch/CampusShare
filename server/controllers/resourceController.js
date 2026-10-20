const Resource = require('../models/Resource');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// @desc    Get all resources with filters, search, and sorting
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res) => {
  try {
    const { search, category, condition, availability, location, maxBorrowDuration, sort, department } = req.query;

    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Condition filter
    if (condition) {
      query.condition = condition;
    }

    // Availability filter
    if (availability !== undefined) {
      query.availability = availability === 'true';
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Department filter
    if (department) {
      query.department = department;
    }

    // Max Borrow Duration filter
    if (maxBorrowDuration) {
      query.maxBorrowDuration = { $lte: parseInt(maxBorrowDuration) };
    }

    let queryBuilder = Resource.find(query).populate('ownerId', 'name rating profileImage department');

    // Sorting
    if (sort) {
      if (sort === 'Recently Added') {
        queryBuilder = queryBuilder.sort({ createdAt: -1 });
      } else if (sort === 'Highest Rated') {
        // Since we populate ownerId, we cannot easily sort inside MongoDB query directly on populated rating,
        // so we will sort programmatically after fetching or sort by name for now,
        // but sorting programmatically is very easy for small databases. Let's do it programmatically.
      } else if (sort === 'Available Now') {
        queryBuilder = queryBuilder.sort({ availability: -1, createdAt: -1 });
      } else {
        queryBuilder = queryBuilder.sort({ createdAt: -1 });
      }
    } else {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }

    let resources = await queryBuilder;

    // Programmatic sort check
    if (sort === 'Highest Rated') {
      resources = resources.sort((a, b) => {
        const ratingA = a.ownerId ? a.ownerId.rating : 0;
        const ratingB = b.ownerId ? b.ownerId.rating : 0;
        return ratingB - ratingA;
      });
    } else if (sort === 'Most Borrowed') {
      // Simulate by counting transactions for this resource
      const transactionCounts = await Transaction.aggregate([
        { $group: { _id: '$resourceId', count: { $sum: 1 } } }
      ]);

      const countMap = {};
      transactionCounts.forEach(item => {
        countMap[item._id.toString()] = item.count;
      });

      resources = resources.sort((a, b) => {
        const countA = countMap[a._id.toString()] || 0;
        const countB = countMap[b._id.toString()] || 0;
        return countB - countA;
      });
    }

    res.status(200).json({ success: true, count: resources.length, resources });
  } catch (error) {
    console.error('Get Resources Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('ownerId', 'name email rating profileImage department registerNumber');
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Get number of successful lendings by this owner
    const lendingsCount = await Transaction.countDocuments({ 
      ownerId: resource.ownerId?._id, 
      status: 'returned' 
    });

    res.status(200).json({ success: true, resource, lendingsCount });
  } catch (error) {
    console.error('Get Resource Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create new listing
// @route   POST /api/resources
// @access  Private
const createResource = async (req, res) => {
  try {
    const { name, category, description, images, condition, quantity, location, maxBorrowDuration, accessories, suitableFor, tags, department } = req.body;

    if (!name || !category || !description || !condition || !location) {
      return res.status(400).json({ success: false, message: 'Missing required resource details' });
    }

    const resource = await Resource.create({
      name,
      category,
      description,
      images: images || [],
      condition,
      quantity: quantity || 1,
      ownerId: req.user.id,
      location,
      maxBorrowDuration: maxBorrowDuration || 7,
      accessories: accessories || [],
      suitableFor: suitableFor || [],
      tags: tags || [],
      department: department || req.user.department || 'General'
    });

    // Notify users on wishlist if this category matches or tag matches?
    // Let's implement wishlist notifications when a new item is published:
    // If a user has this resource name or similar in their wishlist, notify them!
    const usersToNotify = await User.find({ wishlist: { $size: 0 } }); // fallback, not notifying everyone
    
    res.status(201).json({ success: true, message: 'Resource successfully listed!', resource });
  } catch (error) {
    console.error('Create Resource Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update resource details
// @route   PUT /api/resources/:id
// @access  Private
const updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Check ownership
    if (resource.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'User not authorized to update this resource' });
    }

    resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Resource successfully updated!', resource });
  } catch (error) {
    console.error('Update Resource Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete resource listing
// @route   DELETE /api/resources/:id
// @access  Private
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Check ownership
    if (resource.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'User not authorized to delete this resource' });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete Resource Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle resource in wishlist
// @route   POST /api/resources/:id/wishlist
// @access  Private
const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const resourceId = req.params.id;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const index = user.wishlist.indexOf(resourceId);
    let isAdded = false;

    if (index === -1) {
      user.wishlist.push(resourceId);
      isAdded = true;
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();

    res.status(200).json({ 
      success: true, 
      message: isAdded ? 'Added to wishlist!' : 'Removed from wishlist!', 
      wishlist: user.wishlist 
    });
  } catch (error) {
    console.error('Toggle Wishlist Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current user's wishlist
// @route   GET /api/resources/wishlist/all
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      populate: { path: 'ownerId', select: 'name rating profileImage' }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    console.error('Get Wishlist Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get rule-based smart recommendations
// @route   GET /api/resources/recommendations/all
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get categories of items in user's wishlist, or items they recently borrowed
    const userTransactions = await Transaction.find({ borrowerId: user._id }).populate('resourceId');
    const borrowedCategories = userTransactions.map(t => t.resourceId?.category).filter(Boolean);
    
    // User's wishlist categories
    const wishlistItems = await Resource.find({ _id: { $in: user.wishlist } });
    const wishlistCategories = wishlistItems.map(item => item.category);

    const categoriesOfInterest = [...new Set([...borrowedCategories, ...wishlistCategories])];

    let query = { 
      ownerId: { $ne: user._id }, // Don't recommend own resources
      availability: true 
    };

    if (categoriesOfInterest.length > 0) {
      query.category = { $in: categoriesOfInterest };
    }

    let recommendations = await Resource.find(query)
      .limit(6)
      .populate('ownerId', 'name rating profileImage department');

    // If recommendation list is small, backfill with top rated/recently added resources
    if (recommendations.length < 4) {
      const extraResources = await Resource.find({
        ownerId: { $ne: user._id },
        availability: true,
        _id: { $not: { $in: recommendations.map(r => r._id) } }
      })
        .limit(6 - recommendations.length)
        .populate('ownerId', 'name rating profileImage department');

      recommendations = [...recommendations, ...extraResources];
    }

    res.status(200).json({ success: true, recommendations });
  } catch (error) {
    console.error('Get Recommendations Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  toggleWishlist,
  getWishlist,
  getRecommendations,
};
