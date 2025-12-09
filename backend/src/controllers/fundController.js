const FundAllocation = require('../models/FundAllocation');
const Grievance = require('../models/Grievance');

/**
 * Get the complete fund flow - from Ministry to Victim
 * GET /api/funds/flow
 */
const getFundFlow = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'NyayaSetu Fund Disbursement Flow',
            flow: {
                step1: {
                    name: 'Fund Sanction',
                    actor: 'Ministry of Social Justice / State Welfare Department',
                    action: 'Sanctions funds under SC/ST Act provisions',
                    details: 'Funds are sanctioned based on budget allocation and state requirements'
                },
                step2: {
                    name: 'Fund Allocation',
                    actor: 'District Treasury',
                    action: 'Allocates funds to District Welfare Officer',
                    details: 'Officer receives fund allocation with unique sanction number'
                },
                step3: {
                    name: 'Case Approval',
                    actor: 'District Welfare Officer',
                    action: 'Reviews and approves victim case',
                    details: 'Officer verifies documents, approves relief amount'
                },
                step4: {
                    name: 'Phased Disbursement',
                    actor: 'District Welfare Officer',
                    action: 'Disburses in 3 phases: 25% → 25% → 50%',
                    details: 'Each phase requires victim verification before next phase'
                },
                step5: {
                    name: 'Victim Verification',
                    actor: 'Victim',
                    action: 'Verifies transaction ID from bank SMS',
                    details: 'Ensures transparency and confirms receipt of funds'
                },
                step6: {
                    name: 'Case Closure',
                    actor: 'System',
                    action: 'Auto-closes case after all verifications',
                    details: 'Complete audit trail maintained'
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get fund statistics for dashboard
 * GET /api/funds/stats
 */
const getFundStats = async (req, res) => {
    try {
        const { district, state } = req.query;

        // Build filter
        const filter = {};
        if (district) filter.district = district;
        if (state) filter.state = state;

        // Get fund allocations
        const allocations = await FundAllocation.find(filter);

        // Get grievance stats
        const grievanceStats = await Grievance.aggregate([
            { $match: filter.district ? { district: filter.district } : {} },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$approvedAmount' }
                }
            }
        ]);

        // Calculate totals
        const totalSanctioned = allocations.reduce((sum, a) => sum + a.sanctionedAmount, 0);
        const totalUtilized = allocations.reduce((sum, a) => sum + a.amountUtilized, 0);
        const totalRemaining = allocations.reduce((sum, a) => sum + a.amountRemaining, 0);

        // Get disbursed amount from grievances
        const disbursedGrievances = await Grievance.find({
            status: { $in: ['disbursed', 'closed'] },
            ...(filter.district ? { district: filter.district } : {})
        });

        const totalDisbursedToVictims = disbursedGrievances.reduce((sum, g) => {
            const disbursedAmount = g.disbursements?.reduce((s, d) => s + (d.amount || 0), 0) || 0;
            return sum + disbursedAmount;
        }, 0);

        res.json({
            success: true,
            data: {
                fundSource: {
                    totalSanctioned,
                    totalAllocatedToOfficers: totalSanctioned,
                    totalUtilized,
                    totalRemaining,
                    utilizationPercentage: totalSanctioned > 0
                        ? ((totalUtilized / totalSanctioned) * 100).toFixed(2)
                        : 0
                },
                disbursementToVictims: {
                    totalDisbursed: totalDisbursedToVictims,
                    casesCompleted: disbursedGrievances.filter(g => g.status === 'closed').length,
                    casesInProgress: disbursedGrievances.filter(g => g.status === 'disbursed').length
                },
                casesByStatus: grievanceStats,
                allocationsCount: allocations.length
            }
        });
    } catch (error) {
        console.error('Error getting fund stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create a new fund allocation (simulates ministry sanction)
 * POST /api/funds/allocate
 */
const createFundAllocation = async (req, res) => {
    try {
        const {
            source,
            sanctionNumber,
            sanctionDate,
            sanctionedAmount,
            financialYear,
            district,
            state,
            allocatedToOfficer
        } = req.body;

        const allocation = new FundAllocation({
            source: source || 'Ministry of Social Justice',
            sanctionNumber,
            sanctionDate: sanctionDate || new Date(),
            sanctionedAmount,
            financialYear: financialYear || `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(2)}`,
            district,
            state,
            allocatedToOfficer: allocatedToOfficer || req.user?.userId,
            amountRemaining: sanctionedAmount
        });

        await allocation.save();

        res.status(201).json({
            success: true,
            message: 'Fund allocation created successfully',
            data: allocation
        });
    } catch (error) {
        console.error('Error creating fund allocation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get all fund allocations
 * GET /api/funds/allocations
 */
const getAllocations = async (req, res) => {
    try {
        const { district, status } = req.query;
        const filter = {};

        if (district) filter.district = district;
        if (status) filter.status = status;

        const allocations = await FundAllocation.find(filter)
            .populate('allocatedToOfficer', 'fullName email')
            .sort({ sanctionDate: -1 });

        res.json({
            success: true,
            count: allocations.length,
            data: allocations
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Link disbursement to fund allocation (called when officer disburses)
 * POST /api/funds/utilize
 */
const utilizeFund = async (req, res) => {
    try {
        const { allocationId, caseId, grievanceId, amount } = req.body;

        const allocation = await FundAllocation.findById(allocationId);
        if (!allocation) {
            return res.status(404).json({ success: false, message: 'Fund allocation not found' });
        }

        await allocation.utilizeFund(caseId, grievanceId, amount);

        res.json({
            success: true,
            message: `₹${amount.toLocaleString('en-IN')} utilized from fund allocation`,
            data: {
                allocationId: allocation._id,
                sanctionNumber: allocation.sanctionNumber,
                amountUtilized: allocation.amountUtilized,
                amountRemaining: allocation.amountRemaining
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Seed demo fund allocations for demonstration
 * POST /api/funds/seed-demo
 */
const seedDemoData = async (req, res) => {
    try {
        // Check if demo data already exists
        const existing = await FundAllocation.findOne({ sanctionNumber: 'MSJ/2024/SC-ST/001' });
        if (existing) {
            return res.json({
                success: true,
                message: 'Demo data already exists',
                data: await FundAllocation.find({})
            });
        }

        const demoAllocations = [
            {
                source: 'Ministry of Social Justice',
                sanctionNumber: 'MSJ/2024/SC-ST/001',
                sanctionDate: new Date('2024-04-01'),
                sanctionedAmount: 5000000, // 50 Lakhs
                financialYear: '2024-25',
                district: 'Pune',
                state: 'Maharashtra',
                amountUtilized: 820000, // 8.2 Lakhs (matches your screenshot!)
                status: 'partially_utilized'
            },
            {
                source: 'State Welfare Department',
                sanctionNumber: 'MH/SWD/2024/102',
                sanctionDate: new Date('2024-06-15'),
                sanctionedAmount: 2500000, // 25 Lakhs
                financialYear: '2024-25',
                district: 'Mumbai',
                state: 'Maharashtra',
                amountUtilized: 500000,
                status: 'partially_utilized'
            },
            {
                source: 'District Treasury',
                sanctionNumber: 'DT/PUNE/2024/045',
                sanctionDate: new Date('2024-08-01'),
                sanctionedAmount: 1000000, // 10 Lakhs
                financialYear: '2024-25',
                district: 'Pune',
                state: 'Maharashtra',
                amountUtilized: 0,
                status: 'allocated'
            }
        ];

        const created = await FundAllocation.insertMany(demoAllocations);

        res.status(201).json({
            success: true,
            message: 'Demo fund allocations created successfully',
            summary: {
                totalSanctioned: '₹85 Lakhs',
                totalUtilized: '₹13.2 Lakhs',
                totalRemaining: '₹71.8 Lakhs'
            },
            data: created
        });
    } catch (error) {
        console.error('Error seeding demo data:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getFundFlow,
    getFundStats,
    createFundAllocation,
    getAllocations,
    utilizeFund,
    seedDemoData
};
