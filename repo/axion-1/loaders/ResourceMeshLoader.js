const loader = require('./_common/fileLoader');
const path = require('path');

module.exports = class ResourceMeshLoader { 
    /**
     * Creates a new ResourceMeshLoader instance
     * @param {Object} injectable - Injectable dependencies
     */
    constructor(injectable) {
        if (!injectable || typeof injectable !== 'object') {
            throw new Error('Injectable parameter must be a valid object');
        }

        this.nodes = {};
        this.injectable = injectable;
    }

    /**
     * Loads and validates resource nodes
     * @returns {Object} Object containing validated resource nodes
     * @throws {Error} If loading or validation fails
     */
    load() {
        try {
            // Load resource nodes
            const loadedNodes = loader(path.join('mws', '**', '*.rnode.js'));

            if (!loadedNodes || typeof loadedNodes !== 'object') {
                throw new Error('Failed to load resource nodes');
            }

            // Initialize and validate each node
            Object.keys(loadedNodes).forEach(nodeName => {
                try {
                    // Check if node is a function (constructor)
                    if (typeof loadedNodes[nodeName] !== 'function') {
                        throw new Error(`Resource node ${nodeName} is not a constructor`);
                    }

                    // Initialize node with injectable dependencies
                    const nodeInstance = new loadedNodes[nodeName](this.injectable);

                    // Validate node structure
                    if (this.validateNode(nodeName, nodeInstance)) {
                        this.nodes[nodeName] = nodeInstance;
                    } else {
                        throw new Error(`Invalid node structure for ${nodeName}`);
                    }
                } catch (error) {
                    console.error(`Error processing node ${nodeName}:`, error);
                    // Skip failed nodes
                }
            });

            // Check if any nodes were loaded
            if (Object.keys(this.nodes).length === 0) {
                console.warn('No valid resource nodes were loaded');
            }

            return this.nodes;
        } catch (error) {
            console.error('Error in ResourceMeshLoader.load():', error);
            throw error;
        }
    }

    /**
     * Validates a resource node's structure and required methods
     * @param {string} nodeName - Name of the node
     * @param {Object} node - Node instance to validate
     * @returns {boolean} - True if node is valid
     */
    validateNode(nodeName, node) {
        try {
            // Basic type checking
            if (!node || typeof node !== 'object') {
                throw new Error('Node must be an object');
            }

            // Check for required methods/properties
            const requiredMethods = ['initialize', 'process'];
            for (const method of requiredMethods) {
                if (typeof node[method] !== 'function') {
                    throw new Error(`Missing required method: ${method}`);
                }
            }

            // Additional validation can be added here
            return true;
        } catch (error) {
            console.error(`Node validation failed for ${nodeName}:`, error);
            return false;
        }
    }

    /**
     * Gets a specific node by name
     * @param {string} nodeName - Name of the node to retrieve
     * @returns {Object|null} The requested node or null if not found
     */
    getNode(nodeName) {
        return this.nodes[nodeName] || null;
    }
}
