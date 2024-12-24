const path = require('path');
const glob = require("glob");

module.exports = (pattern) => {
    try {
        const files = glob.sync(pattern);
        const modules = {};
        
        files.forEach(p => {
            try {
                const key = p.split('/').pop().split('.').shift();
                modules[key] = require(path.resolve(p));
            } catch (err) {
                console.error(`Error loading module ${p}:`, err);
            }
        });
        
        return modules;
    } catch (err) {
        console.error('Error in file loader:', err);
        return {};
    }
};
const key = p.split(path.sep).pop().split('.').shift();
/**
 * Loads files matching the given glob pattern and returns them as an object
 * @param {string} pattern - Glob pattern to match files
 * @returns {Object} Object containing loaded modules with filenames (without extension) as keys
 * @throws {Error} If there's an error reading the files or loading the modules
 */
