// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const ResponseHandler = require('./utils/responseHandler');

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes/api'));

// 404 handler
app.use((req, res) => {
    ResponseHandler.error(res, 'Route not found', 404);
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    ResponseHandler.error(
        res,
        err.message || 'Internal Server Error',
        err.status || 500,
        process.env.NODE_ENV === 'development' ? [{ stack: err.stack }] : []
    );
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
