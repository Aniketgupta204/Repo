const loader = require('./_common/fileLoader');
const path = require('path');

module.exports = class MongoLoader {
    /**
     * Creates a new MongoLoader instance
     * @param {Object} params - Constructor parameters
     * @param {string} params.schemaExtension - File extension for schema files
     */
    constructor({ schemaExtension }) {
        if (!schemaExtension || typeof schemaExtension !== 'string') {
            throw new Error('Schema extension must be a valid string');
        }
        
        this.schemaExtension = schemaExtension;
    }

    /**
     * Loads MongoDB models from schema files
     * @returns {Object} Object containing loaded models
     * @throws {Error} If loading fails
     */
    load() {
        try {
            // Validate schema extension
            if (!this.schemaExtension) {
                throw new Error('Schema extension not set');
            }

            // Construct the glob pattern
            const pattern = path.join('managers', 'entities', '**', `*.${this.schemaExtension}`);

            // Load models
            const models = loader(pattern);

            // Validate loaded models
            if (!models || typeof models !== 'object') {
                throw new Error('Failed to load MongoDB models');
            }

            // Check if any models were loaded
            if (Object.keys(models).length === 0) {
                console.warn(`No models found with extension .${this.schemaExtension}`);
            }

            return models;
        } catch (error) {
            console.error('Error in MongoLoader.load():', error);
            throw error;
        }
    }

    /**
     * Validates a loaded model
     * @param {string} modelName - Name of the model
     * @param {Object} model - The loaded model
     * @returns {boolean} - True if model is valid
     */
    validateModel(modelName, model) {
        try {
            if (!model || typeof model !== 'object') {
                throw new Error(`Invalid model structure for ${modelName}`);
            }

            // Add additional model validation logic here
            return true;
        } catch (error) {
            console.error(`Model validation failed for ${modelName}:`, error);
            return false;
        }
    }
}
