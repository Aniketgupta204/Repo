/**
 * Custom validators for schema validation
 */
module.exports = {
    'username': (data) => {
        try {
            // Check if data exists
            if (!data || typeof data !== 'string') {
                return {
                    isValid: false,
                    message: 'Username must be a valid string'
                };
            }

            // Trim the username
            const username = data.trim();

            // Check minimum length
            if (username.length < 3) {
                return {
                    isValid: false,
                    message: 'Username must be at least 3 characters long'
                };
            }

            // Check maximum length
            if (username.length > 20) {
                return {
                    isValid: false,
                    message: 'Username cannot exceed 20 characters'
                };
            }

            // Check for valid characters (alphanumeric, underscore, hyphen)
            const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
            if (!validUsernameRegex.test(username)) {
                return {
                    isValid: false,
                    message: 'Username can only contain letters, numbers, underscores, and hyphens'
                };
            }

            // Check if username starts with a letter
            if (!/^[a-zA-Z]/.test(username)) {
                return {
                    isValid: false,
                    message: 'Username must start with a letter'
                };
            }

            return {
                isValid: true,
                message: 'Username is valid'
            };
        } catch (error) {
            console.error('Error in username validator:', error);
            return {
                isValid: false,
                message: 'Username validation failed'
            };
        }
    },

    'email': (data) => {
        try {
            // Check if data exists
            if (!data || typeof data !== 'string') {
                return {
                    isValid: false,
                    message: 'Email must be a valid string'
                };
            }

            // Trim the email
            const email = data.trim();

            // Check minimum length
            if (email.length < 3) {
                return {
                    isValid: false,
                    message: 'Email must be at least 3 characters long'
                };
            }

            // Check maximum length
            if (email.length > 100) {
                return {
                    isValid: false,
                    message: 'Email cannot exceed 100 characters'
                };
            }

            // Email format validation
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                return {
                    isValid: false,
                    message: 'Invalid email format'
                };
            }

            return {
                isValid: true,
                message: 'Email is valid'
            };
        } catch (error) {
            console.error('Error in email validator:', error);
            return {
                isValid: false,
                message: 'Email validation failed'
            };
        }
    },

    'password': (data) => {
        try {
            // Check if data exists
            if (!data || typeof data !== 'string') {
                return {
                    isValid: false,
                    message: 'Password must be a valid string'
                };
            }

            const password = data.trim();

            // Check minimum length
            if (password.length < 8) {
                return {
                    isValid: false,
                    message: 'Password must be at least 8 characters long'
                };
            }

            // Check maximum length
            if (password.length > 100) {
                return {
                    isValid: false,
                    message: 'Password cannot exceed 100 characters'
                };
            }

            // Password strength validation
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
                return {
                    isValid: false,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                };
            }

            return {
                isValid: true,
                message: 'Password is valid'
            };
        } catch (error) {
            console.error('Error in password validator:', error);
            return {
                isValid: false,
                message: 'Password validation failed'
            };
        }
    }
};
