import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import {
  Shield,
  Upload,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Globe,
  Fingerprint,
  Lock,
  Eye,
  Download,
  HelpCircle,
  Wallet,
  CreditCard,
  Users,
  Home,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import LegalPopCard from "@/components/LegalPopCard";
import VictimSupportFaqContent from "@/components/VictimSupportFaqContent";
import FileUpload from "@/components/FileUpload";
import { grievanceAPI, documentAPI, intercasteAPI } from "@/services/api";

const VictimPortal = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("register");

  // Form data state
  const [formData, setFormData] = useState({
    aadhaarNumber: "",
    mobileNumber: "",
    email: "",
    firCaseNumber: "",
    policeStation: "",
    district: "",
    state: "",
    dateOfIncident: "",
    dateOfFirRegistration: "",
    delayReason: "",
    casteCategory: "",
    casteCertificateNumber: "",
    typeOfAtrocity: "",
    incidentDescription: "",
    village: "",
    pincode: "",
    witnessName: "",
    witnessContact: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: ""
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [grievanceId, setGrievanceId] = useState("");

  const [incidentDate, setIncidentDate] = useState("");
  const [firDate, setFirDate] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [needsEmergencySupport, setNeedsEmergencySupport] = useState(false);
  const [emergencySupports, setEmergencySupports] = useState({
    medical: false,
    shelter: false,
    police: false,
    counselling: false,
    foodTravel: false,
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [utrId, setUtrId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isVictimFaqOpen, setIsVictimFaqOpen] = useState(false);

  // File uploads
  const [firFile, setFirFile] = useState(null);
  const [medicalFile, setMedicalFile] = useState(null);
  const [otherDocsFile, setOtherDocsFile] = useState(null);
  const [casteFile, setCasteFile] = useState(null);

  // Intercaste Marriage Form State
  const [intercasteFormData, setIntercasteFormData] = useState({
    husbandName: "",
    husbandAadhaar: "",
    husbandMobile: "",
    husbandEmail: "",
    wifeName: "",
    wifeAadhaar: "",
    wifeMobile: "",
    wifeEmail: "",
    currentAddress: "",
    district: "",
    state: "",
    pincode: "",
    scstSpouse: "", // "husband" or "wife"
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: ""
  });
  const [intercasteElectricBillFile, setIntercasteElectricBillFile] = useState(null);
  const [intercasteMarriageCertFile, setIntercasteMarriageCertFile] = useState(null);
  const [intercasteScstCertFile, setIntercasteScstCertFile] = useState(null);
  const [intercasteOtherCertFile, setIntercasteOtherCertFile] = useState(null);
  const [intercasteSubmitting, setIntercasteSubmitting] = useState(false);
  const [intercasteSuccess, setIntercasteSuccess] = useState(false);
  const [intercasteCaseId, setIntercasteCaseId] = useState("");
  const [showIntercasteReviewModal, setShowIntercasteReviewModal] = useState(false);
  const [intercasteAccountNumber, setIntercasteAccountNumber] = useState("");
  const [intercasteConfirmAccountNumber, setIntercasteConfirmAccountNumber] = useState("");

  // Dummy officer transaction ID for frontend verification
  const officerTransactionId = "TXN123456789";

  // Officer Queries State
  const [officerQueries, setOfficerQueries] = useState([]);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [responseFile, setResponseFile] = useState(null);
  const [responseError, setResponseError] = useState("");

  // Track Status State
  const [trackCaseId, setTrackCaseId] = useState("");
  const [trackedCase, setTrackedCase] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState("");
  const [trackedDisbursements, setTrackedDisbursements] = useState([]);
  const [verifyingIndex, setVerifyingIndex] = useState(-1);
  const [verifyTxnInput, setVerifyTxnInput] = useState("");


  const handleSubmit = (e) => {
    e.preventDefault();

    // Collect form data from form fields
    const form = e.target;
    const updatedFormData = {
      aadhaarNumber: form.aadhaar.value,
      mobileNumber: form.mobile.value,
      email: form.email.value || "",
      firCaseNumber: form.fir.value,
      policeStation: form["police-station"].value,
      district: form.district.value,
      state: form.state.value,
      dateOfIncident: form["incident-date"].value,
      dateOfFirRegistration: form["fir-date"].value || undefined,
      delayReason: form["delay-reason"]?.value || "",
      casteCategory: form["caste-category"].value,
      casteCertificateNumber: form["caste-certificate"].value,
      typeOfAtrocity: form["atrocity-type"].value,
      incidentDescription: form["incident-description"]?.value || "",
      village: form.village?.value || "",
      pincode: form.pincode?.value || "",
      witnessName: form["witness-name"]?.value || "",
      witnessContact: form["witness-contact"]?.value || "",
      accountHolderName: form["account-holder-name"].value,
      bankName: form["bank-name"]?.value || "",
      accountNumber: form["account-number"].value,
      ifscCode: form["ifsc-code"].value
    };

    setFormData(updatedFormData);
    setShowReviewModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Step 1: Create the grievance
      const response = await grievanceAPI.create(formData);
      const newGrievanceId = response.data.grievanceId;
      const newCaseId = response.data.caseId;

      // Step 2: Upload all documents automatically
      const uploadPromises = [];

      if (firFile) {
        uploadPromises.push(
          documentAPI.upload(firFile, newGrievanceId, 'fir')
            .catch(err => console.error('FIR upload failed:', err))
        );
      }

      if (casteFile) {
        uploadPromises.push(
          documentAPI.upload(casteFile, newGrievanceId, 'casteCertificate')
            .catch(err => console.error('Caste certificate upload failed:', err))
        );
      }

      if (medicalFile) {
        uploadPromises.push(
          documentAPI.upload(medicalFile, newGrievanceId, 'medicalReport')
            .catch(err => console.error('Medical report upload failed:', err))
        );
      }

      if (otherDocsFile) {
        uploadPromises.push(
          documentAPI.upload(otherDocsFile, newGrievanceId, 'other')
            .catch(err => console.error('Other documents upload failed:', err))
        );
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // Success!
      setCaseId(newCaseId);
      setGrievanceId(newGrievanceId);
      setSubmissionSuccess(true);
      setShowReviewModal(false);

      toast({
        title: "Application Submitted Successfully! ✓",
        description: `Your case has been registered. Your Case ID is: ${newCaseId}`,
      });

    } catch (error) {
      console.error("Submission error:", error);

      // Handle duplicate FIR error
      if (error.response?.data?.message?.includes("FIR number already exists")) {
        toast({
          title: "Duplicate FIR Number",
          description: `This FIR number is already registered. Existing Case ID: ${error.response.data.existingCaseId}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Submission Failed",
          description: error.response?.data?.message || "Failed to submit grievance. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyUTR = () => {
    if (utrId.trim() === officerTransactionId) {
      setIsVerified(true);
      setVerificationError("");
      toast({
        title: "Transaction Verified Successfully! ✓",
        description: "Relief amount confirmed. Your case is now closed.",
      });
    } else {
      setVerificationError("The Transaction/UTR ID does not match our records. Please check the bank SMS and try again.");
    }
  };


  // Helper function to check if FIR was delayed
  const isFirDelayed = () => {
    if (!incidentDate || !firDate) return false;
    const incident = new Date(incidentDate);
    const fir = new Date(firDate);
    const diffTime = Math.abs(fir - incident);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 2;
  };

  // Helper function to check if account numbers match
  const accountNumbersMatch = () => {
    if (!accountNumber || !confirmAccountNumber) return true;
    return accountNumber === confirmAccountNumber;
  };

  // Officer Queries Event Handlers
  const handleRespondToQuery = (query) => {
    setSelectedQuery(query);
    setShowResponseModal(true);
    setResponseText("");
    setResponseFile(null);
    setResponseError("");
  };

  const handleCloseResponseModal = () => {
    setShowResponseModal(false);
    setSelectedQuery(null);
    setResponseText("");
    setResponseFile(null);
    setResponseError("");
  };

  const handleResponseFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setResponseError("File size must be less than 5MB");
        return;
      }
      setResponseFile(file);
      setResponseError("");
    }
  };

  const handleSubmitResponse = async () => {
    const isMissingDocument = selectedQuery.type?.toLowerCase().includes("missing");

    // Validation
    if (isMissingDocument) {
      // For missing document, require at least file OR text
      if (!responseFile && !responseText.trim()) {
        setResponseError("Please upload a document or provide a text response");
        return;
      }
    } else {
      if (!responseText.trim()) {
        setResponseError("Please enter your response");
        return;
      }
    }

    try {
      let uploadedFileName = null;

      // Upload file if provided
      if (responseFile && trackedCase?._id) {
        try {
          const uploadResult = await documentAPI.upload(responseFile, trackedCase._id, 'queryResponse');
          uploadedFileName = responseFile.name;
          toast({
            title: "Document Uploaded",
            description: `${responseFile.name} uploaded successfully.`,
          });
        } catch (uploadErr) {
          console.error('File upload error:', uploadErr);
          // Continue even if upload fails, just note it in response
          uploadedFileName = `${responseFile.name} (upload pending)`;
        }
      }

      // Build response text
      let finalResponse = responseText.trim();
      if (uploadedFileName) {
        finalResponse = finalResponse
          ? `${finalResponse}\n\n[Document uploaded: ${uploadedFileName}]`
          : `Document uploaded: ${uploadedFileName}`;
      }

      await grievanceAPI.respondToQuery(trackedCase._id, selectedQuery.id, {
        response: finalResponse
      });

      // Refresh tracked case data
      handleTrackCase();

      // Close modal
      handleCloseResponseModal();

      // Show success toast
      toast({
        title: "Response Submitted",
        description: "Your response has been submitted. The officer will review it shortly.",
      });
    } catch (err) {
      console.error('Error submitting response:', err);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Helper to get query status message
  const getQueryStatusMessage = () => {
    if (!officerQueries.length) return null;

    const hasActionRequired = officerQueries.some(q => q.status === "Action Required");
    const allResolved = officerQueries.every(q => q.status === "Resolved");
    const allWaiting = officerQueries.every(q => q.status === "Waiting for Officer Review" || q.status === "Resolved");

    if (hasActionRequired) {
      return { text: "Officer query raised – action required from you.", color: "text-orange-600" };
    } else if (allResolved) {
      return { text: "Officer review completed.", color: "text-green-600" };
    } else if (allWaiting) {
      return { text: "Your response has been submitted. Awaiting officer review.", color: "text-blue-600" };
    }
    return null;
  };

  // Track case handler
  const handleTrackCase = async () => {
    if (!trackCaseId.trim()) {
      setTrackError("Please enter a Case ID or Aadhaar number");
      return;
    }

    setTrackLoading(true);
    setTrackError("");

    try {
      const response = await grievanceAPI.trackByCaseId(trackCaseId.trim());
      setTrackedCase(response.data);
      setOfficerQueries(response.data.queries || []);
      setTrackedDisbursements(response.data.disbursements || []);
      setTrackError("");
    } catch (err) {
      console.error('Error tracking case:', err);
      setTrackError(err.response?.data?.message || "Case not found. Please check your Case ID.");
      setTrackedCase(null);
      setOfficerQueries([]);
      setTrackedDisbursements([]);
    } finally {
      setTrackLoading(false);
    }
  };

  // Verify transaction handler
  const handleVerifyDisbursement = async (index) => {
    if (!verifyTxnInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter the transaction ID",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await grievanceAPI.verifyTransaction(trackedCase._id, index, verifyTxnInput.trim());

      // Refresh tracked case
      handleTrackCase();

      setVerifyingIndex(-1);
      setVerifyTxnInput("");

      toast({
        title: response.data?.allVerified ? "All Verified!" : "Verified",
        description: response.message,
      });
    } catch (err) {
      console.error('Error verifying:', err);
      toast({
        title: "Verification Failed",
        description: err.response?.data?.message || "Transaction ID does not match.",
        variant: "destructive"
      });
    }
  };

  // Generate dynamic case stages based on tracked case
  const getCaseStages = () => {
    if (!trackedCase) {
      // Default demo stages when no case is tracked
      return [
        { stage: "Application Filed", status: "completed", date: "2024-01-15" },
        { stage: "Document Verification", status: "completed", date: "2024-01-16" },
        { stage: "Officer Review", status: "in-progress", date: "In Progress" },
        { stage: "Relief Sanctioned", status: "pending", date: "Pending" },
        { stage: "DBT to Bank Account", status: "pending", date: "Pending" },
        { stage: "Victim Confirmation", status: "pending", date: "Pending" },
        { stage: "Case Closed", status: "pending", date: "Pending" },
      ];
    }

    const status = trackedCase.status;
    const hasQueries = officerQueries.length > 0;
    const allQueriesResolved = officerQueries.every(q => q.status === "Resolved");
    const hasDisbursements = trackedDisbursements.length > 0;
    const allDisbursementsVerified = trackedDisbursements.length > 0 &&
      trackedDisbursements.every(d => d.victimVerified);
    const isApprovedOrBeyond = ['approved', 'disbursed', 'closed'].includes(status);

    const formatDate = (dateStr) => {
      if (!dateStr) return "Pending";
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return [
      {
        stage: "Application Filed",
        status: "completed",
        date: formatDate(trackedCase.submittedAt)
      },
      {
        stage: "Document Verification",
        status: status !== 'pending' ? "completed" : "in-progress",
        date: status !== 'pending' ? formatDate(trackedCase.lastUpdated) : "In Progress"
      },
      {
        stage: "Officer Review",
        status: isApprovedOrBeyond ? "completed" :
          (status === 'under_review' ? "in-progress" : "pending"),
        date: isApprovedOrBeyond ? formatDate(trackedCase.lastUpdated) :
          (status === 'under_review' ? "In Progress" : "Pending")
      },
      {
        stage: "Relief Sanctioned",
        status: isApprovedOrBeyond ? "completed" : "pending",
        date: isApprovedOrBeyond ? formatDate(trackedCase.lastUpdated) : "Pending"
      },
      {
        stage: "DBT to Bank Account",
        status: hasDisbursements ? (allDisbursementsVerified ? "completed" : "in-progress") : "pending",
        date: hasDisbursements ? formatDate(trackedDisbursements[0]?.disbursedAt) : "Pending"
      },
      {
        stage: "Victim Confirmation",
        status: allDisbursementsVerified ? "completed" : (hasDisbursements ? "in-progress" : "pending"),
        date: allDisbursementsVerified ? formatDate(trackedDisbursements[trackedDisbursements.length - 1]?.victimVerifiedAt) :
          (hasDisbursements ? "Awaiting Verification" : "Pending")
      },
      {
        stage: "Case Closed",
        status: status === 'closed' ? "completed" : "pending",
        date: status === 'closed' ? formatDate(trackedCase.lastUpdated) : "Pending"
      },
    ];
  };

  const caseStages = getCaseStages();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <Shield className="h-4 w-4" />
              <span>Your Safety & Privacy Matter</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Victim Relief Portal
            </h1>

            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              A safe, secure, and compassionate platform to access immediate relief and justice.
              You are not alone—we are here to support you every step of the way.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <Lock className="h-4 w-4" />
                <span>100% Privacy Protected</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <Clock className="h-4 w-4" />
                <span>48-Hour Emergency Relief</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <Globe className="h-4 w-4" />
                <span>Multilingual Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Portal Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Apply for Relief</span>
                  <span className="sm:hidden">Apply</span>
                </TabsTrigger>
                <TabsTrigger value="intercaste" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Intercaste Marriage</span>
                  <span className="sm:hidden">Intercaste</span>
                </TabsTrigger>
                <TabsTrigger value="track" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Track Status</span>
                  <span className="sm:hidden">Track</span>
                </TabsTrigger>
                <TabsTrigger value="emergency" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Emergency Relief</span>
                  <span className="sm:hidden">Emergency</span>
                </TabsTrigger>
              </TabsList>

              {/* Apply for Relief Tab */}
              <TabsContent value="register" className="space-y-6">
                <Card className="p-6 md:p-8">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Register Your Case</h2>
                      <p className="text-muted-foreground">
                        All information is encrypted and handled with strict confidentiality.
                        You will be identified by your Case ID only.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Fingerprint className="h-5 w-5 text-accent" />
                          Personal Information
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                            <Input
                              id="aadhaar"
                              placeholder="XXXX-XXXX-XXXX"
                              required
                              maxLength={14}
                            />
                            <p className="text-xs text-muted-foreground">
                              Used only for verification, not stored permanently
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number *</Label>
                            <Input
                              id="mobile"
                              type="tel"
                              placeholder="+91 XXXXX XXXXX"
                              required
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="email">Email Address (Optional)</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="your.email@example.com"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Case Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <FileText className="h-5 w-5 text-accent" />
                          Case Details
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fir">FIR/Case Number *</Label>
                            <Input
                              id="fir"
                              placeholder="Enter FIR/Case Number"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="police-station">Police Station *</Label>
                            <Input
                              id="police-station"
                              placeholder="Name of Police Station"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="district">District *</Label>
                            <Input
                              id="district"
                              placeholder="Your District"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="state">State *</Label>
                            <select
                              id="state"
                              className="w-full h-10 px-3 rounded-md border border-input bg-background"
                              required
                            >
                              <option value="">Select State</option>
                              <option value="andhra-pradesh">Andhra Pradesh</option>
                              <option value="bihar">Bihar</option>
                              <option value="delhi">Delhi</option>
                              <option value="gujarat">Gujarat</option>
                              <option value="maharashtra">Maharashtra</option>
                              <option value="tamil-nadu">Tamil Nadu</option>
                              <option value="uttar-pradesh">Uttar Pradesh</option>
                            </select>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="incident-date">Date of Incident *</Label>
                            <Input
                              id="incident-date"
                              type="date"
                              required
                              value={incidentDate}
                              onChange={(e) => setIncidentDate(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="fir-date">Date of FIR Registration *</Label>
                            <Input
                              id="fir-date"
                              type="date"
                              required
                              value={firDate}
                              onChange={(e) => setFirDate(e.target.value)}
                            />
                          </div>

                          {isFirDelayed() && (
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="delay-reason">Reason for Delay (if FIR registered after 2 days of incident)</Label>
                              <textarea
                                id="delay-reason"
                                rows={3}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                                placeholder="Please explain why the FIR was not registered within 2 days of the incident..."
                              />
                              <p className="text-xs text-muted-foreground">
                                This information helps us understand your situation better.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Caste & Identity Verification */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Shield className="h-5 w-5 text-accent" />
                          Caste & Identity Verification
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="caste-category">Caste Category *</Label>
                            <select
                              id="caste-category"
                              className="w-full h-10 px-3 rounded-md border border-input bg-background"
                              required
                            >
                              <option value="">Select</option>
                              <option value="sc">Scheduled Caste (SC)</option>
                              <option value="st">Scheduled Tribe (ST)</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="caste-certificate">Caste Certificate Number *</Label>
                            <Input
                              id="caste-certificate"
                              placeholder="Enter your caste certificate number"
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              This is used only for eligibility verification under PCR/PoA schemes.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button type="button" size="sm" variant="outline">
                            <Lock className="mr-2 h-4 w-4" />
                            Fetch from DigiLocker
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            or upload manually below
                          </span>
                        </div>

                        <FileUpload
                          id="caste-certificate"
                          label="Caste Certificate (PDF/JPG)"
                          helperText="Max 5MB - Document will be verified"
                          onFileChange={setCasteFile}
                          expectedDocumentType="casteCertificate"
                          required
                        />
                      </div>

                      {/* Nature of Atrocity & Incident Details */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-accent" />
                          Nature of Atrocity & Incident Details
                        </h3>

                        <div className="space-y-2">
                          <Label htmlFor="atrocity-type">Type of Atrocity / Offence *</Label>
                          <select
                            id="atrocity-type"
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            required
                          >
                            <option value="">Select type of atrocity</option>
                            <option value="inedible-substance">Putting inedible or dirty/obnoxious substance on a person (कसी व्यक्त को खाने योग्य नहीं या गंदा पदार्थ जबरदस्ती देना / लगाना)</option>
                            <option value="excreta-dumping">Throwing/dumping excreta, sewage, carcass on someone (किसी पर मल-मूत्र, गंदा पानी या पशु-मृत शरीर फेंकना)</option>
                            <option value="intentional-dumping">Dumping such substances intentionally to insult or annoy (अपमान या परेशान करने की नीयत से गंदगी डालना)</option>
                            <option value="footwear-garland">Garlanding with footwear, parading naked or half-naked (चप्पल की माला पहनाना, नग्न या अर्ध-नग्न घुमाना)</option>
                            <option value="forced-humiliation">Forcing to remove clothes, shave head, moustache or paint body (कपड़े उतरवाना, सिर/मूंछ जबरन मुंडवाना, शरीर पर रंग लगाना)</option>
                            <option value="land-occupation">Wrongful occupation or illegal cultivation on land (ज़मीन पर गैर-कानूनी कब्ज़ा या खेती करना)</option>
                            <option value="land-dispossession">Wrongful dispossession from land or interfering with forest rights (किसी को उसकी ज़मीन/जंगल के अधिकार से बेदखल करना)</option>
                            <option value="forced-labour">Forced labour / begar / bonded labour (बेगार करवाना, जबरन या बंधुआ मज़दूरी करवाना)</option>
                            <option value="forced-dead-body">Forcing to dispose or carry human/animal dead bodies (मानव/पशु शव उठाने या निपटाने के लिए मजबूर करना)</option>
                            <option value="manual-scavenging">Forcing to do manual scavenging or employing for it (जबरन मैला ढोना करवाना या इसके लिए नियुक्त करना)</option>
                            <option value="devadasi">Dedicating an SC/ST woman as a devadasi (किसी एससी/एसटी महिला को देवदासी बनाना)</option>
                            <option value="voting-prevention">Preventing from voting or filing nomination (मतदान या नामांकन करने से रोकना)</option>
                            <option value="panchayat-threat">Stopping or threatening a Panchayat/Municipal office holder (पंचायत/नगरपालिका अधिकारी को काम करने से रोकना या धमकाना)</option>
                            <option value="post-election-violence">Violence after elections or social/economic boycott (चुनाव के बाद हिंसा करना या सामाजिक/आर्थिक बहिष्कार करना)</option>
                            <option value="voting-retaliation">Committing any offence because a person voted/did not vote (किसी ने वोट दिया या नहीं दिया — इस कारण अपराध करना)</option>
                            <option value="false-cases">Filing false, malicious legal cases against SC/ST person (एससी/एसटी व्यक्ति पर झूठे या बदनीयत कानूनी मामले दर्ज करना)</option>
                            <option value="false-information">Giving false information to a public servant (सरकारी अधिकारी को झूठी/गलत जानकारी देना)</option>
                            <option value="public-insult">Intentional insult in public view (सार्वजनिक स्थान पर जानबूझकर अपमान करना)</option>
                            <option value="caste-abuse">Abusing by caste name in public (सार्वजनिक स्थान पर जाति-सूचक गाली देना)</option>
                            <option value="sacred-damage">Destroying/damaging sacred or respected objects (पवित्र या सम्मानित वस्तुओं को नुकसान पहुँचाना)</option>
                            <option value="caste-hatred">Promoting caste-hatred or enmity (जातीय नफरत या वैमनस्य फैलाना)</option>
                            <option value="dead-disrespect">Disrespecting respected dead person by words/acts (किसी दिवंगत सम्मानित व्यक्ति का अपमान करना)</option>
                            <option value="sexual-touching">Sexual touching/gesture without consent of SC/ST woman (एससी/एसटी महिला को बिना सहमति यौन रूप से छूना या संकेत करना)</option>
                            <option value="acid-attack">Throwing or attempt to throw acid (तेज़ाब फेंकना या फेंकने का प्रयास करना)</option>
                            <option value="outraging-modesty">Outraging modesty of woman (महिला की मर्यादा भंग करना)</option>
                            <option value="sexual-harassment">Sexual harassment (यौन उत्पीड़न)</option>
                            <option value="disrobe-intent">Intent to disrobe a woman (महिला के कपड़े उतारने की नीयत से हमला करना)</option>
                            <option value="voyeurism">Voyeurism (चोरी-छिपे देखना या वीडियो बनाना)</option>
                            <option value="stalking">Stalking (पीछा करना या परेशान करना)</option>
                            <option value="marital-rape-separation">Sexual intercourse by husband during separation (अलग रहने की अवधि में पति द्वारा जबरन शारीरिक संबंध बनाना)</option>
                            <option value="authority-abuse">Sexual intercourse by person in authority (अधिकार में बैठे व्यक्ति द्वारा यौन शोषण)</option>
                            <option value="modesty-insult">Insulting modesty of woman by word/gesture (महिला की मर्यादा का शब्द/इशारे से अपमान करना)</option>
                            <option value="water-contamination">Fouling or contaminating water (पानी को गंदा या दूषित करना)</option>
                            <option value="passage-denial">Denying right of passage to public place (सार्वजनिक मार्ग/रास्ते का उपयोग रोकना)</option>
                            <option value="forced-eviction">Forcing a person to leave house/village (किसी व्यक्ति को घर या गांव छोड़ने के लिए मजबूर करना)</option>
                            <option value="public-resource-denial">Preventing SC/ST person from using public resources (सार्वजनिक पानी, सड़क, मंदिर, वाहन, कपड़े आदि के उपयोग से रोकना)</option>
                            <option value="witch-torture">Physical/mental torture by calling woman "witch" (महिला को "डायन/चुड़ैल" कहकर शारीरिक/मानसिक यातना देना)</option>
                            <option value="social-boycott">Imposing or threatening social/economic boycott (सामाजिक या आर्थिक बहिष्कार करना/धमकाना)</option>
                            <option value="false-evidence">Giving or fabricating false evidence (झूठे साक्ष्य देना या तैयार करना)</option>
                            <option value="ipc-10-years">Committing IPC offences punishable with 10+ years (10 वर्ष या अधिक दंड वाली गंभीर IPC धाराओं का अपराध करना)</option>
                            <option value="poa-ipc-schedule">Offences under IPC Schedule of PoA Act (PoA अधिनियम सूची में शामिल IPC अपराध करना)</option>
                            <option value="public-servant-abuse">Victimization by a public servant (सरकारी कर्मचारी द्वारा प्रताड़ित करना)</option>
                            <option value="disability-caused">Disability caused due to offence (अपराध के कारण विकलांगता होना)</option>
                            <option value="rape-gang-rape">Rape / Gang-rape (बलात्कार / सामूहिक बलात्कार)</option>
                            <option value="murder-death">Murder or death (हत्या या मृत्यु होना)</option>
                            <option value="major-offence-relief">Additional relief for major offences (हत्या, बलात्कार जैसे गंभीर अपराधों पर अतिरिक्त सहायता)</option>
                            <option value="house-destruction">Complete destruction or burning of house (घर का जलना या पूरी तरह नष्ट होना)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="incident-description">Brief Description of Incident</Label>
                          <textarea
                            id="incident-description"
                            rows={4}
                            className="w-full px-3 py-2 rounded-md border border-input bg-background"
                            placeholder="Describe what happened in your own words."
                          />
                          <p className="text-xs text-muted-foreground">
                            Do not include sensitive personal details that you are uncomfortable sharing.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium">Location of Incident</h4>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="village">Village/Locality</Label>
                              <Input
                                id="village"
                                placeholder="Enter village or locality name"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="pincode">Pincode</Label>
                              <Input
                                id="pincode"
                                placeholder="Enter 6-digit pincode"
                                maxLength={6}
                              />
                            </div>
                          </div>

                        </div>

                        {/* Witness Details */}
                        <div className="border border-border rounded-lg p-4 space-y-4">
                          <h4 className="font-medium">Witness Details (Optional)</h4>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="witness-name">Witness Name</Label>
                              <Input
                                id="witness-name"
                                placeholder="Enter witness name"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="witness-contact">Witness Contact Number</Label>
                              <Input
                                id="witness-contact"
                                type="tel"
                                placeholder="+91 XXXXX XXXXX"
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="link"
                            className="text-accent p-0"
                            onClick={() => {
                              console.log('Add another witness clicked');
                              toast({
                                title: "Feature Notice",
                                description: "Multiple witness support will be available soon.",
                              });
                            }}
                          >
                            + Add another witness
                          </Button>
                        </div>
                      </div>

                      {/* Bank & Payment Details */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-accent" />
                          Bank & Payment Details (For Direct Benefit Transfer)
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="account-holder-name">Account Holder Name *</Label>
                            <Input
                              id="account-holder-name"
                              placeholder="Enter account holder name"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bank-name">Bank Name</Label>
                            <Input
                              id="bank-name"
                              placeholder="Enter bank name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="account-number">Bank Account Number *</Label>
                            <Input
                              id="account-number"
                              placeholder="Enter bank account number"
                              required
                              value={accountNumber}
                              onChange={(e) => setAccountNumber(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirm-account-number">Confirm Account Number *</Label>
                            <Input
                              id="confirm-account-number"
                              placeholder="Re-enter bank account number"
                              required
                              value={confirmAccountNumber}
                              onChange={(e) => setConfirmAccountNumber(e.target.value)}
                              className={!accountNumbersMatch() ? "border-red-500" : ""}
                            />
                            {!accountNumbersMatch() && (
                              <p className="text-xs text-red-500">
                                Account numbers do not match
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ifsc-code">IFSC Code *</Label>
                            <Input
                              id="ifsc-code"
                              placeholder="Enter IFSC code"
                              required
                              className="uppercase"
                              onChange={(e) => {
                                e.target.value = e.target.value.toUpperCase();
                              }}
                            />
                          </div>
                        </div>

                        <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4 flex gap-3">
                          <Wallet className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="text-muted-foreground">
                              Your bank details are used only for Direct Benefit Transfer (DBT) of approved relief amounts.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Document Upload */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Upload className="h-5 w-5 text-accent" />
                          Document Upload
                        </h3>

                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="font-medium mb-2">Upload via DigiLocker</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              Securely fetch documents from your DigiLocker account
                            </p>
                            <Button type="button" variant="outline" className="mb-2">
                              <Lock className="mr-2 h-4 w-4" />
                              Connect DigiLocker
                            </Button>
                            <p className="text-xs text-muted-foreground">or</p>
                          </div>

                          <div className="space-y-3">
                            <FileUpload
                              id="fir-copy"
                              label="FIR Copy*"
                              helperText="PDF, JPG (Max 5MB) - Document will be verified"
                              onFileChange={setFirFile}
                              expectedDocumentType="fir"
                              required
                            />

                            <FileUpload
                              id="medical-report"
                              label="Medical Report (if applicable)"
                              helperText="PDF, JPG (Max 5MB) - Document will be verified"
                              onFileChange={setMedicalFile}
                              expectedDocumentType="medical"
                            />

                            <FileUpload
                              id="other-docs"
                              label="Other Supporting Documents"
                              helperText="PDF, JPG (Max 5MB each)"
                              onFileChange={setOtherDocsFile}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Emergency Support Needs */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="emergency-support"
                            className="h-4 w-4 rounded border-input"
                            checked={needsEmergencySupport}
                            onChange={(e) => setNeedsEmergencySupport(e.target.checked)}
                          />
                          <Label htmlFor="emergency-support" className="font-semibold cursor-pointer">
                            I need immediate emergency support
                          </Label>
                        </div>

                        {needsEmergencySupport && (
                          <div className="ml-7 space-y-2 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                            <p className="text-sm font-medium mb-3">Select support needed:</p>
                            <div className="grid md:grid-cols-2 gap-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-input"
                                  checked={emergencySupports.medical}
                                  onChange={(e) =>
                                    setEmergencySupports({ ...emergencySupports, medical: e.target.checked })
                                  }
                                />
                                <span className="text-sm">Medical assistance</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-input"
                                  checked={emergencySupports.shelter}
                                  onChange={(e) =>
                                    setEmergencySupports({ ...emergencySupports, shelter: e.target.checked })
                                  }
                                />
                                <span className="text-sm">Temporary shelter</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-input"
                                  checked={emergencySupports.police}
                                  onChange={(e) =>
                                    setEmergencySupports({ ...emergencySupports, police: e.target.checked })
                                  }
                                />
                                <span className="text-sm">Police protection</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-input"
                                  checked={emergencySupports.counselling}
                                  onChange={(e) =>
                                    setEmergencySupports({ ...emergencySupports, counselling: e.target.checked })
                                  }
                                />
                                <span className="text-sm">Psychological counselling</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer md:col-span-2">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-input"
                                  checked={emergencySupports.foodTravel}
                                  onChange={(e) =>
                                    setEmergencySupports({ ...emergencySupports, foodTravel: e.target.checked })
                                  }
                                />
                                <span className="text-sm">Food and travel support</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Privacy Notice */}
                      <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 flex gap-3">
                        <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium mb-1">Your Privacy is Protected</p>
                          <p className="text-muted-foreground">
                            All data is encrypted end-to-end. You will be identified by a unique Case ID,
                            not your name. Your personal details are visible only to authorized officers
                            handling your case.
                          </p>
                        </div>
                      </div>

                      <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent-hover">
                        Review Application
                      </Button>
                    </form>

                    {/* Review Modal */}
                    {showReviewModal && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                          <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold">Review Your Details</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                              Please verify all information before submitting
                            </p>
                          </div>

                          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                            {/* Personal Information Summary */}
                            <div>
                              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Fingerprint className="h-5 w-5 text-accent" />
                                Personal Information
                              </h3>
                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Aadhaar Number</p>
                                  <p className="font-medium">{formData.aadhaarNumber || "Not provided"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Mobile Number</p>
                                  <p className="font-medium">{formData.mobileNumber || "Not provided"}</p>
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-muted-foreground">Email Address</p>
                                  <p className="font-medium">{formData.email || "Not provided"}</p>
                                </div>
                              </div>
                            </div>

                            {/* Case Details Summary */}
                            <div className="border-t pt-4">
                              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-accent" />
                                Case Details
                              </h3>
                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">FIR Case Number</p>
                                  <p className="font-medium">{formData.firCaseNumber || "Not provided"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Police Station</p>
                                  <p className="font-medium">{formData.policeStation || "Not provided"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">District</p>
                                  <p className="font-medium">{formData.district || "Not specified"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">State</p>
                                  <p className="font-medium">{formData.state || "Not specified"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Date of Incident</p>
                                  <p className="font-medium">{formData.dateOfIncident || "Not specified"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Date of FIR Registration</p>
                                  <p className="font-medium">{formData.dateOfFirRegistration || "Not specified"}</p>
                                </div>
                              </div>
                            </div>

                            {/* Caste & Identity */}
                            <div className="border-t pt-4">
                              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-accent" />
                                Caste & Identity Verification
                              </h3>
                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Caste Category</p>
                                  <p className="font-medium">SC/ST</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Certificate Number</p>
                                  <p className="font-medium">CERT-XXXX-XXXX</p>
                                </div>
                              </div>
                            </div>

                            {/* Incident Details */}
                            <div className="border-t pt-4">
                              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-accent" />
                                Incident Details
                              </h3>
                              <div className="space-y-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Type of Atrocity</p>
                                  <p className="font-medium">Physical assault</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Location</p>
                                  <p className="font-medium">Village/Locality, Pincode</p>
                                </div>
                              </div>
                            </div>

                            {/* Bank Details */}
                            <div className="border-t pt-4">
                              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-accent" />
                                Bank Details
                              </h3>
                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Account Holder Name</p>
                                  <p className="font-medium">{formData.accountHolderName || "Not provided"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Bank Name</p>
                                  <p className="font-medium">{formData.bankName || "Not provided"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Account Number</p>
                                  <p className="font-medium">
                                    {formData.accountNumber ? `XXXXXXX${formData.accountNumber.slice(-4)}` : "Not provided"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">IFSC Code</p>
                                  <p className="font-medium">{formData.ifscCode || "Not provided"}</p>
                                </div>
                              </div>
                            </div>

                            {/* Emergency Support */}
                            {needsEmergencySupport && (
                              <div className="border-t pt-4">
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                  <Clock className="h-5 w-5 text-accent" />
                                  Emergency Support Requested
                                </h3>
                                <div className="space-y-1 text-sm">
                                  {emergencySupports.medical && <p>• Medical assistance</p>}
                                  {emergencySupports.shelter && <p>• Temporary shelter</p>}
                                  {emergencySupports.police && <p>• Police protection</p>}
                                  {emergencySupports.counselling && <p>• Psychological counselling</p>}
                                  {emergencySupports.foodTravel && <p>• Food and travel support</p>}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="p-6 border-t flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => setShowReviewModal(false)}
                              disabled={isSubmitting}
                            >
                              Edit Details
                            </Button>
                            <Button
                              type="button"
                              className="flex-1 bg-accent hover:bg-accent-hover"
                              onClick={handleConfirmSubmit}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Submitting..." : "Confirm & Submit"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    {submissionSuccess && caseId && (
                      <div className="space-y-6 mt-8">
                        {/* Success Card */}
                        <Card className="p-6 bg-green-50 border-green-200">
                          <div className="flex items-start gap-4">
                            <CheckCircle2 className="h-12 w-12 text-green-600 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-green-900 mb-2">
                                Application Submitted Successfully! ✓
                              </h3>
                              <div className="space-y-2">
                                <p className="text-green-800">
                                  Your case has been registered in the NyayaSetu system and all documents have been uploaded.
                                </p>
                                <div className="bg-white rounded-lg p-4 border border-green-300">
                                  <p className="text-sm text-muted-foreground mb-1">Your Case ID:</p>
                                  <p className="text-2xl font-bold text-green-900">{caseId}</p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Save this Case ID for tracking your application status
                                  </p>
                                </div>
                                <p className="text-sm text-green-800 mt-3">
                                  📧 A confirmation email has been sent to your registered email address with your case details.
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Intercaste Marriage Tab */}
              <TabsContent value="intercaste" className="space-y-6">
                <Card className="p-6 md:p-8">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Intercaste Marriage Relief Application</h2>
                      <p className="text-muted-foreground">
                        Apply for relief under Intercaste Marriage Scheme. All information is encrypted and handled with strict confidentiality.
                      </p>
                    </div>

                    {!intercasteSuccess ? (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target;
                        const updatedData = {
                          husbandName: form['husband-name'].value,
                          husbandAadhaar: form['husband-aadhaar'].value,
                          husbandMobile: form['husband-mobile'].value,
                          husbandEmail: form['husband-email']?.value || "",
                          wifeName: form['wife-name'].value,
                          wifeAadhaar: form['wife-aadhaar'].value,
                          wifeMobile: form['wife-mobile'].value,
                          wifeEmail: form['wife-email']?.value || "",
                          currentAddress: form['current-address'].value,
                          district: form['im-district'].value,
                          state: form['im-state'].value,
                          pincode: form['im-pincode'].value,
                          scstSpouse: form['scst-spouse'].value,
                          accountHolderName: form['im-account-holder'].value,
                          bankName: form['im-bank-name']?.value || "",
                          accountNumber: form['im-account-number'].value,
                          ifscCode: form['im-ifsc-code'].value
                        };
                        setIntercasteFormData(updatedData);
                        setShowIntercasteReviewModal(true);
                      }} className="space-y-6">

                        {/* Husband's Details */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Users className="h-5 w-5 text-accent" />
                            Husband's Details
                          </h3>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="husband-name">Full Name *</Label>
                              <Input
                                id="husband-name"
                                placeholder="Enter husband's full name"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="husband-aadhaar">Aadhaar Number *</Label>
                              <Input
                                id="husband-aadhaar"
                                placeholder="XXXX-XXXX-XXXX"
                                required
                                maxLength={14}
                              />
                              <p className="text-xs text-muted-foreground">
                                Used only for verification
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="husband-mobile">Mobile Number *</Label>
                              <Input
                                id="husband-mobile"
                                type="tel"
                                placeholder="+91 XXXXX XXXXX"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="husband-email">Email (Optional)</Label>
                              <Input
                                id="husband-email"
                                type="email"
                                placeholder="husband@example.com"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Wife's Details */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Users className="h-5 w-5 text-accent" />
                            Wife's Details
                          </h3>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="wife-name">Full Name *</Label>
                              <Input
                                id="wife-name"
                                placeholder="Enter wife's full name"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="wife-aadhaar">Aadhaar Number *</Label>
                              <Input
                                id="wife-aadhaar"
                                placeholder="XXXX-XXXX-XXXX"
                                required
                                maxLength={14}
                              />
                              <p className="text-xs text-muted-foreground">
                                Used only for verification
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="wife-mobile">Mobile Number *</Label>
                              <Input
                                id="wife-mobile"
                                type="tel"
                                placeholder="+91 XXXXX XXXXX"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="wife-email">Email (Optional)</Label>
                              <Input
                                id="wife-email"
                                type="email"
                                placeholder="wife@example.com"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Address Details */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Home className="h-5 w-5 text-accent" />
                            Address Details
                          </h3>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="current-address">Current Address *</Label>
                              <textarea
                                id="current-address"
                                rows={3}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                                placeholder="Enter complete current address"
                                required
                              />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="im-district">District *</Label>
                                <Input
                                  id="im-district"
                                  placeholder="Your District"
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="im-state">State *</Label>
                                <select
                                  id="im-state"
                                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                  required
                                >
                                  <option value="">Select State</option>
                                  <option value="andhra-pradesh">Andhra Pradesh</option>
                                  <option value="bihar">Bihar</option>
                                  <option value="delhi">Delhi</option>
                                  <option value="gujarat">Gujarat</option>
                                  <option value="maharashtra">Maharashtra</option>
                                  <option value="tamil-nadu">Tamil Nadu</option>
                                  <option value="uttar-pradesh">Uttar Pradesh</option>
                                  <option value="karnataka">Karnataka</option>
                                  <option value="kerala">Kerala</option>
                                  <option value="madhya-pradesh">Madhya Pradesh</option>
                                  <option value="rajasthan">Rajasthan</option>
                                  <option value="west-bengal">West Bengal</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="im-pincode">Pincode *</Label>
                                <Input
                                  id="im-pincode"
                                  placeholder="6-digit pincode"
                                  maxLength={6}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SC/ST Spouse Selection */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Shield className="h-5 w-5 text-accent" />
                            Caste Information
                          </h3>

                          <div className="space-y-2">
                            <Label htmlFor="scst-spouse">Who belongs to SC/ST category? *</Label>
                            <select
                              id="scst-spouse"
                              className="w-full h-10 px-3 rounded-md border border-input bg-background"
                              required
                            >
                              <option value="">Select</option>
                              <option value="husband">Husband</option>
                              <option value="wife">Wife</option>
                            </select>
                            <p className="text-xs text-muted-foreground">
                              One spouse must be from SC/ST category for eligibility
                            </p>
                          </div>
                        </div>

                        {/* Bank Details */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-accent" />
                            Bank Details (For Direct Benefit Transfer)
                          </h3>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="im-account-holder">Account Holder Name *</Label>
                              <Input
                                id="im-account-holder"
                                placeholder="Enter account holder name"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="im-bank-name">Bank Name</Label>
                              <Input
                                id="im-bank-name"
                                placeholder="Enter bank name"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="im-account-number">Bank Account Number *</Label>
                              <Input
                                id="im-account-number"
                                placeholder="Enter bank account number"
                                required
                                value={intercasteAccountNumber}
                                onChange={(e) => setIntercasteAccountNumber(e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="im-confirm-account">Confirm Account Number *</Label>
                              <Input
                                id="im-confirm-account"
                                placeholder="Re-enter account number"
                                required
                                value={intercasteConfirmAccountNumber}
                                onChange={(e) => setIntercasteConfirmAccountNumber(e.target.value)}
                                className={intercasteAccountNumber && intercasteConfirmAccountNumber && intercasteAccountNumber !== intercasteConfirmAccountNumber ? "border-red-500" : ""}
                              />
                              {intercasteAccountNumber && intercasteConfirmAccountNumber && intercasteAccountNumber !== intercasteConfirmAccountNumber && (
                                <p className="text-xs text-red-500">Account numbers do not match</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="im-ifsc-code">IFSC Code *</Label>
                              <Input
                                id="im-ifsc-code"
                                placeholder="Enter IFSC code"
                                required
                                className="uppercase"
                                onChange={(e) => {
                                  e.target.value = e.target.value.toUpperCase();
                                }}
                              />
                            </div>
                          </div>

                          <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4 flex gap-3">
                            <Wallet className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="text-muted-foreground">
                                Your bank details are used only for Direct Benefit Transfer (DBT) of approved relief amounts.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Document Upload */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Upload className="h-5 w-5 text-accent" />
                            Document Upload
                          </h3>

                          <div className="space-y-3">
                            <FileUpload
                              id="proof-of-address"
                              label="Proof of Address *"
                              helperText="Electric Bill / Water Bill / Property Tax Bill / Gas Connection Booking Receipt (PDF, JPG - Max 5MB) - Document will be verified"
                              onFileChange={setIntercasteElectricBillFile}
                              expectedDocumentType="addressProof"
                              required
                            />

                            <FileUpload
                              id="marriage-certificate"
                              label="Marriage Certificate *"
                              helperText="PDF, JPG (Max 5MB) - Document will be verified"
                              onFileChange={setIntercasteMarriageCertFile}
                              expectedDocumentType="marriageCertificate"
                              required
                            />

                            <FileUpload
                              id="scst-certificate"
                              label="SC/ST Caste Certificate (of SC/ST spouse) *"
                              helperText="PDF, JPG (Max 5MB) - Document will be verified"
                              onFileChange={setIntercasteScstCertFile}
                              expectedDocumentType="scstCertificate"
                              required
                            />

                            <FileUpload
                              id="other-caste-certificate"
                              label="Caste Certificate (of non-SC/ST spouse) *"
                              helperText="PDF, JPG (Max 5MB) - Document will be verified"
                              onFileChange={setIntercasteOtherCertFile}
                              expectedDocumentType="otherCasteCertificate"
                              required
                            />
                          </div>
                        </div>

                        {/* Privacy Notice */}
                        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 flex gap-3">
                          <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium mb-1">Your Privacy is Protected</p>
                            <p className="text-muted-foreground">
                              All data is encrypted end-to-end. You will be identified by a unique Case ID,
                              not your name. Your personal details are visible only to authorized officers.
                            </p>
                          </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent-hover">
                          Review Application
                        </Button>
                      </form>
                    ) : (
                      /* Success Message */
                      <div className="space-y-6">
                        <Card className="p-6 bg-green-50 border-green-200">
                          <div className="flex items-start gap-4">
                            <CheckCircle2 className="h-12 w-12 text-green-600 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-green-900 mb-2">
                                Application Submitted Successfully! ✓
                              </h3>
                              <div className="space-y-2">
                                <p className="text-green-800">
                                  Your intercaste marriage relief application has been registered.
                                </p>
                                <div className="bg-white rounded-lg p-4 border border-green-300">
                                  <p className="text-sm text-muted-foreground mb-1">Your Case ID:</p>
                                  <p className="text-2xl font-bold text-green-900">{intercasteCaseId}</p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Save this Case ID for tracking your application status
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* Review Modal */}
                    {showIntercasteReviewModal && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                          <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold">Review Your Details</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                              Please verify all information before submitting
                            </p>
                          </div>

                          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                            {/* Husband Details */}
                            <div>
                              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Users className="h-5 w-5 text-accent" />
                                Husband's Details
                              </h3>
                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Name</p>
                                  <p className="font-medium">{intercasteFormData.husbandName}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Aadhaar</p>
                                  <p className="font-medium">{intercasteFormData.husbandAadhaar}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Mobile</p>
                                  <p className="font-medium">{intercasteFormData.husbandMobile}</p>
                                </div>
                              </div>
                            </div>

                            {/* Wife Details */}
                            <div className="border-t pt-4">
                              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Users className="h-5 w-5 text-accent" />
                                Wife's Details
                              </h3>
                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Name</p>
                                  <p className="font-medium">{intercasteFormData.wifeName}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Aadhaar</p>
                                  <p className="font-medium">{intercasteFormData.wifeAadhaar}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Mobile</p>
                                  <p className="font-medium">{intercasteFormData.wifeMobile}</p>
                                </div>
                              </div>
                            </div>

                            {/* Address */}
                            <div className="border-t pt-4">
                              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Home className="h-5 w-5 text-accent" />
                                Address Details
                              </h3>
                              <div className="text-sm space-y-2">
                                <div>
                                  <p className="text-muted-foreground">Address</p>
                                  <p className="font-medium">{intercasteFormData.currentAddress}</p>
                                </div>
                                <div className="grid md:grid-cols-3 gap-3">
                                  <div>
                                    <p className="text-muted-foreground">District</p>
                                    <p className="font-medium">{intercasteFormData.district}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">State</p>
                                    <p className="font-medium">{intercasteFormData.state}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Pincode</p>
                                    <p className="font-medium">{intercasteFormData.pincode}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* SC/ST Info */}
                            <div className="border-t pt-4">
                              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-accent" />
                                Caste Information
                              </h3>
                              <div className="text-sm">
                                <p className="text-muted-foreground">SC/ST Spouse</p>
                                <p className="font-medium capitalize">{intercasteFormData.scstSpouse}</p>
                              </div>
                            </div>

                            {/* Bank Details */}
                            <div className="border-t pt-4">
                              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-accent" />
                                Bank Details
                              </h3>
                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Account Holder</p>
                                  <p className="font-medium">{intercasteFormData.accountHolderName}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Account Number</p>
                                  <p className="font-medium">{intercasteFormData.accountNumber}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">IFSC Code</p>
                                  <p className="font-medium">{intercasteFormData.ifscCode}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 border-t flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => setShowIntercasteReviewModal(false)}
                              disabled={intercasteSubmitting}
                            >
                              Edit Details
                            </Button>
                            <Button
                              type="button"
                              className="flex-1 bg-accent hover:bg-accent-hover"
                              onClick={async () => {
                                setIntercasteSubmitting(true);
                                try {
                                  // Call the Intercaste API
                                  const response = await intercasteAPI.create(intercasteFormData);

                                  if (response.success) {
                                    const grievanceId = response.data.grievanceId;
                                    const newCaseId = response.data.caseId;

                                    // Upload documents and track errors
                                    const uploadResults = [];
                                    const uploadErrors = [];

                                    // Address Proof upload
                                    if (intercasteElectricBillFile) {
                                      try {
                                        await documentAPI.upload(intercasteElectricBillFile, grievanceId, 'addressProof');
                                        uploadResults.push('Address Proof');
                                      } catch (err) {
                                        const errorMsg = err.response?.data?.message || 'Upload failed';
                                        uploadErrors.push(`Address Proof: ${errorMsg}`);
                                      }
                                    }

                                    // Marriage Certificate upload
                                    if (intercasteMarriageCertFile) {
                                      try {
                                        await documentAPI.upload(intercasteMarriageCertFile, grievanceId, 'marriageCertificate');
                                        uploadResults.push('Marriage Certificate');
                                      } catch (err) {
                                        const errorMsg = err.response?.data?.message || 'Upload failed';
                                        uploadErrors.push(`Marriage Certificate: ${errorMsg}`);
                                      }
                                    }

                                    // SC/ST Certificate upload
                                    if (intercasteScstCertFile) {
                                      try {
                                        await documentAPI.upload(intercasteScstCertFile, grievanceId, 'scstCertificate');
                                        uploadResults.push('SC/ST Certificate');
                                      } catch (err) {
                                        const errorMsg = err.response?.data?.message || 'Upload failed';
                                        uploadErrors.push(`SC/ST Certificate: ${errorMsg}`);
                                      }
                                    }

                                    // Other Caste Certificate upload
                                    if (intercasteOtherCertFile) {
                                      try {
                                        await documentAPI.upload(intercasteOtherCertFile, grievanceId, 'otherCasteCertificate');
                                        uploadResults.push('Non SC/ST Certificate');
                                      } catch (err) {
                                        const errorMsg = err.response?.data?.message || 'Upload failed';
                                        uploadErrors.push(`Non SC/ST Certificate: ${errorMsg}`);
                                      }
                                    }

                                    setIntercasteCaseId(newCaseId);
                                    setIntercasteSuccess(true);
                                    setShowIntercasteReviewModal(false);

                                    // Show success toast
                                    toast({
                                      title: "Application Submitted! ✓",
                                      description: `Case ID: ${newCaseId}. ${uploadResults.length} document(s) uploaded.`,
                                    });

                                    // Show errors for failed documents
                                    if (uploadErrors.length > 0) {
                                      uploadErrors.forEach((errorMsg, index) => {
                                        setTimeout(() => {
                                          toast({
                                            title: "Document Upload Failed",
                                            description: errorMsg,
                                            variant: "destructive"
                                          });
                                        }, (index + 1) * 500); // Stagger error toasts
                                      });
                                    }
                                  } else {
                                    throw new Error(response.message || 'Submission failed');
                                  }
                                } catch (error) {
                                  console.error('Intercaste submission error:', error);
                                  toast({
                                    title: "Submission Failed",
                                    description: error.response?.data?.message || error.message || "Please try again.",
                                    variant: "destructive"
                                  });
                                } finally {
                                  setIntercasteSubmitting(false);
                                }
                              }}
                              disabled={intercasteSubmitting}
                            >
                              {intercasteSubmitting ? "Submitting..." : "Confirm & Submit"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Track Status Tab */}
              <TabsContent value="track" className="space-y-6">
                <Card className="p-6 md:p-8">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Track Your Case Status</h2>
                      <p className="text-muted-foreground">
                        Enter your Case ID or Aadhaar number to view your application status
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Input
                        placeholder="Enter Case ID or Aadhaar"
                        className="flex-1"
                        value={trackCaseId}
                        onChange={(e) => setTrackCaseId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTrackCase()}
                      />
                      <Button
                        className="bg-primary hover:bg-primary-hover"
                        onClick={handleTrackCase}
                        disabled={trackLoading}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {trackLoading ? "Tracking..." : "Track"}
                      </Button>
                    </div>

                    {trackError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {trackError}
                      </div>
                    )}

                    {/* Status Display */}
                    <div className="space-y-6 pt-6">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Case ID</p>
                          <p className="font-bold text-lg">{trackedCase?.caseId || "DBT-2024-XX-XXXXX"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Applied On</p>
                          <p className="font-semibold">
                            {trackedCase?.submittedAt
                              ? new Date(trackedCase.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : "-- --- ----"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {caseStages.map((stage, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${stage.status === "completed"
                                  ? "bg-secondary text-white"
                                  : stage.status === "in-progress"
                                    ? "bg-accent text-white"
                                    : "bg-muted text-muted-foreground"
                                  }`}
                              >
                                {stage.status === "completed" ? (
                                  <CheckCircle2 className="h-5 w-5" />
                                ) : stage.status === "in-progress" ? (
                                  <Clock className="h-5 w-5" />
                                ) : (
                                  <AlertCircle className="h-5 w-5" />
                                )}
                              </div>
                              {index < caseStages.length - 1 && (
                                <div
                                  className={`w-0.5 h-12 ${stage.status === "completed"
                                    ? "bg-secondary"
                                    : "bg-muted"
                                    }`}
                                />
                              )}
                            </div>
                            <div className="flex-1 pb-8">
                              <p className="font-semibold">{stage.stage}</p>
                              <p className="text-sm text-muted-foreground">{stage.date}</p>
                              {stage.status === "in-progress" && (
                                <p className="text-sm text-accent mt-1">Currently processing...</p>
                              )}

                              {/* Officer Review - Status Message */}
                              {stage.stage === "Officer Review" && getQueryStatusMessage() && (
                                <p className={`text-sm mt-1 ${getQueryStatusMessage().color}`}>
                                  {getQueryStatusMessage().text}
                                </p>
                              )}

                              {/* Officer Queries & Clarifications - Show under Officer Review step */}
                              {stage.stage === "Officer Review" && (
                                <div className="mt-4 bg-muted/20 border border-muted rounded-lg p-4 space-y-4">
                                  <h4 className="font-semibold text-sm">Officer Queries & Clarifications</h4>

                                  {officerQueries.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                      No queries have been raised by the officer for this case.
                                    </p>
                                  ) : (
                                    <div className="space-y-3">
                                      {officerQueries.map((query) => (
                                        <div key={query.id} className="border border-muted rounded-lg p-3 bg-background space-y-2">
                                          <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 space-y-1">
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{query.type}</span>
                                                <span
                                                  className={`text-xs px-2 py-0.5 rounded-full ${query.status === "Action Required"
                                                    ? "bg-orange-100 text-orange-700"
                                                    : query.status === "Waiting for Officer Review"
                                                      ? "bg-blue-100 text-blue-700"
                                                      : "bg-green-100 text-green-700"
                                                    }`}
                                                >
                                                  {query.status}
                                                </span>
                                              </div>
                                              <p className="text-sm text-muted-foreground">{query.message}</p>
                                              <p className="text-xs text-muted-foreground">Raised on: {query.raisedOn}</p>
                                            </div>
                                            {query.status === "Action Required" && (
                                              <Button
                                                size="sm"
                                                onClick={() => handleRespondToQuery(query)}
                                                className="bg-primary hover:bg-primary-hover flex-shrink-0"
                                              >
                                                Respond / Upload
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Transaction Verification Card - Show under Victim Confirmation step */}
                              {stage.stage === "Victim Confirmation" && stage.status === "in-progress" && trackedDisbursements.length > 0 && (
                                <div className="mt-4 bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-4">
                                  <div>
                                    <p className="font-medium text-sm">Verify Your Disbursements</p>
                                    <p className="text-xs text-muted-foreground">
                                      Verify each transaction by entering the Transaction ID from your bank SMS.
                                    </p>
                                  </div>

                                  {trackedDisbursements.map((disbursement, idx) => (
                                    <div key={idx} className="border border-muted rounded-lg p-3 bg-background">
                                      <div className="flex items-center justify-between mb-2">
                                        <div>
                                          <span className="font-medium text-sm">
                                            Phase {idx + 1} ({disbursement.percentage}%)
                                          </span>
                                          {disbursement.amount && (
                                            <span className="text-sm text-muted-foreground ml-2">
                                              ₹{disbursement.amount?.toLocaleString()}
                                            </span>
                                          )}
                                        </div>
                                        {disbursement.victimVerified ? (
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                            ✓ Verified
                                          </span>
                                        ) : (
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                                            Pending
                                          </span>
                                        )}
                                      </div>

                                      {!disbursement.victimVerified && (
                                        verifyingIndex === idx ? (
                                          <div className="space-y-2">
                                            <Input
                                              placeholder="Enter Transaction ID from bank SMS"
                                              value={verifyTxnInput}
                                              onChange={(e) => setVerifyTxnInput(e.target.value)}
                                              className="text-sm"
                                            />
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                onClick={() => handleVerifyDisbursement(idx)}
                                                className="bg-primary hover:bg-primary-hover"
                                              >
                                                Verify
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                  setVerifyingIndex(-1);
                                                  setVerifyTxnInput("");
                                                }}
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setVerifyingIndex(idx)}
                                            className="w-full"
                                          >
                                            Enter Transaction ID
                                          </Button>
                                        )
                                      )}
                                    </div>
                                  ))}

                                  {/* Grievance option if money not received */}
                                  <div className="border-t pt-3">
                                    <p className="text-xs text-muted-foreground mb-2">
                                      Haven't received the money? You can raise a grievance.
                                    </p>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                      onClick={() => window.location.href = '/grievances'}
                                    >
                                      <AlertCircle className="mr-2 h-3 w-3" />
                                      Raise Grievance
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Success Message - Show when all verified */}
                              {stage.stage === "Victim Confirmation" && stage.status === "completed" && (
                                <div className="mt-4 bg-secondary/5 border border-secondary/20 rounded-lg p-4 space-y-2">
                                  <p className="text-sm font-medium text-secondary">
                                    ✅ All disbursements received and verified
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Thank you. Your case is now closed.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4">
                        <p className="font-medium text-secondary mb-2">Estimated Completion</p>
                        <p className="text-sm text-muted-foreground">
                          Your case is on track. Expected disbursement by: <strong>25 Jan 2024</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Emergency Relief Tab */}
              <TabsContent value="emergency" className="space-y-6">
                <Card className="p-6 md:p-8">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Emergency Relief Wallet</h2>
                      <p className="text-muted-foreground">
                        Apply for immediate partial disbursement if you're facing critical financial hardship
                      </p>
                    </div>

                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <Clock className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-lg mb-2">48-Hour Relief Promise</h3>
                          <p className="text-sm text-muted-foreground">
                            In critical situations, you can receive up to 30% of your sanctioned amount
                            within 48 hours after basic AI verification. This helps cover immediate needs
                            like medical expenses, temporary shelter, or legal assistance.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Eligibility Criteria</h3>
                      <ul className="space-y-2">
                        <li className="flex gap-3">
                          <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Valid FIR registered under PCR/PoA Acts</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Case registered within last 30 days</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Valid Aadhaar linked bank account</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">No previous emergency relief claimed for same case</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="emergency-case-id">Enter Your Case ID</Label>
                      <Input
                        id="emergency-case-id"
                        placeholder="DBT-2024-XX-XXXXX"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="emergency-reason">Reason for Emergency Relief</Label>
                      <textarea
                        id="emergency-reason"
                        rows={4}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background"
                        placeholder="Please describe your urgent need (e.g., medical emergency, temporary shelter, legal fees)"
                      />
                    </div>

                    <Button size="lg" className="w-full bg-accent hover:bg-accent-hover">
                      Apply for Emergency Relief
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Help & Support Section */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Need Help?</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center space-y-3">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Call Us</h3>
                <p className="text-sm text-muted-foreground">24/7 Helpline</p>
                <p className="font-bold text-primary">18002021989</p>
              </Card>

              <Card className="p-6 text-center space-y-3">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-sm text-muted-foreground">Response within 24 hours</p>
                <p className="font-bold text-primary">support@dbt.gov.in</p>
              </Card>

              <Card className="p-6 text-center space-y-3">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">FAQs</h3>
                <p className="text-sm text-muted-foreground">Quick answers</p>
                <Button
                  variant="link"
                  className="text-primary p-0 h-auto"
                  onClick={() => setIsVictimFaqOpen(true)}
                >
                  View FAQs
                </Button>
              </Card>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                asChild
                className="w-full max-w-4xl h-14 bg-white border-gray-300 text-[#1e3a8a] hover:bg-orange-500 hover:text-white hover:border-orange-500 rounded-lg transition-all"
              >
                <a href="/grievances" className="flex items-center justify-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  File a Grievance
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Offline Access */}
      <section className="py-12 bg-gradient-dashboard">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold">Don't Have Internet Access?</h2>
            <p className="text-muted-foreground">
              You can still apply for relief through alternative channels
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="p-6 space-y-3">
                <Phone className="h-8 w-8 mx-auto text-accent" />
                <h3 className="font-semibold">SMS Application</h3>
                <p className="text-sm text-muted-foreground">
                  Send SMS to <strong>9XXXX-XXXXX</strong> with format:
                  <br />
                  <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                    APPLY &lt;Aadhaar&gt; &lt;FIR&gt;
                  </code>
                </p>
              </Card>

              <Card className="p-6 space-y-3">
                <Phone className="h-8 w-8 mx-auto text-accent" />
                <h3 className="font-semibold">IVR System</h3>
                <p className="text-sm text-muted-foreground">
                  Call <strong>18002021989</strong>
                  <br />
                  Follow voice instructions in your language
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Respond to Officer Query Modal */}
      {showResponseModal && selectedQuery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseResponseModal}>
          <div
            className="bg-background rounded-lg shadow-xl max-w-xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Respond to Officer Query</h2>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Read-only Query Details */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Case ID</p>
                  <p className="font-semibold">{trackedCase?.caseId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Query Type</p>
                  <p className="font-semibold">{selectedQuery.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Officer's Message</p>
                  <p className="text-sm">{selectedQuery.message}</p>
                </div>
              </div>

              {/* Conditional Response Input */}
              {selectedQuery.type?.toLowerCase().includes("missing") ? (
                <div className="space-y-4">
                  {/* File Upload Section */}
                  <div className="space-y-2">
                    <label htmlFor="response-file" className="text-sm font-medium">
                      Upload required document <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <Input
                      id="response-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleResponseFileChange}
                    />
                    <p className="text-xs text-muted-foreground">PDF/JPG/PNG, Max 5MB</p>
                    {responseFile && (
                      <p className="text-xs text-green-600">✓ {responseFile.name}</p>
                    )}
                  </div>

                  {/* Text Response Section */}
                  <div className="space-y-2">
                    <label htmlFor="response-text" className="text-sm font-medium">
                      Additional notes <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <textarea
                      id="response-text"
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      placeholder="Add any clarification or notes about the uploaded document."
                      value={responseText}
                      onChange={(e) => {
                        setResponseText(e.target.value);
                        setResponseError("");
                      }}
                    />
                  </div>

                  {responseError && (
                    <p className="text-xs text-red-500">{responseError}</p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Please upload a document OR provide a text response (at least one is required).
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="response-text" className="text-sm font-medium">
                    Your response <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="response-text"
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    placeholder="Write your clarification for the officer here."
                    value={responseText}
                    onChange={(e) => {
                      setResponseText(e.target.value);
                      setResponseError("");
                    }}
                  />
                  {responseError && (
                    <p className="text-xs text-red-500">{responseError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-muted/20 flex justify-end gap-3">
              <Button variant="ghost" onClick={handleCloseResponseModal}>
                Cancel
              </Button>
              <Button className="bg-primary hover:bg-primary-hover" onClick={handleSubmitResponse}>
                Submit Response
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Victim Support FAQs Modal */}
      <LegalPopCard
        isOpen={isVictimFaqOpen}
        onClose={() => setIsVictimFaqOpen(false)}
        title="Victim Support FAQs"
      >
        <VictimSupportFaqContent />
      </LegalPopCard>

      <Footer />
    </div>
  );
};

export default VictimPortal;
