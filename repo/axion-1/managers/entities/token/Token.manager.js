const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const md5 = require('md5');

/**
 * Token Manager for handling JWT tokens
 */
module.exports = class TokenManager {
    /**
     * @param {Object} params - Configuration parameters
     * @param {Object} params.config - Configuration object containing environment variables
     * @throws {Error} If required configuration is missing
     */
    constructor({ config }) {
        if (!config?.dotEnv?.LONG_TOKEN_SECRET || !config?.dotEnv?.SHORT_TOKEN_SECRET) {
            throw new Error('Token secrets are required in configuration');
        }

        this.config = config;
        // Use more precise time units for token expiration
        this.longTokenExpiresIn = '1095d'; // 3 years
        this.shortTokenExpiresIn = '365d';  // 1 year
        this.userExposed = ['v1_createShortToken'];
    }

    /**
     * Generates a long-lived JWT token
     * @param {Object} params - Token parameters
     * @param {string} params.userId - User ID
     * @param {string} params.userKey - User key
     * @returns {string} Generated JWT token
     * @throws {Error} If required parameters are missing
     */
    genLongToken({ userId, userKey }) {
        try {
            this._validateParams({ userId, userKey }, ['userId', 'userKey']);

            return jwt.sign(
                { 
                    userKey, 
                    userId,
                    iat: Math.floor(Date.now() / 1000) // Add issued at time
                }, 
                this.config.dotEnv.LONG_TOKEN_SECRET, 
                { 
                    expiresIn: this.longTokenExpiresIn,
                    algorithm: 'HS256',
                    jwtid: nanoid() // Add unique token identifier
                }
            );
        } catch (error) {
            console.error('Error generating long token:', error);
            throw new Error(`Failed to generate long token: ${error.message}`);
        }
    }

    /**
     * Generates a short-lived JWT token
     * @param {Object} params - Token parameters
     * @param {string} params.userId - User ID
     * @param {string} params.userKey - User key
     * @param {string} params.sessionId - Session ID
     * @param {string} params.deviceId - Device ID
     * @returns {string} Generated JWT token
     * @throws {Error} If required parameters are missing
     */
    genShortToken({ userId, userKey, sessionId, deviceId }) {
        try {
            this._validateParams(
                { userId, userKey, sessionId, deviceId },
                ['userId', 'userKey', 'sessionId', 'deviceId']
            );

            return jwt.sign(
                { 
                    userKey, 
                    userId, 
                    sessionId, 
                    deviceId,
                    iat: Math.floor(Date.now() / 1000)
                }, 
                this.config.dotEnv.SHORT_TOKEN_SECRET, 
                { 
                    expiresIn: this.shortTokenExpiresIn,
                    algorithm: 'HS256',
                    jwtid: nanoid()
                }
            );
        } catch (error) {
            console.error('Error generating short token:', error);
            throw new Error(`Failed to generate short token: ${error.message}`);
        }
    }

    /**
     * Verifies a JWT token
     * @private
     * @param {Object} params - Verification parameters
     * @param {string} params.token - Token to verify
     * @param {string} params.secret - Secret to use for verification
     * @returns {Object|null} Decoded token or null if invalid
     */
    _verifyToken({ token, secret }) {
        try {
            this._validateParams({ token, secret }, ['token', 'secret']);

            return jwt.verify(token, secret, { 
                algorithms: ['HS256'],
                complete: true // Return complete token info including header
            }).payload;
        } catch (error) {
            console.error('Token verification error:', error);
            return null;
        }
    }

    /**
     * Verifies a long-lived token
     * @param {Object} params - Verification parameters
     * @param {string} params.token - Token to verify
     * @returns {Object|null} Decoded token or null if invalid
     */
    verifyLongToken({ token }) {
        return this._verifyToken({
            token,
            secret: this.config.dotEnv.LONG_TOKEN_SECRET
        });
    }

    /**
     * Verifies a short-lived token
     * @param {Object} params - Verification parameters
     * @param {string} params.token - Token to verify
     * @returns {Object|null} Decoded token or null if invalid
     */
    verifyShortToken({ token }) {
        return this._verifyToken({
            token,
            secret: this.config.dotEnv.SHORT_TOKEN_SECRET
        });
    }

    /**
     * Creates a short token from a long token
     * @param {Object} params - Request parameters
     * @param {Object} params.__headers - Request headers
     * @param {Object} params.__device - Device information
     * @returns {Object} Object containing short token or error
     */
    v1_createShortToken({ __headers, __device }) {
        try {
            this._validateParams({ token: __headers?.token, device: __device }, ['token', 'device']);

            const decoded = this.verifyLongToken({ token: __headers.token });
            if (!decoded) {
                return { error: 'Invalid or expired token' };
            }

            const deviceId = md5(JSON.stringify(__device)); // More reliable device ID generation
            const shortToken = this.genShortToken({
                userId: decoded.userId,
                userKey: decoded.userKey,
                sessionId: nanoid(),
                deviceId
            });

            return { shortToken };
        } catch (error) {
            console.error('Error creating short token:', error);
            return { error: `Failed to create short token: ${error.message}` };
        }
    }

    /**
     * Validates token parameters
     * @private
     * @param {Object} params - Parameters to validate
     * @param {Array} required - Required parameter names
     * @throws {Error} If any required parameter is missing or undefined
     */
    _validateParams(params, required) {
        for (const param of required) {
            if (!params[param]) {
                throw new Error(`Missing required parameter: ${param}`);
            }
        }
    }
};
