const MiddlewaresLoader = require('./MiddlewaresLoader');
const ApiHandler = require("../managers/api/Api.manager");
const LiveDB = require('../managers/live_db/LiveDb.manager');
const UserServer = require('../managers/http/UserServer.manager');
const ResponseDispatcher = require('../managers/response_dispatcher/ResponseDispatcher.manager');
const VirtualStack = require('../managers/virtual_stack/VirtualStack.manager');
const ValidatorsLoader = require('./ValidatorsLoader');
const ResourceMeshLoader = require('./ResourceMeshLoader');
const utils = require('../libs/utils');
const systemArch = require('../static_arch/main.system');
const TokenManager = require('../managers/token/Token.manager');
const SharkFin = require('../managers/shark_fin/SharkFin.manager');
const TimeMachine = require('../managers/time_machine/TimeMachine.manager');

/** 
 * Load sharable modules
 * @return {Object} modules tree with instance of each module
 */
module.exports = class ManagersLoader {
    constructor({ config, cortex, cache, oyster, aeon }) {
        if (!config || !cortex || !cache) {
            throw new Error('Required dependencies missing in ManagersLoader constructor');
        }

        this.managers = {};
        this.config = config;
        this.cache = cache;
        this.cortex = cortex;
        
        try {
            this._preload();
            this.injectable = {
                utils,
                cache, 
                config,
                cortex,
                oyster,
                aeon,
                managers: this.managers, 
                validators: this.validators,
                resourceNodes: this.resourceNodes,
            };
        } catch (error) {
            console.error('Error in ManagersLoader initialization:', error);
            throw error;
        }
    }

    _preload() {
        try {
            const validatorsLoader = new ValidatorsLoader({
                models: require('../managers/_common/schema.models'),
                customValidators: require('../managers/_common/schema.validators'),
            });
            const resourceMeshLoader = new ResourceMeshLoader({});

            this.validators = validatorsLoader.load();
            this.resourceNodes = resourceMeshLoader.load();
        } catch (error) {
            console.error('Error in _preload:', error);
            throw error;
        }
    }

    load() {
        try {
            // Initialize core managers
            this.managers.responseDispatcher = new ResponseDispatcher();
            this.managers.liveDb = new LiveDB(this.injectable);
            
            // Load middlewares
            const middlewaresLoader = new MiddlewaresLoader(this.injectable);
            const mwsRepo = middlewaresLoader.load();
            
            // Get system architecture
            const { layers, actions } = systemArch;
            this.injectable.mwsRepo = mwsRepo;

            // Initialize custom managers
            this.managers.shark = new SharkFin({ ...this.injectable, layers, actions });
            this.managers.timeMachine = new TimeMachine(this.injectable);
            this.managers.token = new TokenManager(this.injectable);

            // Initialize stack and servers
            this.managers.mwsExec = new VirtualStack({ 
                ...{ preStack: ['__device'] }, 
                ...this.injectable 
            });
            this.managers.userApi = new ApiHandler({
                ...this.injectable,
                ...{ prop: 'httpExposed' }
            });
            this.managers.userServer = new UserServer({ 
                config: this.config, 
                managers: this.managers 
            });

            return this.managers;
        } catch (error) {
            console.error('Error in load:', error);
            throw error;
        }
    }
};
