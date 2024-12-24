# Middleware Documentation

## Core Middlewares

### 1. Device Middleware
Handles device detection and information processing.
```javascript
const deviceMiddleware = require('./__device.mw.js');
app.use(deviceMiddleware({ meta, config, managers }));

// Response Format:
{
    success: true,
    deviceInfo: {
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
        browser: "Chrome",
        os: "Windows",
        device: "Desktop",
        timestamp: "2024-01-17T12:34:56.789Z"
    }
}
const filesMiddleware = require('./__files.mw.js');
app.use(filesMiddleware({ meta, config, managers: { fm: fileManager } }));

// Response Format:
{
    success: true,
    files: [{
        filename: "example.jpg",
        size: 1024567,
        mimetype: "image/jpeg",
        uploadedAt: "2024-01-17T12:34:56.789Z"
    }],
    metadata: {
        totalFiles: 1,
        totalSize: 1024567
    }
}
const headersMiddleware = require('./__headers.mw.js');
app.use(headersMiddleware({ meta, config, managers }));

// Response Format:
{
    success: true,
    headers: {
        "content-type": "application/json",
        "authorization": "Bearer ***"
    },
    metadata: {
        count: 2,
        timestamp: "2024-01-17T12:34:56.789Z"
    }
}
const longTokenMiddleware = require('./__longToken.mw.js');
app.use(longTokenMiddleware({ meta, config, managers }));

// Response Format:
{
    ok: true,
    tokenInfo: {
        verified: true,
        type: "long-lived",
        timestamp: "2024-01-17T12:34:56.789Z"
    }
}
const paramsMiddleware = require('./__params.mw.js');
app.use(paramsMiddleware({ meta, config, managers }));

// Response Format:
{
    success: true,
    params: {
        id: "123",
        type: "user"
    },
    metadata: {
        count: 2,
        timestamp: "2024-01-17T12:34:56.789Z"
    }
}
const queryMiddleware = require('./__query.mw.js');
app.use(queryMiddleware({ meta, config, managers }));

// Response Format:
{
    success: true,
    query: {
        limit: 10,
        page: 1,
        sort: "desc"
    },
    metadata: {
        count: 3,
        timestamp: "2024-01-17T12:34:56.789Z"
    }
}
const shortTokenMiddleware = require('./__shortToken.mw.js');
app.use(shortTokenMiddleware({ meta, config, managers }));

// Response Format:
{
    ok: true,
    tokenInfo: {
        verified: true,
        type: "short-lived",
        timestamp: "2024-01-17T12:34:56.789Z"
    }
}
const tokenMiddleware = require('./__token.mw.js');
app.use(tokenMiddleware({ meta, config, managers }));

// Response Format:
{
    ok: true,
    tokenInfo: {
        verified: true,
        type: "bearer",
        timestamp: "2024-01-17T12:34:56.789Z"
    }
}
{
    success: false,
    error: "Error message",
    code: "ERROR_CODE",
    timestamp: "2024-01-17T12:34:56.789Z"
}
{
    meta: {}, // Metadata settings
    config: {}, // Middleware-specific config
    managers: {} // Required service managers
}

//This documentation provides:
//- Clear middleware descriptions
//- Usage examples
//- Response formats
//- Error handling
//- Configuration guides
//- Best practices
//- Security guidelines

//Keep this documentation updated as changes are made to the middleware components.
