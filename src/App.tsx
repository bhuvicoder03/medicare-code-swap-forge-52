import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TermsAndConditions from './pages/legal/TermsAndConditions';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import AboutUs from './pages/AboutUs';
import OurCards from './pages/OurCards';
import PatientDashboard from './pages/PatientDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import CrmDashboard from './pages/CrmDashboard';
import SalesTeamDashboard from './pages/SalesTeamDashboard';
import SupportDashboard from './pages/SupportDashboard';
import AmbulanceService from './pages/services/AmbulanceService';
import FinancingService from './pages/services/FinancingService';
import PathologyService from './pages/services/PathologyService';
import PharmaService from './pages/services/PharmaService';
import PharmacyService from './pages/services/PharmacyService';
import StoresService from './pages/services/StoresService';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import Sitemap from './pages/Sitemap';
import ApplyLoan from './pages/ApplyLoan';
import HospitalRegistration from './pages/HospitalRegistration';

// Routes configuration
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/our-cards" element={<OurCards />} />
        <Route path="/hospital-registration" element={<HospitalRegistration />} />
        <Route path="/apply-loan" element={<ApplyLoan />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/patient-dashboard/:section" element={<PatientDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['hospital']} />}>
          <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
          <Route path="/hospital-dashboard/:section" element={<HospitalDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-dashboard/:section" element={<AdminDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['agent']} />}>
          <Route path="/agent-dashboard" element={<AgentDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['crm']} />}>
          <Route path="/crm-dashboard" element={<CrmDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['sales']} />}>
          <Route path="/sales-dashboard" element={<SalesTeamDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['support']} />}>
          <Route path="/support-dashboard" element={<SupportDashboard />} />
        </Route>
        
        {/* Service Pages */}
        <Route path="/services/ambulance" element={<AmbulanceService />} />
        <Route path="/services/financing" element={<FinancingService />} />
        <Route path="/services/pathology" element={<PathologyService />} />
        <Route path="/services/pharma" element={<PharmaService />} />
        <Route path="/services/pharmacy" element={<PharmacyService />} />
        <Route path="/services/stores" element={<StoresService />} />
        
        {/* Sitemap */}
        <Route path="/sitemap" element={<Sitemap />} />
        
        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
