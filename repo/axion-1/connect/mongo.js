const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const connectDB = async ({ uri }) => {
    if (!uri) {
        throw new Error('MongoDB URI is required');
    }

    try {
        // Configuration options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s
            family: 4, // Use IPv4, skip trying IPv6
            maxPoolSize: 10, // Maintain up to 10 socket connections
            retryWrites: true,
        };

        // Connect to MongoDB
        await mongoose.connect(uri, options);

        // Connection event handlers
        mongoose.connection.on('connected', () => {
            console.log('💾 Mongoose connected successfully to:', 
                uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials in logs
        });

        mongoose.connection.on('error', (err) => {
            console.error('💾 Mongoose connection error:', err);
            console.log(
                '=> if using local mongodb: make sure that mongo server is running\n' +
                '=> if using online mongodb: check your internet connection\n' +
                '=> MongoDB Error Details:', err.message
            );
        });

        mongoose.connection.on('disconnected', () => {
            console.log('💾 Mongoose connection disconnected');
        });

        // Graceful shutdown handling
        const gracefulShutdown = async () => {
            try {
                await mongoose.connection.close();
                console.log('💾 Mongoose connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error during mongoose connection closure:', err);
                process.exit(1);
            }
        };

        // Handle application termination
        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGUSR2', gracefulShutdown); // For nodemon restarts

        // Handle uncaught exceptions
        process.on('uncaughtException', async (err) => {
            console.error('Uncaught Exception:', err);
            await gracefulShutdown();
        });

        return mongoose.connection;

    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// Helper function to check connection status
const checkConnection = () => {
    return {
        isConnected: mongoose.connection.readyState === 1,
        state: getConnectionState(mongoose.connection.readyState),
        dbName: mongoose.connection.name,
        host: mongoose.connection.host
    };
};

// Get connection state description
const getConnectionState = (state) => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
        99: 'uninitialized'
    };
    return states[state] || 'unknown';
};

// Retry connection helper
const retryConnection = async (uri, maxRetries = 5, delay = 5000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await connectDB({ uri });
            console.log('MongoDB connection successful after retry');
            return true;
        } catch (err) {
            console.error(`Connection attempt ${i + 1} failed:`, err.message);
            if (i < maxRetries - 1) {
                console.log(`Retrying in ${delay/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error(`Failed to connect after ${maxRetries} attempts`);
};

module.exports = {
    connectDB,
    checkConnection,
    retryConnection
};
const { connectDB, checkConnection, retryConnection } = require('./mongo');

// Connect with retry mechanism
retryConnection('your-mongodb-uri')
    .then(() => console.log('Connected successfully'))
    .catch(err => console.error('Failed to connect:', err));

// Or connect directly
connectDB({ uri: 'your-mongodb-uri' })
    .then(() => console.log('Connected successfully'))
    .catch(err => console.error('Connection error:', err));
