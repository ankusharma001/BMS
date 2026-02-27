import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import RatingStars from '../components/RatingStars'
import QuantityStepper from '../components/QuantityStepper'

const FALLBACK = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80'

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addItem } = useCart()
    const { user, isLoggedIn } = useAuth()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [qty, setQty] = useState(1)
    const [toast, setToast] = useState('')

    // Reviews state
    const [reviews, setReviews] = useState([])
    const [reviewsEnabled, setReviewsEnabled] = useState(true)
    const [averageRating, setAverageRating] = useState(0)
    const [totalReviews, setTotalReviews] = useState(0)
    const [reviewsLoading, setReviewsLoading] = useState(true)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
    const [reviewError, setReviewError] = useState('')
    const [reviewSubmitting, setReviewSubmitting] = useState(false)
    const [userReview, setUserReview] = useState(null)

    useEffect(() => {
        api.get(`/products/${id}`)
            .then(r => setProduct(r.data.product))
            .catch(() => navigate('/products', { replace: true }))
            .finally(() => setLoading(false))
    }, [id, navigate])

    // Load reviews
    useEffect(() => {
        if (!id) return
        setReviewsLoading(true)
        api.get(`/reviews/${id}`)
            .then(r => {
                setReviews(r.data.reviews || [])
                setAverageRating(r.data.averageRating || 0)
                setTotalReviews(r.data.totalReviews || 0)
                setReviewsEnabled(r.data.reviewsEnabled !== false)
            })
            .catch(() => { })
            .finally(() => setReviewsLoading(false))
    }, [id])

    // Check if user already reviewed
    useEffect(() => {
        if (!id || !isLoggedIn) return
        api.get(`/reviews/check/${id}`)
            .then(r => {
                if (r.data.hasReviewed && r.data.review) {
                    setUserReview(r.data.review)
                    setReviewForm({
                        rating: r.data.review.rating,
                        title: r.data.review.title || '',
                        comment: r.data.review.comment || ''
                    })
                }
            })
            .catch(() => { })
    }, [id, isLoggedIn])

    const handleAdd = () => {
        addItem(product, qty)
        setToast(`Added ${qty} × ${product.name} to cart!`)
        setTimeout(() => setToast(''), 3000)
    }

    const handleReviewSubmit = async (e) => {
        e.preventDefault()
        setReviewError('')
        if (!reviewForm.rating) { setReviewError('Please select a rating.'); return }

        setReviewSubmitting(true)
        try {
            await api.post(`/reviews/${id}`, reviewForm)
            setToast(userReview ? 'Review updated!' : 'Review submitted!')
            setTimeout(() => setToast(''), 3000)
            setShowReviewForm(false)

            // Reload reviews
            const r = await api.get(`/reviews/${id}`)
            setReviews(r.data.reviews || [])
            setAverageRating(r.data.averageRating || 0)
            setTotalReviews(r.data.totalReviews || 0)

            // Re-check user review
            const check = await api.get(`/reviews/check/${id}`)
            if (check.data.hasReviewed) setUserReview(check.data.review)
        } catch (err) {
            setReviewError(err.response?.data?.error || 'Failed to submit review.')
        }
        setReviewSubmitting(false)
    }

    const handleDeleteReview = async () => {
        if (!userReview) return
        try {
            await api.delete(`/reviews/${userReview.id}`)
            setUserReview(null)
            setReviewForm({ rating: 5, title: '', comment: '' })
            setToast('Review deleted.')
            setTimeout(() => setToast(''), 3000)

            const r = await api.get(`/reviews/${id}`)
            setReviews(r.data.reviews || [])
            setAverageRating(r.data.averageRating || 0)
            setTotalReviews(r.data.totalReviews || 0)
        } catch { }
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
                <div className="skeleton aspect-square rounded-3xl" />
                <div className="space-y-4">
                    <div className="skeleton h-8 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-20 w-full" />
                    <div className="skeleton h-12 w-1/3" />
                </div>
            </div>
        )
    }

    if (!product) return null

    const isOutOfStock = product.stock === 0

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Toast */}
            {toast && (
                <div className="fixed top-20 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-2xl shadow-warm-lg animate-fade-in flex items-center gap-2">
                    <span>✓</span> {toast}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* Image */}
                <div className="rounded-3xl overflow-hidden shadow-warm-lg aspect-square bg-cream-100">
                    <img
                        src={product.image_url || FALLBACK}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = FALLBACK }}
                    />
                </div>

                {/* Info */}
                <div className="animate-fade-in">
                    {/* Category & Subcategory badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {product.categories?.name && (
                            <span className="badge badge-brown">{product.categories.name}</span>
                        )}
                        {product.subcategory_name && (
                            <span className="badge badge-blue">{product.subcategory_name}</span>
                        )}
                    </div>

                    <h1 className="font-display text-4xl font-bold text-brown-800 mb-3">{product.name}</h1>

                    <div className="flex items-center gap-3">
                        <RatingStars rating={averageRating || product.rating} size="md" />
                        {totalReviews > 0 && (
                            <span className="text-brown-400 text-sm">({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
                        )}
                    </div>

                    <div className="flex items-baseline gap-3 mt-4 mb-6">
                        <span className="font-display text-4xl font-bold text-brown-700">
                            ₹{parseFloat(product.price).toFixed(0)}
                        </span>
                    </div>

                    <p className="text-brown-500 leading-relaxed mb-6">{product.description}</p>

                    {/* Stock */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className={`w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-red-400' : 'bg-green-400'}`} />
                        <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                            {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock} left)`}
                        </span>
                    </div>

                    {/* Qty + Add */}
                    {!isOutOfStock && (
                        <div className="flex items-center gap-4 mb-8">
                            <QuantityStepper value={qty} onChange={setQty} min={1} max={product.stock} />
                            <button onClick={handleAdd} className="btn-primary flex-1">
                                🛒 Add to Cart
                            </button>
                        </div>
                    )}

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-3">
                        {[['🚚', 'Free delivery', 'Over ₹500'], ['✨', 'Pure', 'No preservatives'], ['📦', 'Gift ready', 'Beautiful packaging']].map(([icon, title, sub]) => (
                            <div key={title} className="bg-cream-50 rounded-2xl p-4 text-center">
                                <div className="text-2xl mb-1">{icon}</div>
                                <p className="text-xs font-semibold text-brown-700">{title}</p>
                                <p className="text-xs text-brown-400">{sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* Reviews Section                                */}
            {/* ═══════════════════════════════════════════════ */}
            {reviewsEnabled && (
                <div className="mt-16">
                    <div className="border-t border-cream-200 pt-12">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="font-display text-2xl font-bold text-brown-800">Customer Reviews</h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <RatingStars rating={averageRating} size="lg" />
                                    <span className="text-brown-500 font-medium">
                                        {averageRating > 0 ? `${averageRating} out of 5` : 'No reviews yet'}
                                    </span>
                                    <span className="text-brown-400 text-sm">
                                        ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                                    </span>
                                </div>
                            </div>
                            {isLoggedIn && (
                                <button
                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    {userReview ? '✏️ Edit Your Review' : '⭐ Write a Review'}
                                </button>
                            )}
                        </div>

                        {/* Review Form */}
                        {showReviewForm && isLoggedIn && (
                            <div className="bg-cream-50 rounded-3xl p-6 mb-8 animate-fade-in border border-cream-200">
                                <h3 className="font-display text-lg font-bold text-brown-800 mb-4">
                                    {userReview ? 'Update Your Review' : 'Write a Review'}
                                </h3>

                                {reviewError && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
                                        {reviewError}
                                    </div>
                                )}

                                <form onSubmit={handleReviewSubmit} className="space-y-4">
                                    {/* Star Rating Picker */}
                                    <div>
                                        <label className="block text-sm font-medium text-brown-700 mb-2">Your Rating *</label>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                                                    className={`text-3xl transition-all hover:scale-125 ${star <= reviewForm.rating ? 'text-amber-400' : 'text-cream-300'
                                                        }`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                            <span className="ml-3 text-sm text-brown-500 font-medium">
                                                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating]}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-brown-700 mb-1.5">Review Title (optional)</label>
                                        <input
                                            value={reviewForm.title}
                                            onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                                            className="input" placeholder="Sum up your experience…"
                                            maxLength={100}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-brown-700 mb-1.5">Your Review (optional)</label>
                                        <textarea
                                            value={reviewForm.comment}
                                            onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                                            rows={3}
                                            className="input resize-none"
                                            placeholder="Tell others what you think about this product…"
                                            maxLength={1000}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setShowReviewForm(false)}
                                            className="btn-secondary flex-1">
                                            Cancel
                                        </button>
                                        {userReview && (
                                            <button type="button" onClick={handleDeleteReview}
                                                className="px-4 py-3 rounded-full border-2 border-red-300 text-red-500 hover:bg-red-50 font-semibold text-sm transition-colors">
                                                🗑️ Delete
                                            </button>
                                        )}
                                        <button type="submit" disabled={reviewSubmitting}
                                            className="btn-primary flex-1 disabled:opacity-60 flex items-center justify-center gap-2">
                                            {reviewSubmitting ? (
                                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
                                            ) : userReview ? 'Update Review' : 'Submit Review'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Login prompt */}
                        {!isLoggedIn && (
                            <div className="bg-cream-50 rounded-2xl p-6 text-center mb-8 border border-cream-200">
                                <p className="text-brown-500 mb-3">Log in to share your review</p>
                                <button onClick={() => navigate('/login', { state: { from: `/products/${id}` } })}
                                    className="btn-primary">
                                    Sign In to Review
                                </button>
                            </div>
                        )}

                        {/* Rating Breakdown */}
                        {totalReviews > 0 && (
                            <div className="grid md:grid-cols-[280px_1fr] gap-8 mb-8">
                                <div className="bg-white rounded-2xl p-6 shadow-warm">
                                    <div className="text-center mb-4">
                                        <div className="font-display text-5xl font-bold text-brown-800">{averageRating}</div>
                                        <RatingStars rating={averageRating} size="lg" />
                                        <p className="text-sm text-brown-400 mt-1">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
                                    </div>
                                    {/* Rating distribution */}
                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map(star => {
                                            const count = reviews.filter(r => r.rating === star).length
                                            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                                            return (
                                                <div key={star} className="flex items-center gap-2 text-sm">
                                                    <span className="text-brown-500 w-3">{star}</span>
                                                    <span className="text-amber-400">★</span>
                                                    <div className="flex-1 h-2 bg-cream-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-amber-400 rounded-full transition-all"
                                                            style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-brown-400 w-6 text-right">{count}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Reviews List */}
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <div key={review.id} className="bg-white rounded-2xl p-5 shadow-warm">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-brown-600">
                                                        {review.user?.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-brown-800 text-sm">{review.user?.full_name || 'Anonymous'}</p>
                                                        <p className="text-xs text-brown-400">
                                                            {new Date(review.created_at).toLocaleDateString('en-IN', {
                                                                day: 'numeric', month: 'short', year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <RatingStars rating={review.rating} size="sm" />
                                            </div>
                                            {review.title && (
                                                <h4 className="font-semibold text-brown-800 mb-1">{review.title}</h4>
                                            )}
                                            {review.comment && (
                                                <p className="text-brown-500 text-sm leading-relaxed">{review.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {totalReviews === 0 && !reviewsLoading && (
                            <div className="text-center py-12 text-brown-400">
                                <div className="text-5xl mb-3">⭐</div>
                                <p className="text-lg font-medium text-brown-500">No reviews yet</p>
                                <p className="text-sm mt-1">Be the first to share your experience!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
