const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  toggleWishlist,
  getWishlist,
  getRecommendations,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');

router.get('/', getResources);
router.get('/recommendations/all', protect, getRecommendations);
router.get('/wishlist/all', protect, getWishlist);
router.get('/:id', getResourceById);
router.post('/', protect, createResource);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);
router.post('/:id/wishlist', protect, toggleWishlist);

module.exports = router;
