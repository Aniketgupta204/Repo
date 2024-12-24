// services/auth.service.js
const User = require('../models/User');

class AuthService {
    async register(userData) {
        const user = new User(userData);
        await user.save();
        const token = await user.generateAuthToken();
        return { user, token };
    }

    async login(email, password) {
        const user = await User.findOne({ email, status: 'active' });
        if (!user) {
            throw new Error('Invalid login credentials');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid login credentials');
        }

        const token = await user.generateAuthToken();
        return { user, token };
    }

    async logout(user, token) {
        user.tokens = user.tokens.filter(t => t.token !== token);
        await user.save();
    }

    async logoutAll(user) {
        user.tokens = [];
        await user.save();
    }

    async changePassword(user, oldPassword, newPassword) {
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }

        user.password = newPassword;
        await user.save();
    }
}

module.exports = new AuthService();
