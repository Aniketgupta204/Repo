const http = require('http');
const express = require('express');
const cors = require('cors');

class UserValidation {
    constructor({ userManager }) {
        this.userManager = userManager;
    }

    /**
     * Validates user creation data
     * @param {Object} userData - User data to validate
     * @returns {Promise<Object>} Validation result
     */
    async createUser(userData) {
        try {
            // Validate fields against schema
            const validationResult = this._validateFields(userData, userSchema.createUser);
            if (validationResult.error) {
                return validationResult;
            }

            // Validate username format
            if (!this._isValidUsername(userData.username)) {
                return {
                    error: 'Invalid username format'
                };
            }

            // Validate email format
            if (!this._isValidEmail(userData.email)) {
                return {
                    error: 'Invalid email format'
                };
            }

            // Validate password strength
            if (!this._isValidPassword(userData.password)) {
                return {
                    error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                };
            }

            // Check if username exists
            const existingUsername = await this.userManager.findByUsername(userData.username);
            if (existingUsername) {
                return {
                    error: 'Username already exists'
                };
            }

            // Check if email exists
            const existingEmail = await this.userManager.findByEmail(userData.email);
            if (existingEmail) {
                return {
                    error: 'Email already exists'
                };
            }

            return { isValid: true };
        } catch (error) {
            console.error('Error in createUser validation:', error);
            return {
                error: 'Validation failed'
            };
        }
    }

    // ... (previous validation methods remain the same)
}

class UserServer {
    /**
     * @param {Object} params
     * @param {Object} params.config - Configuration object
     * @param {Object} params.managers - Managers object containing userApi
     */
    constructor({ config, managers }) {
        if (!config || !managers?.userApi) {
            throw new Error('Required configuration or managers missing');
        }

        this.config = config;
        this.userApi = managers.userApi;
        this.app = express();
        this.server = null;
    }

    /**
     * Add middleware to the express application
     * @param {Function} middleware - Express middleware
     */
    use(middleware) {
        if (!middleware) {
            throw new Error('Middleware is required');
        }
        this.app.use(middleware);
    }

    /**
     * Initialize and start the server
     * @returns {Promise<void>}
     */
    async run() {
        try {
            // Basic security headers
            this.app.use((req, res, next) => {
                res.setHeader('X-Content-Type-Options', 'nosniff');
                res.setHeader('X-Frame-Options', 'DENY');
                res.setHeader('X-XSS-Protection', '1; mode=block');
                next();
            });

            // CORS configuration
            this.app.use(cors({
                origin: this.config.dotEnv.ALLOWED_ORIGINS || '*',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization'],
                credentials: true
            }));

            // Body parsers
            this.app.use(express.json({ limit: '10mb' }));
            this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

            // Static files with cache control
            this.app.use('/static', express.static('public', {
                maxAge: '1d',
                etag: true
            }));

            // Error handling middleware
            this.app.use((err, req, res, next) => {
                console.error('Server error:', err);
                const statusCode = err.status || 500;
                res.status(statusCode).json({
                    error: this.config.dotEnv.NODE_ENV === 'production' 
                        ? 'Internal Server Error' 
                        : err.message
                });
            });

            // API routes
            this.app.all('/api/:moduleName/:fnName', this.userApi.mw);

            // 404 handler
            this.app.use((req, res) => {
                res.status(404).json({ error: 'Route not found' });
            });

            // Create and start server
            this.server = http.createServer(this.app);

            // Graceful shutdown handler
            process.on('SIGTERM', () => this.shutdown());
            process.on('SIGINT', () => this.shutdown());

            await this.startServer();
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    /**
     * Start the server
     * @returns {Promise<void>}
     */
    startServer() {
        return new Promise((resolve, reject) => {
            try {
                const port = this.config.dotEnv.USER_PORT || 3000;
                this.server.listen(port, () => {
                    console.log(`${(this.config.dotEnv.SERVICE_NAME || 'Server').toUpperCase()} is running on port: ${port}`);
                    resolve();
                });

                this.server.on('error', (error) => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Gracefully shutdown the server
     */
    async shutdown() {
        if (this.server) {
            console.log('Shutting down server...');
            await new Promise((resolve) => {
                this.server.close(resolve);
            });
            console.log('Server shutdown complete');
            process.exit(0);
        }
    }
}

module.exports = UserServer;
