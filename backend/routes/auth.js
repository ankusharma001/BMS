const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// ── Public routes (no auth required) ─────────────────────────

// POST /api/auth/signup
router.post(
    '/signup',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('full_name').notEmpty().trim().withMessage('Full name required')
    ],
    validate,
    authController.signup
);

// POST /api/auth/login
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('password').notEmpty().withMessage('Password required')
    ],
    validate,
    authController.login
);

// POST /api/auth/refresh — silent token renewal
router.post('/refresh', authController.refresh);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// POST /api/auth/forgot-password — send verification code
router.post(
    '/forgot-password',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email required')
    ],
    validate,
    authController.forgotPassword
);

// POST /api/auth/verify-reset-code — verify the code
router.post(
    '/verify-reset-code',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('code').notEmpty().withMessage('Verification code required')
    ],
    validate,
    authController.verifyResetCode
);

// POST /api/auth/reset-password — set new password
router.post(
    '/reset-password',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('code').notEmpty().withMessage('Verification code required'),
        body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    validate,
    authController.resetPassword
);

// ── Protected routes (auth required) ─────────────────────────

// GET /api/auth/me — get current user
router.get('/me', authMiddleware, authController.getMe);

// PUT /api/auth/profile — update profile
router.put(
    '/profile',
    authMiddleware,
    [
        body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
        body('phone').optional().trim(),
        body('address').optional().trim()
    ],
    validate,
    authController.updateProfile
);

// PUT /api/auth/change-password
router.put(
    '/change-password',
    authMiddleware,
    [
        body('currentPassword').notEmpty().withMessage('Current password required'),
        body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
    ],
    validate,
    authController.changePassword
);

module.exports = router;
