const express = require('express');
const router = express.Router();
const fundController = require('../controllers/fundController');
const { authenticate } = require('../middleware/auth');

/**
 * Fund Routes
 * Base path: /api/funds
 * 
 * These routes demonstrate the fund flow:
 * Ministry → District Treasury → Officer → Victim
 */

// Public route - shows the complete fund flow (for jury demonstration)
router.get('/flow', fundController.getFundFlow);

// Public route - seed demo data for demonstration
router.post('/seed-demo', fundController.seedDemoData);

// Protected routes (require authentication)
router.use(authenticate);

// Get fund statistics (officer dashboard)
router.get('/stats', fundController.getFundStats);

// Get all fund allocations
router.get('/allocations', fundController.getAllocations);

// Create new fund allocation (simulates ministry sanction)
router.post('/allocate', fundController.createFundAllocation);

// Utilize fund for a case
router.post('/utilize', fundController.utilizeFund);

module.exports = router;
