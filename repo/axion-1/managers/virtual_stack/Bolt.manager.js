const debug = require('debug')('cp:StackBolt');

module.exports = class StackBolt {
    /**
     * @param {Object} options Configuration options
     * @param {Object} options.mwsRepo Middleware repository
     * @param {Array} options.stack Stack of middleware functions
     * @param {string} options._id Identifier
     * @param {Object} options.managers Managers object
     * @param {Object} options.req Request object
     * @param {Object} options.res Response object
     * @param {Function} options.onDone Callback when stack completes successfully
     * @param {Function} options.onError Callback when stack encounters an error
     */
    constructor({
        mwsRepo = {},
        stack = [],
        _id = null,
        managers = {},
        req = {},
        res = {},
        onDone = null,
        onError = null
    } = {}) {
        this.mwsRepo = mwsRepo;
        this.stack = stack;
        this.managers = managers;
        this.index = 0;
        this.req = req;
        this.res = res;
        this.results = {};
        this.onDone = onDone || (() => {});
        this.onError = onError || (() => {});

        // Bind methods to preserve context
        this.run = this.run.bind(this);
        this.next = this.next.bind(this);
        this.end = this.end.bind(this);
    }

    /**
     * Handle stack execution end
     * @param {Object} options
     * @param {Error|string} options.error Error object or message
     */
    end({ error } = {}) {
        const errorMessage = error || "Unexpected Failure";
        this.req.stackError = errorMessage;

        if (this.index === (this.stack.length - 1)) {
            debug('stack broke:', errorMessage);
            if (this.onError) {
                this.onError(errorMessage);
            }
            if (this.res.end && !this.res.headersSent) {
                this.res.end();
            }
        } else {
            debug('stack error:', errorMessage);
            this.index = this.stack.length - 1;
            this.run({ index: this.index });
        }
    }

    /**
     * Move to next middleware in stack
     * @param {*} data Data to pass to next middleware
     * @param {number} index Optional specific index to jump to
     */
    next(data, index) {
        try {
            if (this.index >= 0 && this.index < this.stack.length) {
                this.results[this.stack[this.index]] = data || {};
            }

            const indexToBe = index !== undefined ? index : this.index + 1;

            if (!this.stack[indexToBe]) {
                debug('reached end of the stack');
                this.onDone({
                    req: this.req,
                    res: this.res,
                    results: this.results
                });
                return;
            }

            this.index = indexToBe;
            this.run({ index: this.index });
        } catch (err) {
            debug('Error in next:', err);
            this.end({ error: err.message });
        }
    }

    /**
     * Run middleware at specified index
     * @param {Object} options
     * @param {number} options.index Index of middleware to run
     */
    run({ index } = {}) {
        try {
            const tIndex = index !== undefined ? index : this.index;

            if (!this.stack[tIndex]) {
                debug(`Index ${tIndex} not found in stack`);
                return;
            }

            const fnKey = this.stack[tIndex];
            const fn = this.mwsRepo[fnKey];

            if (!fn) {
                debug(`Function not found: ${fnKey}`);
                this.end({ error: `Function not found: ${fnKey}` });
                return;
            }

            fn({
                req: this.req,
                res: this.res,
                results: this.results,
                next: this.next,
                end: this.end,
                stack: this.stack,
                self: fn
            });
        } catch (err) {
            debug(`Failed to execute middleware at index ${index}:`, err);
            this.end({ error: `Execution failed: ${err.message}` });
        }
    }
}
