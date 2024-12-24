// routes/api.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const AuthService = require('../services/auth.service');
const ResponseHandler = require('../utils/responseHandler');
const { PERMISSIONS } = require('../config/roles');

// Auth routes
router.post('/auth/register', async (req, res) => {
    try {
        const { user, token } = await AuthService.register(req.body);
        ResponseHandler.success(res, { user, token }, 'User registered successfully', 201);
    } catch (error) {
        ResponseHandler.error(res, 'Registration failed', 400, [{ message: error.message }]);
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await AuthService.login(email, password);
        ResponseHandler.success(res, { user, token }, 'Logged in successfully');
    } catch (error) {
        ResponseHandler.error(res, 'Login failed', 400, [{ message: error.message }]);
    }
});

router.post('/auth/logout', auth, async (req, res) => {
    try {
        await AuthService.logout(req.user, req.token);
        ResponseHandler.success(res, null, 'Logged out successfully');
    } catch (error) {
        ResponseHandler.error(res, 'Logout failed', 500, [{ message: error.message }]);
    }
});

router.post('/auth/change-password', auth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        await AuthService.changePassword(req.user, oldPassword, newPassword);
        ResponseHandler.success(res, null, 'Password changed successfully');
    } catch (error) {
        ResponseHandler.error(res, 'Password change failed', 400, [{ message: error.message }]);
    }
});

// Protected route example
router.get('/dashboard', 
    auth, 
    checkPermission(PERMISSIONS.VIEW_DASHBOARD),
    (req, res) => {
        ResponseHandler.success(res, { user: req.user }, 'Dashboard data retrieved');
    }
);

module.exports = router;
