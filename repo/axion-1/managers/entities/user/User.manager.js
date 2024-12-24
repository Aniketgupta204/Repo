try {
    const userManager = new UserManager({
        utils,
        cache,
        config,
        cortex,
        managers,
        validators,
        mongomodels
    });

    // Create new user
    const result = await userManager.createUser({
        username: 'johndoe',
        email: 'john@example.com',
        password: 'SecurePassword123!'
    });

    if (result.error) {
        console.error('Error:', result.error);
    } else {
        console.log('User created:', result.user);
        console.log('Token:', result.longToken);
    }

    // Validate credentials
    const validationResult = await userManager.validateCredentials(
        'john@example.com',
        'SecurePassword123!'
    );

    if (validationResult.error) {
        console.error('Error:', validationResult.error);
    } else {
        console.log('Valid credentials for user:', validationResult.user);
    }
} catch (error) {
    console.error('Error:', error.message);
}
module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.usersCollection     = "users";
        this.userExposed         = ['createUser'];
    }

    async createUser({username, email, password}){
        const user = {username, email, password};

        // Data validation
        let result = await this.validators.user.createUser(user);
        if(result) return result;
        
        // Creation Logic
        let createdUser     = {username, email, password}
        let longToken       = this.tokenManager.genLongToken({userId: createdUser._id, userKey: createdUser.key });
        
        // Response
        return {
            user: createdUser, 
            longToken 
        };
    }

}
