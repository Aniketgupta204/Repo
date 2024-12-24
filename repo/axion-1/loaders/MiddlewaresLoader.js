const loader = require('./_common/fileLoader');

module.exports = class MiddlewareLoader { 
    constructor(injectable) {
        if (!injectable) {
            throw new Error('Injectable parameter is required');
        }
        
        this.mws = {};
        this.injectable = injectable;
    }

    load() {
        try {
            const mws = loader('./mws/**/*.mw.js');
            
            if (!mws || typeof mws !== 'object') {
                throw new Error('Failed to load middleware files');
            }

            // Use forEach instead of map since we're modifying the original object
            Object.keys(mws).forEach(ik => {
                try {
                    if (typeof mws[ik] !== 'function') {
                        throw new Error(`Middleware ${ik} is not a function`);
                    }
                    
                    // Initialize the middleware with injectable dependencies
                    mws[ik] = mws[ik](this.injectable);
                    
                    // Validate that the middleware returned something
                    if (!mws[ik]) {
                        throw new Error(`Middleware ${ik} initialization returned empty result`);
                    }
                } catch (error) {
                    console.error(`Error initializing middleware ${ik}:`, error);
                    // Remove failed middleware
                    delete mws[ik];
                }
            });

            return mws;
        } catch (error) {
            console.error('Error in MiddlewareLoader.load():', error);
            throw error;
        }
    }

    /**
     * Validates that a middleware has required methods/properties
     * @param {string} name - Middleware name
     * @param {object} middleware - Middleware instance
     * @returns {boolean} - True if valid
     */
    validateMiddleware(name, middleware) {
        try {
            // Add any specific validation logic for middleware structure
            return true;
        } catch (error) {
            console.error(`Middleware ${name} validation failed:`, error);
            return false;
        }
    }
}
