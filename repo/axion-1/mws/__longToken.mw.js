/**
 * Long Token validation middleware
 * @param {Object} params - Middleware parameters
 * @param {Object} params.meta - Metadata configuration
 * @param {Object} params.config - Configuration options
 * @param {Object} params.managers - Manager instances
 */
module.exports = ({ meta, config, managers }) => {
    /**
     * Validate long-lived tokens
     * @param {Object} params - Request parameters
     * @param {Object} params.req - Express request object
     * @param {Object} params.res - Express response object
     * @param {Function} params.next - Next middleware function
     */
    return async ({ req, res, next }) => {
        try {
            // Validate managers existence
            if (!managers?.token || !managers?.responseDispatcher) {
                const error = new Error('Required managers not initialized');
                console.error(error.message);
                return handleError(res, managers, {
                    ok: false,
                    code: 500,
                    errors: 'Internal server configuration error'
                });
            }

            // Extract token from headers
            const token = extractToken(req);
            if (!token) {
                console.log('Token not found in request headers');
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 401,
                    errors: 'Authentication token is required'
                });
            }

            // Verify token
            const decoded = await verifyToken(managers.token, token);
            if (!decoded) {
                console.log('Token verification failed');
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 401,
                    errors: 'Invalid or expired token'
                });
            }

            // Add token info to request
            req.decodedToken = decoded;
            req.tokenInfo = {
                verified: true,
                timestamp: new Date().toISOString(),
                type: 'long-lived'
            };

            return next(decoded);

        } catch (error) {
            console.error('Token verification error:', error);
            return handleError(res, managers, {
                ok: false,
                code: 401,
                errors: 'Token validation failed'
            });
        }
    };
};

/**
 * Extract token from request headers
 * @param {Object} req - Express request object
 * @returns {string|null} Extracted token or null
 */
function extractToken(req) {
    if (!req?.headers) return null;
    
    return (
        req.headers.authorization?.replace('Bearer ', '') ||
        req.headers.token ||
        req.headers['x-access-token']
    );
}

/**
 * Verify token using token manager
 * @param {Object} tokenManager - Token manager instance
 * @param {string} token - Token to verify
 * @returns {Object|null} Decoded token or null
 */
async function verifyToken(tokenManager, token) {
    try {
        return await tokenManager.verifyLongToken({ token });
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

/**
 * Handle error responses
 * @param {Object} res - Express response object
 * @param {Object} managers - Manager instances
 * @param {Object} errorData - Error response data
 */
function handleError(res, managers, errorData) {
    return managers?.responseDispatcher?.dispatch(res, errorData) || 
           res.status(errorData.code).json(errorData);
}

/**
 * Example usage:
 * const longTokenMiddleware = require('./__longToken.mw.js');
 * app.use(longTokenMiddleware({ 
 *   meta: {}, 
 *   config: {}, 
 *   managers: {
 *     token: tokenManager,
 *     responseDispatcher: responseDispatcher
 *   }
 * }));
 */
