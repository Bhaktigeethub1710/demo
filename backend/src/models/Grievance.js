const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Case Type: atrocity (normal) or intercaste (intercaste marriage)
    caseType: {
        type: String,
        enum: ['atrocity', 'intercaste'],
        default: 'atrocity',
        index: true
    },
    // Unique Case ID for tracking
    // Format: DBT-YYYY-DISTRICT-XXX (atrocity) or IM-YYYY-DISTRICT-XXX (intercaste)
    caseId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // Personal Information (for atrocity)
    aadhaarNumber: {
        type: String,
        required: function () { return this.caseType === 'atrocity'; }
    },
    mobileNumber: {
        type: String,
        required: function () { return this.caseType === 'atrocity'; }
    },
    email: {
        type: String
    },

    // ============ INTERCASTE MARRIAGE SPECIFIC FIELDS ============
    // Husband's Details
    husbandName: { type: String },
    husbandAadhaar: { type: String },
    husbandMobile: { type: String },
    husbandEmail: { type: String },
    // Wife's Details
    wifeName: { type: String },
    wifeAadhaar: { type: String },
    wifeMobile: { type: String },
    wifeEmail: { type: String },
    // SC/ST Spouse indicator
    scstSpouse: {
        type: String,
        enum: ['husband', 'wife', null]
    },
    // Current Address (for intercaste)
    currentAddress: { type: String },

    // ============ ATROCITY CASE FIELDS (optional for intercaste) ============
    // Case Details - Made optional for intercaste
    firCaseNumber: {
        type: String,
        sparse: true,
        index: true
    },
    policeStation: {
        type: String
    },
    district: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    dateOfIncident: {
        type: Date
    },
    dateOfFirRegistration: {
        type: Date
    },
    // Type of Atrocity
    typeOfAtrocity: {
        type: String
    },
    // Caste Information
    casteCategory: {
        type: String,
        enum: ['sc', 'st']
    },
    casteCertificateNumber: {
        type: String
    },
    // Location Details
    village: {
        type: String
    },
    pincode: {
        type: String
    },
    // Witness Information
    witnessName: {
        type: String
    },
    witnessContact: {
        type: String
    },
    // FIR Delay Information
    delayReason: {
        type: String
    },
    // Additional Details
    incidentDescription: {
        type: String
    },
    reliefAmountRequested: {
        type: Number
    },
    // Bank Details for Disbursement
    accountHolderName: {
        type: String
    },
    accountNumber: {
        type: String
    },
    ifscCode: {
        type: String
    },
    bankName: {
        type: String
    },
    // Status tracking
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'on_hold', 'disbursed', 'closed'],
        default: 'pending'
    },
    // Officer assignment
    assignedOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Disbursement tracking
    approvedAmount: {
        type: Number
    },
    disbursements: [{
        amount: {
            type: Number
        },
        percentage: {
            type: Number
        },
        transactionId: {
            type: String
        },
        disbursedAt: {
            type: Date
        },
        disbursedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        // Victim verification fields
        victimVerified: {
            type: Boolean,
            default: false
        },
        victimVerifiedAt: {
            type: Date
        },
        victimEnteredTxnId: {
            type: String
        }
    }],
    // Queries/Comments
    queries: [{
        queryType: {
            type: String,
            enum: ['Missing Document', 'Clarification Required', 'Incorrect Information', 'Other']
        },
        message: {
            type: String
        },
        highPriority: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['action_required', 'waiting_review', 'resolved'],
            default: 'action_required'
        },
        askedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        askedAt: {
            type: Date,
            default: Date.now
        },
        response: {
            type: String
        },
        responseFile: {
            type: String
        },
        respondedAt: {
            type: Date
        }
    }],
    // Timestamps
    submittedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Virtual for documents (populated from Document model)
grievanceSchema.virtual('documents', {
    ref: 'Document',
    localField: '_id',
    foreignField: 'grievanceId'
});

// Indexes for faster queries
grievanceSchema.index({ userId: 1, submittedAt: -1 });
grievanceSchema.index({ status: 1, submittedAt: -1 });
grievanceSchema.index({ assignedOfficer: 1, status: 1 });

// Methods
grievanceSchema.methods.updateStatus = function (newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date();
    return this.save();
};

grievanceSchema.methods.assignOfficer = function (officerId) {
    this.assignedOfficer = officerId;
    this.status = 'under_review';
    this.updatedAt = new Date();
    return this.save();
};

grievanceSchema.methods.addQuery = function (message, userId) {
    this.queries.push({
        message,
        askedBy: userId,
        askedAt: new Date()
    });
    this.updatedAt = new Date();
    return this.save();
};

const Grievance = mongoose.model('Grievance', grievanceSchema);

module.exports = Grievance;
