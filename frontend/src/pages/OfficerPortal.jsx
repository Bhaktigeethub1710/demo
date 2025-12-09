import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { grievanceAPI, ticketAPI } from "@/services/api";
import DocumentViewer from "@/components/DocumentViewer";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  FileCheck,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  BarChart3,
  Users,
  IndianRupee,
  FileText,
  Brain,
  Verified,
  Upload,
  X,
  CreditCard,
  Ticket,
  Send,
} from "lucide-react";

const OfficerPortal = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // API Integration State
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, approved, rejected
  const [caseTypeFilter, setCaseTypeFilter] = useState("all"); // all, atrocity, intercaste
  const [error, setError] = useState("");

  // Raise Query Modal State
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryCase, setQueryCase] = useState(null);
  const [queryType, setQueryType] = useState("");
  const [queryMessage, setQueryMessage] = useState("");
  const [queryFile, setQueryFile] = useState(null);
  const [highPriority, setHighPriority] = useState(false);
  const [queryErrors, setQueryErrors] = useState({});

  // Transaction/Disbursement Modal State
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [disbursementCase, setDisbursementCase] = useState(null);
  const [transactionId1, setTransactionId1] = useState(""); // 25%
  const [transactionId2, setTransactionId2] = useState(""); // 25%
  const [transactionId3, setTransactionId3] = useState(""); // 50%
  const [transactionError, setTransactionError] = useState("");

  // Support Tickets State (new - API connected)
  const [supportTickets, setSupportTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSearchQuery, setTicketSearchQuery] = useState("");
  const [ticketResponse, setTicketResponse] = useState("");
  const [ticketResponseLoading, setTicketResponseLoading] = useState(false);

  // Fetch cases from API
  useEffect(() => {
    fetchCases();
  }, [statusFilter, caseTypeFilter]);

  const fetchCases = async () => {
    setLoading(true);
    setError("");
    try {
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (caseTypeFilter !== "all") filters.caseType = caseTypeFilter;
      const response = await grievanceAPI.getAll(filters);
      setCases(response.data || []);
    } catch (error) {
      console.error("Failed to fetch cases:", error);
      setError("Failed to load cases. Please try again.");
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter cases based on search query
  const filteredCases = cases.filter(caseItem => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const caseId = (caseItem.caseId || "").toLowerCase();
    const firNumber = (caseItem.firCaseNumber || "").toLowerCase();
    const district = (caseItem.district || "").toLowerCase();
    const state = (caseItem.state || "").toLowerCase();

    return caseId.includes(query) ||
      firNumber.includes(query) ||
      district.includes(query) ||
      state.includes(query);
  });

  // Export all cases to CSV
  const handleExport = async () => {
    try {
      // Fetch ALL cases (without filters)
      const response = await grievanceAPI.getAll({});
      const allCases = response.data || [];

      if (allCases.length === 0) {
        alert("No cases to export");
        return;
      }

      // Create CSV content
      const headers = ["Case ID", "FIR Number", "District", "State", "Status", "Submitted Date"];
      const csvRows = [headers.join(",")];

      allCases.forEach(caseItem => {
        const row = [
          caseItem.caseId || caseItem._id || "",
          caseItem.firCaseNumber || "",
          caseItem.district || "",
          caseItem.state || "",
          caseItem.status || "",
          caseItem.submittedAt ? new Date(caseItem.submittedAt).toLocaleDateString() : ""
        ];
        csvRows.push(row.join(","));
      });

      // Create blob and download
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cases_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`Exported ${allCases.length} cases`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export cases. Please try again.");
    }
  };

  // Officer Queries & Victim Responses State
  // Queries state - populated from real case data when View Details is clicked
  const [officerQueriesForCase, setOfficerQueriesForCase] = useState([]);

  // Grievances State
  const [grievances, setGrievances] = useState([
    {
      id: "GZ-2024-001",
      caseId: "JWD-2024-001",
      victimName: "Anita Devi",
      district: "Mumbai",
      state: "Maharashtra",
      contact: "+91-XXXXX-56789",
      category: "Didn't receive funds",
      status: "Open",
      createdOn: "2025-11-24",
      subject: "Relief amount not credited",
      description: "I was approved for relief on 20th Nov but the amount has not been credited to my bank account. My account details are correct as per the application. Please help.",
      attachments: ["passbook_photo.jpg"],
      timeline: [
        { by: "Victim", at: "2025-11-24 10:15", message: "I have not received the relief amount in my bank account even after 4 days of approval." },
        { by: "Officer", at: "2025-11-25 11:05", message: "We are checking your bank transaction status. Please wait 24 hours." }
      ]
    },
    {
      id: "GZ-2024-002",
      caseId: "JWD-2024-005",
      victimName: "Ramesh Kumar",
      district: "Delhi",
      state: "Delhi",
      contact: "+91-XXXXX-12345",
      category: "Case status not updated",
      status: "Under Review",
      createdOn: "2025-11-22",
      subject: "Portal showing wrong status",
      description: "My case was approved by the officer but the portal still shows 'Under Review'. This is causing confusion and delay in receiving funds.",
      attachments: [],
      timeline: [
        { by: "Victim", at: "2025-11-22 14:30", message: "My case status is not updated on the portal." },
        { by: "Officer", at: "2025-11-23 09:15", message: "Looking into the system sync issue." },
        { by: "Victim", at: "2025-11-23 16:45", message: "Still showing wrong status. Please fix urgently." }
      ]
    },
    {
      id: "GZ-2024-003",
      caseId: "JWD-2024-008",
      victimName: "Sunita Sharma",
      district: "Bangalore",
      state: "Karnataka",
      contact: "+91-XXXXX-98765",
      category: "Portal technical issue",
      status: "Resolved",
      createdOn: "2025-11-20",
      subject: "Cannot upload documents",
      description: "I am unable to upload my medical certificate. The upload button is not working on the portal.",
      attachments: ["error_screenshot.png"],
      timeline: [
        { by: "Victim", at: "2025-11-20 11:00", message: "Upload button not working for medical certificate." },
        { by: "Officer", at: "2025-11-20 14:30", message: "Please try clearing browser cache and using Chrome browser." },
        { by: "Victim", at: "2025-11-21 10:00", message: "It worked! Thank you for the help." }
      ]
    }
  ]);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [grievanceSearchQuery, setGrievanceSearchQuery] = useState("");
  const [officerResponse, setOfficerResponse] = useState("");
  const [responseProof, setResponseProof] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");
  const [responseError, setResponseError] = useState("");
  const timelineEndRef = useRef(null);

  // Auto-scroll to bottom of timeline when it updates
  useEffect(() => {
    if (showGrievanceModal && selectedGrievance?.timeline) {
      timelineEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedGrievance?.timeline, showGrievanceModal]);


  const mockCases = [
    {
      id: "CASE-2024-001",
      victimName: "Applicant A",
      aadhaar: "XXXX-XXXX-1234",
      district: "Mumbai",
      state: "Maharashtra",
      caseType: "Physical Assault",
      amount: "50,000",
      status: "pending_verification",
      aiScore: 94,
      submittedDate: "2024-03-15",
      priority: "high",
      firNumber: "FIR-123/2024",
      policeStation: "Andheri Police Station",
      firDate: "2024-01-16",
      incidentDate: "2024-01-15",
      sections: "IPC 323, 354; PoA 3(1)(r), 3(1)(s)",
      incidentDescription: "The victim was subjected to physical assault and caste-based abuse by a group of individuals in a public place. The incident occurred on January 15, 2024, and resulted in injuries requiring medical attention. The victim has submitted medical reports and witness statements as supporting evidence.",
      reliefCategory: "Category B – Physical Assault",
      bankMasked: "A/C ending 1234",
      ifsc: "SBIN0001234",
      bankName: "State Bank of India",
      documents: [
        { type: "FIR Copy", status: "verified" },
        { type: "Medical Report", status: "verified" },
        { type: "Caste Certificate", status: "verified" },
        { type: "Other Supporting Documents", status: "pending" },
      ],
    },
    {
      id: "CASE-2024-002",
      victimName: "Applicant B",
      aadhaar: "XXXX-XXXX-5678",
      district: "Delhi Central",
      state: "Delhi",
      caseType: "Economic Discrimination",
      amount: "35,000",
      status: "verified",
      aiScore: 88,
      submittedDate: "2024-03-14",
      priority: "medium",
      firNumber: "FIR-456/2024",
      policeStation: "Connaught Place Police Station",
      firDate: "2024-01-20",
      incidentDate: "2024-01-18",
      sections: "IPC 506; PoA 3(1)(w)",
      incidentDescription: "The victim faced economic discrimination and threats when denied services at a local establishment based on caste identity. Documentation includes witness statements and establishment records.",
      reliefCategory: "Category C – Economic Discrimination",
      bankMasked: "A/C ending 5678",
      ifsc: "HDFC0002345",
      bankName: "HDFC Bank",
      documents: [
        { type: "FIR Copy", status: "verified" },
        { type: "Medical Report", status: "not_applicable" },
        { type: "Caste Certificate", status: "verified" },
        { type: "Other Supporting Documents", status: "verified" },
      ],
    },
    {
      id: "CASE-2024-003",
      victimName: "Applicant C",
      aadhaar: "XXXX-XXXX-9012",
      district: "Bangalore Urban",
      state: "Karnataka",
      caseType: "Social Boycott",
      amount: "75,000",
      status: "query_raised",
      aiScore: 76,
      submittedDate: "2024-03-13",
      priority: "medium",
      firNumber: "FIR-789/2024",
      policeStation: "Whitefield Police Station",
      firDate: "2024-02-05",
      incidentDate: "2024-02-01",
      sections: "IPC 153A; PoA 3(1)(u)",
      incidentDescription: "The victim and family were subjected to social boycott by the village community, preventing access to common resources and public spaces. Multiple witnesses have corroborated the incident.",
      reliefCategory: "Category A – Social Boycott",
      bankMasked: "A/C ending 9012",
      ifsc: "ICIC0003456",
      bankName: "ICICI Bank",
      documents: [
        { type: "FIR Copy", status: "verified" },
        { type: "Medical Report", status: "not_applicable" },
        { type: "Caste Certificate", status: "verified" },
        { type: "Other Supporting Documents", status: "verified" },
      ],
    },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_verification: { label: "Pending Verification", variant: "outline" },
      verified: { label: "Verified", variant: "default" },
      query_raised: { label: "Query Raised", variant: "secondary" },
      approved: { label: "Approved", variant: "default" },
    };
    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { variant: "destructive" },
      medium: { variant: "secondary" },
      low: { variant: "default" },
    };
    return <Badge variant={config[priority]?.variant || "default"}>{priority.toUpperCase()}</Badge>;
  };

  // Event handlers for View Details modal
  const handleViewDetails = (caseItem) => {
    setSelectedCase(caseItem);
    // Load real queries from the case, not mock data
    if (caseItem.queries && caseItem.queries.length > 0) {
      setOfficerQueriesForCase(caseItem.queries.map((q, index) => ({
        id: index,
        type: q.queryType || q.type || "General Query",
        message: q.message || "",
        status: q.status === "resolved" ? "Resolved" : (q.response ? "Waiting for Officer Review" : "Action Required"),
        raisedOn: q.raisedAt ? new Date(q.raisedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A",
        response: q.response ? {
          type: q.responseFile ? "document" : "text",
          content: q.response,
          fileName: q.responseFile || null
        } : null,
        highPriority: q.highPriority || false
      })));
    } else {
      // No queries for this case
      setOfficerQueriesForCase([]);
    }
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedCase(null);
  };

  const handlePutOnHold = async () => {
    if (!selectedCase) return;

    console.log('handlePutOnHold - selectedCase._id:', selectedCase._id);
    console.log('handlePutOnHold - selectedCase:', selectedCase);

    try {
      await grievanceAPI.updateStatus(selectedCase._id, { status: 'on_hold' });
      toast({
        title: "Status Updated",
        description: `Case ${selectedCase.caseId} has been put on hold`,
      });
      setShowDetailsModal(false);
      fetchCases(); // Refresh the list
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to update case status",
        variant: "destructive"
      });
    }
  };

  const handleReject = async () => {
    if (!selectedCase) return;

    try {
      await grievanceAPI.updateStatus(selectedCase._id, { status: 'rejected' });
      toast({
        title: "Case Rejected",
        description: `Case ${selectedCase.caseId} has been rejected`,
      });
      setShowDetailsModal(false);
      fetchCases(); // Refresh the list
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to reject case",
        variant: "destructive"
      });
    }
  };

  const handleApprove = async () => {
    if (!selectedCase) return;

    try {
      await grievanceAPI.updateStatus(selectedCase._id, { status: 'approved' });
      toast({
        title: "Case Approved! ✓",
        description: `Case ${selectedCase.caseId} has been approved`,
      });
      setShowDetailsModal(false);
      fetchCases(); // Refresh the list
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to approve case",
        variant: "destructive"
      });
    }
  };

  // Event handlers for Transaction/Disbursement modal
  const handleOpenTransactionModal = (caseItem) => {
    setDisbursementCase(caseItem);
    setShowTransactionModal(true);
    setTransactionId1("");
    setTransactionId2("");
    setTransactionId3("");
    setTransactionError("");
  };

  const handleCloseTransactionModal = () => {
    setShowTransactionModal(false);
    setDisbursementCase(null);
    setTransactionId1("");
    setTransactionId2("");
    setTransactionId3("");
    setTransactionError("");
  };

  // Save single phase disbursement
  const handleSaveSingleDisbursement = async (phaseIndex, transactionId) => {
    if (!transactionId?.trim()) {
      setTransactionError(`Transaction ID for Phase ${phaseIndex + 1} is required.`);
      return;
    }

    try {
      const response = await grievanceAPI.saveDisbursements(disbursementCase?._id, {
        transactionId: transactionId.trim(),
        phase: phaseIndex,
        approvedAmount: disbursementCase?.approvedAmount
      });

      // Show success toast
      toast({
        title: response.message || "Disbursement Saved",
        description: `Phase ${phaseIndex + 1} transaction saved. Awaiting victim verification.`,
        variant: "default"
      });

      // Refresh cases list
      fetchCases();

      // Clear the input field
      if (phaseIndex === 0) setTransactionId1("");
      if (phaseIndex === 1) setTransactionId2("");
      if (phaseIndex === 2) setTransactionId3("");

      // Close modal after Phase 3
      if (phaseIndex === 2) {
        handleCloseTransactionModal();
      }
    } catch (err) {
      console.error('Error saving disbursement:', err);
      const errorMessage = err.response?.data?.message || "Failed to save disbursement. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      setTransactionError(errorMessage);
    }
  };


  // Event handlers for Raise Query modal
  const handleRaiseQuery = (caseItem) => {
    setQueryCase(caseItem);
    setShowQueryModal(true);
    // Reset form
    setQueryType("");
    setQueryMessage("");
    setQueryFile(null);
    setHighPriority(false);
    setQueryErrors({});
  };

  const handleCloseQueryModal = () => {
    setShowQueryModal(false);
    setQueryCase(null);
    setQueryType("");
    setQueryMessage("");
    setQueryFile(null);
    setHighPriority(false);
    setQueryErrors({});
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setQueryErrors({ ...queryErrors, file: "File size must be less than 5MB" });
        return;
      }
      setQueryFile(file);
      setQueryErrors({ ...queryErrors, file: "" });
    }
  };

  const handleSendQuery = async () => {
    const errors = {};

    // Validation
    if (!queryType) {
      errors.queryType = "Please select a query type";
    }
    if (!queryMessage.trim()) {
      errors.queryMessage = "Please enter your query message";
    }

    if (Object.keys(errors).length > 0) {
      setQueryErrors(errors);
      return;
    }

    try {
      await grievanceAPI.addQuery(queryCase?._id, {
        queryType,
        message: queryMessage,
        highPriority
      });

      // Close modal
      handleCloseQueryModal();

      // Show success toast
      toast({
        title: "Query Sent",
        description: "Your query has been sent to the applicant successfully.",
        variant: "default"
      });

      // Refresh cases list
      fetchCases();
    } catch (err) {
      console.error('Error sending query:', err);
      toast({
        title: "Error",
        description: "Failed to send query. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handler for marking query as resolved
  const handleMarkQueryResolved = (queryId) => {
    console.log("Marked as resolved (demo)", queryId);
    setOfficerQueriesForCase(queries =>
      queries.map(q =>
        q.id === queryId ? { ...q, status: "Resolved" } : q
      )
    );
  };

  // Grievances Event Handlers
  const handleViewGrievance = (grievance) => {
    setSelectedGrievance(grievance);
    setUpdatedStatus(grievance.status);
    setOfficerResponse("");
    setResponseProof(null);
    setResponseError("");
    setShowGrievanceModal(true);
  };

  const handleCloseGrievanceModal = () => {
    setShowGrievanceModal(false);
    setSelectedGrievance(null);
    setOfficerResponse("");
    setResponseProof(null);
    setUpdatedStatus("");
    setResponseError("");
  };

  const handleResponseFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setResponseError("File size must be less than 5MB");
        return;
      }
      setResponseProof(file);
      setResponseError("");
    }
  };

  const handleSubmitResponse = () => {
    // Validation
    if (!officerResponse.trim()) {
      setResponseError("Please enter a response message");
      return;
    }

    // Log to console (demo)
    console.log("Officer response submitted (demo)", {
      grievanceId: selectedGrievance.id,
      caseId: selectedGrievance.caseId,
      status: updatedStatus,
      message: officerResponse,
      hasProof: responseProof !== null,
      proofFileName: responseProof?.name || null
    });

    // Update grievance status in state
    setGrievances(prev => prev.map(g =>
      g.id === selectedGrievance.id
        ? { ...g, status: updatedStatus, timeline: [...g.timeline, { by: "Officer", at: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), message: officerResponse }] }
        : g
    ));

    // Show success message
    alert(`Response saved and grievance status updated to "${updatedStatus}" (demo).`);

    // Close modal
    handleCloseGrievanceModal();
  };

  // ========== SUPPORT TICKETS HANDLERS (API Connected) ==========

  const fetchSupportTickets = async () => {
    setTicketsLoading(true);
    try {
      const response = await ticketAPI.getAll();
      setSupportTickets(response.data || []);
    } catch (error) {
      console.error("Failed to fetch support tickets:", error);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive"
      });
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setTicketResponse("");
    setShowTicketModal(true);
  };

  const handleCloseTicketModal = () => {
    setShowTicketModal(false);
    setSelectedTicket(null);
    setTicketResponse("");
  };

  const handleSendTicketResponse = async () => {
    if (!ticketResponse.trim()) {
      toast({
        title: "Error",
        description: "Please enter a response message",
        variant: "destructive"
      });
      return;
    }

    setTicketResponseLoading(true);
    try {
      await ticketAPI.respond(selectedTicket._id, ticketResponse.trim());
      toast({
        title: "Response Sent",
        description: "Your response has been sent to the user",
      });
      // Refresh tickets and close modal
      fetchSupportTickets();
      handleCloseTicketModal();
    } catch (error) {
      console.error("Failed to send response:", error);
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTicketResponseLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      await ticketAPI.updateStatus(ticketId, newStatus);
      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${newStatus}`,
      });
      fetchSupportTickets();
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive"
      });
    }
  };

  const getTicketStatusBadge = (status) => {
    const statusConfig = {
      open: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Open" },
      under_review: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Under Review" },
      resolved: { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "Resolved" },
      closed: { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", label: "Closed" }
    };
    const config = statusConfig[status] || statusConfig.open;
    return <Badge className={`${config.color} border`}>{config.label}</Badge>;
  };

  const getCategoryLabel = (category) => {
    const categories = {
      delay: "Delay in Processing",
      verification: "Verification Issues",
      disbursement: "Disbursement Problems",
      technical: "Technical Support",
      document: "Document Related",
      other: "Other"
    };
    return categories[category] || category;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter support tickets based on search
  const filteredSupportTickets = supportTickets.filter(ticket => {
    if (!ticketSearchQuery.trim()) return true;
    const query = ticketSearchQuery.toLowerCase();
    return (
      (ticket.ticketId || "").toLowerCase().includes(query) ||
      (ticket.caseId || "").toLowerCase().includes(query) ||
      (ticket.subject || "").toLowerCase().includes(query) ||
      (ticket.userId?.name || "").toLowerCase().includes(query)
    );
  });


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section className="py-12 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Officer Dashboard</h1>
                <p className="text-xl text-muted-foreground">
                  Review, verify, and process relief applications with AI-powered insights
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Cases</p>
                      <p className="text-3xl font-bold">24</p>
                    </div>
                    <Clock className="h-10 w-10 text-muted-foreground opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Verified Today</p>
                      <p className="text-3xl font-bold">12</p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Funds Processed</p>
                      <p className="text-3xl font-bold">₹8.2L</p>
                    </div>
                    <IndianRupee className="h-10 w-10 text-green-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="cases" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="cases">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Case Review
                </TabsTrigger>
                <TabsTrigger value="disbursement">
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Fund Tracking
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="tickets" onClick={() => fetchSupportTickets()}>
                  <Ticket className="h-4 w-4 mr-2" />
                  Support Tickets
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cases">
                <Card>
                  <CardHeader>
                    <CardTitle>Submitted Cases - Review & Process</CardTitle>
                    <CardDescription>
                      Manage relief applications with intelligent prioritization and verification tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by Case ID, FIR Number, District, or State..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Button variant="outline" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    {/* Status Filter Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                      <Button
                        size="sm"
                        variant={statusFilter === "all" ? "default" : "outline"}
                        onClick={() => setStatusFilter("all")}
                      >
                        All Cases
                      </Button>
                      <Button
                        size="sm"
                        variant={statusFilter === "pending" ? "default" : "outline"}
                        onClick={() => setStatusFilter("pending")}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Pending
                      </Button>
                      <Button
                        size="sm"
                        variant={statusFilter === "under_review" ? "default" : "outline"}
                        onClick={() => setStatusFilter("under_review")}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Under Review
                      </Button>
                      <Button
                        size="sm"
                        variant={statusFilter === "approved" ? "default" : "outline"}
                        onClick={() => setStatusFilter("approved")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approved
                      </Button>
                      <Button
                        size="sm"
                        variant={statusFilter === "rejected" ? "default" : "outline"}
                        onClick={() => setStatusFilter("rejected")}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rejected
                      </Button>
                      <Button
                        size="sm"
                        variant={statusFilter === "disbursed" ? "default" : "outline"}
                        onClick={() => setStatusFilter("disbursed")}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Disbursed
                      </Button>
                      <Button
                        size="sm"
                        variant={statusFilter === "closed" ? "default" : "outline"}
                        onClick={() => setStatusFilter("closed")}
                      >
                        <Verified className="h-4 w-4 mr-2" />
                        Closed
                      </Button>
                    </div>

                    {/* Case Type Filter Tabs */}
                    <div className="flex gap-2 mb-6">
                      <span className="text-sm text-muted-foreground mr-2 self-center">Case Type:</span>
                      <Button
                        size="sm"
                        variant={caseTypeFilter === "all" ? "default" : "outline"}
                        onClick={() => setCaseTypeFilter("all")}
                      >
                        All
                      </Button>
                      <Button
                        size="sm"
                        variant={caseTypeFilter === "atrocity" ? "default" : "outline"}
                        onClick={() => setCaseTypeFilter("atrocity")}
                        className={caseTypeFilter === "atrocity" ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Atrocity
                      </Button>
                      <Button
                        size="sm"
                        variant={caseTypeFilter === "intercaste" ? "default" : "outline"}
                        onClick={() => setCaseTypeFilter("intercaste")}
                        className={caseTypeFilter === "intercaste" ? "bg-pink-600 hover:bg-pink-700" : ""}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Intercaste
                      </Button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading cases...</p>
                      </div>
                    )}

                    {/* Error State */}
                    {error && (
                      <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                        <p className="text-red-600">{error}</p>
                        <Button onClick={fetchCases} className="mt-4">Retry</Button>
                      </div>
                    )}

                    {/* Cases List - Scrollable Container */}
                    {!loading && !error && (
                      <div
                        className="space-y-4 overflow-y-auto pr-2"
                        style={{ maxHeight: "70vh" }}
                      >
                        {filteredCases.length === 0 ? (
                          <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <p className="text-muted-foreground">No cases found</p>
                          </div>
                        ) : (
                          filteredCases.map((caseItem) => (
                            <Card key={caseItem._id} className="border-l-4 border-l-primary">
                              <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="text-lg font-semibold">{caseItem.caseId || caseItem._id}</h3>
                                      <Badge variant="outline">{caseItem.status}</Badge>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <span>FIR: {caseItem.firCaseNumber}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        <span>{caseItem.district}, {caseItem.state}</span>
                                      </div>
                                      {caseItem.submittedAt && (
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          <span>Submitted: {new Date(caseItem.submittedAt).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2 min-w-[160px]">
                                    <Button size="sm" onClick={() => handleViewDetails(caseItem)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleRaiseQuery(caseItem)}>
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Raise Query
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleOpenTransactionModal(caseItem)}
                                      disabled={caseItem.status !== 'approved'}
                                      title={caseItem.status !== 'approved' ? 'Case must be approved first' : 'Enter transaction IDs'}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fund Tracking Tab */}
              <TabsContent value="disbursement">
                <Card>
                  <CardHeader>
                    <CardTitle>Fund Disbursal Progress Tracking</CardTitle>
                    <CardDescription>
                      Real-time coordination with financial institutions and DBT status monitoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-primary/10 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Sanctioned This Month</p>
                          <p className="text-2xl font-bold">₹24.5 Lakhs</p>
                        </div>
                        <div className="p-4 bg-green-500/10 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Disbursed Successfully</p>
                          <p className="text-2xl font-bold">₹18.2 Lakhs</p>
                        </div>
                        <div className="p-4 bg-yellow-500/10 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Pending Transfer</p>
                          <p className="text-2xl font-bold">₹6.3 Lakhs</p>
                        </div>
                      </div>

                      <div className="border rounded-lg p-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <IndianRupee className="h-5 w-5" />
                          Recent Fund Transfers
                        </h4>
                        <div className="space-y-3">
                          {[
                            { case: "CASE-2024-001", amount: "50,000", status: "Completed", bank: "State Bank of India" },
                            { case: "CASE-2024-005", amount: "35,000", status: "In Progress", bank: "Punjab National Bank" },
                            { case: "CASE-2024-012", amount: "75,000", status: "Pending", bank: "Bank of Baroda" },
                          ].map((transfer, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div>
                                <p className="font-medium">{transfer.case}</p>
                                <p className="text-sm text-muted-foreground">{transfer.bank}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">₹{transfer.amount}</p>
                                <Badge variant={transfer.status === "Completed" ? "default" : "outline"}>
                                  {transfer.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Card className="border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-base">Bank Coordination Interface</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Direct communication channel with financial institutions for sanction confirmation and ledger reconciliation.
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send to Bank
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <FileCheck className="h-4 w-4 mr-2" />
                              Request Confirmation
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Data-Driven Insights</CardTitle>
                      <CardDescription>Performance metrics and trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Average Processing Time</p>
                          <p className="text-3xl font-bold">36 hours</p>
                          <p className="text-sm text-green-600 mt-1">↓ 22% from last month</p>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Approval Rate</p>
                          <p className="text-3xl font-bold">87%</p>
                          <p className="text-sm text-green-600 mt-1">↑ 5% improvement</p>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Query Resolution Time</p>
                          <p className="text-3xl font-bold">12 hours</p>
                          <p className="text-sm text-green-600 mt-1">Within target SLA</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Case Prioritization Matrix</CardTitle>
                      <CardDescription>AI-powered priority scoring</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 border-l-4 border-l-red-500 bg-red-500/5 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">Critical Priority</span>
                            <Badge variant="destructive">5 Cases</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Serious injury cases, vulnerable victims, time-sensitive
                          </p>
                        </div>

                        <div className="p-3 border-l-4 border-l-yellow-500 bg-yellow-500/5 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">High Priority</span>
                            <Badge variant="secondary">12 Cases</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Complete documentation, awaiting final verification
                          </p>
                        </div>

                        <div className="p-3 border-l-4 border-l-blue-500 bg-blue-500/5 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">Medium Priority</span>
                            <Badge variant="outline">18 Cases</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Standard processing queue, documents under review
                          </p>
                        </div>

                        <div className="p-3 border-l-4 border-l-gray-500 bg-gray-500/5 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">Low Priority</span>
                            <Badge variant="outline">7 Cases</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Awaiting additional documents from applicants
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>District-wise Performance</CardTitle>
                    <CardDescription>Compare processing efficiency across regions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { district: "Mumbai", processed: 45, pending: 8, efficiency: 85 },
                        { district: "Pune", processed: 38, pending: 12, efficiency: 76 },
                        { district: "Nagpur", processed: 29, pending: 6, efficiency: 83 },
                        { district: "Thane", processed: 52, pending: 15, efficiency: 78 },
                      ].map((dist, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{dist.district}</span>
                            <span className="text-sm text-muted-foreground">
                              {dist.processed} processed | {dist.pending} pending
                            </span>
                          </div>
                          <Progress value={dist.efficiency} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Support Tickets Tab Content */}
              <TabsContent value="tickets">
                <Card>
                  <CardHeader>
                    <CardTitle>Support Tickets – Review & Respond</CardTitle>
                    <CardDescription>
                      Manage complaints and support requests submitted by victims
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by Ticket ID, Case ID, or Subject..."
                          className="pl-10"
                          value={ticketSearchQuery}
                          onChange={(e) => setTicketSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button variant="outline" onClick={fetchSupportTickets}>
                        Refresh
                      </Button>
                    </div>

                    {ticketsLoading ? (
                      <div className="text-center py-12 text-muted-foreground">
                        Loading tickets...
                      </div>
                    ) : filteredSupportTickets.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No support tickets found</p>
                        <p className="text-sm">Click "Refresh" to load tickets</p>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                              <th className="p-4">Ticket ID</th>
                              <th className="p-4">Case ID</th>
                              <th className="p-4">Submitted By</th>
                              <th className="p-4">Category</th>
                              <th className="p-4">Subject</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Created</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSupportTickets.map((ticket) => (
                              <tr key={ticket._id} className="border-t hover:bg-muted/50">
                                <td className="p-4 font-medium text-accent">{ticket.ticketId}</td>
                                <td className="p-4 text-muted-foreground">{ticket.caseId}</td>
                                <td className="p-4">{ticket.userId?.name || "Unknown"}</td>
                                <td className="p-4">
                                  <Badge variant="outline" className="font-normal">
                                    {getCategoryLabel(ticket.category)}
                                  </Badge>
                                </td>
                                <td className="p-4 max-w-[200px] truncate">{ticket.subject}</td>
                                <td className="p-4">{getTicketStatusBadge(ticket.status)}</td>
                                <td className="p-4 text-muted-foreground">{formatDate(ticket.createdAt)}</td>
                                <td className="p-4 text-right">
                                  <Button size="sm" variant="outline" onClick={() => handleViewTicket(ticket)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Help Section */}
      </main>

      {/* View Details Modal */}
      {showDetailsModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-background border-b p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Eye className="h-6 w-6 text-primary" />
                  Case Details: {selectedCase.caseId || selectedCase._id}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  FIR: {selectedCase.firCaseNumber || "N/A"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: "calc(90vh - 200px)" }}>
              {/* Case Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Case Information
                  {selectedCase.caseType === 'intercaste' && (
                    <Badge className="bg-pink-500/20 text-pink-500 border border-pink-500/30 ml-2">
                      Intercaste Marriage
                    </Badge>
                  )}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">District</p>
                    <p className="font-medium">{selectedCase.district || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">State</p>
                    <p className="font-medium">{selectedCase.state || "N/A"}</p>
                  </div>
                  {selectedCase.caseType !== 'intercaste' && (
                    <div>
                      <p className="text-muted-foreground">Police Station</p>
                      <p className="font-medium">{selectedCase.policeStation || "N/A"}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{selectedCase.status || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted Date</p>
                    <p className="font-medium">
                      {selectedCase.submittedAt
                        ? new Date(selectedCase.submittedAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information - Conditional based on caseType */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {selectedCase.caseType === 'intercaste' ? 'Applicant Details' : 'Personal Information'}
                </h3>

                {selectedCase.caseType === 'intercaste' ? (
                  /* Intercaste Marriage - Husband & Wife Details */
                  <div className="space-y-4">
                    {/* Husband's Details */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-3">Husband's Details</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Full Name</p>
                          <p className="font-medium">{selectedCase.husbandName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Aadhaar Number</p>
                          <p className="font-medium font-mono">{selectedCase.husbandAadhaar || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Mobile Number</p>
                          <p className="font-medium">{selectedCase.husbandMobile || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedCase.husbandEmail || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Wife's Details */}
                    <div className="bg-pink-50 dark:bg-pink-950/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
                      <h4 className="font-medium text-pink-700 dark:text-pink-400 mb-3">Wife's Details</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Full Name</p>
                          <p className="font-medium">{selectedCase.wifeName || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Aadhaar Number</p>
                          <p className="font-medium font-mono">{selectedCase.wifeAadhaar || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Mobile Number</p>
                          <p className="font-medium">{selectedCase.wifeMobile || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedCase.wifeEmail || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* SC/ST Spouse */}
                    <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-sm">
                        <p className="text-muted-foreground">SC/ST Spouse</p>
                        <p className="font-medium capitalize">{selectedCase.scstSpouse || "N/A"}</p>
                      </div>
                    </div>

                    {/* Current Address */}
                    {selectedCase.currentAddress && (
                      <div className="mt-4">
                        <p className="text-muted-foreground text-sm mb-2">Current Address</p>
                        <div className="bg-muted/30 rounded-lg p-4">
                          <p className="text-sm whitespace-pre-wrap">{selectedCase.currentAddress}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Atrocity Cases - Normal Personal Info */
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Aadhaar Number</p>
                      <p className="font-medium">{selectedCase.aadhaarNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mobile Number</p>
                      <p className="font-medium">{selectedCase.mobileNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedCase.email || "N/A"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Incident Details - Only for Atrocity cases */}
              {selectedCase.caseType !== 'intercaste' && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Incident Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type of Atrocity</p>
                      <p className="font-medium">{selectedCase.typeOfAtrocity || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date of Incident</p>
                      <p className="font-medium">
                        {selectedCase.dateOfIncident
                          ? new Date(selectedCase.dateOfIncident).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date of FIR Registration</p>
                      <p className="font-medium">
                        {selectedCase.dateOfFirRegistration
                          ? new Date(selectedCase.dateOfFirRegistration).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  {selectedCase.incidentDescription && (
                    <div className="mt-4">
                      <p className="text-muted-foreground text-sm mb-2">Incident Description</p>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <p className="text-sm whitespace-pre-wrap">{selectedCase.incidentDescription}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bank Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Bank Details for Disbursement
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div>
                    <p className="text-muted-foreground">Account Holder Name</p>
                    <p className="font-semibold">{selectedCase.accountHolderName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Account Number</p>
                    <p className="font-semibold font-mono">{selectedCase.accountNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">IFSC Code</p>
                    <p className="font-semibold font-mono">{selectedCase.ifscCode || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bank Name</p>
                    <p className="font-semibold">{selectedCase.bankName || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Submitted Documents */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Submitted Documents
                </h3>
                <DocumentViewer grievanceId={selectedCase._id} />
              </div>

              {/* Officer Queries & Victim Responses */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Officer Queries & Victim Responses
                </h3>

                {/* Query Summary */}
                <div className="mb-4">
                  {officerQueriesForCase.length === 0 ? (
                    <p className="text-sm font-medium text-muted-foreground">
                      No queries have been raised for this case.
                    </p>
                  ) : officerQueriesForCase.filter(q => q.status !== "Resolved").length > 0 ? (
                    <p className="text-sm font-medium text-orange-600">
                      Queries pending: {officerQueriesForCase.filter(q => q.status !== "Resolved").length}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-green-600">
                      All queries have been resolved
                    </p>
                  )}
                </div>

                {/* Queries List */}
                <div className="space-y-4">
                  {officerQueriesForCase.length > 0 && officerQueriesForCase.map((query) => (
                    <div key={query.id} className="border rounded-lg p-4 bg-muted/20 space-y-3">
                      {/* Query Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-sm">{query.type}</span>
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
                          <p className="text-xs text-muted-foreground">Raised on: {query.raisedOn}</p>
                        </div>
                        {query.status === "Waiting for Officer Review" && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkQueryResolved(query.id)}
                            className="bg-primary hover:bg-primary-hover"
                          >
                            Mark as Resolved
                          </Button>
                        )}
                      </div>

                      {/* Officer's Message */}
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">Officer's Message:</p>
                        <p className="text-sm">{query.message}</p>
                      </div>

                      {/* Victim Response */}
                      {query.response && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">Victim Response:</p>
                          {query.response.type === "document" ? (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{query.response.fileName}</span>
                              <Button
                                size="sm"
                                variant="link"
                                className="h-auto p-0 text-primary"
                                onClick={() => console.log("View document:", query.response.fileName)}
                              >
                                View
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm bg-background rounded p-2">{query.response.content}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>


            </div>

            {/* Modal Footer - Action Buttons */}
            <div className="p-6 border-t bg-muted/20 flex justify-end gap-3">
              <Button variant="secondary" onClick={handlePutOnHold}>
                <Clock className="h-4 w-4 mr-2" />
                Put On Hold
              </Button>
              <Button variant="outline" onClick={handleReject}>
                <AlertCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button className="bg-primary hover:bg-primary-hover" onClick={handleApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Raise Query Modal */}
      {showQueryModal && queryCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseQueryModal}>
          <div
            className="bg-background rounded-lg shadow-xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold mb-2">Raise Query for This Case</h2>
              <p className="text-sm text-muted-foreground">
                Case ID: <span className="font-semibold">{queryCase.id}</span>
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Query Type */}
              <div className="space-y-2">
                <label htmlFor="query-type" className="text-sm font-medium">
                  Query Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="query-type"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={queryType}
                  onChange={(e) => {
                    setQueryType(e.target.value);
                    setQueryErrors({ ...queryErrors, queryType: "" });
                  }}
                >
                  <option value="">Select query type...</option>
                  <option value="Missing Document">Missing Document</option>
                  <option value="Clarification Required">Clarification Required</option>
                  <option value="Incorrect Information">Incorrect Information</option>
                  <option value="Other">Other</option>
                </select>
                {queryErrors.type && <p className="text-xs text-red-500 mt-1">{queryErrors.type}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Message to Victim</label>
                <textarea
                  className="w-full p-2 border rounded-md bg-background min-h-[100px]"
                  placeholder="Explain clearly what is needed..."
                  value={queryMessage}
                  onChange={(e) => setQueryMessage(e.target.value)}
                />
                {queryErrors.message && <p className="text-xs text-red-500 mt-1">{queryErrors.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Attach Reference (Optional)</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setQueryFile(e.target.files[0])}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {queryFile ? queryFile.name : "Click to upload reference document"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="highPriority"
                  checked={highPriority}
                  onChange={(e) => setHighPriority(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="highPriority" className="text-sm font-medium">Mark as High Priority</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={handleCloseQueryModal}>Cancel</Button>
              <Button onClick={handleSendQuery}>Send Query</Button>
            </div>
          </div>
        </div>
      )}

      {/* Grievance Details Modal */}
      {showGrievanceModal && selectedGrievance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={handleCloseGrievanceModal}>
          <div
            className="bg-background rounded-lg shadow-lg w-full max-w-4xl my-8 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-background rounded-t-lg z-10">
              <div>
                <h2 className="text-xl font-bold">Grievance Details</h2>
                <p className="text-muted-foreground">Grievance ID: {selectedGrievance.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={
                  selectedGrievance.status === "Open" ? "bg-blue-100 text-blue-800" :
                    selectedGrievance.status === "Under Review" ? "bg-yellow-100 text-yellow-800" :
                      selectedGrievance.status === "Resolved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                }>
                  {selectedGrievance.status}
                </Badge>
                <Button variant="ghost" size="icon" onClick={handleCloseGrievanceModal}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">

              {/* Victim & Case Summary */}
              <div className="bg-muted/30 p-4 rounded-lg grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Victim Name</p>
                  <p className="font-medium">{selectedGrievance.victimName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Case ID</p>
                  <p className="font-medium">{selectedGrievance.caseId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{selectedGrievance.contact}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">District/State</p>
                  <p className="font-medium">{selectedGrievance.district}, {selectedGrievance.state}</p>
                </div>
              </div>

              {/* Original Grievance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Victim's Grievance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Category</span>
                    <p className="font-medium mt-1">{selectedGrievance.category}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Subject</span>
                    <p className="font-medium mt-1">{selectedGrievance.subject}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Description</span>
                    <p className="mt-1 text-sm leading-relaxed">{selectedGrievance.description}</p>
                  </div>
                  {selectedGrievance.attachments?.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Attachments</span>
                      <div className="mt-2 flex gap-2">
                        {selectedGrievance.attachments.map((file, idx) => (
                          <Button key={idx} variant="outline" size="sm" onClick={() => console.log("Open attachment:", file)}>
                            <FileText className="h-3 w-3 mr-2" />
                            {file}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Communication Timeline */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Communication Timeline</h3>
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  {selectedGrievance.timeline?.map((item, idx) => (
                    <div key={idx} className="relative pl-4 pb-2">
                      <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full ${item.by === 'Officer' ? 'bg-primary' : 'bg-orange-500'}`} />
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={item.by === 'Officer' ? "default" : "secondary"}>{item.by}</Badge>
                        <span className="text-xs text-muted-foreground">{item.at}</span>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg text-sm">
                        {item.message}
                      </div>
                    </div>
                  ))}
                  <div ref={timelineEndRef} />
                </div>
              </div>

              {/* Officer Response Area */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Officer Response & Status Update</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Officer Response / Warning</label>
                    <textarea
                      className="w-full p-3 border rounded-md bg-background min-h-[100px] focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Write your response to the victim, or add a warning note if this appears to be a false claim."
                      value={officerResponse}
                      onChange={(e) => setOfficerResponse(e.target.value)}
                    />
                    {responseError && <p className="text-xs text-red-500 mt-1">{responseError}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Attach proof (optional)</label>
                      <div className="border border-dashed rounded-lg p-3 bg-background hover:bg-muted/50 transition-colors cursor-pointer relative">
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleResponseFileChange}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <div className="flex items-center gap-2 justify-center">
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {responseProof ? responseProof.name : "Upload receipt/document (Max 5MB)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Update Status</label>
                      <select
                        className="w-full p-2.5 border rounded-md bg-background"
                        value={updatedStatus}
                        onChange={(e) => setUpdatedStatus(e.target.value)}
                      >
                        <option value="Open">Open</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Resolved">Resolved</option>
                        <option value="False Claim">False Claim / Misuse</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 border-t bg-background/50 flex justify-end gap-3 rounded-b-lg">
                  <Button variant="outline" onClick={handleCloseGrievanceModal}>Cancel</Button>
                  <Button onClick={handleSubmitResponse}>Submit Response</Button>
                </div>
              </Card>

            </div>
          </div>
        </div>
      )}

      {/* Transaction/Disbursement Confirmation Modal */}
      {showTransactionModal && disbursementCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseTransactionModal}>
          <div
            className="bg-background rounded-lg shadow-xl max-w-xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Confirm Fund Disbursement</h2>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Case Summary */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Case Summary</h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Case ID</p>
                      <p className="font-semibold">{disbursementCase.caseId || disbursementCase._id || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">FIR Number</p>
                      <p className="font-semibold">{disbursementCase.firCaseNumber || "N/A"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-semibold">{disbursementCase.district || "N/A"}, {disbursementCase.state || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-semibold capitalize">{disbursementCase.status || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phased Disbursement Section */}
              <div className="space-y-4">
                <div className="border-l-4 border-l-primary pl-3">
                  <h3 className="text-lg font-bold mb-1">Phased Disbursement</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter transaction IDs one phase at a time. Each phase must be verified by the victim before adding the next.
                  </p>
                </div>

                {/* Phase 1 - 25% */}
                {(() => {
                  const phase1 = disbursementCase?.disbursements?.[0];
                  const phase1Saved = !!phase1?.transactionId;
                  const phase1Verified = !!phase1?.victimVerified;

                  return (
                    <div className={`space-y-2 p-4 rounded-lg border ${phase1Verified
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700'
                      : phase1Saved
                        ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-700'
                        : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                      }`}>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold">
                          Phase 1 - First Installment (25%)
                        </label>
                        {phase1Verified && (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <CheckCircle className="h-4 w-4" /> Verified
                          </span>
                        )}
                        {phase1Saved && !phase1Verified && (
                          <span className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
                            <Clock className="h-4 w-4" /> Waiting for verification
                          </span>
                        )}
                      </div>

                      {phase1Verified ? (
                        <div className="bg-green-100 dark:bg-green-900/30 rounded p-3">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            ✓ Transaction ID: <span className="font-mono">{phase1.transactionId}</span>
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Verified on {phase1.victimVerifiedAt ? new Date(phase1.victimVerifiedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      ) : phase1Saved ? (
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded p-3">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Transaction ID saved: <span className="font-mono">{phase1.transactionId}</span>
                          </p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            ⏳ Waiting for victim to verify this transaction
                          </p>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            id="transaction-id-1"
                            type="text"
                            placeholder="Enter Transaction/UTR ID for 25%"
                            value={transactionId1}
                            onChange={(e) => {
                              setTransactionId1(e.target.value);
                              setTransactionError("");
                            }}
                            className="bg-white dark:bg-background flex-1"
                          />
                          <Button
                            onClick={() => handleSaveSingleDisbursement(0, transactionId1)}
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={!transactionId1.trim()}
                          >
                            Save Phase 1
                          </Button>
                        </div>
                      )}

                      {!phase1Saved && (
                        <p className="text-xs text-muted-foreground">
                          First Installment (25%) - Save this first, then wait for victim verification.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Phase 2 - 25% */}
                {(() => {
                  const phase1 = disbursementCase?.disbursements?.[0];
                  const phase1Verified = !!phase1?.victimVerified;
                  const phase2 = disbursementCase?.disbursements?.[1];
                  const phase2Saved = !!phase2?.transactionId;
                  const phase2Verified = !!phase2?.victimVerified;

                  // Phase 2 is locked until Phase 1 is verified
                  if (!phase1Verified) {
                    return (
                      <div className="space-y-2 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-300 dark:border-gray-600 opacity-60">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-gray-500">
                            Phase 2 - Second Installment (25%)
                          </label>
                          <span className="text-xs text-gray-500">🔒 Locked</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Unlock by verifying Phase 1 first (victim must verify)
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className={`space-y-2 p-4 rounded-lg border ${phase2Verified
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700'
                      : phase2Saved
                        ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-700'
                        : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                      }`}>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold">
                          Phase 2 - Second Installment (25%)
                        </label>
                        {phase2Verified && (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <CheckCircle className="h-4 w-4" /> Verified
                          </span>
                        )}
                        {phase2Saved && !phase2Verified && (
                          <span className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
                            <Clock className="h-4 w-4" /> Waiting for verification
                          </span>
                        )}
                      </div>

                      {phase2Verified ? (
                        <div className="bg-green-100 dark:bg-green-900/30 rounded p-3">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            ✓ Transaction ID: <span className="font-mono">{phase2.transactionId}</span>
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Verified on {phase2.victimVerifiedAt ? new Date(phase2.victimVerifiedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      ) : phase2Saved ? (
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded p-3">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Transaction ID saved: <span className="font-mono">{phase2.transactionId}</span>
                          </p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            ⏳ Waiting for victim to verify this transaction
                          </p>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            id="transaction-id-2"
                            type="text"
                            placeholder="Enter Transaction/UTR ID for 25%"
                            value={transactionId2}
                            onChange={(e) => {
                              setTransactionId2(e.target.value);
                              setTransactionError("");
                            }}
                            className="bg-white dark:bg-background flex-1"
                          />
                          <Button
                            onClick={() => handleSaveSingleDisbursement(1, transactionId2)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={!transactionId2.trim()}
                          >
                            Save Phase 2
                          </Button>
                        </div>
                      )}

                      {!phase2Saved && (
                        <p className="text-xs text-muted-foreground">
                          Second Installment (25%) - Enter transaction ID, then wait for victim verification.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Phase 3 - 50% */}
                {(() => {
                  const phase2 = disbursementCase?.disbursements?.[1];
                  const phase2Verified = !!phase2?.victimVerified;
                  const phase3 = disbursementCase?.disbursements?.[2];
                  const phase3Saved = !!phase3?.transactionId;
                  const phase3Verified = !!phase3?.victimVerified;

                  // Phase 3 is locked until Phase 2 is verified
                  if (!phase2Verified) {
                    return (
                      <div className="space-y-2 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-300 dark:border-gray-600 opacity-60">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-semibold text-gray-500">
                            Phase 3 - Final Installment (50%)
                          </label>
                          <span className="text-xs text-gray-500">🔒 Locked</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Unlock by verifying Phase 2 first (victim must verify)
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className={`space-y-2 p-4 rounded-lg border ${phase3Verified
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700'
                      : phase3Saved
                        ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-700'
                        : 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800'
                      }`}>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold">
                          Phase 3 - Final Installment (50%)
                        </label>
                        {phase3Verified && (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <CheckCircle className="h-4 w-4" /> Verified
                          </span>
                        )}
                        {phase3Saved && !phase3Verified && (
                          <span className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
                            <Clock className="h-4 w-4" /> Waiting for verification
                          </span>
                        )}
                      </div>

                      {phase3Verified ? (
                        <div className="bg-green-100 dark:bg-green-900/30 rounded p-3">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            ✓ Transaction ID: <span className="font-mono">{phase3.transactionId}</span>
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Verified on {phase3.victimVerifiedAt ? new Date(phase3.victimVerifiedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      ) : phase3Saved ? (
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded p-3">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Transaction ID saved: <span className="font-mono">{phase3.transactionId}</span>
                          </p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            ⏳ Waiting for victim to verify this transaction
                          </p>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            id="transaction-id-3"
                            type="text"
                            placeholder="Enter Transaction/UTR ID for 50%"
                            value={transactionId3}
                            onChange={(e) => {
                              setTransactionId3(e.target.value);
                              setTransactionError("");
                            }}
                            className="bg-white dark:bg-background flex-1"
                          />
                          <Button
                            onClick={() => handleSaveSingleDisbursement(2, transactionId3)}
                            className="bg-purple-600 hover:bg-purple-700"
                            disabled={!transactionId3.trim()}
                          >
                            Save Phase 3
                          </Button>
                        </div>
                      )}

                      {!phase3Saved && (
                        <p className="text-xs text-muted-foreground">
                          Final Installment (50%) - Enter transaction ID, then wait for victim verification.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {transactionError && (
                  <p className="text-sm text-red-500 font-medium">{transactionError}</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-muted/20 flex justify-end gap-3">
              <Button variant="ghost" onClick={handleCloseTransactionModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Support Ticket View/Respond Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseTicketModal}>
          <div
            className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Ticket className="h-6 w-6 text-accent" />
                  {selectedTicket.ticketId}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Case ID: {selectedTicket.caseId} • Submitted by: {selectedTicket.userId?.name || "Unknown"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCloseTicketModal}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
              {/* Status and Category */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getTicketStatusBadge(selectedTicket.status)}
                    <select
                      className="text-sm border rounded px-2 py-1 bg-background"
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateTicketStatus(selectedTicket._id, e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="under_review">Under Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <Badge variant="outline">{getCategoryLabel(selectedTicket.category)}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="font-medium">{formatDate(selectedTicket.createdAt)}</p>
                </div>
              </div>

              {/* Subject and Description */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">{selectedTicket.subject}</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* Previous Responses */}
              {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Response History</h3>
                  <div className="space-y-3">
                    {selectedTicket.responses.map((response, index) => (
                      <div key={index} className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          <span className="font-medium text-sm">
                            {response.respondedBy?.name || "Officer"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {formatDate(response.respondedAt)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Response */}
              <div>
                <h3 className="font-semibold mb-3">Add Response</h3>
                <textarea
                  className="w-full p-3 border rounded-lg bg-background min-h-[100px] resize-none"
                  placeholder="Type your response to the user..."
                  value={ticketResponse}
                  onChange={(e) => setTicketResponse(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-muted/20 flex justify-end gap-3">
              <Button variant="ghost" onClick={handleCloseTicketModal}>
                Cancel
              </Button>
              <Button
                className="bg-accent hover:bg-accent-hover"
                onClick={handleSendTicketResponse}
                disabled={ticketResponseLoading || !ticketResponse.trim()}
              >
                {ticketResponseLoading ? "Sending..." : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Response
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};


export default OfficerPortal;
