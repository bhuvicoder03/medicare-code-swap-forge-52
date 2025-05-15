
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AboutUs from './pages/AboutUs';
import OurCards from './pages/OurCards';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import PatientDashboard from './pages/PatientDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SalesTeamDashboard from './pages/SalesTeamDashboard';
import CrmDashboard from './pages/CrmDashboard';
import AgentDashboard from './pages/AgentDashboard';
import SupportDashboard from './pages/SupportDashboard';
import NotFound from './pages/NotFound';
import HospitalRegistration from './pages/HospitalRegistration';
import ApplyLoan from './pages/ApplyLoan';
import AmbulanceService from './pages/services/AmbulanceService';
import FinancingService from './pages/services/FinancingService';
import PathologyService from './pages/services/PathologyService';
import PharmaService from './pages/services/PharmaService';
import PharmacyService from './pages/services/PharmacyService';
import StoresService from './pages/services/StoresService';
import Sitemap from './pages/Sitemap';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

function App() {
  const { authState } = useAuth();

  return (
    <Router>
      <Suspense fallback={<div className="loading">Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/our-cards" element={<OurCards />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/hospital-registration" element={<HospitalRegistration />} />
          <Route path="/apply-loan" element={<ApplyLoan />} />
          <Route path="/sitemap" element={<Sitemap />} />
          
          {/* Service Routes */}
          <Route path="/services/ambulance" element={<AmbulanceService />} />
          <Route path="/services/financing" element={<FinancingService />} />
          <Route path="/services/pathology" element={<PathologyService />} />
          <Route path="/services/pharma" element={<PharmaService />} />
          <Route path="/services/pharmacy" element={<PharmacyService />} />
          <Route path="/services/stores" element={<StoresService />} />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/patient-dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hospital-dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['hospital']}>
                <HospitalDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sales-dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['sales']}>
                <SalesTeamDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/crm-dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['crm']}>
                <CrmDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agent-dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/support-dashboard/*" 
            element={
              <ProtectedRoute allowedRoles={['support']}>
                <SupportDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
