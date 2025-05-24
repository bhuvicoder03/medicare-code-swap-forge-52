
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from "@/components/ui/toaster";

// Import pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SalesDashboard from './pages/SalesDashboard';
import CrmDashboard from './pages/CrmDashboard';
import GuarantorLoanPage from './pages/GuarantorLoanPage';
import LoanStatusPage from './pages/LoanStatusPage';

// Import components
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/guarantor-loan" element={<GuarantorLoanPage />} />
            <Route path="/loan-status" element={<LoanStatusPage />} />
            
            {/* Protected Routes */}
            <Route path="/patient-dashboard" element={
              <PrivateRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/hospital-dashboard" element={
              <PrivateRoute allowedRoles={['hospital']}>
                <HospitalDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/admin-dashboard" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/sales-dashboard" element={
              <PrivateRoute allowedRoles={['sales']}>
                <SalesDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/crm-dashboard" element={
              <PrivateRoute allowedRoles={['crm']}>
                <CrmDashboard />
              </PrivateRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
