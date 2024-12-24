/**
 * System user roles and permissions configuration
 * @module wildSystem
 */

const systemConfig = [
    {
        userId: '00boardman00',
        action: 'config',
        layer: 'board',
        permissions: {
            create: true,
            read: true,
            update: true,
            delete: true,
            audit: true
        }
    },
    {
        userId: '00postman00',
        action: 'config',
        layer: 'board.post',
        permissions: {
            create: true,
            read: true,
            update: true,
            delete: true,
            audit: true
        }
    },
    {
        userId: '00commentman00',
        action: 'config',
        layer: 'board.post.comment',
        permissions: {
            create: true,
            read: true,
            update: true,
            delete: true,
            audit: true
        }
    },
    {
        userId: '00replyman00',
        action: 'config',
        layer: 'board.post.comment.reply',
        permissions: {
            create: true,
            read: true,
            update: true,
            delete: true,
            audit: true
        }
    }
];

/**
 * Permission validation functions
 */
const validation = {
    /**
     * Validate user configuration
     * @param {Object} config - User configuration to validate
     * @returns {boolean} Validation result
     */
    validateConfig(config) {
        return (
            config &&
            typeof config.userId === 'string' &&
            typeof config.action === 'string' &&
            typeof config.layer === 'string' &&
            this.validatePermissions(config.permissions)
        );
    },

    /**
     * Validate permissions object
     * @param {Object} permissions - Permissions to validate
     * @returns {boolean} Validation result
     */
    validatePermissions(permissions) {
        const requiredPermissions = ['create', 'read', 'update', 'delete', 'audit'];
        return (
            permissions &&
            typeof permissions === 'object' &&
            requiredPermissions.every(perm => 
                typeof permissions[perm] === 'boolean'
            )
        );
    }
};

/**
 * Helper functions for permission management
 */
const helpers = {
    /**
     * Get user configuration by ID
     * @param {string} userId - User ID to find
     * @returns {Object|null} User configuration
     */
    getUserConfig(userId) {
        return systemConfig.find(config => config.userId === userId) || null;
    },

    /**
     * Get all configurations for a layer
     * @param {string} layer - Layer to filter by
     * @returns {Array} Layer configurations
     */
    getLayerConfigs(layer) {
        return systemConfig.filter(config => config.layer === layer);
    },

    /**
     * Check if user has permission
     * @param {string} userId - User ID to check
     * @param {string} permission - Permission to check
     * @returns {boolean} Permission check result
     */
    hasPermission(userId, permission) {
        const config = this.getUserConfig(userId);
        return config?.permissions?.[permission] || false;
    },

    /**
     * Get layer hierarchy
     * @param {string} layer - Layer path
     * @returns {Array} Layer hierarchy
     */
    getLayerHierarchy(layer) {
        return layer.split('.');
    }
};

/**
 * System metadata
 */
const metadata = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    users: systemConfig.map(config => config.userId),
    layers: [...new Set(systemConfig.map(config => config.layer))],
    permissions: ['create', 'read', 'update', 'delete', 'audit']
};

// Export configuration and utilities
module.exports = {
    config: systemConfig,
    validate: validation,
    helpers,
    metadata
};

/**
 * Example usage:
 * const wildSystem = require('./wild.system.js');
 * 
 * // Get user configuration
 * const userConfig = wildSystem.helpers.getUserConfig('00boardman00');
 * console.log('User config:', userConfig);
 * 
 * // Check permission
 * const hasPermission = wildSystem.helpers.hasPermission('00boardman00', 'create');
 * console.log('Has create permission:', hasPermission);
 * 
 * // Get layer configurations
 * const layerConfigs = wildSystem.helpers.getLayerConfigs('board');
 * console.log('Layer configs:', layerConfigs);
 * 
 * // Validate configuration
 * const isValid = wildSystem.validate.validateConfig(userConfig);
 * console.log('Is valid config:', isValid);
 * 
 * // Get system metadata
 * console.log('System metadata:', wildSystem.metadata);
 */
