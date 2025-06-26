import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Search, Plus, MapPin, Truck, Shield } from "lucide-react";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Decode JWT token to get user info
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('Shipmenttoken');
        
        if (token) {
          const decodedToken = decodeToken(token);
          
          if (decodedToken) {
            // Check if token is expired
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp && decodedToken.exp < currentTime) {
              // Token is expired
              localStorage.removeItem('Shipmenttoken');
              setIsLoggedIn(false);
              setUserName('');
            } else {
              setIsLoggedIn(true);
              // Get name from token
              setUserName(decodedToken.name || decodedToken.displayName || decodedToken.email?.split('@')[0] || 'User');
            }
          } else {
            setIsLoggedIn(false);
            setUserName('');
          }
        } else {
          setIsLoggedIn(false);
          setUserName('');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoggedIn(false);
        setUserName('');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const quickActions = [
    { name: 'Create Shipment', path: '/new-shipment', icon: Plus, color: 'bg-blue-600 hover:bg-blue-700', description: 'Send a new package' },
    { name: 'Track Package', path: '/track', icon: Search, color: 'bg-green-600 hover:bg-green-700', description: 'Track your shipments' },
    { name: 'My Shipments', path: '/my-shipments', icon: Package, color: 'bg-purple-600 hover:bg-purple-700', description: 'View your packages' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Authenticated User Dashboard View
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
        {/* Welcome Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {userName}! 👋
                </h1>
                <p className="text-gray-600 mt-2">
                  Ready to send or track your packages today?
                </p>
              </div>
              <div className="hidden md:block">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Today's Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What would you like to do?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.name}
                    onClick={() => navigate(action.path)}
                    className={`${action.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Icon className="w-12 h-12" />
                      <div>
                        <h3 className="text-lg font-semibold">{action.name}</h3>
                        <p className="text-sm opacity-90 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Features */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Ship With Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                    <Truck className="w-6 h-6" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-gray-900">Fast Delivery</h3>
                </div>
                <p className="text-gray-600">Quick and reliable shipping to get your packages where they need to go.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-lg bg-green-100 text-green-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-gray-900">Real-Time Tracking</h3>
                </div>
                <p className="text-gray-600">Track your packages every step of the way with live updates.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-gray-900">Secure & Safe</h3>
                </div>
                <p className="text-gray-600">Your packages are handled with care and delivered securely.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Non-authenticated Landing Page View
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white text-gray-800">
      {/* Hero Section */}
      <header className="text-center py-16 px-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          ShipFast
        </h1>
        <p className="text-lg md:text-xl max-w-xl mx-auto text-gray-600">
          Send packages anywhere, anytime. Track your shipments in real-time and enjoy hassle-free delivery.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/auth"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
          >
            Get Started
          </Link>
          <Link
            to="/track"
            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-lg transition-all font-semibold"
          >
            Track Package
          </Link>
        </div>
      </header>

      {/* Features */}
      <section className="py-12 px-6 bg-white">
        <h2 className="text-3xl font-semibold text-center mb-10">Why Choose ShipFast</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Easy Shipping</h3>
            <p className="text-gray-600">Create shipments in minutes with our simple and intuitive interface.</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Real-Time Tracking</h3>
            <p className="text-gray-600">Get live updates and track your packages through every step of delivery.</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure & Reliable</h3>
            <p className="text-gray-600">Your packages are handled with care and delivered safely to their destination.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Shipment</h3>
              <p className="text-gray-600">Enter sender and receiver details, package information, and choose your delivery options.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Package Pickup</h3>
              <p className="text-gray-600">Schedule a pickup or drop off your package at one of our convenient locations.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Track & Deliver</h3>
              <p className="text-gray-600">Monitor your package in real-time and receive notifications when it's delivered.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Send Your First Package?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
          Join thousands of customers who trust ShipFast for their shipping needs. 
          Fast, reliable, and affordable shipping solutions.
        </p>
        <Link
          to="/auth"
          className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Start Shipping Today
        </Link>
      </section>
    </div>
  );
};

export default Home;