const path = require('path');
const glob = require("glob");

/**
 * Load any files that match the pattern and require them
 * @param {string} pattern - Glob pattern to match files
 * @returns {Array} Array of required modules
 * @throws {Error} If there's an error loading the modules
 */
module.exports = (pattern) => {
    try {
        // Validate input
        if (!pattern || typeof pattern !== 'string') {
            throw new Error('Invalid pattern provided');
        }

        // Get matching files
        const files = glob.sync(pattern);
        
        // Handle case where no files are found
        if (!files || files.length === 0) {
            console.warn('No files found matching pattern:', pattern);
            return [];
        }

        // Load modules
        const modules = files.map(p => {
            try {
                return require(path.resolve(p));
            } catch (err) {
                console.error(`Error loading module ${p}:`, err);
                return null;
            }
        }).filter(module => module !== null);

        return modules;
    } catch (err) {
        console.error('Error in file loader:', err);
        throw err;
    }
}
