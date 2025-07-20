import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import AuthPages from './pages/Auth';
import Home from './pages/Home';
import ForgotPassword from './pages/Forgot';
import Profile from './pages/Profile';
import CreateShipment from './pages/CreateShipment';
import Success from './pages/Success';
import ConfirmShipment from './pages/ConfirmShippment';
import ActiveShipments from './pages/MyShipments';
import ShipmentHistory from './pages/History';
import ShipmentDetails from './pages/ShipmentDetails';
import TrackShipment from './pages/TrackShipment';
import CancellationSuccess from './pages/Cancellation';
import ContactPage from './pages/additional/Contact';
import PrivacyPolicy from './pages/additional/PrivacyPage';
import TermsAndConditions from './pages/additional/Terms';
import About from './pages/additional/About';

import AdminLogin from './admin/login';
import AdminWelcome from './admin/Welcome';
import AdminDashboard from './admin/Dashboard';
import AllShipments from './admin/AllShipments';
import UpdateShipment from './admin/UpdateShipment';
import AllUsers from './admin/AllUsers';

import { AuthProvider } from './context/AuthContext';
import { ShipmentProvider } from './context/ShipmentContext';
import { pingBackend } from './services/api';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin && <Navbar />}
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={true} />

      <main className="flex-1">
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPages />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/new-shipment" element={<CreateShipment />} />
          <Route path="/confirm" element={<ConfirmShipment />} />
          <Route path="/success" element={<Success />} />
          <Route path="/my-shipments" element={<ActiveShipments />} />
          <Route path="/history" element={<ShipmentHistory />} />
          <Route path="/details" element={<ShipmentDetails />} />
          <Route path="/track" element={<TrackShipment />} />
          <Route path="/cancellation-success" element={<CancellationSuccess />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/about" element={<About />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminWelcome />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/shipments" element={<AllShipments />} />
          <Route path="/admin/shipments/:id/update" element={<UpdateShipment />} />
          <Route path="/admin/users" element={<AllUsers />} />
        </Routes>
      </main>

      {!isAdmin && <Footer />}
    </div>
  );
}

function App() {
  const [isBackendReady, setIsBackendReady] = useState(false);

  useEffect(() => {
    pingBackend()
      .then(() => setIsBackendReady(true))
      .catch(() => setIsBackendReady(true)); // Even if it fails, proceed
  }, []);

  if (!isBackendReady) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background text-textPrimary transition-colors">
      <div className="text-4xl font-bold mb-4 animate-pulse text-primary">🚚 ShipNest</div>
      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-lg text-center px-4 text-textSecondary">
        Waking up servers... Preparing your shipments...
      </p>
    </div>
  );
}


  return (
    <Router>
      <AuthProvider>
        <ShipmentProvider>
          <AppContent />
        </ShipmentProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
