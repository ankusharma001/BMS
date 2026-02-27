const Product = require('../models/Product');
const Category = require('../models/Category');

// GET /api/products
const getProducts = async (req, res) => {
    try {
        const { category, subcategory, search, sort = 'created_at', order = 'desc', page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { is_active: true };

        // Category filter (by name or id)
        if (category) {
            let cat = null;
            // Try by ObjectId first
            if (category.match(/^[0-9a-fA-F]{24}$/)) {
                cat = await Category.findById(category);
            }
            if (!cat) {
                cat = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
            }
            if (cat) {
                filter.category_id = cat._id;

                // Subcategory filter
                if (subcategory) {
                    const sub = cat.subcategories.find(s =>
                        s._id.toString() === subcategory ||
                        s.name.toLowerCase() === subcategory.toLowerCase()
                    );
                    if (sub) filter.subcategory_id = sub._id.toString();
                }
            }
        }

        // Search filter
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('category_id', 'id name subcategories')
                .sort(sortObj)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Product.countDocuments(filter)
        ]);

        // Map to match frontend expected shape (categories field)
        const mapped = products.map(p => {
            const cat = p.category_id;
            let subcategoryName = null;
            if (cat && p.subcategory_id && cat.subcategories) {
                const sub = cat.subcategories.find(s => s._id.toString() === p.subcategory_id);
                subcategoryName = sub ? sub.name : null;
            }
            return {
                ...p,
                id: p._id,
                categories: cat ? { id: cat._id, name: cat.name, subcategories: cat.subcategories } : null,
                subcategory_name: subcategoryName
            };
        });

        res.json({
            products: mapped,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ error: 'Failed to fetch products.' });
    }
};

// GET /api/products/categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 }).lean();
        const mapped = categories.map(c => ({ ...c, id: c._id }));
        res.json({ categories: mapped });
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: 'Failed to fetch categories.' });
    }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const product = await Product.findOne({ _id: id, is_active: true })
            .populate('category_id', 'id name subcategories')
            .lean();

        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const cat = product.category_id;
        let subcategoryName = null;
        if (cat && product.subcategory_id && cat.subcategories) {
            const sub = cat.subcategories.find(s => s._id.toString() === product.subcategory_id);
            subcategoryName = sub ? sub.name : null;
        }

        const mapped = {
            ...product,
            id: product._id,
            categories: cat ? { id: cat._id, name: cat.name, subcategories: cat.subcategories } : null,
            subcategory_name: subcategoryName
        };

        res.json({ product: mapped });
    } catch (err) {
        console.error('Get product error:', err);
        res.status(500).json({ error: 'Failed to fetch product.' });
    }
};

module.exports = { getProducts, getCategories, getProduct };
