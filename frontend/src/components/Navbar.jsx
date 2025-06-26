import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Truck, Package, Menu, X, LogOut, ChevronDown,
  Home, History, MapPin, Plus, User
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Track Shipment', path: '/track', icon: MapPin },
  { name: 'New Shipment', path: '/new-shipment', icon: Plus },
  { name: 'Active Shipment', path: '/my-shipments', icon: Package },
  { name: 'History', path: '/history', icon: History },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const getInitials = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('') || 'U';

  const isActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      toast.success('Logged out successfully');
    }
  }, [logout]);

  if (loading) {
    return (
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <div className="animate-pulse flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-xl mr-3" />
            <div className="w-24 h-6 bg-gray-300 rounded" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ShipNest
            </span>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden lg:flex space-x-2">
              {navItems.map(({ name, path, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={clsx(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive(path)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-purple-600 hover:scale-105'
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Profile Menu */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-haspopup="true"
                    aria-expanded={isProfileOpen}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {getInitials(user?.name)}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {isProfileOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fade-in-down"
                    >
                      <div className="px-4 py-2 border-b text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/profile');
                        }}
                        role="menuitem"
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        role="menuitem"
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="lg:hidden p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-lg"
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && user && (
          <div
            ref={mobileMenuRef}
            className="lg:hidden border-t border-gray-200 py-4 animate-slide-down"
            role="menu"
          >
            <div className="space-y-1">
              {navItems.map(({ name, path, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => {
                    navigate(path);
                    setIsMenuOpen(false);
                  }}
                  role="menuitem"
                  className={clsx(
                    'w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg',
                    isActive(path)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
