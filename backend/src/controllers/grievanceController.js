const Grievance = require('../models/Grievance');
const sendEmail = require('../utils/sendEmail');

/**
 * Generate unique case ID based on district
 * Format: DBT-2024-{DISTRICT}-{INCREMENT}
 */
const generateCaseId = async (district) => {
    const year = new Date().getFullYear();
    const districtCode = district.toUpperCase().replace(/\s+/g, '');
    const prefix = `DBT-${year}-${districtCode}`;

    // Find last case ID with this prefix
    const lastCase = await Grievance.findOne({
        caseId: new RegExp(`^${prefix}`)
    }).sort({ createdAt: -1 });

    let number = 1;
    if (lastCase) {
        const match = lastCase.caseId.match(/-(\d+)$/);
        if (match) {
            number = parseInt(match[1]) + 1;
        }
    }

    return `${prefix}-${String(number).padStart(3, '0')}`;
};

/**
 * Create a new grievance
 * POST /api/grievances/create
 */
const createGrievance = async (req, res) => {
    try {
        const {
            aadhaarNumber,
            mobileNumber,
            email,
            firCaseNumber,
            policeStation,
            district,
            state,
            dateOfIncident,
            dateOfFirRegistration,
            typeOfAtrocity,
            casteCategory,
            casteCertificateNumber,
            village,
            pincode,
            witnessName,
            witnessContact,
            delayReason,
            incidentDescription,
            reliefAmountRequested,
            accountHolderName,
            accountNumber,
            ifscCode,
            bankName
        } = req.body;

        // Validate required fields
        if (!aadhaarNumber || !mobileNumber || !firCaseNumber || !policeStation ||
            !district || !state || !dateOfIncident || !accountHolderName ||
            !accountNumber || !ifscCode) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided (including bank details)'
            });
        }

        // Check for duplicate FIR number
        const existingGrievance = await Grievance.findOne({ firCaseNumber });
        if (existingGrievance) {
            return res.status(400).json({
                success: false,
                message: 'A grievance with this FIR number already exists',
                existingCaseId: existingGrievance.caseId
            });
        }

        // Generate unique case ID
        const caseId = await generateCaseId(district);

        // Create new grievance
        const grievance = new Grievance({
            userId: req.user.userId, // From auth middleware
            caseId,
            aadhaarNumber,
            mobileNumber,
            email: email || req.user.email,
            firCaseNumber,
            policeStation,
            district,
            state,
            dateOfIncident: new Date(dateOfIncident),
            dateOfFirRegistration: dateOfFirRegistration ? new Date(dateOfFirRegistration) : undefined,
            typeOfAtrocity,
            casteCategory,
            casteCertificateNumber,
            village,
            pincode,
            witnessName,
            witnessContact,
            delayReason,
            incidentDescription,
            reliefAmountRequested: reliefAmountRequested ? Number(reliefAmountRequested) : undefined,
            accountHolderName,
            accountNumber,
            ifscCode,
            bankName,
            status: 'pending',
            submittedAt: new Date()
        });

        await grievance.save();

        // Send confirmation email asynchronously (non-blocking)
        const userEmail = email || req.user.email;
        if (userEmail) {
            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Grievance Submitted Successfully</h2>
                    <p>Dear ${req.user.name || 'User'},</p>
                    <p>Your relief application has been successfully registered in the NyayaSetu system.</p>
                    
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Case Details:</h3>
                        <p><strong>Case ID:</strong> ${caseId}</p>
                        <p><strong>FIR Number:</strong> ${firCaseNumber}</p>
                        <p><strong>Police Station:</strong> ${policeStation}</p>
                        <p><strong>Submitted On:</strong> ${new Date().toLocaleString('en-IN')}</p>
                    </div>
                    
                    <h3>Next Steps:</h3>
                    <ol>
                        <li>Track your application status using your Case ID</li>
                        <li>You will be notified once verification is complete</li>
                        <li>Check your email for confirmation (may take 5-30 minutes)</li>
                    </ol>
                    
                    <p><strong>Important:</strong> Please save your Case ID (${caseId}) for future reference.</p>
                    
                    <p style="margin-top: 30px;">For any queries, please contact us at support@nyayasetu.gov.in</p>
                    
                    <p>Best Regards,<br>NyayaSetu Team</p>
                </div>
            `;

            // Send email in background without waiting
            sendEmail({
                to: userEmail,
                subject: `Case Registered Successfully - ${caseId}`,
                html: emailContent
            }).then(() => {
                console.log(`✅ Confirmation email sent to ${userEmail}`);
            }).catch((emailError) => {
                console.error('❌ Failed to send confirmation email:', emailError);
            });
        }

        res.status(201).json({
            success: true,
            message: 'Grievance submitted successfully',
            data: {
                grievanceId: grievance._id,
                caseId: grievance.caseId,
                status: grievance.status,
                submittedAt: grievance.submittedAt
            }
        });
    } catch (error) {
        console.error('Error creating grievance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create grievance',
            error: error.message
        });
    }
};

/**
 * Get all grievances for logged-in user
 * GET /api/grievances/my-grievances
 */
const getMyGrievances = async (req, res) => {
    try {
        const grievances = await Grievance.find({ userId: req.user.userId })
            .sort({ submittedAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            count: grievances.length,
            data: grievances
        });
    } catch (error) {
        console.error('Error fetching grievances:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch grievances',
            error: error.message
        });
    }
};

/**
 * Get single grievance by ID
 * GET /api/grievances/:id
 */
const getGrievanceById = async (req, res) => {
    try {
        const { id } = req.params;

        const grievance = await Grievance.findById(id)
            .populate('userId', 'name email mobile')
            .populate('assignedOfficer', 'name email');

        if (!grievance) {
            return res.status(404).json({
                success: false,
                message: 'Grievance not found'
            });
        }

        // Check access permissions
        const isOwner = grievance.userId._id.toString() === req.user.userId;
        const isOfficer = req.user.role === 'officer' || req.user.role === 'admin';

        if (!isOwner && !isOfficer) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this grievance'
            });
        }

        res.status(200).json({
            success: true,
            data: grievance
        });
    } catch (error) {
        console.error('Error fetching grievance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch grievance',
            error: error.message
        });
    }
};

/**
 * Get all grievances (for officers/admin)
 * GET /api/grievances
 * Query params: status, assignedToMe, caseType (atrocity/intercaste)
 */
const getGrievances = async (req, res) => {
    try {
        // Only officers and admins can view all grievances
        if (req.user.role !== 'officer' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only officers can view all grievances.'
            });
        }

        const { status, assignedToMe, caseType } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        if (assignedToMe === 'true') {
            query.assignedOfficer = req.user.userId;
        }

        // Filter by case type (atrocity or intercaste)
        if (caseType && ['atrocity', 'intercaste'].includes(caseType)) {
            query.caseType = caseType;
        }

        const grievances = await Grievance.find(query)
            .populate('userId', 'name email mobile')
            .populate('assignedOfficer', 'name email')
            .sort({ submittedAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            count: grievances.length,
            data: grievances
        });
    } catch (error) {
        console.error('Error fetching all grievances:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch grievances',
            error: error.message
        });
    }
};

/**
 * Update grievance (for officers)
 * PUT /api/grievances/:id
 */
const updateGrievance = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Only officers and admins can update grievances
        if (req.user.role !== 'officer' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only officers can update grievances'
            });
        }

        const grievance = await Grievance.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!grievance) {
            return res.status(404).json({
                success: false,
                message: 'Grievance not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Grievance updated successfully',
            data: grievance
        });
    } catch (error) {
        console.error('Error updating grievance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update grievance',
            error: error.message
        });
    }
};

/**
 * Track grievance by Case ID (enhanced with full data)
 * GET /api/grievances/track/:caseId
 */
const trackByCaseId = async (req, res) => {
    try {
        const { caseId } = req.params;

        const grievance = await Grievance.findOne({ caseId })
            .select('_id caseId status firCaseNumber submittedAt district state updatedAt approvedAmount queries disbursements')
            .lean();

        if (!grievance) {
            return res.status(404).json({
                success: false,
                message: 'Case not found. Please check your Case ID and try again.'
            });
        }

        // Format queries for frontend
        const formattedQueries = (grievance.queries || []).map((q, index) => ({
            id: index,
            type: q.queryType || 'General',
            message: q.message,
            status: q.status === 'action_required' ? 'Action Required' :
                q.status === 'waiting_review' ? 'Waiting for Officer Review' : 'Resolved',
            highPriority: q.highPriority || false,
            raisedOn: q.askedAt ? new Date(q.askedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            response: q.response,
            respondedAt: q.respondedAt
        }));

        res.status(200).json({
            success: true,
            data: {
                _id: grievance._id, // MongoDB ObjectId - needed for API calls like verify
                caseId: grievance.caseId,
                status: grievance.status,
                firCaseNumber: grievance.firCaseNumber,
                district: grievance.district,
                state: grievance.state,
                submittedAt: grievance.submittedAt,
                lastUpdated: grievance.updatedAt,
                approvedAmount: grievance.approvedAmount,
                queries: formattedQueries,
                disbursements: grievance.disbursements || []
            }
        });
    } catch (error) {
        console.error('Error tracking grievance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track grievance',
            error: error.message
        });
    }
};

/**
 * Update grievance status (for officers)
 * PATCH /api/grievances/:id/status
 */
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'on_hold', 'disbursed', 'closed'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const grievance = await Grievance.findById(id);

        if (!grievance) {
            return res.status(404).json({
                success: false,
                message: 'Grievance not found'
            });
        }

        // Update status using model method
        await grievance.updateStatus(status);

        res.status(200).json({
            success: true,
            message: `Status updated to ${status}`,
            data: {
                _id: grievance._id,
                caseId: grievance.caseId,
                status: grievance.status,
                updatedAt: grievance.updatedAt
            }
        });
    } catch (error) {
        console.error('Error updating grievance status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        });
    }
};
/**
 * Add query to grievance (officers only)
 * POST /api/grievances/:id/queries
 */
const addQuery = async (req, res) => {
    try {
        const { id } = req.params;
        const { queryType, message, highPriority } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Query message is required'
            });
        }

        const grievance = await Grievance.findById(id);
        if (!grievance) {
            return res.status(404).json({
                success: false,
                message: 'Grievance not found'
            });
        }

        // Add query to the grievance
        grievance.queries.push({
            queryType: queryType || 'Other',
            message,
            highPriority: highPriority || false,
            status: 'action_required',
            askedBy: req.user.userId,
            askedAt: new Date()
        });
        grievance.updatedAt = new Date();
        await grievance.save();

        res.status(201).json({
            success: true,
            message: 'Query added successfully',
            data: {
                queryIndex: grievance.queries.length - 1,
                caseId: grievance.caseId
            }
        });
    } catch (error) {
        console.error('Error adding query:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add query',
            error: error.message
        });
    }
};

/**
 * Respond to query (victim only)
 * PATCH /api/grievances/:id/queries/:index/respond
 */
const respondToQuery = async (req, res) => {
    try {
        const { id, index } = req.params;
        const { response } = req.body;

        if (!response) {
            return res.status(400).json({
                success: false,
                message: 'Response is required'
            });
        }

        const grievance = await Grievance.findById(id);
        if (!grievance) {
            return res.status(404).json({
                success: false,
                message: 'Grievance not found'
            });
        }

        const queryIndex = parseInt(index);
        if (queryIndex < 0 || queryIndex >= grievance.queries.length) {
            return res.status(404).json({
                success: false,
                message: 'Query not found'
            });
        }

        // Update the query with response
        grievance.queries[queryIndex].response = response;
        grievance.queries[queryIndex].respondedAt = new Date();
        grievance.queries[queryIndex].status = 'waiting_review';
        grievance.updatedAt = new Date();
        await grievance.save();

        res.status(200).json({
            success: true,
            message: 'Response submitted successfully'
        });
    } catch (error) {
        console.error('Error responding to query:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit response',
            error: error.message
        });
    }
};

/**
 * Save disbursements (officer enters transaction IDs one at a time)
 * POST /api/grievances/:id/disbursements
 * 
 * Sequential flow: Phase 1 (25%) → Victim verifies → Phase 2 (25%) → Victim verifies → Phase 3 (50%) → Victim verifies
 */
const saveDisbursements = async (req, res) => {
    try {
        const { id } = req.params;
        const { transactionId, phase, approvedAmount } = req.body;

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID is required'
            });
        }

        const grievance = await Grievance.findById(id);
        if (!grievance) {
            return res.status(404).json({
                success: false,
                message: 'Grievance not found'
            });
        }

        const amount = approvedAmount || grievance.approvedAmount || 0;

        // Determine which phase to add based on existing disbursements
        const currentPhaseCount = grievance.disbursements?.length || 0;
        const phaseIndex = phase !== undefined ? phase : currentPhaseCount;

        // Check if previous phase is verified (if applicable)
        if (phaseIndex > 0 && grievance.disbursements?.length > 0) {
            const lastDisbursement = grievance.disbursements[phaseIndex - 1];
            if (!lastDisbursement?.victimVerified) {
                return res.status(400).json({
                    success: false,
                    message: `Phase ${phaseIndex} must be verified by victim before adding Phase ${phaseIndex + 1}`
                });
            }
        }

        // Define phase percentages
        const phasePercentages = [25, 25, 50];

        if (phaseIndex >= 3) {
            return res.status(400).json({
                success: false,
                message: 'All 3 disbursement phases have already been added'
            });
        }

        // Create new disbursement entry
        const newDisbursement = {
            amount: amount * (phasePercentages[phaseIndex] / 100),
            percentage: phasePercentages[phaseIndex],
            transactionId: transactionId,
            disbursedAt: new Date(),
            disbursedBy: req.user.userId,
            victimVerified: false
        };

        // Initialize disbursements array if needed
        if (!grievance.disbursements) {
            grievance.disbursements = [];
        }

        // Add or update the disbursement at the specific phase
        if (grievance.disbursements.length > phaseIndex) {
            // Update existing
            grievance.disbursements[phaseIndex] = newDisbursement;
        } else {
            // Add new
            grievance.disbursements.push(newDisbursement);
        }

        if (approvedAmount) {
            grievance.approvedAmount = approvedAmount;
        }

        // Status logic:
        // - stays 'approved' until all 3 phases are SAVED
        // - changes to 'disbursed' when all 3 phases are SAVED (money sent)
        // - changes to 'closed' when all 3 phases are VERIFIED by victim (in verifyTransaction)
        if (grievance.disbursements.length === 3) {
            grievance.status = 'disbursed';
        }

        grievance.updatedAt = new Date();
        await grievance.save();

        res.status(200).json({
            success: true,
            message: `Phase ${phaseIndex + 1} (${phasePercentages[phaseIndex]}%) disbursement saved successfully`,
            data: {
                caseId: grievance.caseId,
                phaseAdded: phaseIndex + 1,
                disbursementCount: grievance.disbursements.length,
                disbursements: grievance.disbursements
            }
        });
    } catch (error) {
        console.error('Error saving disbursement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save disbursement',
            error: error.message
        });
    }
};

/**
 * Verify transaction by victim
 * PATCH /api/grievances/:id/disbursements/:index/verify
 */
const verifyTransaction = async (req, res) => {
    try {
        const { id, index } = req.params;
        const { transactionId } = req.body;

        console.log('=== VERIFY TRANSACTION DEBUG ===');
        console.log('Grievance ID:', id);
        console.log('Disbursement Index:', index);
        console.log('Entered Transaction ID:', transactionId);

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                message: 'Transaction ID is required'
            });
        }

        const grievance = await Grievance.findById(id);
        console.log('Grievance found:', grievance ? 'Yes' : 'No');

        if (!grievance) {
            return res.status(404).json({
                success: false,
                message: 'Grievance not found'
            });
        }

        console.log('Disbursements count:', grievance.disbursements?.length || 0);

        const disbursementIndex = parseInt(index);
        if (disbursementIndex < 0 || disbursementIndex >= grievance.disbursements.length) {
            return res.status(404).json({
                success: false,
                message: 'Disbursement not found'
            });
        }

        const disbursement = grievance.disbursements[disbursementIndex];

        // Verify transaction ID matches (case-insensitive, trimmed)
        const storedId = (disbursement.transactionId || '').trim().toLowerCase();
        const enteredId = (transactionId || '').trim().toLowerCase();

        if (storedId !== enteredId) {
            return res.status(400).json({
                success: false,
                message: `Transaction ID does not match. Please check the ID from your bank SMS and try again.`
            });
        }

        // Mark as verified
        grievance.disbursements[disbursementIndex].victimVerified = true;
        grievance.disbursements[disbursementIndex].victimVerifiedAt = new Date();
        grievance.disbursements[disbursementIndex].victimEnteredTxnId = transactionId;

        // Check if ALL 3 disbursements exist AND all are verified
        // Case should only close when all 3 phases (25%, 25%, 50%) are complete and verified
        const hasAllThreePhases = grievance.disbursements.length === 3;
        const allVerified = hasAllThreePhases && grievance.disbursements.every(d => d.victimVerified);

        if (allVerified) {
            grievance.status = 'closed';
        }

        grievance.updatedAt = new Date();
        await grievance.save();

        res.status(200).json({
            success: true,
            message: allVerified ? 'All transactions verified. Case closed.' : 'Transaction verified successfully',
            data: {
                allVerified,
                status: grievance.status
            }
        });
    } catch (error) {
        console.error('Error verifying transaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify transaction',
            error: error.message
        });
    }
};

/**
 * Mark query as resolved (officer)
 * PATCH /api/grievances/:id/queries/:index/resolve
 */
const resolveQuery = async (req, res) => {
    try {
        const { id, index } = req.params;

        const grievance = await Grievance.findById(id);
        if (!grievance) {
            return res.status(404).json({
                success: false,
                message: 'Grievance not found'
            });
        }

        const queryIndex = parseInt(index);
        if (queryIndex < 0 || queryIndex >= grievance.queries.length) {
            return res.status(404).json({
                success: false,
                message: 'Query not found'
            });
        }

        grievance.queries[queryIndex].status = 'resolved';
        grievance.updatedAt = new Date();
        await grievance.save();

        res.status(200).json({
            success: true,
            message: 'Query marked as resolved'
        });
    } catch (error) {
        console.error('Error resolving query:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resolve query',
            error: error.message
        });
    }
};

/**
 * Generate unique case ID for Intercaste Marriage
 * Format: IM-2025-{DISTRICT}-{INCREMENT}
 */
const generateIntercasteCaseId = async (district) => {
    const year = new Date().getFullYear();
    const districtCode = district.toUpperCase().replace(/\s+/g, '');
    const prefix = `IM-${year}-${districtCode}`;

    // Find last intercaste case ID with this prefix
    const lastCase = await Grievance.findOne({
        caseId: new RegExp(`^${prefix}`)
    }).sort({ createdAt: -1 });

    let number = 1;
    if (lastCase) {
        const match = lastCase.caseId.match(/-(\d+)$/);
        if (match) {
            number = parseInt(match[1]) + 1;
        }
    }

    return `${prefix}-${String(number).padStart(3, '0')}`;
};

/**
 * Create Intercaste Marriage grievance
 * POST /api/intercaste/create
 */
const createIntercasteGrievance = async (req, res) => {
    try {
        const {
            // Husband's Details
            husbandName,
            husbandAadhaar,
            husbandMobile,
            husbandEmail,
            // Wife's Details
            wifeName,
            wifeAadhaar,
            wifeMobile,
            wifeEmail,
            // Address
            currentAddress,
            district,
            state,
            pincode,
            // SC/ST Spouse
            scstSpouse,
            // Bank Details
            accountHolderName,
            bankName,
            accountNumber,
            ifscCode
        } = req.body;

        // Validate required fields
        if (!husbandName || !husbandAadhaar || !husbandMobile ||
            !wifeName || !wifeAadhaar || !wifeMobile ||
            !currentAddress || !district || !state || !scstSpouse ||
            !accountHolderName || !accountNumber || !ifscCode) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided (husband details, wife details, address, bank details)'
            });
        }

        // Generate unique intercaste case ID (IM-YYYY-DISTRICT-XXX)
        const caseId = await generateIntercasteCaseId(district);

        // Create new intercaste grievance
        const grievance = new Grievance({
            userId: req.user.userId,
            caseType: 'intercaste',
            caseId,
            // Husband Details
            husbandName,
            husbandAadhaar,
            husbandMobile,
            husbandEmail,
            // Wife Details
            wifeName,
            wifeAadhaar,
            wifeMobile,
            wifeEmail,
            // Address
            currentAddress,
            district,
            state,
            pincode,
            // SC/ST Spouse
            scstSpouse,
            // Unique placeholder for firCaseNumber to avoid duplicate key error
            // Since intercaste cases don't have FIR, we use the caseId as placeholder
            firCaseNumber: `IM-${caseId}`,
            // Bank Details  
            accountHolderName,
            bankName,
            accountNumber,
            ifscCode,
            // Status
            status: 'pending',
            submittedAt: new Date()
        });

        await grievance.save();

        // Send confirmation email
        const userEmail = husbandEmail || wifeEmail || req.user.email;
        if (userEmail) {
            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ec4899;">Intercaste Marriage Application Submitted Successfully</h2>
                    <p>Dear ${husbandName} & ${wifeName},</p>
                    <p>Your intercaste marriage relief application has been successfully registered in the NyayaSetu system.</p>
                    
                    <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #be185d;">Application Details:</h3>
                        <p><strong>Case ID:</strong> ${caseId}</p>
                        <p><strong>Husband:</strong> ${husbandName}</p>
                        <p><strong>Wife:</strong> ${wifeName}</p>
                        <p><strong>SC/ST Spouse:</strong> ${scstSpouse === 'husband' ? husbandName : wifeName}</p>
                        <p><strong>Submitted On:</strong> ${new Date().toLocaleString('en-IN')}</p>
                    </div>
                    
                    <h3>Next Steps:</h3>
                    <ol>
                        <li>Track your application status using your Case ID: <strong>${caseId}</strong></li>
                        <li>An officer will review your documents</li>
                        <li>You will be notified once verification is complete</li>
                    </ol>
                    
                    <p><strong>Important:</strong> Please save your Case ID (${caseId}) for future reference.</p>
                    
                    <p style="margin-top: 30px;">For any queries, please contact us at support@nyayasetu.gov.in</p>
                    
                    <p>Best Regards,<br>NyayaSetu Team</p>
                </div>
            `;

            // Send email in background
            sendEmail({
                to: userEmail,
                subject: `Intercaste Marriage Application Registered - ${caseId}`,
                html: emailContent
            }).then(() => {
                console.log(`✅ Intercaste confirmation email sent to ${userEmail}`);
            }).catch((emailError) => {
                console.error('❌ Failed to send intercaste confirmation email:', emailError);
            });
        }

        res.status(201).json({
            success: true,
            message: 'Intercaste marriage application submitted successfully',
            data: {
                grievanceId: grievance._id,
                caseId: grievance.caseId,
                status: grievance.status,
                submittedAt: grievance.submittedAt
            }
        });
    } catch (error) {
        console.error('Error creating intercaste grievance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit intercaste marriage application',
            error: error.message
        });
    }
};

module.exports = {
    createGrievance,
    createIntercasteGrievance,
    getMyGrievances,
    getGrievanceById,
    getGrievances,
    updateGrievance,
    updateStatus,
    trackByCaseId,
    addQuery,
    respondToQuery,
    saveDisbursements,
    verifyTransaction,
    resolveQuery
};
