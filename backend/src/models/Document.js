const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    grievanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grievance',
        required: true,
        index: true
    },
    documentType: {
        type: String,
        enum: [
            // Atrocity case documents
            'aadhaar', 'fir', 'medical', 'bankPassbook', 'casteCertificate', 'other',
            // Intercaste marriage documents
            'addressProof', 'marriageCertificate', 'scstCertificate', 'otherCasteCertificate'
        ],
        required: true
    },
    originalFileName: {
        type: String,
        required: true
    },
    googleDriveFileId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    googleDriveFolderId: {
        type: String,
        required: true
    },
    googleDriveWebViewLink: {
        type: String
    },
    googleDriveWebContentLink: {
        type: String
    },
    mimeType: {
        type: String
    },
    fileSize: {
        type: Number // in bytes
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    },
    accessPermissions: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['viewer', 'editor']
        },
        grantedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Compound index for faster queries
documentSchema.index({ grievanceId: 1, documentType: 1 });
documentSchema.index({ uploadedBy: 1, uploadedAt: -1 });

// Methods
documentSchema.methods.softDelete = function () {
    this.status = 'deleted';
    return this.save();
};

documentSchema.methods.grantAccess = function (userId, role = 'viewer') {
    const existingPermission = this.accessPermissions.find(
        p => p.userId.toString() === userId.toString()
    );

    if (!existingPermission) {
        this.accessPermissions.push({ userId, role });
        return this.save();
    }

    return this;
};

// Static methods
documentSchema.statics.findByGrievance = function (grievanceId) {
    return this.find({ grievanceId, status: 'active' })
        .sort({ uploadedAt: -1 })
        .populate('uploadedBy', 'name email');
};

documentSchema.statics.findByType = function (grievanceId, documentType) {
    return this.findOne({ grievanceId, documentType, status: 'active' });
};

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
