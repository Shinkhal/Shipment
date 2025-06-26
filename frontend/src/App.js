import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

import { AuthProvider } from './context/AuthContext'; // ⬅️ Import your context
import { ShipmentProvider } from './context/ShipmentContext'; // ⬅️ Import Shipment context if needed

function App() {
  return (
    <Router>
      <AuthProvider> {/* ⬅️ Wrap everything inside AuthProvider */}
      <ShipmentProvider> {/* ⬅️ Wrap with ShipmentProvider if needed */}
        <div className="min-h-screen flex flex-col">
          <Navbar />

          <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={true} />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPages />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/new-shipment" element={<CreateShipment />} />
              <Route path="/confirm" element={<ConfirmShipment />} />
              <Route path="/success" element={<Success />} />
              <Route path="/my-shipments" element={<ActiveShipments />} />
              <Route path="/history" element={<ShipmentHistory />} />
              <Route path='/details' element={<ShipmentDetails/>}/>
              <Route path='/track' element={<TrackShipment/>} />
              {/* Add more routes here */}
            </Routes>
          </main>

          <Footer />
        </div>
        </ShipmentProvider> {/* ⬅️ Close ShipmentProvider */}
      </AuthProvider>
    </Router>
  );
}

export default App;
