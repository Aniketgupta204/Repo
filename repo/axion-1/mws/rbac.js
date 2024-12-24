// middleware/rbac.js
const { ROLE_PERMISSIONS } = require('../config/roles');
const ResponseHandler = require('../utils/responseHandler');

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const userRole = req.user.role;
            const permissions = ROLE_PERMISSIONS[userRole];

            if (!permissions) {
                throw new Error('Invalid role');
            }

            if (permissions.includes('*') || permissions.includes(requiredPermission)) {
                return next();
            }

            throw new Error('Permission denied');
        } catch (error) {
            return ResponseHandler.error(
                res, 
                'Access denied', 
                403, 
                [{ message: error.message }]
            );
        }
    };
};

module.exports = { checkPermission };
