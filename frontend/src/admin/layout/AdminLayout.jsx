// src/admin/layout/AdminLayout.jsx
import React from 'react';
import AdminSidebar from '../components/Sidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-6 pt-20 md:pt-6 w-full min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;