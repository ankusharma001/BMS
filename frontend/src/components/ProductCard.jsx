import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import RatingStars from './RatingStars'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80'

export default function ProductCard({ product }) {
    const { addItem, items } = useCart()

    const inCart = items.find(i => i.id === product.id)
    const isOutOfStock = product.stock === 0

    const handleAdd = (e) => {
        e.preventDefault()
        if (!isOutOfStock) addItem(product, 1)
    }

    return (
        <Link to={`/products/${product.id}`}
            className="group block bg-white rounded-2xl overflow-hidden shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1">

            {/* Image */}
            <div className="relative overflow-hidden aspect-square bg-cream-100">
                <img
                    src={product.image_url || FALLBACK_IMG}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = FALLBACK_IMG }}
                />
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-brown-700 text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
                    </div>
                )}
                {inCart && !isOutOfStock && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                        In Cart
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-brown-800 text-sm leading-tight line-clamp-1">{product.name}</h3>
                </div>
                {product.categories?.name && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        <span className="badge badge-brown text-xs">{product.categories.name}</span>
                        {product.subcategory_name && (
                            <span className="badge badge-blue text-xs">{product.subcategory_name}</span>
                        )}
                    </div>
                )}
                <p className="text-brown-400 text-xs line-clamp-2 mb-3">{product.description}</p>

                <RatingStars rating={product.rating} count={product.review_count} size="sm" />

                <div className="flex items-center justify-between mt-3">
                    <span className="text-brown-700 font-bold text-lg">₹{parseFloat(product.price).toFixed(0)}</span>
                    <button
                        onClick={handleAdd}
                        disabled={isOutOfStock}
                        className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full font-medium transition-all duration-200
              ${isOutOfStock
                                ? 'bg-cream-200 text-brown-300 cursor-not-allowed'
                                : 'bg-brown-400 hover:bg-brown-500 text-white active:scale-95 shadow-warm hover:shadow-warm-lg'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add
                    </button>
                </div>
            </div>
        </Link>
    )
}
