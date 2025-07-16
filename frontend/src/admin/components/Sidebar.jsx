// src/admin/components/AdminSidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, LogOut, User } from 'lucide-react';

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const navItemStyle = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
      isActive ? 'bg-purple-100 text-purple-800' : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <aside className="h-screen w-64 bg-white border-r shadow-sm fixed top-0 left-0 z-10">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-purple-700">Admin Panel</h2>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        <NavLink to="/admin/dashboard" className={navItemStyle}>
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </NavLink>

        <NavLink to="/admin/shipments" className={navItemStyle}>
          <Package className="w-4 h-4" />
          All Shipments
        </NavLink>
        <NavLink to="/admin/users" className={navItemStyle}>
          <User className="w-4 h-4" />
          All Users
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 mt-4"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
