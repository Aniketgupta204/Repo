// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ResponseHandler = require('../utils/responseHandler');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return ResponseHandler.error(
                res, 
                'Authentication required', 
                401
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ 
            _id: decoded._id,
            'tokens.token': token,
            status: 'active'
        });

        if (!user) {
            throw new Error('User not found or inactive');
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        return ResponseHandler.error(
            res, 
            'Authentication failed', 
            401, 
            [{ message: error.message }]
        );
    }
};

module.exports = auth;
