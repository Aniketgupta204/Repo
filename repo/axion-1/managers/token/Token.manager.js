const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const md5 = require('md5');

module.exports = class TokenManager {
    constructor({config}) {
        this.config = config;
        // Changed to match documentation (72 hours for short token)
        this.shortTokenExpiresIn = '72h';
        this.longTokenExpiresIn = '3y';
        this.httpExposed = ['v1_createShortToken'];
    }

    /**
     * short token are issue from long token 
     * short tokens are issued for 72 hours 
     * short tokens are connected to user-agent
     * short token are used on the soft logout 
     * short tokens are used for account switch 
     * short token represents a device. 
     * long token represents a single user. 
     *  
     * long token contains immutable data and long lived
     * master key must exists on any device to create short tokens
     */
    genLongToken({userId, userKey}) {
        if (!userId || !userKey) {
            throw new Error('Missing required parameters for long token generation');
        }

        try {
            return jwt.sign(
                { 
                    userKey, 
                    userId,
                }, 
                this.config.dotEnv.LONG_TOKEN_SECRET, 
                { expiresIn: this.longTokenExpiresIn }
            );
        } catch (error) {
            console.error('Error generating long token:', error);
            throw new Error('Failed to generate long token');
        }
    }

    genShortToken({userId, userKey, sessionId, deviceId}) {
        if (!userId || !userKey || !sessionId || !deviceId) {
            throw new Error('Missing required parameters for short token generation');
        }

        try {
            return jwt.sign(
                { 
                    userKey, 
                    userId, 
                    sessionId, 
                    deviceId
                }, 
                this.config.dotEnv.SHORT_TOKEN_SECRET, 
                { expiresIn: this.shortTokenExpiresIn }
            );
        } catch (error) {
            console.error('Error generating short token:', error);
            throw new Error('Failed to generate short token');
        }
    }

    _verifyToken({token, secret}) {
        if (!token || !secret) {
            throw new Error('Token and secret are required for verification');
        }

        try {
            return jwt.verify(token, secret);
        } catch (error) {
            console.error('Token verification failed:', error);
            return null;
        }
    }

    verifyLongToken({token}) {
        return this._verifyToken({
            token, 
            secret: this.config.dotEnv.LONG_TOKEN_SECRET
        });
    }

    verifyShortToken({token}) {
        return this._verifyToken({
            token, 
            secret: this.config.dotEnv.SHORT_TOKEN_SECRET
        });
    }

    /** 
     * Generate shortId based on a longId 
     * @param {Object} params - The parameters object
     * @param {string} params.__longToken - The long token to verify
     * @param {string} params.__device - The device identifier
     * @returns {Object} Object containing the generated short token
     * @throws {Error} If token verification fails or required parameters are missing
     */
    v1_createShortToken({__longToken, __device}) {
        if (!__longToken || !__device) {
            throw new Error('Long token and device identifier are required');
        }

        try {
            // Verify the long token first
            const decoded = this.verifyLongToken({ token: __longToken });
            
            if (!decoded) {
                throw new Error('Invalid long token');
            }

            // Generate device ID using md5
            const deviceId = md5(__device);

            // Generate session ID
            const sessionId = nanoid();

            // Generate short token
            const shortToken = this.genShortToken({
                userId: decoded.userId,
                userKey: decoded.userKey,
                sessionId,
                deviceId,
            });

            return { shortToken };
        } catch (error) {
            console.error('Error creating short token:', error);
            throw new Error('Failed to create short token');
        }
    }
}
