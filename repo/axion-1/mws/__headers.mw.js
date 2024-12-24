/**
 * Headers middleware for processing request headers
 * @param {Object} params - Middleware parameters
 * @param {Object} params.meta - Metadata configuration
 * @param {Object} params.config - Configuration options
 * @param {Object} params.managers - Manager instances
 */
module.exports = ({ meta, config, managers }) => {
    /**
     * Process request headers
     * @param {Object} params - Request parameters
     * @param {Object} params.req - Express request object
     * @param {Object} params.res - Express response object
     * @param {Function} params.next - Next middleware function
     */
    return ({ req, res, next }) => {
        try {
            // Validate request and headers
            if (!req) {
                throw new Error('Request object is missing');
            }

            // Initialize headers response object
            const headerResponse = {
                success: true,
                timestamp: new Date().toISOString(),
                originalHeaders: {},
                processedHeaders: {},
                metadata: {
                    count: 0,
                    requestMethod: req.method || 'UNKNOWN',
                    requestPath: req.path || req.url || 'UNKNOWN',
                    clientIp: req.ip || req.connection.remoteAddress || 'UNKNOWN'
                }
            };

            // Process headers if they exist
            if (req.headers) {
                // Store original headers
                headerResponse.originalHeaders = { ...req.headers };
                
                // Process and normalize headers
                const normalizedHeaders = normalizeHeaders(req.headers);
                headerResponse.processedHeaders = normalizedHeaders;
                headerResponse.metadata.count = Object.keys(normalizedHeaders).length;
            } else {
                headerResponse.success = false;
                headerResponse.message = 'No headers found in request';
            }

            // Store processed headers in request object for later use
            req.processedHeaders = headerResponse;

            return next(headerResponse);

        } catch (error) {
            console.error('Headers middleware error:', error);
            
            // Return error response
            return next({
                success: false,
                error: error.message || 'Error processing headers',
                timestamp: new Date().toISOString()
            });
        }
    };
};

/**
 * Normalize and clean headers
 * @param {Object} headers - Raw headers object
 * @returns {Object} Normalized headers
 */
function normalizeHeaders(headers) {
    const normalized = {};

    try {
        Object.entries(headers).forEach(([key, value]) => {
            // Convert header keys to lowercase
            const normalizedKey = key.toLowerCase();

            // Handle different value types
            let normalizedValue = value;
            if (Array.isArray(value)) {
                normalizedValue = value.map(item => String(item).trim());
            } else if (value !== undefined && value !== null) {
                normalizedValue = String(value).trim();
            } else {
                normalizedValue = '';
            }

            // Only add non-empty values
            if (normalizedValue !== '') {
                normalized[normalizedKey] = normalizedValue;
            }
        });
    } catch (error) {
        console.error('Error normalizing headers:', error);
    }

    return normalized;
}

/**
 * Example usage:
 * const headerMiddleware = require('./__headers.mw.js');
 * app.use(headerMiddleware({ meta: {}, config: {}, managers: {} }));
 * 
 * Example response:
 * {
 *   success: true,
 *   timestamp: "2024-01-17T12:34:56.789Z",
 *   originalHeaders: {
 *     "Content-Type": "application/json",
 *     "User-Agent": "Mozilla/5.0..."
 *   },
 *   processedHeaders: {
 *     "content-type": "application/json",
 *     "user-agent": "Mozilla/5.0..."
 *   },
 *   metadata: {
 *     count: 2,
 *     requestMethod: "GET",
 *     requestPath: "/api/resource",
 *     clientIp: "127.0.0.1"
 *   }
 * }
 */
