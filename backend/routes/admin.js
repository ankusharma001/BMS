const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const adminController = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// ── Products ──────────────────────────────────────────────
router.get('/products', adminController.getAllProducts);

router.post(
    '/products',
    [
        body('name').notEmpty().trim().withMessage('Product name required'),
        body('price').isFloat({ min: 0.01 }).withMessage('Valid price required'),
        body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity required'),
        body('category_id').notEmpty().withMessage('Category required')
    ],
    validate,
    adminController.createProduct
);

router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// ── Categories ────────────────────────────────────────────
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// ── Subcategories ─────────────────────────────────────────
router.post('/categories/:id/subcategories', adminController.addSubcategory);
router.delete('/categories/:id/subcategories/:subId', adminController.removeSubcategory);

// ── Orders ────────────────────────────────────────────────
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// ── Users ─────────────────────────────────────────────────
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);

// ── Inventory Logs ────────────────────────────────────────
router.get('/inventory-logs', adminController.getInventoryLogs);

// ── Payments ──────────────────────────────────────────────
router.get('/payments', adminController.getAllPayments);

// ── Reports ───────────────────────────────────────────────
router.get('/reports/sales-summary', adminController.getSalesSummary);
router.get('/reports/top-products', adminController.getTopProducts);
router.get('/reports/low-stock', adminController.getLowStock);

// ── Reviews ───────────────────────────────────────────────
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:id', adminController.deleteReview);
router.put('/reviews/:id/toggle', adminController.toggleReviewApproval);

// ── Settings ──────────────────────────────────────────────
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSetting);

module.exports = router;
