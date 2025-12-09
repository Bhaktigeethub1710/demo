/**
 * Document Verification Service
 * Uses Google Cloud Vision API to verify uploaded documents match their expected type
 * Supports: JPEG, PNG, and PDF files
 */

const axios = require('axios');

// Load pdf-parse v1.x (simple function export)
let pdfParse = null;
try {
    pdfParse = require('pdf-parse');
    console.log('✅ pdf-parse v1.x loaded successfully');
} catch (e) {
    console.warn('⚠️ pdf-parse not installed. PDF text extraction disabled.', e.message);
}

// Document type keywords for classification
// Using OR logic - any ONE of the required keywords is enough to match
const DOCUMENT_KEYWORDS = {
    fir: {
        // Official FIR Form IF1 keywords - any ONE triggers a match
        required: [
            'first information report',
            'form if1',
            'integrated form',
            'section 154 cr.p.c',
            'f.i.r. no',
            'f.i.r no',
            'fir no',
            'occurrence of offence',
            'complainant / information',
            'complainant/information',
            'general diary reference',
            'officer-in-charge, police station',
            'signature of the officer-in-charge',
            'informant free of cost',
            'investigation transferred to p.s',
            'action taken',
            'commission of offence',
            'date & time of despatch to the court'
        ],
        supportive: [
            'p.s.', 'police station', 'dist.', 'district',
            'act', 'sections', 'ipc', 'bns', 'crpc',
            'accused', 'complainant', 'informant',
            'type of information', 'written', 'oral',
            'place of occurrence', 'beat no',
            'father\'s name', 'husband\'s name',
            'properties stolen', 'inquest report',
            'f.i.r. contents', 'rank', 'thumb-impression'
        ],
        minConfidenceScore: 0.10  // Lower threshold - FIR forms have many unique keywords
    },
    casteCertificate: {
        // Official Maharashtra Caste Certificate keywords (Form 8 + SEBC format)
        required: [
            // Headers
            'caste certificate',
            'caste certificate (part-a)',
            'परिशिष्ट – अ',
            'परिशिष्ट-अ',
            'जाति प्रमाण पत्र',
            'form - 8',
            'form 8',
            // SEBC specific
            'socially and educationally backward class',
            'sebc',
            'non-creamy layer certificate',
            'non-creamy layer certificate (part-b)',
            'creamy-layer',
            'sebc act',
            // Official phrases
            'this is to certify that',
            'belongs to the',
            'state of maharashtra',
            'sub divisional officer',
            'उप विभागीय अधिकारी',
            // Categories
            'other backward class',
            'scheduled caste',
            'scheduled tribe',
            'de-notified tribe',
            'vimukt jati',
            'nomadic tribe',
            'special backward category',
            // Government references
            'government resolution',
            'social justice & special assistance',
            'cbc-10/2013',
            'government of maharashtra gazette',
            // Certificate fields
            'outward no',
            'reg./case no',
            'certificate sr. no',
            // Verification
            'mahaonline.gov.in',
            'www.mahaonline.gov.in/verify',
            'digitally signed',
            'information technology (it) act',
            'legally valid',
            'verify visit',
            '20 digit barcode number'
        ],
        supportive: [
            'documents verified', 'school leaving certificate', 'income certificate',
            'tahsildar', 'photo id', 'ration card', 'electoral photo id',
            'tehsil', 'taluka', 'district', 'village',
            'ordinarily resides', 'ordinarily reside', 'family', 'son of', 'daughter of',
            'amended from time to time', 'recognised as',
            'place', 'date', 'seal of office', 'with the seal of office',
            'printed by', 'omtid', 'vle name', 'sdo', 'dy.col',
            'valid for the period', 'date of issue', 'signature valid'
        ],
        minConfidenceScore: 0.08  // Lower threshold for more matches
    },
    aadhaar: {
        required: [
            'aadhaar',
            'आधार',
            'unique identification',
            'uidai'
        ],
        supportive: ['government of india', 'address', 'dob', 'male', 'female', 'vid'],
        minConfidenceScore: 0.15
    },
    medical: {
        required: [
            'medical certificate',
            'medical report',
            'hospital',
            'doctor',
            'diagnosis'
        ],
        supportive: ['patient', 'treatment', 'injury', 'prescription', 'clinical'],
        minConfidenceScore: 0.15
    },
    bankPassbook: {
        required: [
            'bank passbook',
            'account statement',
            'bank account',
            'savings account'
        ],
        supportive: ['ifsc', 'branch', 'balance', 'transaction', 'deposit', 'withdrawal'],
        minConfidenceScore: 0.15
    },

    // ============ INTERCASTE MARRIAGE DOCUMENTS ============

    // Marriage Certificate
    marriageCertificate: {
        required: [
            // Header keywords
            'certificate of marriage',
            'marriage certificate',
            'marriage registration',
            'compulsory marriage registration',
            // Form phrases
            'certified that a marriage between',
            'marriage between',
            'duly registered',
            'solemnized at',
            'date of marriage',
            'date of registration',
            // Parties
            'groom',
            'bride',
            'husband',
            'wife',
            // Officials
            'marriage officer',
            'marriage registrar',
            'signature of groom',
            'signature of bride',
            'witness'
        ],
        supportive: [
            'son of', 'daughter of', 'father\'s name', 'mother\'s name',
            'age of the groom', 'age of the bride', 'born on', 'date of birth',
            'resident at', 'address of the groom', 'address of the bride',
            'office of marriage officer', 'district magistrate',
            'particulars furnished', 'delhi', 'mumbai', 'maharashtra',
            'digitally signed', 'information technology act',
            'order-2014', 'order 2014', 'revenue department'
        ],
        minConfidenceScore: 0.08
    },

    // SC/ST Caste Certificate
    scstCertificate: {
        required: [
            // Header keywords (from official SC/ST form)
            'scheduled caste',
            'scheduled tribe',
            'form of caste certificate',
            'शेड्यूल्ड कास्ट',
            'अनुसूचित जाति',
            'अनुसूचित जनजाति',
            // Constitutional references
            'presidential order',
            'constitution (scheduled castes) order',
            'constitution (scheduled tribes) order',
            // Certification phrases
            'this is to certify that',
            'belongs to the',
            'recognised as a scheduled caste',
            'recognised as a scheduled tribe',
            // Legal references
            'scheduled caste and scheduled tribes lists',
            'scheduled castes union territories order',
            'scheduled tribes union territories order',
            'reorganisation act',
            'himachal pradesh act',
            'north eastern area',
            'jammu and kashmir scheduled castes order',
            'andaman and nicobar islands',
            'dadra and nagar haveli',
            'pondicherry',
            'uttar pradesh order',
            'goa daman and diu',
            'nagaland',
            'sikkim'
        ],
        supportive: [
            'son of', 'daughter of', 'wife of', 'shri', 'smt', 'kumari',
            'village', 'town', 'district', 'division', 'state', 'union territory',
            'caste', 'tribe', 'community',
            'migrated from', 'administration',
            'issued on the basis', 'district magistrate', 'collector',
            'tehsildar', 'certificate issued to'
        ],
        minConfidenceScore: 0.08
    },

    // OBC/SEBC/Non-Creamy Layer Certificate
    otherCasteCertificate: {
        required: [
            // SEBC/OBC specific headers
            'socially and educationally backward class',
            'sebc',
            'obc',
            'other backward class',
            'backward class',
            'caste certificate (part-a)',
            'caste certificate part-a',
            'non-creamy layer certificate',
            'non-creamy layer certificate (part-b)',
            'non-creamy layer',
            'creamy-layer',
            'परिशिष्ट – अ',
            'परिशिष्ट-अ',
            // Official phrases
            'this is to certify that',
            'belongs to the',
            'state of maharashtra',
            'government resolution',
            'social justice',
            'special assistance',
            // Category names
            'maratha',
            'kunbi',
            'vimukt jati',
            'de-notified tribe',
            'nomadic tribe',
            'special backward category'
        ],
        supportive: [
            'son of', 'daughter of', 'village', 'taluka', 'district', 'nanded', 'pune',
            'government of maharashtra gazette',
            'maharashtra state reservation',
            'cbc-10/2013', 'pra.kra', 'mavak',
            'vjnt', 'vjnt-1',
            'sub divisional officer', 'sdo', 'dy.col',
            'outward no', 'reg./case no',
            'mahaonline.gov.in', 'digitally signed',
            'valid for the period', 'date of issue',
            'documents verified', 'school leaving certificate',
            'income certificate', 'tahsildar', 'photo id'
        ],
        minConfidenceScore: 0.08
    },

    // Address Proof (Electric Bill, Water Bill, etc.)
    addressProof: {
        required: [
            'electricity bill',
            'electric bill',
            'water bill',
            'property tax',
            'gas connection',
            'gas bill',
            'proof of address',
            'utility bill',
            'consumer number',
            'bill number',
            'meter number',
            'service connection'
        ],
        supportive: [
            'billing date', 'due date', 'amount due', 'units consumed',
            'reading', 'previous reading', 'current reading',
            'residential', 'domestic', 'consumer name',
            'address', 'flat', 'society', 'plot', 'ward',
            'mahanagar gas', 'msedcl', 'tata power', 'adani',
            'municipal corporation', 'nagar palika'
        ],
        minConfidenceScore: 0.10
    }
};

