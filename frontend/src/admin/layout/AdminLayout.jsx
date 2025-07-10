// src/admin/layout/AdminLayout.jsx
import React from 'react';
import AdminSidebar from '../components/Sidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-64 p-6 w-full min-h-screen bg-neutral-50">{children}</main>
    </div>
  );
};

export default AdminLayout;
