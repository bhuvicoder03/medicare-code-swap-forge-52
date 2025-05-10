import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StrictMode } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import ApplyLoan from "./pages/ApplyLoan";
import OurCards from "./pages/OurCards";
import AboutUs from "./pages/AboutUs";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import HospitalRegistration from "./pages/HospitalRegistration";
import HospitalDashboard from "./pages/HospitalDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SalesTeamDashboard from "./pages/SalesTeamDashboard";
import CrmDashboard from "./pages/CrmDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import SupportDashboard from "./pages/SupportDashboard";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsAndConditions from "./pages/legal/TermsAndConditions";
import Sitemap from "./pages/Sitemap";


const queryClient = new QueryClient();

const App = () => (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/apply-loan" element={<ApplyLoan />} />
            <Route path="/our-cards" element={<OurCards />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/hospital-registration" element={<HospitalRegistration />} />
            <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/sales-dashboard" element={<SalesTeamDashboard />} />
            <Route path="/crm-dashboard" element={<CrmDashboard />} />
            <Route path="/agent-dashboard" element={<AgentDashboard />} />
            <Route path="/support-dashboard" element={<SupportDashboard />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);

export default App;
