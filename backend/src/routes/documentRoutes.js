const express = require('express');
const multer = require('multer');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');

// Configure multer for memory storage (files stored in buffer)
const storage = multer.memoryStorage();

// File filter to accept only specific file types
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, JPEG, PNG, DOC, and DOCX files are allowed.'), false);
    }
};

// Configure multer upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// All routes require authentication
router.use(authenticate);

// Upload document
router.post('/upload', upload.single('file'), documentController.uploadDocument);

// Verify document type (pre-submission check - no grievanceId needed)
router.post('/verify', upload.single('file'), documentController.verifyDocument);

// Get all documents for a grievance
router.get('/grievance/:grievanceId', documentController.getDocumentsByGrievance);

// Get document statistics
router.get('/grievance/:grievanceId/stats', documentController.getDocumentStats);

// Get view URL for a document
router.get('/:documentId/view', documentController.getDocumentViewUrl);

// Download document (officers only)
router.get('/:documentId/download', documentController.downloadDocument);

// Delete document (admin only)
router.delete('/:documentId', documentController.deleteDocument);

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 10MB.'
            });
        }
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next(error);
});

module.exports = router;
