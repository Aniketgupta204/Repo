/**
 * System layer and action definitions
 * @module mainSystem
 */

const layers = {
    board: {
        /** Default board permissions */
        _default: { 
            anyoneCan: 'read',
            ownerCan: 'audit',
            systemCan: 'config'
        },

        /** Public board permissions */
        _public: { 
            anyoneCan: 'create',
            ownerCan: 'audit',
            systemCan: 'config'
        },

        /** Private board permissions */
        _private: { 
            anyoneCan: 'none',
            ownerCan: 'config',
            systemCan: 'audit'
        },

        /** Store board permissions */
        _store: { 
            anyoneCan: 'read',
            noOneCan: 'create',
            systemCan: 'config'
        },

        /** Post layer configuration */
        post: {
            _default: { inherit: true },
            _public: { inherit: true },
            _private: { inherit: true },

            /** Comment configuration */
            comment: {
                _default: { inherit: true },
                
                /** Reply configuration */
                reply: {
                    _default: { inherit: true },
                    
                    /** Vote configuration for replies */
                    vote: {
                        _default: { 
                            anyoneCan: 'create',
                            ownerCan: 'audit'
                        }
                    }
                },

                /** Vote configuration for comments */
                vote: {
                    _default: { 
                        anyoneCan: 'create',
                        ownerCan: 'audit'
                    }
                }
            },

            /** Vote configuration for posts */
            vote: {
                _default: { 
                    anyoneCan: 'create',
                    ownerCan: 'audit'
                }
            },

            /** Sticker configuration */
            sticker: {
                _default: { inherit: true }
            }
        }
    }
};

/**
 * Action permission levels
 * @enum {number}
 */
const actions = {
    /** No access allowed */
    blocked: -1,
    
    /** No permissions */
    none: 1,
    
    /** Read-only access */
    read: 2,
    
    /** Create access */
    create: 3,
    
    /** Audit access */
    audit: 4,
    
    /** Full configuration access */
    config: 5
};

/**
 * Permission helper functions
 */
const permissions = {
    /**
     * Check if user has required permission
     * @param {string} requiredAction - Required action
     * @param {string} userAction - User's action level
     * @returns {boolean} Permission check result
     */
    hasPermission(requiredAction, userAction) {
        return actions[userAction] >= actions[requiredAction];
    },

    /**
     * Get effective permissions for a layer
     * @param {Object} layer - Layer configuration
     * @param {Object} parentLayer - Parent layer configuration
     * @returns {Object} Effective permissions
     */
    getEffectivePermissions(layer, parentLayer) {
        if (layer.inherit && parentLayer) {
            return {
                ...parentLayer,
                ...layer,
                inherited: true
            };
        }
        return layer;
    },

    /**
     * Validate layer configuration
     * @param {Object} layer - Layer to validate
     * @returns {boolean} Validation result
     */
    validateLayer(layer) {
        return (
            layer &&
            typeof layer === 'object' &&
            (!layer.anyoneCan || actions[layer.anyoneCan]) &&
            (!layer.ownerCan || actions[layer.ownerCan]) &&
            (!layer.systemCan || actions[layer.systemCan])
        );
    }
};

/**
 * System configuration metadata
 */
const metadata = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    supportedActions: Object.keys(actions),
    defaultPermissions: layers.board._default
};

module.exports = {
    layers,
    actions,
    permissions,
    metadata
};

/**
 * Example usage:
 * const system = require('./main.system.js');
 * 
 * // Check permissions
 * const canCreate = system.permissions.hasPermission('create', 'audit');
 * console.log('Can create:', canCreate);
 * 
 * // Get layer permissions
 * const boardLayer = system.layers.board._public;
 * console.log('Board permissions:', boardLayer);
 * 
 * // Validate layer
 * const isValid = system.permissions.validateLayer(boardLayer);
 * console.log('Is valid:', isValid);
 * 
 * // Get system metadata
 * console.log('System version:', system.metadata.version);
 */
