/**
 * Token validation middleware
 * @param {Object} params - Middleware configuration
 * @param {Object} params.meta - Metadata configuration
 * @param {Object} params.config - Configuration options
 * @param {Object} params.managers - Manager instances
 */
module.exports = ({ meta, config, managers }) => {
    /**
     * Validate authentication tokens
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
                    message: 'Internal server configuration error'
                });
            }

            // Extract and validate token
            const token = extractToken(req);
            if (!token) {
                console.log('Token required but not found');
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 401,
                    message: 'Authentication token is required'
                });
            }

            // Verify token
            const tokenValidation = await verifyToken(managers.token, token);
            if (!tokenValidation.success) {
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: 401,
                    message: tokenValidation.message
                });
            }

            // Add token information to request
            attachTokenInfo(req, tokenValidation.decoded);

            return next(tokenValidation.decoded);

        } catch (error) {
            console.error('Token middleware error:', error);
            return handleError(res, managers, {
                ok: false,
                code: 500,
                message: 'Internal server error'
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

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return req.headers.token || req.headers['x-access-token'] || null;
}

/**
 * Verify token using token manager
 * @param {Object} tokenManager - Token manager instance
 * @param {string} token - Token to verify
 * @returns {Object} Verification result
 */
async function verifyToken(tokenManager, token) {
    try {
        const decoded = await tokenManager.verifyShortToken({ token });
        if (!decoded) {
            return {
                success: false,
                message: 'Invalid token'
            };
        }

        return {
            success: true,
            decoded,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Token verification error:', error);
        return {
            success: false,
            message: 'Token validation failed'
        };
    }
}

/**
 * Attach token information to request
 * @param {Object} req - Express request object
 * @param {Object} decoded - Decoded token data
 */
function attachTokenInfo(req, decoded) {
    req.decodedToken = decoded;
    req.tokenInfo = {
        verified: true,
        timestamp: new Date().toISOString(),
        type: 'bearer',
        metadata: {
            issuedAt: decoded.iat,
            expiresAt: decoded.exp,
            issuer: decoded.iss || 'unknown'
        }
    };
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
 * const tokenMiddleware = require('./__token.mw.js');
 * app.use(tokenMiddleware({ 
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
 *     iat: 1673987654,
 *     exp: 1673991254,
 *     iss: "auth-service"
 *   },
 *   tokenInfo: {
 *     verified: true,
 *     timestamp: "2024-01-17T12:34:56.789Z",
 *     type: "bearer",
 *     metadata: {
 *       issuedAt: 1673987654,
 *       expiresAt: 1673991254,
 *       issuer: "auth-service"
 *     }
 *   }
 * }
 */
