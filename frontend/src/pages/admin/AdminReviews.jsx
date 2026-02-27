import { useEffect, useState } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import api from '../../services/api'

export default function AdminReviews() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState('')
    const [reviewsEnabled, setReviewsEnabled] = useState(true)
    const [settingsLoading, setSettingsLoading] = useState(false)

    const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    const load = async () => {
        setLoading(true)
        try {
            const [reviewsRes, settingsRes] = await Promise.all([
                api.get('/admin/reviews'),
                api.get('/admin/settings')
            ])
            setReviews(reviewsRes.data.reviews || [])
            setReviewsEnabled(settingsRes.data.settings?.reviews_enabled !== false)
        } catch { }
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const handleToggleReview = async (id) => {
        try {
            const res = await api.put(`/admin/reviews/${id}/toggle`)
            showToast(res.data.message)
            load()
        } catch { }
    }

    const handleDeleteReview = async (id) => {
        if (!confirm('Delete this review permanently?')) return
        try {
            await api.delete(`/admin/reviews/${id}`)
            showToast('Review deleted.')
            load()
        } catch { }
    }

    const handleToggleReviewsFeature = async () => {
        setSettingsLoading(true)
        try {
            const newVal = !reviewsEnabled
            await api.put('/admin/settings', { key: 'reviews_enabled', value: newVal })
            setReviewsEnabled(newVal)
            showToast(newVal ? 'Reviews enabled!' : 'Reviews disabled!')
        } catch { }
        setSettingsLoading(false)
    }

    const renderStars = (rating) => {
        return [1, 2, 3, 4, 5].map(i => (
            <span key={i} className={`${i <= rating ? 'text-amber-400' : 'text-cream-200'}`}>★</span>
        ))
    }

    return (
        <div className="flex min-h-screen bg-cream-50">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-8">

                {/* Toast */}
                {toast && (
                    <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-2xl shadow-warm-lg animate-fade-in">
                        ✓ {toast}
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-brown-800">Reviews & Ratings</h1>
                        <p className="text-brown-400 mt-1">{reviews.length} total reviews</p>
                    </div>

                    {/* Master Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-warm">
                            <span className="text-sm font-medium text-brown-700">
                                {reviewsEnabled ? '✅ Reviews Enabled' : '❌ Reviews Disabled'}
                            </span>
                            <button
                                onClick={handleToggleReviewsFeature}
                                disabled={settingsLoading}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${reviewsEnabled ? 'bg-green-400' : 'bg-cream-300'
                                    }`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${reviewsEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>

                {!reviewsEnabled && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-2xl mb-6 flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-semibold">Reviews are currently disabled</p>
                            <p className="text-sm text-amber-600">Customers cannot see or submit reviews. Toggle the switch above to enable.</p>
                        </div>
                    </div>
                )}

                {/* Reviews Table */}
                {loading ? (
                    <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-warm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-cream-50 border-b border-cream-200">
                                    <th className="text-left px-5 py-4 text-sm font-semibold text-brown-600">Customer</th>
                                    <th className="text-left px-4 py-4 text-sm font-semibold text-brown-600">Product</th>
                                    <th className="text-left px-4 py-4 text-sm font-semibold text-brown-600">Rating</th>
                                    <th className="text-left px-4 py-4 text-sm font-semibold text-brown-600">Review</th>
                                    <th className="text-left px-4 py-4 text-sm font-semibold text-brown-600">Status</th>
                                    <th className="text-right px-5 py-4 text-sm font-semibold text-brown-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cream-100">
                                {reviews.map(r => (
                                    <tr key={r.id} className="hover:bg-cream-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center text-xs font-bold text-brown-600">
                                                    {r.user?.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-brown-800">{r.user?.full_name || 'Unknown'}</p>
                                                    <p className="text-xs text-brown-400">{r.user?.email || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm font-medium text-brown-700">{r.product?.name || 'Deleted'}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1 text-sm">
                                                {renderStars(r.rating)}
                                                <span className="text-brown-500 ml-1 font-medium">{r.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 max-w-[250px]">
                                            {r.title && <p className="text-sm font-semibold text-brown-700 truncate">{r.title}</p>}
                                            <p className="text-xs text-brown-400 truncate">{r.comment || '—'}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`badge ${r.is_approved ? 'badge-green' : 'badge-red'}`}>
                                                {r.is_approved ? 'Visible' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleToggleReview(r.id)}
                                                    title={r.is_approved ? 'Hide review' : 'Show review'}
                                                    className="p-2 text-brown-400 hover:text-brown-700 hover:bg-cream-100 rounded-lg transition-colors">
                                                    {r.is_approved ? '🙈' : '👁️'}
                                                </button>
                                                <button onClick={() => handleDeleteReview(r.id)}
                                                    title="Delete review"
                                                    className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {reviews.length === 0 && (
                            <div className="text-center py-16 text-brown-400">
                                <div className="text-4xl mb-3">⭐</div>
                                <p>No reviews yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
