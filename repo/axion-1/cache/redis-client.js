const Redis = require("ioredis");

/**
 * Creates a monitored Redis command
 * @param {Redis} client - Redis client instance
 * @param {string} command - Command to execute
 * @param {...any} args - Command arguments
 * @returns {Promise<any>} Command result
 */
const createMonitoredCommand = async (client, command, ...args) => {
    const startTime = performance.now();
    try {
        const result = await client[command](...args);
        const duration = performance.now() - startTime;
        console.log(`Redis command ${command} completed in ${duration.toFixed(2)}ms`);
        return result;
    } catch (error) {
        console.error(`Redis command ${command} failed:`, error);
        throw error;
    }
};

/**
 * Execute batch operations
 * @param {Redis} client - Redis client instance
 * @param {Array<{command: string, args: Array<any>}>} operations - Batch operations
 * @returns {Promise<Array>} Results of batch operations
 */
const createBatchOperation = async (client, operations) => {
    try {
        const pipeline = client.pipeline();
        
        operations.forEach(({ command, args }) => {
            pipeline[command](...args);
        });

        return await pipeline.exec();
    } catch (error) {
        console.error('Batch operation failed:', error);
        throw error;
    }
};

/**
 * Perform health check on Redis connection
 * @param {Redis} client - Redis client instance
 * @returns {Promise<Object>} Health check result
 */
const healthCheck = async (client) => {
    try {
        const startTime = performance.now();
        await client.ping();
        const duration = performance.now() - startTime;

        return {
            status: 'healthy',
            latency: `${duration.toFixed(2)}ms`,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Run connection test
 * @param {Redis} redis - Redis client instance
 * @param {string} prefix - Key prefix
 * @returns {Promise<void>}
 */
const runTest = async (redis, prefix) => {
    try {
        const key = `${prefix}:test:${Date.now()}`;
        await redis.set(key, "Redis Test Done.");
        const data = await redis.get(key);
        console.log(`Cache Test Data: ${data}`);
        await redis.del(key);
    } catch (error) {
        console.error('Connection test failed:', error);
        throw error;
    }
};

/**
 * Create Redis client
 * @param {Object} config - Client configuration
 * @param {string} config.prefix - Key prefix
 * @param {string} config.url - Redis URL
 * @returns {Redis} Redis client instance
 */
const createClient = ({ prefix, url }) => {
    if (!prefix || !url) {
        throw new Error('Missing required configuration: prefix and url are required');
    }

    console.log('Creating Redis client with config:', { prefix, url });

    const redis = new Redis(url, {
        keyPrefix: `${prefix}:`,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        autoResubscribe: true
    });

    // Register client events
    redis.on('error', (error) => {
        console.error('Redis connection error:', error);
    });

    redis.on('connect', () => {
        console.log('Redis client connected');
    });

    redis.on('ready', () => {
        console.log('Redis client ready');
    });

    redis.on('end', () => {
        console.log('Redis connection closed');
    });

    redis.on('reconnecting', () => {
        console.log('Redis client reconnecting');
    });

    // Run initial connection test
    runTest(redis, prefix).catch(error => {
        console.error('Initial connection test failed:', error);
    });

    return redis;
};

module.exports = {
    createClient,
    createBatchOperation,
    createMonitoredCommand,
    healthCheck
};
// Create Redis client
const redisClient = createClient({
    prefix: 'myapp',
    url: 'redis://localhost:6379'
});

// Execute batch operations
const batch = await createBatchOperation(redisClient, [
    { command: 'set', args: ['key1', 'value1'] },
    { command: 'set', args: ['key2', 'value2'] }
]);

// Check health
const health = await healthCheck(redisClient);
console.log(health);

// Execute monitored command
const result = await createMonitoredCommand(redisClient, 'get', 'mykey');
