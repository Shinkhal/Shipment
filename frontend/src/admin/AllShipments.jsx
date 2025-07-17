import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Package, Search, Filter, Edit, ArrowRight, Sparkles } from 'lucide-react';

import AdminLayout from './layout/AdminLayout';
import { fetchAllShipments } from '../services/AdminApi';
import { useShipment } from '../context/ShipmentContext';

const AllShipments = () => {
  const { shipments, setShipments, setSelectedShipment } = useShipment();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await fetchAllShipments();
        setShipments(res.data.shipments);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch shipments');
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, [setShipments]);

  const getStatusColor = (status) => {
    const colors = {
      'Delivered': 'bg-success/20 text-success border-success/30',
      'In Transit': 'bg-blue-500/20 text-blue-600 border-blue-500/30',
      'Processing': 'bg-accent/20 text-accent border-accent/30',
      'Cancelled': 'bg-error/20 text-error border-error/30',
      'Pending': 'bg-textSecondary/20 text-textSecondary border-textSecondary/30',
      'Returned': 'bg-purple-500/20 text-purple-600 border-purple-500/30'
    };
    return colors[status] || 'bg-textSecondary/20 text-textSecondary border-textSecondary/30';
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch = shipment.trackingId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const uniqueStatuses = [...new Set(shipments.map((s) => s.status))];

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
            <p className="text-textSecondary font-medium">Loading shipments...</p>
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
                      <Package className="w-8 h-8 text-accent" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                      <Sparkles className="w-2 h-2 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-primary tracking-tight">
                      All Shipments
                    </h1>
                  
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filters Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="backdrop-blur-xl bg-surface/60 border border-border/20 rounded-2xl p-6 mb-8 shadow-card">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-textSecondary w-5 h-5 transition-colors group-focus-within:text-accent" />
                  <input
                    type="text"
                    placeholder="Search by tracking ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 backdrop-blur-sm bg-surface/50 border border-border/30 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent/50 text-textPrimary placeholder-textSecondary transition-all duration-300 hover:bg-surface/70"
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="sm:w-56">
                <div className="relative group">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-textSecondary w-5 h-5 transition-colors group-focus-within:text-accent" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 backdrop-blur-sm bg-surface/50 border border-border/30 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent/50 text-textPrimary appearance-none transition-all duration-300 hover:bg-surface/70 cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <ArrowRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-textSecondary w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Modern Shipments Table */}
          <div className="backdrop-blur-xl bg-surface/60 border border-border/20 rounded-2xl overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="backdrop-blur-sm bg-primary/5 border-b border-border/20">
                  <tr>
                    <th className="px-8 py-6 text-left text-sm font-semibold text-primary tracking-wide">
                      Tracking ID
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-semibold text-primary tracking-wide">
                      Status
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-semibold text-primary tracking-wide">
                      Amount
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-semibold text-primary tracking-wide">
                      Created At
                    </th>
                    <th className="px-8 py-6 text-left text-sm font-semibold text-primary tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filteredShipments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-16 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-4 bg-textSecondary/10 backdrop-blur-sm rounded-2xl">
                            <Package className="w-16 h-16 text-textSecondary/50" />
                          </div>
                          <div>
                            <p className="text-xl font-semibold text-primary mb-2">
                              No shipments found
                            </p>
                            <p className="text-textSecondary">
                              Try adjusting your search or filter criteria
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredShipments.map((shipment, index) => (
                      <tr
                        key={shipment.id}
                        className="group hover:bg-surface/30 transition-all duration-300 backdrop-blur-sm"
                      >
                        <td className="px-8 py-6 font-semibold text-primary group-hover:text-accent transition-colors">
                          {shipment.trackingId}
                        </td>
                        <td className="px-8 py-6">
                          <span
                            className={`inline-flex px-4 py-2 rounded-xl text-sm font-medium border backdrop-blur-sm ${getStatusColor(shipment.status)}`}
                          >
                            {shipment.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-primary font-bold text-lg">
                          ₹{(shipment.payment?.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-8 py-6 text-textSecondary font-medium">
                          {new Date(
                            shipment.createdAt?._seconds * 1000 || shipment.createdAt
                          ).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-8 py-6">
                          <Link
                            to={`/admin/shipments/${shipment.id}/update`}
                            onClick={() => setSelectedShipment(shipment)}
                            className="group/button inline-flex items-center px-5 py-3 text-sm font-semibold text-accent bg-accent/10 backdrop-blur-sm border border-accent/20 rounded-xl hover:bg-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/25"
                          >
                            <Edit className="w-4 h-4 mr-2 transition-transform group-hover/button:scale-110" />
                            Update
                            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/button:translate-x-1" />
                          </Link>
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

export default AllShipments;