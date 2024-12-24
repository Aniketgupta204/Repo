const getParamNames = require('./_common/getParamNames');

/**
 * API Handler class that scans managers for exposed methods
 * and makes them available through a handler middleware
 */
module.exports = class ApiHandler {
    /**
     * @param {Object} params - Configuration parameters
     * @param {Object} params.config - Configuration object
     * @param {Object} params.cortex - Cortex instance
     * @param {Object} params.cache - Cache instance
     * @param {Object} params.managers - Managers instance
     * @param {Object} params.mwsRepo - Middleware repository
     * @param {string} params.prop - Property key to scan for exposed methods
     */
    constructor({ config, cortex, cache, managers, mwsRepo, prop }) {
        // Validate required parameters
        if (!config || !cortex || !cache || !managers || !mwsRepo || !prop) {
            throw new Error('Missing required parameters in ApiHandler constructor');
        }

        this.config = config;
        this.cache = cache;
        this.cortex = cortex;
        this.managers = managers;
        this.mwsRepo = mwsRepo;
        this.mwsExec = this.managers.mwsExec;
        this.prop = prop;
        this.exposed = {};
        this.methodMatrix = {};
        this.auth = {};
        this.fileUpload = {};
        this.mwsStack = {};
        this.mw = this.mw.bind(this);

        this.initializeMethodMatrix();
        this.initializeCortexExposure();
    }

    /**
     * Initialize method matrix from managers
     * @private
     */
    initializeMethodMatrix() {
        try {
            Object.keys(this.managers).forEach(mk => {
                if (this.managers[mk][this.prop]) {
                    this.methodMatrix[mk] = {};
                    
                    this.managers[mk][this.prop].forEach(i => {
                        const { method, fnName } = this.parseMethodString(i);
                        
                        if (!this.methodMatrix[mk][method]) {
                            this.methodMatrix[mk][method] = [];
                        }
                        this.methodMatrix[mk][method].push(fnName);

                        this.processMethodParameters(mk, fnName);
                    });
                }
            });
        } catch (error) {
            console.error('Error initializing method matrix:', error);
            throw error;
        }
    }

    /**
     * Parse method string to extract method and function name
     * @private
     * @param {string} methodString - Method string to parse
     * @returns {Object} Object containing method and function name
     */
    parseMethodString(methodString) {
        let method = 'post';
        let fnName = methodString;

        if (methodString.includes('=')) {
            const [methodPart, fnPart] = methodString.split('=');
            method = methodPart.toLowerCase();
            fnName = fnPart;
        }

        return { method, fnName };
    }

    /**
     * Process method parameters and build middleware stack
     * @private
     * @param {string} mk - Manager key
     * @param {string} fnName - Function name
     */
    processMethodParameters(mk, fnName) {
        try {
            const params = getParamNames(this.managers[mk][fnName], fnName, mk)
                .split(',')
                .map(i => i.trim().replace(/{|}/g, ''));

            this.buildMiddlewareStack(mk, fnName, params);
        } catch (error) {
            console.error(`Error processing parameters for ${mk}.${fnName}:`, error);
            throw error;
        }
    }

    /**
     * Build middleware stack for a method
     * @private
     * @param {string} mk - Manager key
     * @param {string} fnName - Function name
     * @param {Array} params - Parameters array
     */
    buildMiddlewareStack(mk, fnName, params) {
        const stackKey = `${mk}.${fnName}`;
        this.mwsStack[stackKey] = [];

        params.forEach(param => {
            if (param.startsWith('__')) {
                if (!this.mwsRepo[param]) {
                    throw new Error(`Unable to find middleware ${param}`);
                }
                this.mwsStack[stackKey].push(param);
            }
        });
    }

    /**
     * Initialize cortex exposure
     * @private
     */
    initializeCortexExposure() {
        try {
            Object.keys(this.managers).forEach(mk => {
                if (this.managers[mk].interceptor) {
                    this.exposed[mk] = this.managers[mk];
                }
            });

            this.setupCortexSubscription();
        } catch (error) {
            console.error('Error initializing cortex exposure:', error);
            throw error;
        }
    }

    /**
     * Setup cortex subscription
     * @private
     */
    setupCortexSubscription() {
        this.cortex.sub('*', (d, meta, cb) => {
            try {
                const [moduleName, fnName] = meta.event.split('.');
                const targetModule = this.exposed[moduleName];
                
                if (!targetModule) {
                    return cb({ error: `Module ${moduleName} not found` });
                }

                targetModule.interceptor({ data: d, meta, cb, fnName });
            } catch (error) {
                console.error('Error in cortex subscription:', error);
                cb({ error: 'Internal server error' });
            }
        });
    }

    /**
     * Execute a function in a target module
     * @private
     * @param {Object} params - Execution parameters
     * @returns {Promise<Object>} Execution result
     */
    async _exec({ targetModule, fnName, data }) {
        try {
            if (!targetModule[fnName]) {
                throw new Error(`Function ${fnName} not found in module`);
            }

            return await targetModule[fnName](data);
        } catch (error) {
            console.error(`Error executing ${fnName}:`, error);
            return { error: `${fnName} failed to execute` };
        }
    }

    /**
     * Middleware handler for executing admin APIs through HTTP
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Next middleware function
     */
    async mw(req, res, next) {
        try {
            const { method, moduleName, context, fnName } = this.extractRequestParams(req);
            
            await this.validateRequest(method, moduleName, fnName);
            
            const targetStack = this.mwsStack[`${moduleName}.${fnName}`];
            
            const hotBolt = this.mwsExec.createBolt({
                stack: targetStack,
                req,
                res,
                onDone: async ({ req, res, results }) => {
                    await this.handleExecution(req, res, moduleName, fnName, results);
                }
            });

            hotBolt.run();
        } catch (error) {
            console.error('Error in middleware:', error);
            this.managers.responseDispatcher.dispatch(res, {
                ok: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    /**
     * Extract parameters from request
     * @private
     * @param {Object} req - Express request object
     * @returns {Object} Extracted parameters
     */
    extractRequestParams(req) {
        return {
            method: req.method.toLowerCase(),
            moduleName: req.params.moduleName,
            context: req.params.context,
            fnName: req.params.fnName
        };
    }

    /**
     * Validate the incoming request
     * @private
     * @param {string} method - HTTP method
     * @param {string} moduleName - Module name
     * @param {string} fnName - Function name
     */
    async validateRequest(method, moduleName, fnName) {
        const moduleMatrix = this.methodMatrix[moduleName];

        if (!moduleMatrix) {
            throw new Error(`Module ${moduleName} not found`);
        }

        if (!moduleMatrix[method]) {
            throw new Error(`Unsupported method ${method} for ${moduleName}`);
        }

        if (!moduleMatrix[method].includes(fnName)) {
            throw new Error(`Unable to find function ${fnName} with method ${method}`);
        }
    }

    /**
     * Handle execution of the target function
     * @private
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {string} moduleName - Module name
     * @param {string} fnName - Function name
     * @param {Object} results - Middleware results
     */
    async handleExecution(req, res, moduleName, fnName, results) {
        const result = await this._exec({
            targetModule: this.managers[moduleName],
            fnName,
            data: {
                ...req.body,
                ...results,
                res
            }
        });

        if (result.selfHandleResponse) {
            return; // Response handled by the function
        }

        if (result.errors) {
            return this.managers.responseDispatcher.dispatch(res, {
                ok: false,
                errors: result.errors
            });
        }

        if (result.error) {
            return this.managers.responseDispatcher.dispatch(res, {
                ok: false,
                message: result.error
            });
        }

        return this.managers.responseDispatcher.dispatch(res, {
            ok: true,
            data: result
        });
    }
};
