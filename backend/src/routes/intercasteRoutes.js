const express = require('express');
const router = express.Router();
const { createIntercasteGrievance } = require('../controllers/grievanceController');
const { authenticate } = require('../middleware/auth');

/**
 * Intercaste Marriage Routes
 * Base path: /api/intercaste
 */

// Create new intercaste marriage application
// POST /api/intercaste/create
router.post('/create', authenticate, createIntercasteGrievance);

module.exports = router;
