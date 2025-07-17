import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShipment } from '../context/ShipmentContext';
import { useNavigate } from 'react-router-dom';
import { getShipmentHistory } from '../services/api';
import Loader from '../components/Loader';

const ShipmentHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const { setSelectedShipment } = useShipment();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  // Luxury status colors using custom color palette
  const statusColors = {
    'Pending': 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-200',
    'Processing': 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200',
    'Shipped': 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border border-purple-200',
    'In Transit': 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-800 border border-indigo-200',
    'Delivered': 'bg-gradient-to-r from-success/10 to-success/20 text-success border border-success/20',
    'Cancelled': 'bg-gradient-to-r from-error/10 to-error/20 text-error border border-error/20',
    'Returned': 'bg-gradient-to-r from-textSecondary/10 to-textSecondary/20 text-textSecondary border border-textSecondary/20'
  };

  const fetchHistory = async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('Shipmenttoken');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Create filters object with only non-empty values
      const cleanFilters = {};
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          cleanFilters[key] = value;
        }
      });

      console.log('Sending filters:', cleanFilters);

      const response = await getShipmentHistory(cleanFilters, token);

      if (response.data && response.data.shipments) {
        setHistory(response.data.shipments);
        setPagination(response.data.pagination || {});
      } else {
        setHistory([]);
        setPagination({});
      }
    } catch (err) {
      console.error('Error fetching shipment history:', err);
      
      let errorMessage = 'Something went wrong while fetching your shipment history.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. You don\'t have permission to view this data.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setHistory([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchHistory();
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (filters.page > 1) {
      fetchHistory();
    }
  }, [filters.page]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    setTimeout(() => {
      fetchHistory(newFilters);
    }, 300);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      page: 1,
      limit: 10,
      status: '',
      dateFrom: '',
      dateTo: ''
    };
    setFilters(clearedFilters);
    fetchHistory(clearedFilters);
  };

  const exportToCSV = () => {
    if (history.length === 0) {
      alert('No data to export');
      return;
    }

    const csvContent = [
      ['Shipment ID', 'Tracking ID', 'Status', 'Sender', 'Receiver', 'Weight', 'Pickup City', 'Delivery City', 'Created At', 'Delivered At'].join(','),
      ...history.map(shipment => [
        `"${shipment.id || 'N/A'}"`,
        `"${shipment.trackingId || 'N/A'}"`,
        `"${shipment.status || 'N/A'}"`,
        `"${shipment.sender?.name || 'N/A'}"`,
        `"${shipment.receiver?.name || 'N/A'}"`,
        `"${shipment.package?.weight || 'N/A'}"`,
        `"${shipment.pickup?.city || 'N/A'}"`,
        `"${shipment.delivery?.city || 'N/A'}"`,
        `"${shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString() : 'N/A'}"`,
        `"${shipment.deliveredAt ? new Date(shipment.deliveredAt).toLocaleDateString() : 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `shipment-history-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Loading state with luxury design
  if (authLoading) {
    return (
      <Loader/>
    );
  }

  // Authentication required state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex justify-center items-center">
        <div className="text-center bg-surface p-12 rounded-2xl shadow-card border border-border">
          <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔐</span>
          </div>
          <h3 className="text-2xl font-bold text-textPrimary mb-3">Authentication Required</h3>
          <p className="text-textSecondary text-lg">Please log in to access your shipment history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-textPrimary to-textSecondary bg-clip-text text-transparent mb-2">
              Shipment History
            </h1>
            <p className="text-textSecondary text-lg font-medium">Track your logistics journey</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={exportToCSV}
              className="group relative px-6 py-3 bg-gradient-to-r from-success to-success/80 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📊</span>
                <span>Export CSV</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-success/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-surface/80 backdrop-blur-sm border border-border rounded-2xl p-6 mb-8 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-textPrimary">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-3 border border-border rounded-xl bg-surface text-textPrimary focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-textPrimary">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full p-3 border border-border rounded-xl bg-surface text-textPrimary focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-textPrimary">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full p-3 border border-border rounded-xl bg-surface text-textPrimary focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-3 bg-gradient-to-r from-textSecondary/10 to-textSecondary/5 text-textSecondary rounded-xl font-medium hover:from-textSecondary/20 hover:to-textSecondary/10 transition-all duration-200 border border-border"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.status || filters.dateFrom || filters.dateTo) && (
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-xl p-4 mb-8">
            <div className="flex items-center flex-wrap gap-3 text-sm">
              <span className="text-textPrimary font-semibold">Active Filters:</span>
              {filters.status && (
                <span className="bg-accent/20 text-accent px-3 py-1 rounded-lg font-medium">
                  Status: {filters.status}
                </span>
              )}
              {filters.dateFrom && (
                <span className="bg-accent/20 text-accent px-3 py-1 rounded-lg font-medium">
                  From: {new Date(filters.dateFrom).toLocaleDateString()}
                </span>
              )}
              {filters.dateTo && (
                <span className="bg-accent/20 text-accent px-3 py-1 rounded-lg font-medium">
                  To: {new Date(filters.dateTo).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-error/10 to-error/5 border border-error/20 rounded-xl p-6 mb-8">
            <div className="text-error text-center">
              <h3 className="font-bold text-lg mb-2">Something went wrong</h3>
              <p className="mb-4">{error}</p>
              <button 
                onClick={() => fetchHistory()}
                className="px-6 py-2 bg-error text-white rounded-xl font-medium hover:bg-error/90 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Loader />
        )}

        {/* No Data State */}
        {!loading && history.length === 0 && !error && (
          <div className="text-center py-20 bg-surface/50 rounded-2xl border border-border shadow-card">
            <div className="w-24 h-24 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-2xl font-bold text-textPrimary mb-3">No History Found</h3>
            <p className="text-textSecondary text-lg mb-6">
              {filters.status || filters.dateFrom || filters.dateTo 
                ? 'No shipments match your current filters.' 
                : 'You haven\'t created any shipments yet.'}
            </p>
            {(filters.status || filters.dateFrom || filters.dateTo) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-accent to-accent/80 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Data Table */}
        {!loading && history.length > 0 && (
          <>
            <div className="bg-surface/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-gradient-to-r from-primary/5 to-primary/10">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-bold text-textPrimary uppercase tracking-wider">
                        Shipment Details
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-textPrimary uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-textPrimary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-textPrimary uppercase tracking-wider">
                        Package Info
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-textPrimary uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-textPrimary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface/50 divide-y divide-border">
                    {history.map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-gradient-to-r hover:from-accent/5 hover:to-transparent transition-all duration-200">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-bold text-textPrimary">
                              #{shipment.id?.slice(-8) || 'N/A'}
                            </div>
                            <div className="text-sm text-textSecondary font-medium">
                              {shipment.trackingId || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm text-textPrimary">
                            <div className="font-semibold mb-1">📍 {shipment.pickup?.city || 'Unknown'}</div>
                            <div className="text-accent text-center text-lg">↓</div>
                            <div className="font-semibold mb-2">🎯 {shipment.delivery?.city || 'Unknown'}</div>
                          </div>
                          <div className="text-xs text-textSecondary space-y-1">
                            <div>From: {shipment.sender?.name || 'N/A'}</div>
                            <div>To: {shipment.receiver?.name || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold ${
                            statusColors[shipment.status] || 'bg-gradient-to-r from-textSecondary/10 to-textSecondary/5 text-textSecondary border border-textSecondary/20'
                          }`}>
                             {shipment.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm text-textPrimary">
                          <div className="space-y-1">
                            <div className="font-semibold">⚖️ {shipment.package?.weight ? `${shipment.package.weight} kg` : 'N/A'}</div>
                            <div className="text-xs text-textSecondary">
                              {shipment.package?.description ? 
                                (shipment.package.description.length > 30 ? 
                                  shipment.package.description.substring(0, 30) + '...' : 
                                  shipment.package.description) : 
                                'No description'}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm text-textSecondary">
                          <div className="space-y-1">
                            <div>📅 {formatDate(shipment.createdAt)}</div>
                            {shipment.estimatedDelivery && (
                              <div>📍 {formatDate(shipment.estimatedDelivery)}</div>
                            )}
                            {shipment.deliveredAt && (
                              <div className="font-semibold text-success">
                                ✅ {formatDate(shipment.deliveredAt)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm">
                          <button 
                            className="group relative px-4 py-2 bg-gradient-to-r from-accent/10 to-accent/5 text-accent rounded-lg font-medium hover:from-accent/20 hover:to-accent/10 transition-all duration-200 border border-accent/20"
                            onClick={() => {
                              setSelectedShipment(shipment);
                              navigate('/details');
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <span>👁️</span>
                              View Details
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 bg-surface/50 rounded-xl p-6 border border-border">
                <div className="text-sm text-textSecondary font-medium">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1 || loading}
                    className="px-4 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-accent/10 hover:border-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                            page === pagination.currentPage
                              ? 'bg-gradient-to-r from-accent to-accent/80 text-white shadow-lg'
                              : 'bg-surface border border-border hover:bg-accent/10 hover:border-accent/20'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === pagination.currentPage - 3 ||
                      page === pagination.currentPage + 3
                    ) {
                      return <span key={page} className="px-2 py-2 text-sm text-textSecondary">...</span>;
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages || loading}
                    className="px-4 py-2 text-sm bg-surface border border-border rounded-lg hover:bg-accent/10 hover:border-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShipmentHistory;