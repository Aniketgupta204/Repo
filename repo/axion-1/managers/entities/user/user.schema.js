/**
 * User schema validation rules
 */
module.exports = {
    createUser: {
        username: {
            type: 'string',
            required: true,
            minLength: 3,
            maxLength: 30,
            pattern: '^[a-zA-Z0-9_-]+$',
            message: 'Username must be 3-30 characters long and can only contain letters, numbers, underscores, and hyphens'
        },
        email: {
            type: 'string',
            required: true,
            minLength: 5,
            maxLength: 100,
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            message: 'Please enter a valid email address'
        },
        password: {
            type: 'string',
            required: true,
            minLength: 8,
            maxLength: 100,
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
            message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        }
    },

    updateUser: {
        username: {
            type: 'string',
            required: false,
            minLength: 3,
            maxLength: 30,
            pattern: '^[a-zA-Z0-9_-]+$',
            message: 'Username must be 3-30 characters long and can only contain letters, numbers, underscores, and hyphens'
        },
        email: {
            type: 'string',
            required: false,
            minLength: 5,
            maxLength: 100,
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            message: 'Please enter a valid email address'
        },
        currentPassword: {
            type: 'string',
            required: false,
            minLength: 8,
            maxLength: 100,
            message: 'Current password is required when changing password'
        },
        newPassword: {
            type: 'string',
            required: false,
            minLength: 8,
            maxLength: 100,
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
            message: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        },
        profile: {
            type: 'object',
            required: false,
            properties: {
                firstName: {
                    type: 'string',
                    maxLength: 50,
                    pattern: '^[a-zA-Z\\s-]+$',
                    message: 'First name can only contain letters, spaces, and hyphens'
                },
                lastName: {
                    type: 'string',
                    maxLength: 50,
                    pattern: '^[a-zA-Z\\s-]+$',
                    message: 'Last name can only contain letters, spaces, and hyphens'
                },
                phoneNumber: {
                    type: 'string',
                    pattern: '^\\+?[1-9]\\d{1,14}$',
                    message: 'Please enter a valid phone number'
                },
                bio: {
                    type: 'string',
                    maxLength: 500,
                    message: 'Bio cannot exceed 500 characters'
                },
                location: {
                    type: 'string',
                    maxLength: 100,
                    message: 'Location cannot exceed 100 characters'
                }
            }
        },
        settings: {
            type: 'object',
            required: false,
            properties: {
                emailNotifications: {
                    type: 'boolean',
                    default: true
                },
                twoFactorAuth: {
                    type: 'boolean',
                    default: false
                },
                language: {
                    type: 'string',
                    enum: ['en', 'es', 'fr', 'de'],
                    default: 'en'
                },
                timezone: {
                    type: 'string',
                    pattern: '^[A-Za-z_/]+$',
                    message: 'Please enter a valid timezone'
                }
            }
        }
    },

    loginUser: {
        email: {
            type: 'string',
            required: true,
            minLength: 5,
            maxLength: 100,
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            message: 'Please enter a valid email address'
        },
        password: {
            type: 'string',
            required: true,
            minLength: 8,
            maxLength: 100,
            message: 'Password is required'
        }
    }
};
