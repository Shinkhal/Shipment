import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShipment } from '../context/ShipmentContext';
import { useNavigate } from 'react-router-dom';
import { getShipmentHistory } from '../services/api';

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

  // Status colors matching backend status values
  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Processing': 'bg-blue-100 text-blue-800',
    'Shipped': 'bg-purple-100 text-purple-800',
    'In Transit': 'bg-indigo-100 text-indigo-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Returned': 'bg-gray-100 text-gray-800'
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

      console.log('Sending filters:', cleanFilters); // Debug log

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

  // Separate useEffect for page changes
  useEffect(() => {
    if (authLoading || !user) return;
    if (filters.page > 1) {
      fetchHistory();
    }
  }, [filters.page]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    // Debounce the API call for better UX
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

  // Show loading spinner only when initially loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to view your shipment history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shipment History</h1>
          <p className="text-gray-600 mt-1">View your completed shipments</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>📊</span>
            Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.status || filters.dateFrom || filters.dateTo) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-800 font-medium">Active Filters:</span>
            {filters.status && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Status: {filters.status}
              </span>
            )}
            {filters.dateFrom && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                From: {new Date(filters.dateFrom).toLocaleDateString()}
              </span>
            )}
            {filters.dateTo && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                To: {new Date(filters.dateTo).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-800 text-center">
            <h3 className="font-semibold">Error</h3>
            <p className="mt-1">{error}</p>
            <button 
              onClick={() => fetchHistory()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
          <span className="ml-3 text-gray-600">Loading shipment history...</span>
        </div>
      )}

      {/* No Data State */}
      {!loading && history.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No History Found</h3>
          <p className="text-gray-600">
            {filters.status || filters.dateFrom || filters.dateTo 
              ? 'No shipments match your current filters.' 
              : 'You haven\'t created any shipments yet.'}
          </p>
          {(filters.status || filters.dateFrom || filters.dateTo) && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Data Table */}
      {!loading && history.length > 0 && (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shipment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{shipment.id?.slice(-8) || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Tracking: {shipment.trackingId || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">From: {shipment.pickup?.city || 'Unknown'}</div>
                          <div className="text-gray-500 text-center">↓</div>
                          <div className="font-medium">To: {shipment.delivery?.city || 'Unknown'}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <div>Sender: {shipment.sender?.name || 'N/A'}</div>
                          <div>Receiver: {shipment.receiver?.name || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[shipment.status] || 'bg-gray-100 text-gray-800'
                        }`}>
                           {shipment.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>Weight: {shipment.package?.weight ? `${shipment.package.weight} kg` : 'N/A'}</div>
                          <div className="text-xs text-gray-500">
                            {shipment.package?.description ? 
                              (shipment.package.description.length > 30 ? 
                                shipment.package.description.substring(0, 30) + '...' : 
                                shipment.package.description) : 
                              'No description'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Created: {formatDate(shipment.createdAt)}</div>
                        {shipment.estimatedDelivery && (
                          <div>Est. Delivery: {formatDate(shipment.estimatedDelivery)}</div>
                        )}
                        {shipment.deliveredAt && (
                          <div className="font-medium text-green-600">
                            Completed: {formatDate(shipment.deliveredAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => {
                            setSelectedShipment(shipment);
                            navigate('/details');
                          }}
                        >
                          View Details
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
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1 || loading}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className={`px-3 py-2 text-sm rounded-md ${
                          page === pagination.currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === pagination.currentPage - 3 ||
                    page === pagination.currentPage + 3
                  ) {
                    return <span key={page} className="px-2 py-2 text-sm text-gray-500">...</span>;
                  }
                  return null;
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages || loading}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShipmentHistory;