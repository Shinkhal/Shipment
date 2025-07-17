// src/admin/components/AdminSidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, LogOut, User, Menu, X } from 'lucide-react';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const navItemStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive 
        ? 'bg-accent text-primary shadow-sm' 
        : 'text-textSecondary hover:bg-accent/10 hover:text-primary'
    }`;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-surface rounded-xl shadow-card text-textPrimary hover:bg-accent/10 transition-all duration-200"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-surface border-r border-border shadow-card z-40 transition-transform duration-300 ease-in-out
          ${isMobile ? 'w-72' : 'w-64'}
          ${isOpen && isMobile ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0'}
          md:translate-x-0
        `}
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-primary">Admin Panel</h2>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          <NavLink 
            to="/admin/dashboard" 
            className={navItemStyle}
            onClick={closeSidebar}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>

          <NavLink 
            to="/admin/shipments" 
            className={navItemStyle}
            onClick={closeSidebar}
          >
            <Package className="w-5 h-5" />
            All Shipments
          </NavLink>

          <NavLink 
            to="/admin/users" 
            className={navItemStyle}
            onClick={closeSidebar}
          >
            <User className="w-5 h-5" />
            All Users
          </NavLink>

          <button
            onClick={() => {
              handleLogout();
              closeSidebar();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error/10 mt-6 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;