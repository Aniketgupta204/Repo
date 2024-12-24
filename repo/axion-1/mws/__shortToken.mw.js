/**
 * Short Token validation middleware
 * @param {Object} params - Middleware configuration
 * @param {Object} params.meta - Metadata configuration
 * @param {Object} params.config - Configuration options
 * @param {Object} params.managers - Manager instances
 */
module.exports = ({ meta, config, managers }) => {
    /**
     * Validate short-lived tokens
     * @param {Object} params - Request parameters
     * @param {Object} params.req - Express request object
     * @param {Object} params.res - Express response object
     * @param {Function} params.next - Next middleware function
     */
    return async ({ req, res, next }) => {
        try {
            // Validate managers
            if (!managers?.token || !managers?.responseDispatcher) {
                console.error('Required managers not initialized');
                return handleError(res, managers, {
                    ok: false,
                    code: 500,
                    errors: 'Internal server configuration error'
                });
            }

            // Extract token
            const token = extractToken(req);
            if (!token) {
                console.log('Token required but not found');
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 401,
                    errors: 'Authentication token required'
                });
            }

            // Verify token
            let decoded = null;
            try {
                decoded = await managers.token.verifyShortToken({ token });
                if (!decoded) {
                    console.log('Token verification failed');
                    return managers.responseDispatcher.dispatch(res, {
                        ok: false,
                        code: 401,
                        errors: 'Invalid token'
                    });
                }
            } catch (verifyError) {
                console.error('Token verification error:', verifyError);
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 401,
                    errors: 'Token validation failed'
                });
            }

            // Add token info to request
            req.decodedToken = decoded;
            req.tokenInfo = {
                verified: true,
                type: 'short-lived',
                timestamp: new Date().toISOString()
            };

            return next(decoded);

        } catch (error) {
            console.error('Short token middleware error:', error);
            return handleError(res, managers, {
                ok: false,
                code: 500,
                errors: 'Internal server error'
            });
        }
    };
};

/**
 * Extract token from request
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
 * Handle error response
 * @param {Object} res - Express response object
 * @param {Object} managers - Manager instances
 * @param {Object} errorData - Error response data
 */
function handleError(res, managers, errorData) {
    if (managers?.responseDispatcher) {
        return managers.responseDispatcher.dispatch(res, errorData);
    }
    return res.status(errorData.code).json(errorData);
}

/**
 * Example usage:
 * const shortTokenMiddleware = require('./__shortToken.mw.js');
 * app.use(shortTokenMiddleware({ 
 *   meta: {}, 
 *   config: {}, 
 *   managers: {
 *     token: tokenManager,
 *     responseDispatcher: responseDispatcher
 *   }
 * }));
 * 
 * Example successful response:
 * {
 *   ok: true,
 *   decoded: {
 *     userId: "123",
 *     exp: 1673987654
 *   },
 *   tokenInfo: {
 *     verified: true,
 *     type: "short-lived",
 *     timestamp: "2024-01-17T12:34:56.789Z"
 *   }
 * }
 */
