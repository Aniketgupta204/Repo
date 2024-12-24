const useragent = require('useragent');
const requestIp = require('request-ip');

module.exports = ({ meta, config, managers }) => {
    /**
     * Middleware to extract device information
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Next middleware function
     */
    return ({ req, res, next }) => {
        try {
            // Validate request object
            if (!req) {
                throw new Error('Request object is required');
            }

            // Initialize device info object
            const deviceInfo = {
                ip: 'N/A',
                agent: {
                    browser: 'N/A',
                    os: 'N/A',
                    device: 'N/A',
                    version: 'N/A'
                },
                timestamp: new Date().toISOString()
            };

            // Get client IP
            const clientIp = requestIp.getClientIp(req);
            if (clientIp) {
                deviceInfo.ip = clientIp;
            }

            // Get user agent information
            const userAgent = req.headers['user-agent'];
            if (userAgent) {
                const agentInfo = useragent.lookup(userAgent);
                if (agentInfo) {
                    deviceInfo.agent = {
                        browser: agentInfo.family || 'N/A',
                        os: agentInfo.os.toString() || 'N/A',
                        device: agentInfo.device.toString() || 'N/A',
                        version: agentInfo.toVersion() || 'N/A'
                    };
                }
            }

            // Add request method and path
            deviceInfo.method = req.method || 'N/A';
            deviceInfo.path = req.path || req.url || 'N/A';

            // Add the device info to the request object for later use
            req.deviceInfo = deviceInfo;

            return next(deviceInfo);

        } catch (error) {
            console.error('Error in device middleware:', error);
            
            // Return a safe error response
            const errorResponse = {
                ip: 'N/A',
                agent: {
                    browser: 'N/A',
                    os: 'N/A',
                    device: 'N/A',
                    version: 'N/A'
                },
                timestamp: new Date().toISOString(),
                error: true,
                errorMessage: 'Failed to process device information'
            };

            return next(errorResponse);
        }
    };
};
