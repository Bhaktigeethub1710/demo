import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatbotButton from "@/components/ChatbotButton";
import ChatbotWindow from "@/components/ChatbotWindow";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Transparency from "./pages/Transparency";
import Grievances from "./pages/Grievances";
import VictimPortal from "./pages/VictimPortal";
import VictimRegistration from "./pages/VictimRegistration";
import EmergencyFund from "./pages/EmergencyFund";
import TrackGrievance from "./pages/TrackGrievance";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <ScrollToTop behavior="smooth" />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login/:role" element={<Login />} />
                <Route path="/transparency" element={<Transparency />} />
                <Route path="/grievances" element={<Grievances />} />
                <Route path="/track-grievance" element={<TrackGrievance />} />
                <Route
                  path="/victim-portal"
                  element={
                    <ProtectedRoute requiredRole="victim">
                      <VictimPortal />
                    </ProtectedRoute>
                  }
                />

                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/register/victim" element={<VictimRegistration />} />
                <Route path="/emergency-fund" element={<EmergencyFund />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>

              {/* Chatbot Components - Available on all pages */}
              <ChatbotButton
                onClick={() => setIsChatOpen(true)}
                isOpen={isChatOpen}
              />
              <ChatbotWindow
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
              />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
