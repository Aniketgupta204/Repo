const Bolt = require('./Bolt.manager');

/**
 * VirtualStack manager class for handling middleware stacks
 */
module.exports = class VirtualStack {
    /**
     * Creates a new VirtualStack instance
     * @param {Object} config Configuration object
     * @param {Object} config.mwsRepo - Repository of middleware functions (key-value pairs)
     * @param {string[]} [config.preStack=[]] - Array of middleware keys to be executed before any stack
     * @throws {Error} If mwsRepo is not provided or invalid
     */
    constructor({ mwsRepo, preStack = [] }) {
        if (!mwsRepo || typeof mwsRepo !== 'object') {
            throw new Error('mwsRepo must be a valid object containing middleware functions');
        }

        this.mwsRepo = mwsRepo;
        this.preStack = Array.isArray(preStack) ? preStack : [];
    }

    /**
     * Creates a new Bolt instance with combined preStack and stack
     * @param {Object} args - Arguments for bolt creation
     * @param {string[]} args.stack - Array of middleware keys
     * @returns {Bolt} New Bolt instance
     * @throws {Error} If args.stack is not provided or invalid
     */
    createBolt(args) {
        if (!args || !args.stack || !Array.isArray(args.stack)) {
            throw new Error('args.stack must be a valid array of middleware keys');
        }

        // Combine preStack with the provided stack
        const combinedArgs = {
            ...args,
            mwsRepo: this.mwsRepo,
            stack: [...this.preStack, ...args.stack]
        };

        return new Bolt(combinedArgs);
    }
};
