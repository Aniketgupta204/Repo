/**
 * Device information middleware
 * @param {Object} params - Middleware configuration
 * @param {Object} params.meta - Metadata configuration
 * @param {Object} params.config - Configuration options
 * @param {Object} params.managers - Manager instances
 */
module.exports = ({ meta, config, managers }) => {
    /**
     * Process device information from request
     * @param {Object} params - Request parameters
     * @param {Object} params.req - Express request object
     * @param {Object} params.res - Express response object
     * @param {Function} params.next - Next middleware function
     */
    return ({ req, res, next }) => {
        try {
            // Validate request object
            if (!req) {
                throw new Error('Request object is missing');
            }

            // Initialize device info response
            const deviceInfo = {
                success: true,
                timestamp: new Date().toISOString(),
                ip: extractIpAddress(req),
                userAgent: parseUserAgent(req),
                device: {
                    type: 'unknown',
                    browser: 'unknown',
                    os: 'unknown',
                    version: 'unknown'
                },
                metadata: {
                    requestPath: req.path || req.url || 'unknown',
                    requestMethod: req.method || 'unknown'
                }
            };

            // Process user agent information
            if (deviceInfo.userAgent) {
                const parsedAgent = parseDetailedUserAgent(deviceInfo.userAgent);
                deviceInfo.device = parsedAgent;
            }

            // Add security information
            deviceInfo.security = {
                isSecure: req.secure || req.protocol === 'https',
                hasForwardedProtocol: !!req.headers['x-forwarded-proto'],
                hasForwardedFor: !!req.headers['x-forwarded-for']
            };

            // Store device info in request for later use
            req.deviceInfo = deviceInfo;

            return next(deviceInfo);

        } catch (error) {
            console.error('Device middleware error:', error);
            return next({
                success: false,
                error: error.message || 'Error processing device information',
                timestamp: new Date().toISOString()
            });
        }
    };
};

/**
 * Extract IP address from request
 * @param {Object} req - Express request object
 * @returns {string} IP address
 */
function extractIpAddress(req) {
    return (
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        'unknown'
    ).trim();
}

/**
 * Extract user agent from request
 * @param {Object} req - Express request object
 * @returns {string} User agent string
 */
function parseUserAgent(req) {
    return (
        req.headers['user-agent'] ||
        req.headers['User-Agent'] ||
        'unknown'
    ).trim();
}

/**
 * Parse detailed user agent information
 * @param {string} userAgent - User agent string
 * @returns {Object} Parsed user agent information
 */
function parseDetailedUserAgent(userAgent) {
    try {
        const deviceInfo = {
            type: 'desktop',
            browser: 'unknown',
            os: 'unknown',
            version: 'unknown'
        };

        // Detect device type
        if (/mobile|android|iphone|ipad|tablet/i.test(userAgent)) {
            deviceInfo.type = 'mobile';
        } else if (/tablet|ipad/i.test(userAgent)) {
            deviceInfo.type = 'tablet';
        }

        // Detect browser
        if (/chrome/i.test(userAgent)) {
            deviceInfo.browser = 'Chrome';
        } else if (/firefox/i.test(userAgent)) {
            deviceInfo.browser = 'Firefox';
        } else if (/safari/i.test(userAgent)) {
            deviceInfo.browser = 'Safari';
        } else if (/msie|trident/i.test(userAgent)) {
            deviceInfo.browser = 'Internet Explorer';
        } else if (/edge/i.test(userAgent)) {
            deviceInfo.browser = 'Edge';
        }

        // Detect OS
        if (/windows/i.test(userAgent)) {
            deviceInfo.os = 'Windows';
        } else if (/macintosh|mac os/i.test(userAgent)) {
            deviceInfo.os = 'MacOS';
        } else if (/linux/i.test(userAgent)) {
            deviceInfo.os = 'Linux';
        } else if (/android/i.test(userAgent)) {
            deviceInfo.os = 'Android';
        } else if (/ios|iphone|ipad/i.test(userAgent)) {
            deviceInfo.os = 'iOS';
        }

        // Extract version (basic implementation)
        const versionMatch = userAgent.match(/(?:chrome|firefox|safari|msie|edge)[\/\s](\d+(\.\d+)?)/i);
        if (versionMatch) {
            deviceInfo.version = versionMatch[1];
        }

        return deviceInfo;

    } catch (error) {
        console.error('Error parsing user agent:', error);
        return {
            type: 'unknown',
            browser: 'unknown',
            os: 'unknown',
            version: 'unknown'
        };
    }
}

/**
 * Example usage:
 * const deviceMiddleware = require('./__device.mw.js');
 * app.use(deviceMiddleware({ meta: {}, config: {}, managers: {} }));
 * 
 * Example response:
 * {
 *   success: true,
 *   timestamp: "2024-01-17T12:34:56.789Z",
 *   ip: "192.168.1.1",
 *   userAgent: "Mozilla/5.0...",
 *   device: {
 *     type: "desktop",
 *     browser: "Chrome",
 *     os: "Windows",
 *     version: "96.0"
 *   },
 *   metadata: {
 *     requestPath: "/api/resource",
 *     requestMethod: "GET"
 *   },
 *   security: {
 *     isSecure: true,
 *     hasForwardedProtocol: true,
 *     hasForwardedFor: true
 *   }
 * }
 */
