import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import {
    Shield,
    Upload,
    FileText,
    AlertTriangle,
    CreditCard,
    Fingerprint,
    Lock,
    RotateCcw,
    Send,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SuccessCard from "@/components/SuccessCard";
import FileUpload from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";

const EmergencyFund = () => {
    const { toast } = useToast();
    const { t } = useTranslation();

    // Form state
    const [fullName, setFullName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [mobile, setMobile] = useState("");
    const [aadhaar, setAadhaar] = useState("");
    const [pincode, setPincode] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [district, setDistrict] = useState("");
    const [state, setState] = useState("");
    const [incidentDate, setIncidentDate] = useState("");
    const [amount, setAmount] = useState("");
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [accountHolderName, setAccountHolderName] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showSuccessCard, setShowSuccessCard] = useState(false);

    // File uploads
    const [casteFile, setCasteFile] = useState(null);
    const [identityFile, setIdentityFile] = useState(null);

    // Validation errors
    const [amountError, setAmountError] = useState("");

    // Validate amount
    const validateAmount = (value) => {
        const numValue = parseInt(value);
        if (!value || value === "") {
            setAmountError("Amount is required");
            return false;
        }
        if (isNaN(numValue) || numValue <= 0) {
            setAmountError("Amount must be greater than 0");
            return false;
        }
        if (numValue > 50000) {
            setAmountError("Amount cannot exceed ₹50,000");
            return false;
        }
        if (!Number.isInteger(numValue)) {
            setAmountError("Amount must be a whole number");
            return false;
        }
        setAmountError("");
        return true;
    };

    // Handle amount change
    const handleAmountChange = (e) => {
        const value = e.target.value;
        setAmount(value);
        if (value) {
            validateAmount(value);
        } else {
            setAmountError("");
        }
    };

    // Reset form
    const handleResetForm = () => {
        setFullName("");
        setDateOfBirth("");
        setMobile("");
        setAadhaar("");
        setPincode("");
        setEmail("");
        setAddress("");
        setDistrict("");
        setState("");
        setIncidentDate("");
        setAmount("");
        setBankAccountNumber("");
        setIfscCode("");
        setAccountHolderName("");
        setAgreedToTerms(false);
        setAmountError("");

        toast({
            title: "Form Reset",
            description: "All fields have been cleared",
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate all required fields
        if (!fullName || !mobile || !aadhaar || !district || !state || !incidentDate ||
            !bankAccountNumber || !ifscCode || !accountHolderName) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        // Validate file uploads
        if (!casteFile) {
            toast({
                title: "Missing Document",
                description: "Please upload your Caste Certificate",
                variant: "destructive",
            });
            return;
        }

        if (!identityFile) {
            toast({
                title: "Missing Document",
                description: "Please upload your Identity Proof",
                variant: "destructive",
            });
            return;
        }

        // Validate amount
        if (!validateAmount(amount)) {
            toast({
                title: "Invalid Amount",
                description: amountError,
                variant: "destructive",
            });
            return;
        }

        // Check terms agreement
        if (!agreedToTerms) {
            toast({
                title: "Terms Required",
                description: "You must agree to the terms and conditions",
                variant: "destructive",
            });
            return;
        }

        // Show success card
        setShowSuccessCard(true);
    };

    // Handle success card close
    const handleSuccessClose = () => {
        setShowSuccessCard(false);
        // Reset form after success
        handleResetForm();
        toast({
            title: "Application Submitted",
            description: "Your emergency fund application has been recorded",
        });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <section className="gradient-hero text-primary-foreground py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-4">
                        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                            <Shield className="h-4 w-4" />
                            <span>Emergency Financial Assistance</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                            Emergency Fund Application
                        </h1>

                        <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
                            Fast-track financial assistance for urgent situations under PCR/PoA Acts
                        </p>
                    </div>
                </div>
            </section>

            {/* Warning Banner */}
            <section className="py-4 bg-orange-50 dark:bg-orange-900/20 border-b-2 border-orange-200 dark:border-orange-800">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex gap-4 items-start">
                            <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <p className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                                    ⚠️ Important Warning
                                </p>
                                <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                                    Fill only and only if you are really in danger and need financial assistance.
                                    If you are unable to upload medical bills within 7 days, a case will be filed against you
                                    and your caste validity will be banned forever.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Form Section */}
            <section className="py-12 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <Card className="p-6 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Fingerprint className="h-5 w-5 text-accent" />
                                        Personal Information
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name *</Label>
                                            <Input
                                                id="fullName"
                                                placeholder="Enter your full name"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="dob">Date of Birth *</Label>
                                            <Input
                                                id="dob"
                                                type="date"
                                                value={dateOfBirth}
                                                onChange={(e) => setDateOfBirth(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mobile">Mobile Number *</Label>
                                            <Input
                                                id="mobile"
                                                type="tel"
                                                placeholder="+91 XXXXX XXXXX"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address (Optional)</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="your.email@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                                            <Input
                                                id="aadhaar"
                                                placeholder="XXXX XXXX XXXX"
                                                maxLength={12}
                                                value={aadhaar}
                                                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="pincode">Pincode *</Label>
                                            <Input
                                                id="pincode"
                                                placeholder="6-digit PIN code"
                                                maxLength={6}
                                                value={pincode}
                                                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="address">Address *</Label>
                                            <Input
                                                id="address"
                                                placeholder="Enter your complete address"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Case Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-accent" />
                                        Case Details
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="district">District *</Label>
                                            <Input
                                                id="district"
                                                placeholder="Enter district"
                                                value={district}
                                                onChange={(e) => setDistrict(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="state">State *</Label>
                                            <select
                                                id="state"
                                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
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
                                            <Label htmlFor="incidentDate">Date of Incident *</Label>
                                            <Input
                                                id="incidentDate"
                                                type="date"
                                                value={incidentDate}
                                                onChange={(e) => setIncidentDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Caste and Identity Verification */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-accent" />
                                        Caste & Identity Verification
                                    </h3>

                                    <div className="flex items-center gap-3">
                                        <Button type="button" size="sm" variant="outline">
                                            <Lock className="mr-2 h-4 w-4" />
                                            Fetch from DigiLocker
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            or upload manually below
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <FileUpload
                                            id="caste-cert"
                                            label="Caste Certificate (PDF/JPG)"
                                            helperText="Max 5MB"
                                            onFileChange={setCasteFile}
                                            required
                                        />

                                        <FileUpload
                                            id="identity-proof"
                                            label="Identity Proof - Aadhaar/Voter ID (PDF/JPG)"
                                            helperText="Max 5MB"
                                            onFileChange={setIdentityFile}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Apply for Amount */}
                                <div className="space-y-4 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Apply for Amount
                                    </h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount" className="text-blue-900 dark:text-blue-100">
                                            Enter Amount (Max Cap ₹50,000) *
                                        </Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="e.g., 10000"
                                            value={amount}
                                            onChange={handleAmountChange}
                                            className={`${amountError ? "border-red-500" : ""} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                            min="1"
                                            max="50000"
                                            step="1"
                                            required
                                        />
                                        {amountError && (
                                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertTriangle className="h-4 w-4" />
                                                {amountError}
                                            </p>
                                        )}
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            Maximum amount allowed: ₹50,000 | Enter whole numbers only
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
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                                            <Input
                                                id="accountHolderName"
                                                placeholder="Enter account holder name"
                                                value={accountHolderName}
                                                onChange={(e) => setAccountHolderName(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="accountNumber">Bank Account Number *</Label>
                                            <Input
                                                id="accountNumber"
                                                placeholder="Enter bank account number"
                                                value={bankAccountNumber}
                                                onChange={(e) => setBankAccountNumber(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="ifsc">IFSC Code *</Label>
                                            <Input
                                                id="ifsc"
                                                placeholder="Enter IFSC code"
                                                value={ifscCode}
                                                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                                                className="uppercase"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            className="h-5 w-5 rounded border-input mt-0.5 cursor-pointer"
                                            checked={agreedToTerms}
                                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                                            required
                                        />
                                        <Label htmlFor="terms" className="cursor-pointer leading-relaxed">
                                            I agree to all terms and conditions and I will provide valid proofs within given time period
                                        </Label>
                                    </div>

                                    {/* Dual Buttons in Rectangle */}
                                    <div className="border-2 border-primary/20 rounded-xl p-1 flex gap-2 bg-muted/30">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleResetForm}
                                            className="flex-1 gap-2"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Edit Form
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!agreedToTerms || !!amountError}
                                            className="flex-1 gap-2 bg-primary hover:bg-primary-hover"
                                        >
                                            <Send className="h-4 w-4" />
                                            Submit for Application
                                        </Button>
                                    </div>

                                    <p className="text-xs text-center text-muted-foreground">
                                        {!agreedToTerms && "Please agree to terms to submit the application"}
                                    </p>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Success Card */}
            <SuccessCard
                isOpen={showSuccessCard}
                onClose={handleSuccessClose}
                message="You have successfully applied for PCR/PoA act, entered amount will be credited in your bank account in few minutes"
            />

            <Footer />
        </div>
    );
};

export default EmergencyFund;
