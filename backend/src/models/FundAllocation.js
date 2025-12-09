const mongoose = require('mongoose');

/**
 * Fund Allocation Model
 * Tracks funds sanctioned by Ministry/Financial Institutions and allocated to officers
 */
const fundAllocationSchema = new mongoose.Schema({
    // Source of funds
    source: {
        type: String,
        enum: ['Ministry of Social Justice', 'State Welfare Department', 'District Treasury', 'Central Fund'],
        required: true
    },
    // Sanction details
    sanctionNumber: {
        type: String,
        required: true,
        unique: true
    },
    sanctionDate: {
        type: Date,
        required: true
    },
    sanctionedAmount: {
        type: Number,
        required: true
    },
    // Financial Year
    financialYear: {
        type: String,
        required: true  // e.g., "2024-25"
    },
    // District allocation
    district: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    // Officer who receives the fund
    allocatedToOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Tracking usage
    amountUtilized: {
        type: Number,
        default: 0
    },
    amountRemaining: {
        type: Number
    },
    // Linked cases that used this fund
    linkedCases: [{
        caseId: String,
        grievanceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Grievance'
        },
        amountDisbursed: Number,
        disbursedAt: Date
    }],
    // Status
    status: {
        type: String,
        enum: ['sanctioned', 'allocated', 'partially_utilized', 'fully_utilized', 'lapsed'],
        default: 'sanctioned'
    },
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-calculate remaining amount before save
fundAllocationSchema.pre('save', function (next) {
    this.amountRemaining = this.sanctionedAmount - this.amountUtilized;

    // Update status based on utilization
    if (this.amountUtilized === 0) {
        this.status = this.allocatedToOfficer ? 'allocated' : 'sanctioned';
    } else if (this.amountRemaining > 0) {
        this.status = 'partially_utilized';
    } else {
        this.status = 'fully_utilized';
    }

    this.updatedAt = new Date();
    next();
});

// Method to utilize funds for a case
fundAllocationSchema.methods.utilizeFund = async function (caseId, grievanceId, amount) {
    if (amount > this.amountRemaining) {
        throw new Error('Insufficient funds in this allocation');
    }

    this.amountUtilized += amount;
    this.linkedCases.push({
        caseId,
        grievanceId,
        amountDisbursed: amount,
        disbursedAt: new Date()
    });

    return this.save();
};

// Static method to get fund summary for a district
fundAllocationSchema.statics.getDistrictSummary = async function (district) {
    const result = await this.aggregate([
        { $match: { district: district } },
        {
            $group: {
                _id: '$district',
                totalSanctioned: { $sum: '$sanctionedAmount' },
                totalUtilized: { $sum: '$amountUtilized' },
                totalRemaining: { $sum: '$amountRemaining' },
                allocationsCount: { $sum: 1 }
            }
        }
    ]);
    return result[0] || { totalSanctioned: 0, totalUtilized: 0, totalRemaining: 0 };
};

const FundAllocation = mongoose.model('FundAllocation', fundAllocationSchema);

module.exports = FundAllocation;
