/**
 * Language seed data for application localization
 * @module langSeed
 */

module.exports = [
    {
        id: 'funny',
        label: {
            ar: 'مضحك',
            en: 'Funny',
            es: 'Gracioso',
            fr: 'Drôle',
            de: 'Lustig'
        },
        category: 'emotions',
        active: true
    },
    {
        id: 'health',
        label: {
            ar: 'صحة',
            en: 'Health',
            es: 'Salud',
            fr: 'Santé',
            de: 'Gesundheit'
        },
        category: 'medical',
        active: true
    },
    {
        id: 'sports',
        label: {
            ar: 'رياضة',
            en: 'Sports',
            es: 'Deportes',
            fr: 'Sports',
            de: 'Sport'
        },
        category: 'activities',
        active: true
    },
    {
        id: 'technology',
        label: {
            ar: 'تكنولوجيا',
            en: 'Technology',
            es: 'Tecnología',
            fr: 'Technologie',
            de: 'Technologie'
        },
        category: 'tech',
        active: true
    },
    {
        id: 'food',
        label: {
            ar: 'طعام',
            en: 'Food',
            es: 'Comida',
            fr: 'Nourriture',
            de: 'Essen'
        },
        category: 'lifestyle',
        active: true
    }
];

/**
 * Metadata for language configuration
 * @constant {Object} LANG_META
 */
const LANG_META = {
    version: '1.0.0',
    supportedLanguages: ['ar', 'en', 'es', 'fr', 'de'],
    defaultLanguage: 'en',
    categories: [
        'emotions',
        'medical',
        'activities',
        'tech',
        'lifestyle'
    ],
    lastUpdated: new Date().toISOString()
};

/**
 * Validation functions for language entries
 */
const validation = {
    /**
     * Validate a language entry
     * @param {Object} entry - Language entry to validate
     * @returns {boolean} Validation result
     */
    validateEntry(entry) {
        return (
            entry.id &&
            typeof entry.id === 'string' &&
            entry.label &&
            typeof entry.label === 'object' &&
            entry.category &&
            typeof entry.category === 'string' &&
            typeof entry.active === 'boolean'
        );
    },

    /**
     * Validate language labels
     * @param {Object} labels - Language labels to validate
     * @returns {boolean} Validation result
     */
    validateLabels(labels) {
        return LANG_META.supportedLanguages.every(lang => 
            labels[lang] && typeof labels[lang] === 'string'
        );
    }
};

/**
 * Helper functions for language handling
 */
const helpers = {
    /**
     * Get label for specific language
     * @param {Object} entry - Language entry
     * @param {string} lang - Language code
     * @returns {string} Label in specified language
     */
    getLabel(entry, lang) {
        return entry.label[lang] || entry.label[LANG_META.defaultLanguage];
    },

    /**
     * Get all entries for a category
     * @param {string} category - Category to filter by
     * @returns {Array} Filtered entries
     */
    getByCategory(category) {
        return module.exports.filter(entry => 
            entry.category === category && entry.active
        );
    },

    /**
     * Get all active entries
     * @returns {Array} Active entries
     */
    getActive() {
        return module.exports.filter(entry => entry.active);
    }
};

// Add metadata and helpers to exports
module.exports.meta = LANG_META;
module.exports.validate = validation;
module.exports.helpers = helpers;

/**
 * Example usage:
 * const langSeed = require('./lang.seed.js');
 * 
 * // Get all entries
 * console.log(langSeed);
 * 
 * // Get metadata
 * console.log(langSeed.meta);
 * 
 * // Get label in specific language
 * const entry = langSeed[0];
 * console.log(langSeed.helpers.getLabel(entry, 'en'));
 * 
 * // Get entries by category
 * console.log(langSeed.helpers.getByCategory('emotions'));
 * 
 * // Get active entries
 * console.log(langSeed.helpers.getActive());
 * 
 * // Validate entry
 * console.log(langSeed.validate.validateEntry(entry));
 */
