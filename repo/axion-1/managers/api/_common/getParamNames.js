/**
 * Extracts parameter names from a function
 * @param {Function} func - Function to analyze
 * @returns {string} Comma-separated list of parameter names
 * @throws {Error} If func is not a valid function
 */

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
const ARROW_FUNCTION = /^(?:async\s+)?(\(?[^)]*\))?\s*=>/;

function getParamNames(func) {
    try {
        // Input validation
        if (!func) {
            throw new Error('Function parameter is required');
        }

        if (typeof func !== 'function') {
            throw new Error('Parameter must be a function');
        }

        // Convert function to string
        const fnStr = func.toString().replace(STRIP_COMMENTS, '');

        // Handle different function types
        let paramStr;
        if (ARROW_FUNCTION.test(fnStr)) {
            // Arrow function
            const match = fnStr.match(ARROW_FUNCTION);
            paramStr = match[1] || '()';
            // Remove parentheses if present
            paramStr = paramStr.replace(/^\(|\)$/g, '');
        } else {
            // Regular function
            paramStr = fnStr.slice(
                fnStr.indexOf('(') + 1,
                fnStr.indexOf(')')
            );
        }

        // Extract parameter names
        const result = paramStr.match(ARGUMENT_NAMES);

        // Handle no parameters case
        if (!result) {
            return '';
        }

        // Filter out invalid parameter names
        const validParams = result.filter(param => {
            // Check for valid JavaScript identifier
            return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(param);
        });

        return validParams.join(', ');
    } catch (error) {
        console.error('Error in getParamNames:', error);
        throw error;
    }
}

/**
 * Validates if a string is a valid JavaScript identifier
 * @param {string} name - Parameter name to validate
 * @returns {boolean} True if valid
 */
function isValidParameterName(name) {
    try {
        // Check if it's a reserved word
        const reservedWords = [
            'break', 'case', 'catch', 'class', 'const', 'continue',
            'debugger', 'default', 'delete', 'do', 'else', 'export',
            'extends', 'finally', 'for', 'function', 'if', 'import',
            'in', 'instanceof', 'new', 'return', 'super', 'switch',
            'this', 'throw', 'try', 'typeof', 'var', 'void', 'while',
            'with', 'yield'
        ];

        return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name) && 
               !reservedWords.includes(name);
    } catch (error) {
        console.error('Error in isValidParameterName:', error);
        return false;
    }
}

module.exports = getParamNames;

// Example usage:
/*
function example(a, b, c) {}
console.log(getParamNames(example)); // "a, b, c"

const arrowFn = (x, y) => {};
console.log(getParamNames(arrowFn)); // "x, y"

const noParams = () => {};
console.log(getParamNames(noParams)); // ""

const asyncFn = async (foo, bar) => {};
console.log(getParamNames(asyncFn)); // "foo, bar"
*/
