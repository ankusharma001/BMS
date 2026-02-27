import { useEffect, useState } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import api from '../../services/api'

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', category_id: '', subcategory_id: '', image_url: '', is_active: true }

// ── Predefined bakery categories with subcategories ──
const DEFAULT_BAKERY_CATEGORIES = [
    {
        name: 'Cakes', description: 'Birthday, wedding, and celebration cakes',
        subcategories: [
            { name: 'Birthday Cakes' }, { name: 'Wedding Cakes' }, { name: 'Photo Cakes' },
            { name: 'Eggless Cakes' }, { name: 'Cheesecakes' }, { name: 'Pastry Cakes' }
        ]
    },
    {
        name: 'Cookies & Biscuits', description: 'Freshly baked cookies, biscuits, and rusks',
        subcategories: [
            { name: 'Butter Cookies' }, { name: 'Chocolate Chip Cookies' }, { name: 'Nan Khatai' },
            { name: 'Rusks' }, { name: 'Jeera Biscuits' }
        ]
    },
    {
        name: 'Pastries', description: 'Puffs, croissants, danishes, and tarts',
        subcategories: [
            { name: 'Puffs' }, { name: 'Croissants' }, { name: 'Danish Pastries' },
            { name: 'Fruit Tarts' }, { name: 'Éclairs' }
        ]
    },
    {
        name: 'Breads', description: 'Artisan breads, sandwich loaves, buns, and rolls',
        subcategories: [
            { name: 'White Bread' }, { name: 'Whole Wheat Bread' }, { name: 'Garlic Bread' },
            { name: 'Burger Buns' }, { name: 'Multigrain Bread' }
        ]
    },
    {
        name: 'Indian Sweets', description: 'Gulab jamun, rasgulla, barfi, laddu, and more',
        subcategories: [
            { name: 'Gulab Jamun' }, { name: 'Rasgulla' }, { name: 'Kaju Katli' },
            { name: 'Barfi' }, { name: 'Peda' }, { name: 'Halwa' }, { name: 'Jalebi' }
        ]
    },
    {
        name: 'Ladoo', description: 'Traditional Indian ladoo varieties',
        subcategories: [
            { name: 'Besan Ladoo' }, { name: 'Motichoor Ladoo' }, { name: 'Boondi Ladoo' },
            { name: 'Coconut Ladoo' }, { name: 'Rava Ladoo' }, { name: 'Churma Ladoo' },
            { name: 'Dry Fruit Ladoo' }, { name: 'Til Ladoo' }, { name: 'Pinni Ladoo' }
        ]
    },
    {
        name: 'Dry Fruits & Nuts', description: 'Premium dry fruits, roasted nuts, and trail mixes',
        subcategories: [
            { name: 'Almonds' }, { name: 'Cashews' }, { name: 'Pistachios' },
            { name: 'Walnuts' }, { name: 'Mixed Dry Fruits' }, { name: 'Trail Mix' }
        ]
    },
    {
        name: 'Chocolates', description: 'Handcrafted chocolates, truffles, and pralines',
        subcategories: [
            { name: 'Dark Chocolate' }, { name: 'Milk Chocolate' }, { name: 'Truffles' },
            { name: 'Pralines' }, { name: 'Chocolate Bars' }
        ]
    },
    {
        name: 'Ice Cream & Frozen', description: 'Ice creams, kulfis, popsicles, and frozen desserts',
        subcategories: [
            { name: 'Ice Cream Tubs' }, { name: 'Kulfi' }, { name: 'Popsicles' },
            { name: 'Frozen Desserts' }
        ]
    },
    {
        name: 'Beverages', description: 'Milkshakes, lassi, smoothies, and specialty drinks',
        subcategories: [
            { name: 'Milkshakes' }, { name: 'Lassi' }, { name: 'Smoothies' },
            { name: 'Cold Coffee' }, { name: 'Fresh Juices' }
        ]
    },
    {
        name: 'Cupcakes & Muffins', description: 'Gourmet cupcakes, muffins, and brownies',
        subcategories: [
            { name: 'Vanilla Cupcakes' }, { name: 'Chocolate Cupcakes' }, { name: 'Red Velvet Cupcakes' },
            { name: 'Blueberry Muffins' }, { name: 'Brownies' }
        ]
    },
    {
        name: 'Namkeen & Savoury', description: 'Namkeen, samosa, kachori, and savoury snacks',
        subcategories: [
            { name: 'Samosa' }, { name: 'Kachori' }, { name: 'Mixture' },
            { name: 'Mathri' }, { name: 'Chakli' }, { name: 'Sev' }
        ]
    },
    {
        name: 'Festival Specials', description: 'Diwali, Holi, Rakhi, and seasonal specials',
        subcategories: [
            { name: 'Diwali Specials' }, { name: 'Holi Specials' }, { name: 'Rakhi Specials' },
            { name: 'Christmas Specials' }, { name: 'Eid Specials' }
        ]
    },
    {
        name: 'Gift Boxes', description: 'Curated gift hampers and combo boxes',
        subcategories: [
            { name: 'Sweet Gift Box' }, { name: 'Dry Fruit Gift Box' }, { name: 'Mixed Hamper' },
            { name: 'Chocolate Gift Box' }, { name: 'Corporate Gifts' }
        ]
    },
]

