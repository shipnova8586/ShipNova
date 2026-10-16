import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Shipments from './pages/Shipments';
import Customers from './pages/Customers';
import Drivers from './pages/Drivers';
import Vehicles from './pages/Vehicles';
import Team from './pages/Team';
import LoadBoard from './pages/LoadBoard';
import Track from './pages/Track';
import RegisterCompany from './pages/RegisterCompany';
import SSOCallback from './pages/SSOCallback';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import Carriers from './pages/Carriers';

// Driver App Simulation Components
import DriverLayout from './pages/DriverApp/DriverLayout';
import DriverLogin from './pages/DriverApp/DriverLogin';
import DriverSignup from './pages/DriverApp/DriverSignup';
import InternalDashboard from './pages/DriverApp/InternalDashboard';
import ExternalDashboard from './pages/DriverApp/ExternalDashboard';

import './App.css';

// ── Loading Spinner ──
const LoadingScreen = () => (
  <div className="loading-container" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
    <div className="spinner"></div>
    <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Loading ShipNova...</p>
  </div>
);

// ── Protected Route (requires our MongoDB user) ──
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isNewClerkUser } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  // Clerk user logged in but no company yet → show registration
  if (isNewClerkUser) return <Navigate to={`/register-company${location.search}`} replace />;

  if (!user) return <Navigate to="/sign-in" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ── Network Plan Guard (requires 'network' subscription) ──
const NetworkRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/sign-in" replace />;
  if (user.companyId?.subscriptionPlan !== 'network') {
    return <Navigate to="/pricing?upgrade=network" replace />;
  }
  return children;
};

// ── Main App Layout (Sidebar + Header) ──
const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <div className="app-content-wrapper">
      <Header />
      <main className="app-main-body">{children}</main>
    </div>
  </div>
);

function App() {
  const { loading } = useContext(AuthContext);

  if (loading) return <LoadingScreen />;

  const adminOrManager = ['company_admin', 'manager'];

  return (
    <Routes>
      {/* ── Public Pages ── */}
      <Route path="/track" element={<Track />} />
      <Route path="/contact" element={<Contact />} />

      {/* ── Driver App Simulation ── */}
      <Route path="/driver" element={<DriverLayout />}>
        <Route index element={<Navigate to="login" replace />} />
        <Route path="login" element={<DriverLogin />} />
        <Route path="signup" element={<DriverSignup />} />
        <Route path="internal/home" element={<InternalDashboard />} />
        <Route path="external/board" element={<ExternalDashboard />} />
      </Route>

      {/* Custom ShipNova Login Page (Clerk-powered under the hood) */}
      <Route path="/sign-in" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Custom ShipNova Sign Up Page */}
      <Route path="/sign-up" element={<SignUp />} />

      {/* Google OAuth Callback */}
      <Route path="/sso-callback" element={<SSOCallback />} />

      {/* New Clerk user → Register Company */}
      <Route path="/register-company" element={<RegisterCompany />} />

      {/* ── Protected App Pages ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shipments"
        element={
          <ProtectedRoute>
            <AppLayout><Shipments /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute allowedRoles={['company_admin', 'dispatcher', 'manager']}>
            <AppLayout><Customers /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/drivers"
        element={
          <ProtectedRoute allowedRoles={['company_admin', 'manager']}>
            <AppLayout><Drivers /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute allowedRoles={adminOrManager}>
            <AppLayout><Vehicles /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute allowedRoles={['company_admin']}>
            <AppLayout><Team /></AppLayout>
          </ProtectedRoute>
        }
      />
      {/* Load Board Route - Network Plan Only */}
      <Route
        path="/load-board"
        element={
          <NetworkRoute>
            <ProtectedRoute allowedRoles={['company_admin', 'manager', 'dispatcher']}>
              <AppLayout><LoadBoard /></AppLayout>
            </ProtectedRoute>
          </NetworkRoute>
        }
      />
      <Route
        path="/carriers"
        element={
          <NetworkRoute>
            <ProtectedRoute allowedRoles={['company_admin', 'manager', 'dispatcher']}>
              <AppLayout><Carriers /></AppLayout>
            </ProtectedRoute>
          </NetworkRoute>
        }
      />

      {/* Fallback redirects */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
