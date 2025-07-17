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
      <nav className="bg-surface/80 backdrop-blur-xl border-b border-accent/20 sticky top-0 z-50 shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <div className="animate-pulse flex items-center">
            <div className="w-10 h-10 bg-accent/20 rounded-xl mr-3" />
            <div className="w-24 h-6 bg-accent/20 rounded-lg" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-surface/80 backdrop-blur-xl border-b border-accent/20 sticky top-0 z-50 shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer hover:scale-105 transition-all duration-300 group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300 border border-accent/20">
              <Truck className="w-6 h-6 text-accent drop-shadow-sm" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">
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
                    'flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden',
                    isActive(path)
                      ? 'bg-primary text-accent shadow-lg hover:shadow-xl transform hover:scale-105 border border-accent/20'
                      : 'text-textPrimary hover:bg-accent/10 backdrop-blur-sm border border-transparent hover:border-accent/20 hover:scale-105'
                  )}
                >
                  <Icon className={clsx(
                    'w-4 h-4 mr-2 transition-all duration-300',
                    isActive(path) ? 'text-accent drop-shadow-sm' : ''
                  )} />
                  {name}
                  {isActive(path) && (
                    <div className="absolute inset-0 bg-accent/10 opacity-30 rounded-xl" />
                  )}
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
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-accent/10 transition-all duration-300 group border border-transparent hover:border-accent/20 backdrop-blur-sm"
                    aria-haspopup="true"
                    aria-expanded={isProfileOpen}
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-accent text-sm font-medium shadow-lg border border-accent/20">
                      {getInitials(user?.name)}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-textPrimary transition-colors">
                      {user?.name || 'User'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-textSecondary transition-all duration-300" />
                  </button>

                  {isProfileOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-56 bg-surface/95 backdrop-blur-xl rounded-2xl shadow-card border border-accent/20 py-2 z-50 animate-fade-in-down"
                    >
                      <div className="px-4 py-3 border-b border-accent/20 text-sm font-medium text-textPrimary bg-accent/5">
                        {user?.name || 'User'}
                      </div>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/profile');
                        }}
                        role="menuitem"
                        className="w-full flex items-center px-4 py-3 text-sm text-textPrimary hover:bg-accent/10 transition-all duration-300 group"
                      >
                        <User className="w-4 h-4 mr-3 text-textSecondary transition-colors" />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        role="menuitem"
                        className="w-full flex items-center px-4 py-3 text-sm text-error hover:bg-error/10 transition-all duration-300 group"
                      >
                        <LogOut className="w-4 h-4 mr-3 text-error/80 transition-colors" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className="lg:hidden p-2.5 text-textSecondary hover:text-accent hover:bg-accent/10 rounded-xl transition-all duration-300 border border-transparent hover:border-accent/20 backdrop-blur-sm"
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/auth')}
                  className="px-5 py-2.5 text-sm font-medium text-textPrimary transition-all duration-300 rounded-xl hover:bg-accent/10 border border-transparent hover:border-accent/20 backdrop-blur-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-5 py-2.5 text-sm font-medium text-accent bg-primary rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-accent/20 backdrop-blur-sm relative overflow-hidden group"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && user && (
          <div
            ref={mobileMenuRef}
            className="lg:hidden border-t border-accent/20 py-4 animate-slide-down bg-surface/50 backdrop-blur-xl"
            role="menu"
          >
            <div className="space-y-2">
              {navItems.map(({ name, path, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => {
                    navigate(path);
                    setIsMenuOpen(false);
                  }}
                  role="menuitem"
                  className={clsx(
                    'w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden group',
                    isActive(path)
                      ? 'bg-primary text-accent shadow-lg border border-accent/20'
                      : 'text-textPrimary hover:bg-accent/10 border border-transparent hover:border-accent/20'
                  )}
                >
                  <Icon className={clsx(
                    'w-5 h-5 mr-3 transition-all duration-300',
                    isActive(path) ? 'text-accent drop-shadow-sm' : 'text-textSecondary'
                  )} />
                  {name}
                  {isActive(path) && (
                    <div className="absolute inset-0 bg-accent/10 opacity-30 rounded-xl" />
                  )}
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