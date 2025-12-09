import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { documentAPI } from "@/services/api";

/**
 * FileUpload Component
 * 
 * A reusable file upload component with validation, preview, and AI document verification.
 * Supports both controlled and uncontrolled modes.
 * 
 * @param {string} id - Required. Used for input id and label association
 * @param {string} label - Required. Display label (e.g., "Caste Certificate (PDF/JPG)")
 * @param {string} helperText - Optional. Helper text (e.g., "Max 5MB")
 * @param {string} accept - Optional. File types to accept (default: 'application/pdf,image/*')
 * @param {number} maxSize - Optional. Max file size in bytes (default: 5MB)
 * @param {File|null} value - Optional. For controlled mode
 * @param {function} onFileChange - Callback function when file changes (file: File | null)
 * @param {boolean} required - Optional. Whether the field is required
 * @param {string} className - Optional. Additional CSS classes for container
 * @param {string} expectedDocumentType - Optional. Expected document type for AI verification (e.g., 'fir', 'casteCertificate')
 * @param {function} onVerificationResult - Optional. Callback for verification result
 */
const FileUpload = ({
    id,
    label,
    helperText = "Max 5MB",
    accept = "application/pdf,image/*",
    maxSize = 5 * 1024 * 1024, // 5MB default
    value,
    onFileChange,
    required = false,
    className = "",
    expectedDocumentType = null, // NEW: For AI verification
    onVerificationResult = null, // NEW: Callback for verification result
}) => {
    const [internalFile, setInternalFile] = useState(null);
    const [error, setError] = useState("");
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null); // 'verified', 'failed', 'skipped', null
    const inputRef = useRef(null);

    // Determine if we're in controlled mode (value prop was explicitly passed)
    const isControlled = value !== undefined;
    const currentFile = isControlled ? value : internalFile;

    // Format bytes to human-readable size
    const formatBytes = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    // Validate file type
    const isValidType = (file) => {
        const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        return validTypes.includes(file.type.toLowerCase());
    };

    // Verify document type with AI
    const verifyDocumentType = async (file) => {
        if (!expectedDocumentType) {
            // No verification needed if no expected type specified
            return { success: true, skipped: true };
        }

        setIsVerifying(true);
        setVerificationStatus(null);
        setError("");

        try {
            const result = await documentAPI.verifyType(file, expectedDocumentType);

            if (result.success) {
                setVerificationStatus(result.verification?.verified ? 'verified' : 'skipped');
                if (onVerificationResult) {
                    onVerificationResult({ success: true, ...result });
                }
                return result;
            } else {
                setVerificationStatus('failed');
                setError(result.message || "Document verification failed");
                if (onVerificationResult) {
                    onVerificationResult({ success: false, ...result });
                }
                return result;
            }
        } catch (err) {
            console.error("Document verification error:", err);

            // Check if it's a 400 error (wrong document type)
            if (err.response?.status === 400) {
                const errorMessage = err.response?.data?.message || "Wrong document type detected";
                setVerificationStatus('failed');
                setError(errorMessage);
                if (onVerificationResult) {
                    onVerificationResult({ success: false, message: errorMessage, ...err.response?.data });
                }
                return { success: false, message: errorMessage };
            }

            // For other errors, allow upload but show warning
            setVerificationStatus('skipped');
            console.warn("Verification failed, allowing upload anyway:", err.message);
            return { success: true, skipped: true };
        } finally {
            setIsVerifying(false);
        }
    };

    // Handle file selection
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // Clear previous error and verification status
        setError("");
        setVerificationStatus(null);

        // Validate file type
        if (!isValidType(file)) {
            setError("Invalid file type. Please upload PDF or image (JPG/PNG).");
            e.target.value = ""; // Clear input
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024));
            setError(`File is too large. Max size is ${maxSizeMB}MB.`);
            e.target.value = ""; // Clear input
            return;
        }

        // Create preview for images
        if (file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }

        // Verify document type with AI (if expectedDocumentType is provided)
        if (expectedDocumentType) {
            const verificationResult = await verifyDocumentType(file);

            // If verification failed, clear the file and stop
            if (!verificationResult.success) {
                e.target.value = ""; // Clear input
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                }
                return;
            }
        }

        // Update state
        if (!isControlled) {
            setInternalFile(file);
        }

        // Call callback
        if (onFileChange) {
            onFileChange(file);
        }
    };

    // Handle file removal
    const handleRemove = (e) => {
        e.stopPropagation(); // Prevent triggering file picker

        // Revoke preview URL
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        // Clear input
        if (inputRef.current) {
            inputRef.current.value = "";
        }

        // Clear error and verification status
        setError("");
        setVerificationStatus(null);

        // Update state
        if (!isControlled) {
            setInternalFile(null);
        }

        // Call callback
        if (onFileChange) {
            onFileChange(null);
        }
    };

    // Open file picker
    const openFilePicker = () => {
        inputRef.current?.click();
    };

    // Keyboard accessibility for card
    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFilePicker();
        }
    };

    // Cleanup preview URL on unmount or file change
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Get verification status icon
    const getStatusIcon = () => {
        if (isVerifying) {
            return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
        }
        if (verificationStatus === 'verified') {
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
        if (verificationStatus === 'failed') {
            return <AlertCircle className="h-4 w-4 text-red-500" />;
        }
        return null;
    };

    return (
        <div className={className}>
            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                id={id}
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
                required={required}
                aria-label={label}
                disabled={isVerifying}
            />

            {/* Upload card */}
            <div
                onClick={() => !isVerifying && inputRef.current?.click()}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="button"
                aria-label={`Upload ${label}`}
                className={`
          flex items-center justify-between p-4 border rounded-lg 
          cursor-pointer transition-all
          bg-background hover:bg-muted/50 hover:shadow-sm
          border-input focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-ring focus-visible:ring-offset-2
          ${error ? "border-red-500" : ""}
          ${verificationStatus === 'verified' ? "border-green-500" : ""}
          ${isVerifying ? "opacity-75 cursor-wait" : ""}
        `}
            >
                {/* Left side: Icon + Label */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icon or Thumbnail */}
                    {currentFile && previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                        />
                    ) : (
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}

                    {/* Label and helper text */}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm flex items-center gap-2">
                            {label}
                            {required && <span className="text-red-500 ml-1">*</span>}
                            {getStatusIcon()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {isVerifying ? "Verifying document..." : helperText}
                        </p>
                    </div>
                </div>

                {/* Right side: Upload button or file info */}
                {!currentFile ? (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!isVerifying && inputRef.current) {
                                inputRef.current.click();
                            }
                        }}
                        className="flex-shrink-0"
                        disabled={isVerifying}
                    >
                        {isVerifying ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="mr-2 h-4 w-4" />
                        )}
                        {isVerifying ? "Verifying..." : "Upload"}
                    </Button>
                ) : (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* File info pill */}
                        <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm max-w-[220px] ${verificationStatus === 'verified'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-primary/10 text-primary'
                                }`}
                            title={`${currentFile.name} (${formatBytes(currentFile.size)})`}
                            aria-label={`Selected file: ${currentFile.name}, ${formatBytes(currentFile.size)}`}
                        >
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                                {currentFile.name}
                            </span>
                            <span className="text-xs opacity-75 flex-shrink-0">
                                ({formatBytes(currentFile.size)})
                            </span>
                        </div>

                        {/* Remove button */}
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={handleRemove}
                            className="h-8 w-8 p-0 flex-shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                            aria-label="Remove file"
                            disabled={isVerifying}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                >
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Verification success message */}
            {verificationStatus === 'verified' && !error && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span>✅</span>
                    <span>Document verified successfully</span>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