/**
 * Extract text from PDF using pdf-parse v1.x
 */
async function extractTextFromPDF(pdfBuffer) {
    if (!pdfParse) {
        console.warn('⚠️ pdf-parse not available. Cannot extract text from PDF.');
        return null;
    }

    try {
        console.log('📄 Starting PDF text extraction...');
        // pdf-parse v1.x: pass buffer directly, returns {text, numpages, info}
        const data = await pdfParse(pdfBuffer);
        console.log(`📄 PDF text extracted: ${data.text.length} characters from ${data.numpages} pages`);
        if (data.text.length > 0) {
            console.log(`   First 200 chars: "${data.text.substring(0, 200).toLowerCase()}..."`);
        }
        return data.text.toLowerCase();
    } catch (error) {
        console.error('❌ PDF parsing error:', error.message);
        return null;
    }
}

/**
 * Extract text from image using Google Cloud Vision API
 */
async function extractTextFromImage(imageBuffer, mimeType) {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
        console.warn('⚠️ Google Cloud Vision API key not configured. Skipping image OCR.');
        console.warn('   Add GOOGLE_CLOUD_VISION_API_KEY to your .env file');
        return null;
    }

    console.log(`🔍 Calling Google Cloud Vision API for image OCR...`);

    try {
        const base64Image = imageBuffer.toString('base64');

        const response = await axios.post(
            `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
            {
                requests: [{
                    image: { content: base64Image },
                    features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
                }]
            },
            { timeout: 30000 }
        );

        // Check for API errors
        if (response.data.responses?.[0]?.error) {
            const apiError = response.data.responses[0].error;
            console.error('❌ Vision API error:', apiError.message);
            return null;
        }

        const textAnnotations = response.data.responses?.[0]?.textAnnotations;
        if (textAnnotations && textAnnotations.length > 0) {
            const extractedText = textAnnotations[0].description.toLowerCase();
            console.log(`✅ Image text extracted: ${extractedText.length} characters`);
            console.log(`   First 200 chars: "${extractedText.substring(0, 200)}..."`);
            return extractedText;
        }

        console.log('⚠️ No text found in image');
        return '';
    } catch (error) {
        console.error('❌ Google Cloud Vision API error:', error.message);

        if (error.response?.status === 403) {
            console.error('   Error 403: API key invalid or Cloud Vision API not enabled');
            console.error('   Enable it at: https://console.cloud.google.com/apis/library/vision.googleapis.com');
        } else if (error.response?.status === 401) {
            console.error('   Error 401: Invalid API key');
        } else if (error.response?.data) {
            console.error('   Response:', JSON.stringify(error.response.data));
        }

        return null;
    }
}

/**
 * Classify document type based on extracted text
 */
function classifyDocument(text) {
    if (!text || text.trim().length === 0) {
        console.log('⚠️ No text to classify');
        return { detectedType: 'unknown', confidence: 0, allScores: {}, matchedKeywords: [] };
    }

    console.log(`🔍 Classifying document (${text.length} chars)...`);

    const scores = {};
    const allMatchedKeywords = {};

    for (const [docType, config] of Object.entries(DOCUMENT_KEYWORDS)) {
        let score = 0;
        let requiredMatches = 0;
        const matchedKeywords = [];

        // Check required keywords (any ONE match is significant)
        for (const keyword of config.required) {
            if (text.includes(keyword.toLowerCase())) {
                score += 3; // Higher weight for required
                requiredMatches++;
                matchedKeywords.push(keyword);
            }
        }

        // Check supportive keywords
        for (const keyword of config.supportive) {
            if (text.includes(keyword.toLowerCase())) {
                score += 1;
                matchedKeywords.push(keyword);
            }
        }

        // Calculate confidence
        const maxScore = (config.required.length * 3) + (config.supportive.length * 1);
        const confidence = maxScore > 0 ? score / maxScore : 0;

        // Store if ANY required keyword matched
        scores[docType] = requiredMatches > 0 ? confidence : 0;
        allMatchedKeywords[docType] = matchedKeywords;

        if (matchedKeywords.length > 0) {
            console.log(`   ${docType}: ${matchedKeywords.length} matches (${matchedKeywords.slice(0, 5).join(', ')})`);
        }
    }

    // Find highest scoring document type
    let maxType = 'unknown';
    let maxConfidence = 0;

    for (const [docType, confidence] of Object.entries(scores)) {
        if (confidence > maxConfidence) {
            maxConfidence = confidence;
            maxType = docType;
        }
    }

    console.log(`📋 Classification result: ${maxType} (confidence: ${(maxConfidence * 100).toFixed(1)}%)`);

    return {
        detectedType: maxType,
        confidence: maxConfidence,
        allScores: scores,
        matchedKeywords: allMatchedKeywords[maxType] || []
    };
}

/**
 * Verify that an uploaded document matches the expected document type
 */
async function verifyDocumentType(fileBuffer, mimeType, expectedType) {
    console.log(`\n========== DOCUMENT VERIFICATION ==========`);
    console.log(`📁 File type: ${mimeType}`);
    console.log(`📋 Expected document type: ${expectedType}`);

    let extractedText = null;

    // Handle different file types
    if (mimeType === 'application/pdf') {
        console.log('📄 Extracting text from PDF...');
        extractedText = await extractTextFromPDF(fileBuffer);
    } else if (['image/jpeg', 'image/jpg', 'image/png'].includes(mimeType)) {
        console.log('🖼️ Extracting text from image using Vision API...');
        extractedText = await extractTextFromImage(fileBuffer, mimeType);
    } else {
        console.log(`⚠️ Unsupported file type: ${mimeType}`);
        return {
            isValid: true,
            message: 'Document accepted (unsupported file type for verification)',
            skipped: true
        };
    }

    // STRICT MODE: If text extraction failed, REJECT the document
    if (extractedText === null) {
        console.log('❌ Text extraction failed - REJECTING document');
        const expectedLabel = getDocumentLabel(expectedType);
        return {
            isValid: false,
            message: `Cannot verify document. Please upload a clear, readable ${expectedLabel} in PDF or image format.`,
            verified: false,
            skipped: false
        };
    }

    // STRICT MODE: If no/minimal text found in document, REJECT
    // Minimum 50 characters required for meaningful verification
    if (extractedText.trim().length < 50) {
        console.log(`❌ Document has insufficient text (${extractedText.trim().length} chars) - REJECTING`);
        const expectedLabel = getDocumentLabel(expectedType);
        return {
            isValid: false,
            message: `Document appears to be empty, scanned, or has unreadable text. Please upload a filled ${expectedLabel} with readable text.`,
            verified: false
        };
    }

    // Classify the document
    const classification = classifyDocument(extractedText);

    // STRICT MODE: If could not classify, REJECT
    if (classification.detectedType === 'unknown') {
        console.log('❌ Could not identify document type - REJECTING');
        const expectedLabel = getDocumentLabel(expectedType);
        return {
            isValid: false,
            message: `Could not identify this as a ${expectedLabel}. Please upload a valid ${expectedLabel} document.`,
            verified: false,
            classification
        };
    }

    // Normalize types for comparison
    const normalizedExpected = expectedType.toLowerCase().replace(/[_-]/g, '');
    const normalizedDetected = classification.detectedType.toLowerCase().replace(/[_-]/g, '');

    // Type aliases for flexible matching
    const typeAliases = {
        'castecertificate': ['castecertificate', 'caste', 'othercastecertificate'],
        'fir': ['fir'],
        'aadhaar': ['aadhaar', 'aadhar'],
        'medical': ['medical'],
        'bankpassbook': ['bankpassbook', 'bank'],
        // Intercaste marriage documents
        'marriagecertificate': ['marriagecertificate', 'marriage'],
        'scstcertificate': ['scstcertificate', 'scheduledcaste', 'scheduledtribe'],
        'othercastecertificate': ['othercastecertificate', 'sebc', 'obc', 'castecertificate'],
        'addressproof': ['addressproof', 'electricbill', 'utilitybill']
    };

    // Check if types match
    let typesMatch = normalizedExpected === normalizedDetected;
    if (!typesMatch) {
        const aliases = typeAliases[normalizedExpected] || [normalizedExpected];
        typesMatch = aliases.includes(normalizedDetected);
    }

    if (typesMatch) {
        console.log(`✅ Document type MATCHES expected type`);
        return {
            isValid: true,
            message: 'Document verified successfully',
            verified: true,
            detectedType: classification.detectedType,
            confidence: classification.confidence,
            matchedKeywords: classification.matchedKeywords,
            classification
        };
    } else {
        // Type mismatch!
        const config = DOCUMENT_KEYWORDS[classification.detectedType];
        const minConfidence = config?.minConfidenceScore || 0.15;

        if (classification.confidence >= minConfidence) {
            // Confident mismatch - REJECT
            const detectedLabel = getDocumentLabel(classification.detectedType);
            const expectedLabel = getDocumentLabel(expectedType);

            console.log(`❌ Document type MISMATCH - REJECTING`);
            console.log(`   Expected: ${expectedLabel}`);
            console.log(`   Detected: ${detectedLabel}`);

            return {
                isValid: false,
                message: `Invalid document: Expected ${expectedLabel} but detected ${detectedLabel}. Please upload the correct document.`,
                verified: false,
                detectedType: classification.detectedType,
                expectedType: expectedType,
                confidence: classification.confidence,
                matchedKeywords: classification.matchedKeywords,
                classification
            };
        } else {
            // Low confidence mismatch - allow with warning
            console.log(`⚠️ Low confidence mismatch - allowing upload`);
            return {
                isValid: true,
                message: 'Document uploaded (verification confidence was low)',
                verified: false,
                classification
            };
        }
    }
}

/**
 * Get human-readable label for document type
 */
function getDocumentLabel(docType) {
    const labels = {
        // Atrocity case documents
        'fir': 'FIR (First Information Report)',
        'casteCertificate': 'Caste Certificate',
        'castecertificate': 'Caste Certificate',
        'aadhaar': 'Aadhaar Card',
        'medical': 'Medical Report',
        'bankPassbook': 'Bank Passbook',
        'bankpassbook': 'Bank Passbook',
        // Intercaste marriage documents
        'marriageCertificate': 'Marriage Certificate',
        'marriagecertificate': 'Marriage Certificate',
        'scstCertificate': 'SC/ST Caste Certificate',
        'scstcertificate': 'SC/ST Caste Certificate',
        'otherCasteCertificate': 'OBC/SEBC Caste Certificate',
        'othercastecertificate': 'OBC/SEBC Caste Certificate',
        'addressProof': 'Address Proof (Utility Bill)',
        'addressproof': 'Address Proof (Utility Bill)'
    };
    return labels[docType] || docType;
}

module.exports = {
    verifyDocumentType,
    extractTextFromImage,
    extractTextFromPDF,
    classifyDocument,
    getDocumentLabel
};
