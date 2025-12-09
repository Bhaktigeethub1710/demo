import { useState } from "react";
import { Shield, Mail, Phone, MapPin } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { navigateToRoleTarget } from "@/utils/navigation";
import { useToast } from "@/hooks/use-toast";
import LegalPopCard from "@/components/LegalPopCard";
import PrivacyPolicyContent from "@/components/PrivacyPolicyContent";
import TermsOfServiceContent from "@/components/TermsOfServiceContent";
import PcrPoaActsContent from "@/components/PcrPoaActsContent";
import FaqContent from "@/components/FaqContent";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isTermsOfServiceOpen, setIsTermsOfServiceOpen] = useState(false);
  const [isPcrPoaActsOpen, setIsPcrPoaActsOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  const handleVictimPortalClick = (e) => {
    e.preventDefault();
    navigateToRoleTarget(navigate, location, '/victim-portal', 'victim', auth, toast);
  };

  const handleOfficerPortalClick = (e) => {
    e.preventDefault();
    navigateToRoleTarget(navigate, location, '/officer-portal', 'officer', auth, toast);
  };

  return (
    <>
      <footer className="bg-primary text-primary-foreground mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* About */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6" />
                <span className="font-semibold">{t('navbar.justiceWithDignity')}</span>
              </div>
              <p className="text-sm text-primary-foreground/80">
                {t('footer.aboutDesc')}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    onClick={handleVictimPortalClick}
                    className="hover:underline cursor-pointer"
                  >
                    {t('navbar.victimPortal')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={handleOfficerPortalClick}
                    className="hover:underline cursor-pointer"
                  >
                    {t('navbar.officerPortal')}
                  </a>
                </li>
                <li><Link to="/transparency" className="hover:underline">{t('navbar.transparencyHub')}</Link></li>
                <li><Link to="/grievances" className="hover:underline">{t('cta.fileGrievance')}</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">{t('footer.legal')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsPrivacyPolicyOpen(true);
                    }}
                    className="hover:underline cursor-pointer"
                  >
                    {t('footer.privacyPolicy')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTermsOfServiceOpen(true);
                    }}
                    className="hover:underline cursor-pointer"
                  >
                    {t('footer.termsOfService')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsPcrPoaActsOpen(true);
                    }}
                    className="hover:underline cursor-pointer"
                  >
                    PCR/PoA Acts
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsFaqOpen(true);
                    }}
                    className="hover:underline cursor-pointer"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">{t('footer.contact')}</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>18002021989 (Toll-Free)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>support@dbt-pcr.gov.in</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Ministry of Social Justice & Empowerment, New Delhi</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm">
            <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            <p className="mt-2 text-primary-foreground/80">
              {t('footer.govtOfIndia')}
            </p>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <LegalPopCard
        isOpen={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
        title="Privacy Policy — Nyaya Setu"
      >
        <PrivacyPolicyContent />
      </LegalPopCard>

      {/* Terms of Service Modal */}
      <LegalPopCard
        isOpen={isTermsOfServiceOpen}
        onClose={() => setIsTermsOfServiceOpen(false)}
        title="Terms of Service — Nyaya Setu"
      >
        <TermsOfServiceContent />
      </LegalPopCard>

      {/* PCR/PoA Acts Modal */}
      <LegalPopCard
        isOpen={isPcrPoaActsOpen}
        onClose={() => setIsPcrPoaActsOpen(false)}
        title="PCR/PoA Acts — Nyaya Setu"
      >
        <PcrPoaActsContent />
      </LegalPopCard>

      {/* FAQ Modal */}
      <LegalPopCard
        isOpen={isFaqOpen}
        onClose={() => setIsFaqOpen(false)}
        title="FAQ — Nyaya Setu"
      >
        <FaqContent />
      </LegalPopCard>
    </>
  );
};

export default Footer;
