const cache = {
    search: {
        createIndex: async ({ index, prefix, schema }) => {
            const schemaArgs = [];
            for (const skey in schema) {
                schemaArgs.push(skey);
                schemaArgs.push(schema[skey].type);
                
                if (schema[skey].sortable) {
                    schemaArgs.push('SORTABLE');
                }
            }

            const args = [
                'FT.CREATE',
                index,
                'ON', 'hash',
                'PREFIX', '1', prefix,
                'SCHEMA',
                ...schemaArgs
            ];
            
            try {
                await redisClient.call(...args);
            } catch (error) {
                throw new Error(`Failed to create index: ${error.message}`);
            }
        },

        find: async ({ query, searchIndex, populate, offset = 0, limit = 50 }) => {
            const startTime = performance.now();
            
            try {
                let args = [
                    'FT.SEARCH',
                    searchIndex,
                    query,
                    'LIMIT',
                    offset,
                    limit
                ];

                if (populate && Array.isArray(populate) && populate.length > 0) {
                    args = args.concat(['RETURN', populate.length], populate);
                }

                console.log(`search --> ${args.join(' ')}`);
                const res = await redisClient.call(...args);

                const [count, ...foundKeysAndSightings] = res;
                const foundSightings = foundKeysAndSightings.filter((_, index) => index % 2 !== 0);
                
                const sightings = foundSightings.map(sightingArray => {
                    const keys = sightingArray.filter((_, index) => index % 2 === 0);
                    const values = sightingArray.filter((_, index) => index % 2 !== 0);
                    
                    return keys.reduce((sighting, key, index) => {
                        sighting[key] = values[index];
                        return sighting;
                    }, {});
                });

                const endTime = performance.now();
                return {
                    count,
                    docs: sightings,
                    time: `${Math.trunc(endTime - startTime)}ms`
                };
            } catch (error) {
                console.error('Search error:', error);
                return { error: error.message || 'unable to execute' };
            }
        }
    },

    hyperlog: {
        add: async ({ key, items }) => {
            try {
                const args = [key, ...items];
                return await redisClient.call('PFADD', ...args);
            } catch (error) {
                console.error('Hyperlog add error:', error);
                throw error;
            }
        },

        count: async ({ key }) => {
            try {
                return await redisClient.call('PFCOUNT', key);
            } catch (error) {
                console.error('Hyperlog count error:', error);
                return 0;
            }
        },

        merge: async ({ keys }) => {
            try {
                return await redisClient.call('PFMERGE', ...keys);
            } catch (error) {
                console.error('Hyperlog merge error:', error);
                return 0;
            }
        }
    },

    hash: {
        set: async ({ key, data }) => {
            try {
                const args = [key];
                Object.entries(data).forEach(([field, value]) => {
                    args.push(field, value);
                });
                return await redisClient.hset(...args);
            } catch (error) {
                throw new Error(`Hash set error: ${error.message}`);
            }
        },

        remove: async ({ key, fields }) => {
            try {
                return await redisClient.hdel(key, ...fields);
            } catch (error) {
                throw new Error(`Hash remove error: ${error.message}`);
            }
        },

        incrby: async ({ key, field, incr = 1 }) => {
            try {
                return await redisClient.hincrby(key, field, incr);
            } catch (error) {
                throw new Error(`Hash incrby error: ${error.message}`);
            }
        },

        get: async ({ key }) => {
            try {
                return await redisClient.hgetall(key);
            } catch (error) {
                throw new Error(`Hash get error: ${error.message}`);
            }
        },

        setField: async ({ key, fieldKey, data }) => {
            try {
                return await redisClient.hset(key, fieldKey, data);
            } catch (error) {
                throw new Error(`Hash setField error: ${error.message}`);
            }
        },

        getField: async ({ key, fieldKey }) => {
            try {
                return await redisClient.hget(key, fieldKey);
            } catch (error) {
                throw new Error(`Hash getField error: ${error.message}`);
            }
        },

        getFields: async ({ key, fields }) => {
            try {
                const result = await redisClient.hmget(key, ...fields);
                if (!result) return null;

                return fields.reduce((obj, field, index) => {
                    obj[field] = result[index];
                    return obj;
                }, {});
            } catch (error) {
                throw new Error(`Hash getFields error: ${error.message}`);
            }
        }
    },

    key: {
        expire: async ({ key, expire }) => {
            try {
                return await redisClient.expire(key, expire);
            } catch (error) {
                throw new Error(`Key expire error: ${error.message}`);
            }
        }
    }
};

module.exports = cache;
