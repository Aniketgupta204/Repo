module.exports = ({ meta, config, managers }) => {
    /**
     * Middleware for handling file uploads
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Next middleware function
     */
    return async ({ req, res, next }) => {
        // Validate managers and file manager initialization
        if (!managers?.fm) {
            const error = new Error('File manager (fm) is not initialized');
            console.error('File middleware error:', error);
            return next({
                success: false,
                error: error.message,
                code: 'FILE_MANAGER_NOT_INITIALIZED'
            });
        }

        try {
            // Validate request object
            if (!req) {
                throw new Error('Request object is required');
            }

            // Validate if request contains files
            if (!req.files && !req.file) {
                return next({
                    success: false,
                    error: 'No files were uploaded',
                    code: 'NO_FILES_UPLOADED'
                });
            }

            // Get file information
            const files = req.files || (req.file ? [req.file] : []);
            
            // Validate file size and type if needed
            const validationErrors = validateFiles(files);
            if (validationErrors.length > 0) {
                return next({
                    success: false,
                    error: 'File validation failed',
                    details: validationErrors,
                    code: 'FILE_VALIDATION_FAILED'
                });
            }

            // Handle file upload
            const uploadResult = await managers.fm.upload(req, res);

            // Add upload metadata
            const response = {
                success: true,
                files: Array.isArray(files) ? files.map(sanitizeFileInfo) : sanitizeFileInfo(files),
                result: uploadResult,
                timestamp: new Date().toISOString(),
                totalFiles: Array.isArray(files) ? files.length : 1
            };

            return next(response);

        } catch (error) {
            console.error('File upload error:', error);
            return next({
                success: false,
                error: error.message || 'File upload failed',
                code: 'FILE_UPLOAD_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    };
};

/**
 * Validates uploaded files
 * @param {Array|Object} files - Files to validate
 * @returns {Array} Array of validation errors
 */
function validateFiles(files) {
    const errors = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const fileArray = Array.isArray(files) ? files : [files];

    fileArray.forEach((file, index) => {
        if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
            errors.push(`File ${index + 1}: Invalid file type`);
        }
        if (file.size > maxSize) {
            errors.push(`File ${index + 1}: File size exceeds 5MB limit`);
        }
    });

    return errors;
}

/**
 * Sanitizes file information for response
 * @param {Object} file - File object
 * @returns {Object} Sanitized file information
 */
function sanitizeFileInfo(file) {
    return {
        filename: file.originalname || file.name,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString()
    };
}