export default function AdminProducts() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [toast, setToast] = useState('')

    // ── New-category modal state ──
    const [showCatModal, setShowCatModal] = useState(false)
    const [catForm, setCatForm] = useState({ name: '', description: '' })
    const [catSaving, setCatSaving] = useState(false)
    const [catError, setCatError] = useState('')
    const [seeding, setSeeding] = useState(false)

    // ── Subcategory management state ──
    const [showSubModal, setShowSubModal] = useState(false)
    const [subCatId, setSubCatId] = useState(null) // category id for subcategory management
    const [newSubName, setNewSubName] = useState('')
    const [subSaving, setSubSaving] = useState(false)

    const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    // ── Load data ─────────────────────────────────────────────
    const load = async () => {
        setLoading(true)
        try {
            const [p, c] = await Promise.all([
                api.get('/admin/products'),
                api.get('/admin/categories')
            ])
            setProducts(p.data.products || [])
            const cats = c.data.categories || []
            setCategories(cats)

            // Auto-seed default bakery categories if the table is empty
            if (cats.length === 0) {
                await seedDefaultCategories()
            }
        } catch { }
        setLoading(false)
    }

    // ── Seed predefined categories ────────────────────────────
    const seedDefaultCategories = async () => {
        setSeeding(true)
        try {
            // Create all default categories in parallel
            await Promise.all(
                DEFAULT_BAKERY_CATEGORIES.map(cat =>
                    api.post('/admin/categories', cat).catch(() => null)
                )
            )
            // Reload categories
            const res = await api.get('/admin/categories')
            setCategories(res.data.categories || [])
            showToast('🎉 Default bakery categories with subcategories added!')
        } catch {
            console.warn('Failed to seed default categories')
        }
        setSeeding(false)
    }

    useEffect(() => { load() }, [])

    // Get subcategories for the currently selected category
    const selectedCategory = categories.find(c => c.id === form.category_id || c._id === form.category_id)
    const subcategories = selectedCategory?.subcategories || []

    // ── Product modal handlers ────────────────────────────────
    const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setShowModal(true) }
    const openEdit = p => {
        setEditing(p)
        setForm({
            name: p.name,
            description: p.description || '',
            price: p.price,
            stock: p.stock,
            category_id: p.category_id?._id || p.category_id || '',
            subcategory_id: p.subcategory_id || '',
            image_url: p.image_url || '',
            is_active: p.is_active
        })
        setError('')
        setShowModal(true)
    }

    const handleSave = async e => {
        e.preventDefault()
        setError('')
        setSaving(true)
        try {
            if (editing) {
                await api.put(`/admin/products/${editing.id}`, form)
                showToast('Product updated!')
            } else {
                await api.post('/admin/products', form)
                showToast('Product created!')
            }
            setShowModal(false)
            load()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save product.')
        }
        setSaving(false)
    }

    const handleToggle = async (p) => {
        try {
            await api.put(`/admin/products/${p.id}`, { is_active: !p.is_active })
            showToast(p.is_active ? 'Product deactivated.' : 'Product activated!')
            load()
        } catch { }
    }

    const handleDelete = async (id) => {
        if (!confirm('Deactivate this product?')) return
        try {
            await api.delete(`/admin/products/${id}`)
            showToast('Product deactivated.')
            load()
        } catch { }
    }

    // ── Category dropdown change handler ──────────────────────
    const handleCategoryChange = (e) => {
        const val = e.target.value
        if (val === '__ADD_NEW__') {
            setCatForm({ name: '', description: '' })
            setCatError('')
            setShowCatModal(true)
        } else {
            setForm(f => ({ ...f, category_id: val, subcategory_id: '' }))
        }
    }

    // ── Save new category ─────────────────────────────────────
    const handleSaveCategory = async (e) => {
        e.preventDefault()
        setCatError('')
        if (!catForm.name.trim()) {
            setCatError('Category name is required.')
            return
        }
        setCatSaving(true)
        try {
            const res = await api.post('/admin/categories', {
                name: catForm.name.trim(),
                description: catForm.description.trim() || null
            })
            const newCat = res.data.category
            setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)))
            setForm(f => ({ ...f, category_id: newCat.id }))
            setShowCatModal(false)
            showToast(`Category "${newCat.name}" created!`)
        } catch (err) {
            setCatError(err.response?.data?.error || 'Failed to create category.')
        }
        setCatSaving(false)
    }

    // ── Subcategory management handlers ───────────────────────
    const openSubManager = (catId) => {
        setSubCatId(catId)
        setNewSubName('')
        setShowSubModal(true)
    }

    const handleAddSubcategory = async () => {
        if (!newSubName.trim()) return
        setSubSaving(true)
        try {
            const res = await api.post(`/admin/categories/${subCatId}/subcategories`, { name: newSubName.trim() })
            const updatedCat = res.data.category
            setCategories(prev => prev.map(c => c.id === updatedCat.id || c._id === updatedCat._id ? { ...updatedCat, id: updatedCat._id } : c))
            setNewSubName('')
            showToast('Subcategory added!')
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to add subcategory')
        }
        setSubSaving(false)
    }

    const handleRemoveSubcategory = async (subId) => {
        try {
            const res = await api.delete(`/admin/categories/${subCatId}/subcategories/${subId}`)
            const updatedCat = res.data.category
            setCategories(prev => prev.map(c => c.id === updatedCat.id || c._id === updatedCat._id ? { ...updatedCat, id: updatedCat._id } : c))
            showToast('Subcategory removed')
        } catch { }
    }

    const managedCategory = categories.find(c => c.id === subCatId || c._id === subCatId)

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

                {/* Seeding indicator */}
                {seeding && (
                    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-brown-500 text-white px-5 py-3 rounded-2xl shadow-warm-lg animate-fade-in flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Setting up bakery categories…
                    </div>
                )}

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-brown-800">Products</h1>
                        <p className="text-brown-400 mt-1">{products.length} total products</p>
                    </div>
                    <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                        <span>+</span> Add Product
                    </button>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-warm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-cream-50 border-b border-cream-200">
                                    <th className="text-left px-5 py-4 text-sm font-semibold text-brown-600">Product</th>
                                    <th className="text-left px-4 py-4 text-sm font-semibold text-brown-600">Category</th>
                                    <th className="text-left px-4 py-4 text-sm font-semibold text-brown-600">Price</th>
                                    <th className="text-left px-4 py-4 text-sm font-semibold text-brown-600">Stock</th>
                                    <th className="text-left px-4 py-4 text-sm font-semibold text-brown-600">Status</th>
                                    <th className="text-right px-5 py-4 text-sm font-semibold text-brown-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cream-100">
                                {products.map(p => (
                                    <tr key={p.id} className="hover:bg-cream-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {p.image_url ? (
                                                    <img src={p.image_url} alt={p.name}
                                                        className="w-10 h-10 rounded-xl object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-cream-200 flex items-center justify-center text-lg">🍰</div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-brown-800 text-sm">{p.name}</p>
                                                    <p className="text-xs text-brown-400 line-clamp-1 max-w-[200px]">{p.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="badge badge-brown text-xs">{p.categories?.name || '—'}</span>
                                                {p.subcategory_name && (
                                                    <span className="badge badge-blue text-xs">{p.subcategory_name}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-brown-700">₹{p.price}</td>
                                        <td className="px-4 py-4">
                                            <span className={`badge text-xs ${p.stock === 0 ? 'badge-red' : p.stock < 10 ? 'badge-yellow' : 'badge-green'}`}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button onClick={() => handleToggle(p)}
                                                className={`badge cursor-pointer ${p.is_active ? 'badge-green' : 'badge-red'}`}>
                                                {p.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(p)}
                                                    className="p-2 text-brown-400 hover:text-brown-700 hover:bg-cream-100 rounded-lg transition-colors">
                                                    ✏️
                                                </button>
                                                <button onClick={() => handleDelete(p.id)}
                                                    className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length === 0 && (
                            <div className="text-center py-16 text-brown-400">
                                <div className="text-4xl mb-3">🍰</div>
                                <p>No products yet. Add your first product!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ════════════════════════════════════════════════ */}
                {/* Product Create/Edit Modal                       */}
                {/* ════════════════════════════════════════════════ */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-warm-lg max-h-screen overflow-y-auto animate-fade-in">
                            <h2 className="font-display text-2xl font-bold text-brown-800 mb-6">
                                {editing ? 'Edit Product' : 'Add New Product'}
                            </h2>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>
                            )}

                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-brown-700 mb-1.5">Product Name *</label>
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        required className="input" placeholder="e.g. Kaju Katli" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brown-700 mb-1.5">Description</label>
                                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        rows={3} className="input resize-none" placeholder="Product description…" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-brown-700 mb-1.5">Price (₹) *</label>
                                        <input type="number" step="0.01" min="0" required
                                            value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                            className="input" placeholder="299" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-brown-700 mb-1.5">Stock *</label>
                                        <input type="number" min="0" required
                                            value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                                            className="input" placeholder="50" />
                                    </div>
                                </div>

                                {/* ── Category picker with "Add New" option ── */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-sm font-medium text-brown-700">Category *</label>
                                        {form.category_id && form.category_id !== '__ADD_NEW__' && (
                                            <button type="button"
                                                onClick={() => openSubManager(form.category_id)}
                                                className="text-xs text-brown-500 hover:text-brown-700 transition-colors">
                                                ⚙️ Manage Subcategories
                                            </button>
                                        )}
                                    </div>
                                    <select
                                        value={form.category_id}
                                        onChange={handleCategoryChange}
                                        required
                                        className="input"
                                    >
                                        <option value="">Select category…</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                        <option disabled>──────────────</option>
                                        <option value="__ADD_NEW__">＋ Add New Category…</option>
                                    </select>

                                    {form.category_id && form.category_id !== '__ADD_NEW__' && (
                                        <div className="mt-2 inline-flex items-center gap-1.5 bg-brown-50 text-brown-700 text-xs font-medium px-3 py-1.5 rounded-full border border-brown-200">
                                            🏷️ {categories.find(c => c.id === form.category_id)?.name || 'Selected'}
                                        </div>
                                    )}
                                </div>

                                {/* ── Subcategory picker ── */}
                                {subcategories.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-brown-700 mb-1.5">Subcategory</label>
                                        <select
                                            value={form.subcategory_id}
                                            onChange={e => setForm(f => ({ ...f, subcategory_id: e.target.value }))}
                                            className="input"
                                        >
                                            <option value="">No subcategory</option>
                                            {subcategories.map(s => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                        {form.subcategory_id && (
                                            <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-200">
                                                📂 {subcategories.find(s => s._id === form.subcategory_id)?.name || ''}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-brown-700 mb-1.5">Image URL</label>
                                    <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                                        className="input" placeholder="https://…" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="active" checked={form.is_active}
                                        onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                                        className="w-4 h-4 accent-brown-400" />
                                    <label htmlFor="active" className="text-sm font-medium text-brown-700">Active (visible to customers)</label>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                                    <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                                        {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════ */}
                {/* Add New Category Modal                          */}
                {/* ════════════════════════════════════════════════ */}
                {showCatModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowCatModal(false) }}>
                        <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-warm-lg animate-fade-in">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-xl">
                                    🏷️
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-bold text-brown-800">New Category</h3>
                                    <p className="text-xs text-brown-400">Add a custom category for your products</p>
                                </div>
                            </div>

                            {catError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
                                    <span>⚠️</span> {catError}
                                </div>
                            )}

                            <form onSubmit={handleSaveCategory} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-brown-700 mb-1.5">Category Name *</label>
                                    <input
                                        value={catForm.name}
                                        onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                                        required
                                        className="input"
                                        placeholder="e.g. Sugar‑Free Specials"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brown-700 mb-1.5">Description (optional)</label>
                                    <input
                                        value={catForm.description}
                                        onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
                                        className="input"
                                        placeholder="Short description of this category…"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button"
                                        onClick={() => setShowCatModal(false)}
                                        className="btn-secondary flex-1">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={catSaving}
                                        className="btn-primary flex-1 disabled:opacity-60 flex items-center justify-center gap-2">
                                        {catSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Creating…
                                            </>
                                        ) : 'Create Category'}
                                    </button>
                                </div>
                            </form>

                            {/* Quick-add existing default categories (if less than 3 exist) */}
                            {categories.length < 3 && (
                                <div className="mt-5 pt-4 border-t border-cream-200">
                                    <p className="text-xs text-brown-400 mb-2">Or quickly add all bakery defaults:</p>
                                    <button
                                        type="button"
                                        onClick={async () => { setShowCatModal(false); await seedDefaultCategories() }}
                                        className="text-sm text-brown-600 font-medium hover:text-brown-800 transition-colors flex items-center gap-1.5"
                                    >
                                        🍰 Add {DEFAULT_BAKERY_CATEGORIES.length} predefined bakery categories
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════ */}
                {/* Subcategory Manager Modal                       */}
                {/* ════════════════════════════════════════════════ */}
                {showSubModal && managedCategory && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowSubModal(false) }}>
                        <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-warm-lg animate-fade-in max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl">
                                    📂
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-bold text-brown-800">Subcategories</h3>
                                    <p className="text-xs text-brown-400">Manage subcategories for <strong>{managedCategory.name}</strong></p>
                                </div>
                            </div>

                            {/* Existing subcategories */}
                            <div className="space-y-2 mb-4">
                                {managedCategory.subcategories?.length > 0 ? (
                                    managedCategory.subcategories.map(sub => (
                                        <div key={sub._id} className="flex items-center justify-between bg-cream-50 rounded-xl px-4 py-2.5">
                                            <span className="text-sm font-medium text-brown-700">{sub.name}</span>
                                            <button
                                                onClick={() => handleRemoveSubcategory(sub._id)}
                                                className="text-red-400 hover:text-red-600 text-sm transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-brown-400 text-sm py-4">No subcategories yet</p>
                                )}
                            </div>

                            {/* Add new subcategory */}
                            <div className="flex gap-2">
                                <input
                                    value={newSubName}
                                    onChange={e => setNewSubName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubcategory() } }}
                                    className="input flex-1"
                                    placeholder="New subcategory name…"
                                />
                                <button
                                    onClick={handleAddSubcategory}
                                    disabled={subSaving || !newSubName.trim()}
                                    className="btn-primary px-4 disabled:opacity-60"
                                >
                                    {subSaving ? '…' : '+ Add'}
                                </button>
                            </div>

                            <div className="flex justify-end mt-5">
                                <button onClick={() => setShowSubModal(false)} className="btn-secondary">
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
