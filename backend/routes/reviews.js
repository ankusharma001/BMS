const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');

// Public: get all approved reviews for a product
router.get('/:productId', reviewController.getProductReviews);

// Protected: check if user already reviewed
router.get('/check/:productId', authMiddleware, reviewController.checkUserReview);

// Protected: submit or update review
router.post('/:productId', authMiddleware, reviewController.createReview);

// Protected: delete own review (or admin can delete any)
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);

module.exports = router;
