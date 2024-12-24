/**
 * LiveDB Manager for in-memory key-value storage with expiration and process synchronization
 * @description Manages in-memory data storage with expiration and cross-process synchronization
 */
module.exports = class LiveDbManager {
    /**
     * @param {Object} params - Configuration parameters
     * @param {Object} params.cortex - Cortex instance for cross-process communication
     * @throws {Error} If required dependencies are missing
     */
    constructor({ cortex }) {
        if (!cortex) {
            throw new Error('Cortex instance is required');
        }

        this.store = new Map();
        this.cortex = cortex;
        this.expirationCheckers = new Map();
        this.listeners = new Map();
        
        this._sub();
        this._startExpirationChecker();
    }

    /**
     * Subscribe to cross-process events
     * @private
     */
    _sub() {
        this.cortex.sub('internal.liveDb.add', (data) => {
            this.add({
                collection: data.collection,
                key: data.key,
                value: data.value,
                exp: data.exp,
                pub: false
            });
        });

        this.cortex.sub('internal.liveDb.delete', (data) => {
            this.delete({
                collection: data.collection,
                key: data.key,
                pub: false
            });
        });
    }

    /**
     * Publish updates to other processes
     * @private
     * @param {Object} params - Publication parameters
     */
    _pub({ action, payload }) {
        this.cortex.AsyncEmitToAllOf({
            type: this.cortex.nodeType,
            call: `internal.liveDb.${action}`,
            args: payload
        });
    }

    /**
     * Get database interface for a collection
     * @param {string} collection - Collection name
     * @returns {Object} Collection interface
     */
    db(collection) {
        if (!collection || typeof collection !== 'string') {
            throw new Error('Valid collection name is required');
        }

        return {
            add: ({ key, value, exp }) => this.add({ collection, key, value, exp, pub: true }),
            delete: ({ key }) => this.delete({ collection, key, pub: true }),
            get: ({ key }) => this.get({ collection, key }),
            subscribe: (callback) => this.subscribe({ collection, callback }),
            unsubscribe: (callback) => this.unsubscribe({ collection, callback })
        };
    }

    /**
     * Add item to collection
     * @param {Object} params - Addition parameters
     * @returns {Object} Added document
     */
    add({ collection, key, value, exp = -1, pub = false }) {
        try {
            if (!collection || !key) {
                throw new Error('Collection and key are required');
            }

            if (!this.store.has(collection)) {
                this.store.set(collection, new Map());
            }

            const doc = { value, exp, timestamp: Date.now() };
            this.store.get(collection).set(key, doc);

            if (exp > 0) {
                this._setupExpiration(collection, key, exp);
            }

            if (pub) {
                this._pub({ action: 'add', payload: { collection, key, value, exp } });
            }

            this._notifyListeners(collection, 'add', { key, value });

            return doc;
        } catch (error) {
            console.error('Error adding item:', error);
            return null;
        }
    }

    /**
     * Get item from collection
     * @param {Object} params - Retrieval parameters
     * @returns {Object|null} Retrieved document or null
     */
    get({ collection, key }) {
        try {
            if (!collection || !key) {
                throw new Error('Collection and key are required');
            }

            const col = this.store.get(collection);
            if (!col) return null;

            const doc = col.get(key);
            if (!doc) return null;

            if (doc.exp > 0 && Date.now() - doc.timestamp >= doc.exp) {
                this.delete({ collection, key });
                return null;
            }

            return doc;
        } catch (error) {
            console.error('Error getting item:', error);
            return null;
        }
    }

    /**
     * Delete item from collection
     * @param {Object} params - Deletion parameters
     * @returns {boolean} Success status
     */
    delete({ collection, key, pub = false }) {
        try {
            if (!collection || !key) {
                throw new Error('Collection and key are required');
            }

            const col = this.store.get(collection);
            if (!col) return false;

            const deleted = col.delete(key);

            if (deleted) {
                this._clearExpiration(collection, key);
                
                if (pub) {
                    this._pub({ action: 'delete', payload: { collection, key } });
                }

                this._notifyListeners(collection, 'delete', { key });
            }

            return deleted;
        } catch (error) {
            console.error('Error deleting item:', error);
            return false;
        }
    }

    /**
     * Subscribe to collection changes
     * @param {Object} params - Subscription parameters
     * @returns {boolean} Success status
     */
    subscribe({ collection, callback }) {
        try {
            if (!collection || typeof callback !== 'function') {
                throw new Error('Collection and callback function are required');
            }

            if (!this.listeners.has(collection)) {
                this.listeners.set(collection, new Set());
            }

            this.listeners.get(collection).add(callback);
            return true;
        } catch (error) {
            console.error('Error subscribing to collection:', error);
            return false;
        }
    }

    /**
     * Unsubscribe from collection changes
     * @param {Object} params - Unsubscription parameters
     * @returns {boolean} Success status
     */
    unsubscribe({ collection, callback }) {
        try {
            if (!collection || typeof callback !== 'function') {
                throw new Error('Collection and callback function are required');
            }

            const listeners = this.listeners.get(collection);
            if (!listeners) return false;

            return listeners.delete(callback);
        } catch (error) {
            console.error('Error unsubscribing from collection:', error);
            return false;
        }
    }

    /**
     * Setup expiration for an item
     * @private
     * @param {string} collection - Collection name
     * @param {string} key - Item key
     * @param {number} exp - Expiration time in milliseconds
     */
    _setupExpiration(collection, key, exp) {
        const expirationKey = `${collection}:${key}`;
        this._clearExpiration(collection, key);

        const timeoutId = setTimeout(() => {
            this.delete({ collection, key });
        }, exp);

        this.expirationCheckers.set(expirationKey, timeoutId);
    }

    /**
     * Clear expiration for an item
     * @private
     * @param {string} collection - Collection name
     * @param {string} key - Item key
     */
    _clearExpiration(collection, key) {
        const expirationKey = `${collection}:${key}`;
        const existingTimeout = this.expirationCheckers.get(expirationKey);
        
        if (existingTimeout) {
            clearTimeout(existingTimeout);
            this.expirationCheckers.delete(expirationKey);
        }
    }

    /**
     * Start periodic expiration checker
     * @private
     */
    _startExpirationChecker() {
        setInterval(() => {
            this.store.forEach((col, colName) => {
                col.forEach((doc, key) => {
                    if (doc.exp > 0 && Date.now() - doc.timestamp >= doc.exp) {
                        this.delete({ collection: colName, key });
                    }
                });
            });
        }, 60000); // Check every minute
    }

    /**
     * Notify collection listeners
     * @private
     * @param {string} collection - Collection name
     * @param {string} action - Action type
     * @param {Object} data - Event data
     */
    _notifyListeners(collection, action, data) {
        const listeners = this.listeners.get(collection);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback({ action, data });
                } catch (error) {
                    console.error('Error in listener callback:', error);
                }
            });
        }
    }
};
