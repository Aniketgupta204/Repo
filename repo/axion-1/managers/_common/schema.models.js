const emojis = require('../../public/emojis.data.json');

module.exports = {
    id: {
        path: "id",
        type: "string",
        length: { min: 1, max: 50 },
        required: true
    },
    username: {
        path: 'username',
        type: 'string',
        length: { min: 3, max: 20 },
        custom: 'username',
        required: true
    },
    password: {
        path: 'password',
        type: 'string',
        length: { min: 8, max: 100 },
        required: true
    },
    email: {
        path: 'email',
        type: 'string',
        length: { min: 3, max: 100 },
        regex: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        required: true
    },
    title: {
        path: 'title',
        type: 'string',
        length: { min: 3, max: 300 },
        required: true
    },
    label: {
        path: 'label',
        type: 'string',
        length: { min: 3, max: 100 }
    },
    shortDesc: {
        path: 'shortDesc', // Fixed path name to match field name
        type: 'string',
        length: { min: 3, max: 300 }
    },
    longDesc: {
        path: 'longDesc', // Fixed path name to match field name
        type: 'string',
        length: { min: 3, max: 2000 }
    },
    url: {
        path: 'url',
        type: 'string',
        length: { min: 9, max: 300 },
        regex: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    },
    emoji: {
        path: 'emoji',
        type: 'array', // Standardized to lowercase
        items: {
            type: 'string',
            length: { min: 1, max: 10 },
            oneOf: emojis.value
        }
    },
    price: {
        path: 'price',
        type: 'number',
        range: { min: 0 } // Added reasonable constraint
    },
    avatar: {
        path: 'avatar',
        type: 'string',
        length: { min: 8, max: 100 }
    },
    text: {
        path: 'text',
        type: 'string', // Standardized to lowercase
        length: { min: 3, max: 15 }
    },
    longText: {
        path: 'longText',
        type: 'string',
        length: { min: 3, max: 250 }
    },
    paragraph: {
        path: 'paragraph',
        type: 'string',
        length: { min: 3, max: 10000 }
    },
    phone: {
        path: 'phone',
        type: 'string',
        length: { min: 10, max: 13 }, // Changed fixed length to range
        regex: /^\+?[\d\s-]{10,13}$/ // Added phone validation
    },
    number: {
        path: 'number',
        type: 'number',
        range: { min: 1, max: 999999 } // Converted length to range for numbers
    },
    arrayOfStrings: {
        path: 'arrayOfStrings',
        type: 'array',
        items: {
            type: 'string',
            length: { min: 3, max: 100 }
        }
    },
    obj: {
        path: 'obj',
        type: 'object',
        required: false
    },
    bool: {
        path: 'bool',
        type: 'boolean',
        required: false
    }
};
