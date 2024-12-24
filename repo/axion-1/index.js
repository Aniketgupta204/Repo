/**
 * Application entry point and service initialization
 * @module index
 */

const config = require('./config/index.config.js');
const Cortex = require('ion-cortex');
const ManagersLoader = require('./loaders/ManagersLoader.js');
const Aeon = require('aeon-machine');

/**
 * Error handler for uncaught exceptions
 */
process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', {
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });
    process.exit(1);
});

/**
 * Error handler for unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', {
        reason: reason?.message || reason,
        promise: promise,
        timestamp: new Date().toISOString()
    });
    process.exit(1);
});

/**
 * Initialize cache service
 * @returns {Object} Initialized cache instance
 */
const initializeCache = () => {
    if (!config.dotEnv.CACHE_REDIS || !config.dotEnv.CACHE_PREFIX) {
        throw new Error('Cache configuration missing required parameters');
    }

    return require('./cache/cache.dbh')({
        prefix: config.dotEnv.CACHE_PREFIX,
        url: config.dotEnv.CACHE_REDIS,
        options: {
            retryStrategy: (times) => Math.min(times * 100, 3000),
            maxRetriesPerRequest: 3
        }
    });
};

/**
 * Initialize Oyster database
 * @returns {Object} Initialized Oyster instance
 */
const initializeOyster = () => {
    const Oyster = require('oyster-db');
    if (!config.dotEnv.OYSTER_REDIS || !config.dotEnv.OYSTER_PREFIX) {
        throw new Error('Oyster configuration missing required parameters');
    }

    return new Oyster({ 
        url: config.dotEnv.OYSTER_REDIS, 
        prefix: config.dotEnv.OYSTER_PREFIX,
        options: {
            connectTimeout: 10000,
            maxRetriesPerRequest: 3
        }
    });
};

/**
 * Initialize Cortex service
 * @returns {Object} Initialized Cortex instance
 */
const initializeCortex = () => {
    if (!config.dotEnv.CORTEX_REDIS || !config.dotEnv.CORTEX_PREFIX || !config.dotEnv.CORTEX_TYPE) {
        throw new Error('Cortex configuration missing required parameters');
    }

    return new Cortex({
        prefix: config.dotEnv.CORTEX_PREFIX,
        url: config.dotEnv.CORTEX_REDIS,
        type: config.dotEnv.CORTEX_TYPE,
        state: () => ({}),
        activeDelay: parseInt(config.dotEnv.CORTEX_ACTIVE_DELAY) || 50,
        idleDelay: parseInt(config.dotEnv.CORTEX_IDLE_DELAY) || 200,
        options: {
            maxReconnectAttempts: 10,
            reconnectDelay: 1000
        }
    });
};

/**
 * Initialize Aeon service
 * @param {Object} cortex - Initialized Cortex instance
 * @returns {Object} Initialized Aeon instance
 */
const initializeAeon = (cortex) => {
    if (!cortex) {
        throw new Error('Cortex instance required for Aeon initialization');
    }

    return new Aeon({ 
        cortex,
        timestampFrom: Date.now(),
        segmentDuration: config.dotEnv.AEON_SEGMENT_DURATION || 500,
        options: {
            maxRetries: 3,
            retryDelay: 1000
        }
    });
};

/**
 * Initialize all services and start the application
 */
const initializeServices = async () => {
    try {
        // Validate configuration
        if (!config.dotEnv) {
            throw new Error('Environment configuration not loaded');
        }

        // Initialize services
        const cache = initializeCache();
        const oyster = initializeOyster();
        const cortex = initializeCortex();
        const aeon = initializeAeon(cortex);

        // Initialize managers
        const managersLoader = new ManagersLoader({
            config,
            cache,
            cortex,
            oyster,
            aeon
        });

        const managers = managersLoader.load();

        // Start user server
        if (!managers.userServer) {
            throw new Error('User server manager not initialized');
        }

        await managers.userServer.run();
        console.log('Application services initialized successfully');

    } catch (error) {
        console.error('Service initialization failed:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        process.exit(1);
    }
};

// Start the application
initializeServices();

module.exports = {
    initializeServices,
    initializeCache,
    initializeOyster,
    initializeCortex,
    initializeAeon
};
