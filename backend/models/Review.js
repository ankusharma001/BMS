const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ''
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ''
    },
    is_approved: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Ensure one review per user per product
reviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
