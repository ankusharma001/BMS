const Review = require('../models/Review');
const Product = require('../models/Product');
const Setting = require('../models/Setting');

// ── Helper: recalculate product rating ────────────────────
const recalcRating = async (productId) => {
    const stats = await Review.aggregate([
        { $match: { product_id: productId, is_approved: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const avg = stats[0]?.avg || 0;
    const count = stats[0]?.count || 0;
    await Product.findByIdAndUpdate(productId, {
        rating: Math.round(avg * 10) / 10,
        review_count: count
    });
};

// ── GET /api/reviews/:productId ─────────────────────────
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        // Check if reviews are enabled
        const setting = await Setting.findOne({ key: 'reviews_enabled' });
        const reviewsEnabled = setting ? setting.value : true;

        if (!reviewsEnabled) {
            return res.json({ reviews: [], averageRating: 0, totalReviews: 0, reviewsEnabled: false });
        }

        const reviews = await Review.find({ product_id: productId, is_approved: true })
            .sort({ created_at: -1 })
            .lean();

        // Populate user info
        const User = require('../models/User');
        for (const review of reviews) {
            review.id = review._id;
            const user = await User.findById(review.user_id).select('full_name avatar_url').lean();
            review.user = user ? { full_name: user.full_name, avatar_url: user.avatar_url } : { full_name: 'Anonymous' };
        }

        // Stats
        const stats = await Review.aggregate([
            { $match: { product_id: require('mongoose').Types.ObjectId.createFromHexString(productId), is_approved: true } },
            { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        res.json({
            reviews,
            averageRating: stats[0]?.avg ? Math.round(stats[0].avg * 10) / 10 : 0,
            totalReviews: stats[0]?.count || 0,
            reviewsEnabled: true
        });
    } catch (err) {
        console.error('Get reviews error:', err);
        res.status(500).json({ error: 'Failed to fetch reviews.' });
    }
};

// ── POST /api/reviews/:productId ────────────────────────
const createReview = async (req, res) => {
    try {
        // Check if reviews are enabled
        const setting = await Setting.findOne({ key: 'reviews_enabled' });
        const reviewsEnabled = setting ? setting.value : true;
        if (!reviewsEnabled) {
            return res.status(403).json({ error: 'Reviews are currently disabled.' });
        }

        const { productId } = req.params;
        const { rating, title, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        // Check if user already reviewed this product
        const existing = await Review.findOne({ product_id: productId, user_id: req.user.id });
        if (existing) {
            // Update existing review
            existing.rating = rating;
            existing.title = title || '';
            existing.comment = comment || '';
            await existing.save();
            await recalcRating(product._id);

            const result = existing.toObject();
            result.id = result._id;
            return res.json({ message: 'Review updated.', review: result });
        }

        // Create new review
        const review = await Review.create({
            product_id: productId,
            user_id: req.user.id,
            rating,
            title: title || '',
            comment: comment || ''
        });

        await recalcRating(product._id);

        const result = review.toObject();
        result.id = result._id;
        res.status(201).json({ message: 'Review submitted!', review: result });
    } catch (err) {
        console.error('Create review error:', err);
        if (err.code === 11000) {
            return res.status(400).json({ error: 'You have already reviewed this product.' });
        }
        res.status(500).json({ error: 'Failed to submit review.' });
    }
};

// ── DELETE /api/reviews/:reviewId ───────────────────────
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ error: 'Review not found.' });

        // Only the review author or admin can delete
        if (review.user_id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this review.' });
        }

        const productId = review.product_id;
        await Review.findByIdAndDelete(reviewId);
        await recalcRating(productId);

        res.json({ message: 'Review deleted.' });
    } catch (err) {
        console.error('Delete review error:', err);
        res.status(500).json({ error: 'Failed to delete review.' });
    }
};

// ── GET /api/reviews/check/:productId ───────────────────
// Check if current user already reviewed this product
const checkUserReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const review = await Review.findOne({ product_id: productId, user_id: req.user.id }).lean();
        res.json({ hasReviewed: !!review, review: review ? { ...review, id: review._id } : null });
    } catch (err) {
        res.status(500).json({ error: 'Failed to check review.' });
    }
};

module.exports = { getProductReviews, createReview, deleteReview, checkUserReview };
