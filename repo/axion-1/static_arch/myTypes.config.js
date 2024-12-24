/**
 * Type configuration system
 * @module typeConfig
 */

const typeConfig = {
    'typeOne': {
        arrField: ['text', 'image', 'gallery'],
        numField: 35,
        boolField: false,
        metadata: {
            pinnable: true,
            topics: ['general', 'media', 'content'],
            allowedReplies: ['text', 'image']
        }
    },
    'typeTwo': {
        arrField: ['text', 'url', 'video'],
        numField: 1000,
        boolField: true,
        metadata: {
            pinnable: true,
            topics: ['links', 'media', 'content'],
            allowedReplies: ['all']
        }
    },
    'typeThree': {
        arrField: ['text', 'code', 'snippet'],
        numField: 500,
        boolField: true,
        metadata: {
            pinnable: false,
            topics: ['development', 'code'],
            allowedReplies: ['text', 'code']
        }
    }
};

/**
 * Type validation functions
 */
const validation = {
    /**
     * Validate type configuration
     * @param {string} typeName - Type name to validate
     * @returns {boolean} Validation result
     */
    validateType(typeName) {
        const type = typeConfig[typeName];
        return (
            type &&
            Array.isArray(type.arrField) &&
            typeof type.numField === 'number' &&
            typeof type.boolField === 'boolean' &&
            type.metadata &&
            Array.isArray(type.metadata.topics)
        );
    },

    /**
     * Validate field value for type
     * @param {string} typeName - Type name
     * @param {string} fieldName - Field name
     * @param {*} value - Value to validate
     * @returns {boolean} Validation result
     */
    validateField(typeName, fieldName, value) {
        const type = typeConfig[typeName];
        if (!type) return false;

        switch (fieldName) {
            case 'arrField':
                return Array.isArray(value);
            case 'numField':
                return typeof value === 'number';
            case 'boolField':
                return typeof value === 'boolean';
            default:
                return false;
        }
    }
};

/**
 * Type helper functions
 */
const helpers = {
    /**
     * Get allowed fields for type
     * @param {string} typeName - Type name
     * @returns {Array} Allowed fields
     */
    getAllowedFields(typeName) {
        const type = typeConfig[typeName];
        return type ? Object.keys(type).filter(key => key !== 'metadata') : [];
    },

    /**
     * Get type metadata
     * @param {string} typeName - Type name
     * @returns {Object} Type metadata
     */
    getMetadata(typeName) {
        const type = typeConfig[typeName];
        return type?.metadata || null;
    },

    /**
     * Check if type allows specific reply
     * @param {string} typeName - Type name
     * @param {string} replyType - Reply type to check
     * @returns {boolean} Check result
     */
    allowsReplyType(typeName, replyType) {
        const type = typeConfig[typeName];
        if (!type?.metadata?.allowedReplies) return false;
        return type.metadata.allowedReplies.includes('all') || 
               type.metadata.allowedReplies.includes(replyType);
    }
};

/**
 * Configuration metadata
 */
const metadata = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    supportedTypes: Object.keys(typeConfig),
    commonFields: ['arrField', 'numField', 'boolField'],
    allowedReplyTypes: ['text', 'image', 'video', 'code', 'url', 'gallery', 'snippet']
};

module.exports = {
    types: typeConfig,
    validate: validation,
    helpers,
    metadata
};

/**
 * Example usage:
 * const typeConfig = require('./myTypes.config.js');
 * 
 * // Get type configuration
 * console.log(typeConfig.types.typeOne);
 * 
 * // Validate type
 * console.log(typeConfig.validate.validateType('typeOne'));
 * 
 * // Get allowed fields
 * console.log(typeConfig.helpers.getAllowedFields('typeOne'));
 * 
 * // Check reply type
 * console.log(typeConfig.helpers.allowsReplyType('typeOne', 'text'));
 * 
 * // Get metadata
 * console.log(typeConfig.metadata);
 */
