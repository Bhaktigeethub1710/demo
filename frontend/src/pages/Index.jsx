import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield,
  Users,
  Building2,
  BarChart3,
  Landmark,
  Lock,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileText,
  Bell,
  Smartphone,
  Upload,
  Fingerprint,
  Globe,
  TrendingUp,
  Award,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ctaBackground from "@/assets/cta-background.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { navigateToRoleTarget } from "@/utils/navigation";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const features = [
    {
      icon: Shield,
      title: t('features.privacyFirst.title'),
      description: t('features.privacyFirst.description'),
    },
    {
      icon: Clock,
      title: t('features.emergencyRelief.title'),
      description: t('features.emergencyRelief.description'),
    },
    {
      icon: CheckCircle2,
      title: t('features.aiVerification.title'),
      description: t('features.aiVerification.description'),
    },
    {
      icon: Lock,
      title: t('features.blockchain.title'),
      description: t('features.blockchain.description'),
    },
    {
      icon: Smartphone,
      title: t('features.multiChannel.title'),
      description: t('features.multiChannel.description'),
    },
    {
      icon: Bell,
      title: t('features.realTimeUpdates.title'),
      description: t('features.realTimeUpdates.description'),
    },
  ];

  const portals = [
    {
      title: t('portals.victimPortal.title'),
      description: t('portals.victimPortal.description'),
      icon: Users,
      path: "/victim-portal",
      role: "victim",
      color: "bg-accent",
    },
    {
      title: t('portals.emergencyFund.title'),
      description: t('portals.emergencyFund.description'),
      icon: Clock,
      path: "/emergency-fund",
      role: null,
      color: "bg-orange-600",
    },
  ];

  const handleApplyForRelief = () => {
    navigateToRoleTarget(navigate, location, '/victim-portal', 'victim', auth, toast);
  };

  const handlePortalClick = (portal) => {
    if (!portal.role) {
      navigate(portal.path);
      return;
    }
    navigateToRoleTarget(navigate, location, portal.path, portal.role, auth, toast);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <Shield className="h-4 w-4" />
              <span>{t('hero.badge')}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {t('hero.title')}<br />
              {t('hero.subtitle')}
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent-hover text-accent-foreground shadow-elevated transition-base"
                onClick={handleApplyForRelief}
              >
                {t('hero.applyForRelief')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link to="/transparency">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20 text-white transition-base">
                  {t('hero.viewTransparencyHub')}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 md:gap-12 pt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">24/7</div>
                <div className="text-sm text-primary-foreground/80">{t('hero.supportAvailable')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">48hrs</div>
                <div className="text-sm text-primary-foreground/80">{t('hero.emergencyRelief')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold">100%</div>
                <div className="text-sm text-primary-foreground/80">{t('hero.transparent')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section className="py-20 bg-gradient-dashboard">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('portals.selectYourPortal')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('portals.roleBasedAccess')}
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {portals.map((portal, index) => (
                <Card
                  key={index}
                  className="p-6 h-full hover:shadow-elevated transition-smooth hover:scale-105 cursor-pointer group"
                  onClick={() => handlePortalClick(portal)}
                >
                  <div className={`${portal.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth`}>
                    <portal.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{portal.title}</h3>
                  <p className="text-muted-foreground text-sm">{portal.description}</p>
                  <div className="mt-4 flex items-center text-primary group-hover:text-primary-hover transition-base">
                    <span className="text-sm font-medium">{t('portals.accessPortal')}</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-base" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portal Details Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('portalDetails.understandingOurPortals')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('portalDetails.detailedInfo')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="victim" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent w-10 h-10 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-semibold">Victim Portal</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6 text-muted-foreground space-y-4">
                  <p className="text-foreground font-medium">
                    A safe, secure, and compassionate space for victims of caste/atrocity incidents to access immediate relief and justice.
                  </p>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Fingerprint className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Secure Registration</p>
                        <p className="text-sm">Register securely using your Aadhaar and Case/FIR ID with complete privacy protection.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Upload className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Easy Document Upload</p>
                        <p className="text-sm">Upload required documents via DigiLocker integration or manual upload with guided assistance.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Globe className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Multilingual Support</p>
                        <p className="text-sm">Access the platform in your preferred language with full support for regional languages.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Clock className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">48-Hour Provisional Relief</p>
                        <p className="text-sm">Receive emergency partial disbursement within 48 hours after AI-assisted verification.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Privacy-First Approach</p>
                        <p className="text-sm">Your identity is protected—you're identified by Case ID, not by name, ensuring dignity and safety.</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm italic border-l-4 border-accent pl-4 py-2 bg-accent/5">
                    "We understand your pain. This portal is designed to provide relief quickly, safely, and with the respect you deserve. Your trust and safety are our priority."
                  </p>
                </AccordionContent>
              </AccordionItem>



              <AccordionItem value="financial" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary w-10 h-10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-semibold">Financial Portal</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6 text-muted-foreground space-y-4">
                  <p className="text-foreground font-medium">
                    Streamlined interface for banks and financial institutions to execute verified DBT transactions efficiently.
                  </p>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <FileText className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Verified Case View</p>
                        <p className="text-sm">Access all verified cases pending DBT transactions with complete beneficiary details and sanction amounts.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Digital Sanction Workflow</p>
                        <p className="text-sm">Approve and process fund releases through a secure, paperless digital approval system.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Lock className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Blockchain Transaction Logs</p>
                        <p className="text-sm">All disbursements are recorded on an immutable blockchain ledger ensuring complete transparency and audit trails.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Building2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Officer Coordination</p>
                        <p className="text-sm">Direct coordination with officer dashboards for fund confirmation and ledger reconciliation.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <FileText className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Automated Reporting</p>
                        <p className="text-sm">Generate disbursement receipts and transaction reports automatically uploaded to the central system.</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ministry" className="border rounded-lg px-6 bg-card">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FFBF00] w-10 h-10 rounded-lg flex items-center justify-center">
                      <Landmark className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-semibold">Ministry Dashboard</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-6 text-muted-foreground space-y-4">
                  <p className="text-foreground font-medium">
                    Comprehensive oversight for the Ministry of Social Justice and Empowerment with real-time analytics and accountability.
                  </p>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Landmark className="h-5 w-5 text-[#FFBF00] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Centralized Analytics</p>
                        <p className="text-sm">Access pan-India fund utilization reports, state-wise performance metrics, and district-level insights.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <TrendingUp className="h-5 w-5 text-[#FFBF00] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Real-Time Dashboards</p>
                        <p className="text-sm">Monitor live data on pending cases, disbursed funds, processing times, and regional performance.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Lock className="h-5 w-5 text-[#FFBF00] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Transparency Features</p>
                        <p className="text-sm">Blockchain-backed immutable ledger provides complete transparency and prevents fund misuse.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Award className="h-5 w-5 text-[#FFBF00] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Impact Visualizations</p>
                        <p className="text-sm">Interactive charts and graphs showing relief impact, beneficiary demographics, and policy effectiveness.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Bell className="h-5 w-5 text-[#FFBF00] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Grievance Statistics</p>
                        <p className="text-sm">Track grievance trends, resolution times, and identify systemic issues for policy improvements.</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm italic border-l-4 border-[#FFBF00] pl-4 py-2 bg-[#FFBF00]/5">
                    "Driving accountability, transparency, and efficiency to ensure every rupee reaches those who need it most."
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* How to Apply Section */}
      <section className="py-20 bg-gradient-dashboard">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('howToApply.title')}
              </h2>
              <p className="text-muted-foreground">
                {t('howToApply.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="p-6 text-center space-y-4 hover:shadow-elevated transition-smooth">
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-accent">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('howToApply.step1.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('howToApply.step1.description')}
                  </p>
                </div>
              </Card>

              <Card className="p-6 text-center space-y-4 hover:shadow-elevated transition-smooth">
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-accent">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('howToApply.step2.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('howToApply.step2.description')}
                  </p>
                </div>
              </Card>

              <Card className="p-6 text-center space-y-4 hover:shadow-elevated transition-smooth">
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-accent">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('howToApply.step3.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('howToApply.step3.description')}
                  </p>
                </div>
              </Card>

              <Card className="p-6 text-center space-y-4 hover:shadow-elevated transition-smooth">
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-accent">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t('howToApply.step4.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('howToApply.step4.description')}
                  </p>
                </div>
              </Card>
            </div>

            <div className="text-center space-y-6">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent-hover text-accent-foreground shadow-elevated"
                onClick={handleApplyForRelief}
              >
                {t('howToApply.beginApplication')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-secondary" />
                  <span>{t('howToApply.securedByBlockchain')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  <span>{t('howToApply.verifiedByAI')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-secondary" />
                  <span>{t('howToApply.supportedByMoSJE')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('features.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="space-y-3">
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <Card
            className="p-8 md:p-12 text-primary-foreground relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(14, 116, 144, 0.95) 100%), url(${ctaBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold">
                {t('cta.needAssistance')}
              </h2>
              <p className="text-lg text-primary-foreground/90">
                {t('cta.supportAvailable')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/grievances">
                  <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground">
                    {t('cta.fileGrievance')}
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20 text-white">
                  {t('cta.callHelpline')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
