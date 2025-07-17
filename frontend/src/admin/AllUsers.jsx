import React, { useEffect, useState } from 'react';
import { Users, Search, UserCheck, Mail, Phone, Package, Crown } from 'lucide-react';
import { toast } from 'react-toastify';

import AdminLayout from './layout/AdminLayout';
import { fetchAllUsersWithShipments } from '../services/AdminApi';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetchAllUsersWithShipments();
        setUsers(res.data.users || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    return (
      user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          {/* Glassmorphism loading card */}
          <div className="backdrop-blur-xl bg-surface/30 border border-border/20 rounded-2xl p-8 shadow-card">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-2 border-accent/20 border-t-accent mx-auto mb-6"></div>
              <div className="absolute inset-0 rounded-full bg-accent/5 blur-sm"></div>
            </div>
            <p className="text-textSecondary font-medium">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Modern Header with Glassmorphism */}
        <div className="relative">
          {/* Background blur overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm"></div>
          
          <div className="relative backdrop-blur-xl bg-surface/80 border-b border-border/20 shadow-card">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="flex items-center justify-between py-8">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="p-3 bg-accent/10 backdrop-blur-sm rounded-2xl border border-accent/20">
                      <Users className="w-8 h-8 text-accent" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                      <Crown className="w-2 h-2 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-primary tracking-tight">
                      All Users
                    </h1>
                    
                  </div>
                </div>
                
               
              </div>
            </div>
          </div>
        </div>

        {/* Modern Search Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="backdrop-blur-xl bg-surface/60 border border-border/20 rounded-2xl p-6 mb-8 shadow-card">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-textSecondary w-5 h-5 transition-colors group-focus-within:text-accent" />
              <input
                type="text"
                placeholder="Search by name, email, or UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 backdrop-blur-sm bg-surface/50 border border-border/30 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent/50 text-textPrimary placeholder-textSecondary transition-all duration-300 hover:bg-surface/70"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
               
              </div>
            </div>
          </div>

          {/* Modern Users Table */}
          <div className="backdrop-blur-xl bg-surface/60 border border-border/20 rounded-2xl overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="backdrop-blur-sm bg-primary/5 border-b border-border/20">
                  <tr>
                    <th className="px-8 py-6 text-left text-sm font-semibold text-primary tracking-wide">
                      User ID
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-semibold text-primary tracking-wide">
                      Name
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-semibold text-primary tracking-wide">
                      Email
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-semibold text-primary tracking-wide">
                      Phone
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-semibold text-primary tracking-wide">
                      Shipments
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-16 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-4 bg-textSecondary/10 backdrop-blur-sm rounded-2xl">
                            <Users className="w-16 h-16 text-textSecondary/50" />
                          </div>
                          <div>
                            <p className="text-xl font-semibold text-primary mb-2">
                              No users found
                            </p>
                            <p className="text-textSecondary">
                              Try another search term
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <tr
                        key={user.userId}
                        className="group hover:bg-surface/30 transition-all duration-300 backdrop-blur-sm"
                      >
                        <td className="px-8 py-6">
                          <div className="font-mono text-sm text-textSecondary bg-background/50 backdrop-blur-sm rounded-lg px-3 py-1 border border-border/20 inline-block">
                            {user.userId}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-accent/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-accent/20">
                              <UserCheck className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <p className="font-semibold text-primary group-hover:text-accent transition-colors">
                                {user.name || '—'}
                              </p>
                              <p className="text-xs text-textSecondary">
                                {user.shipmentCount > 0 ? 'Active user' : 'New user'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-textSecondary" />
                            <span className="text-textSecondary font-medium">
                              {user.email || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-textSecondary" />
                            <span className="text-textSecondary font-medium">
                              {user.phone || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-accent" />
                            <span className="text-accent font-bold text-lg">
                              {user.shipmentCount}
                            </span>
                            {user.shipmentCount > 10 && (
                              <div className="px-2 py-1 bg-accent/20 backdrop-blur-sm rounded-full border border-accent/30">
                                <Crown className="w-3 h-3 text-accent" />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AllUsers;