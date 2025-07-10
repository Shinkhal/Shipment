import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getActiveShipments, cancelShipment, refundShipment } from '../services/api';
import { useShipment } from '../context/ShipmentContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ActiveShipments = () => {
  const { user, loading: authLoading } = useAuth();
  const {setSelectedShipment} = useShipment();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const statusConfig = {
    Pending: { 
      bg: 'bg-gradient-to-r from-orange-50 to-yellow-50', 
      text: 'text-orange-700', 
      icon: '⏳', 
      badge: 'bg-orange-100 text-orange-700 border-orange-200',
      progress: 'bg-orange-200',
      progressFill: 'bg-orange-500'
    },
    Processing: { 
      bg: 'bg-gradient-to-r from-blue-50 to-indigo-50', 
      text: 'text-blue-700', 
      icon: '⚙️', 
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
      progress: 'bg-blue-200',
      progressFill: 'bg-blue-500'
    },
    Shipped: { 
      bg: 'bg-gradient-to-r from-purple-50 to-pink-50', 
      text: 'text-purple-700', 
      icon: '📦', 
      badge: 'bg-purple-100 text-purple-700 border-purple-200',
      progress: 'bg-purple-200',
      progressFill: 'bg-purple-500'
    },
    in_transit: { 
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50', 
      text: 'text-green-700', 
      icon: '🚚', 
      badge: 'bg-green-100 text-green-700 border-green-200',
      progress: 'bg-green-200',
      progressFill: 'bg-green-500'
    }
  };

  const getProgressPercentage = (status) => {
    const progressMap = {
      pending: 25,
      processing: 50,
      shipped: 75,
      in_transit: 90
    };
    return progressMap[status] || 0;
  };

  useEffect(() => {
    const fetchActiveShipments = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('Shipmenttoken');
        if (!token) {
          throw new Error('Authentication required. Please log in again.');
        }

        const response = await getActiveShipments(token);
        setShipments(response.data || []);
      } catch (err) {
        console.error('Error fetching active shipments:', err);
        
        let errorMessage = 'Something went wrong while fetching active shipments.';
        
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
        setShipments([]);
      } finally {
        setLoading(false);
      }
    };
    if (authLoading || !user) return;
    fetchActiveShipments();
  }, [authLoading, user]);

  const handleDetailsClick = (shipment) => {
    setSelectedShipment(shipment);
    navigate('/details');
  };

  const handleCancelShipment = async (shipment) => {
    const confirm = window.confirm("Are you sure you want to cancel this shipment?");
    if (!confirm) return;

    const token = localStorage.getItem('Shipmenttoken');

    try {
      await cancelShipment(shipment.id, token);

      let refundData = null;

      if (shipment.payment?.status === "Paid") {
        const refundRes = await refundShipment(shipment.id, token);
        refundData = refundRes.data.refund;
      }

      navigate('/cancellation-success', {
        state: {
          shipmentId: shipment.id,
          wasPaid: shipment.payment?.status === "Paid",
          refundAmount: refundData?.amount / 100 || 0,
          refundId: refundData?.id || '',
          refundedAt: refundData?.created_at ? new Date(refundData.created_at * 1000).toISOString() : new Date().toISOString(),
        }
      });
    } catch (err) {
      console.error("Cancellation/refund failed:", err);
      toast.error("Failed to cancel shipment");
    }
  };

  const getDaysUntilDelivery = (estimatedDelivery) => {
    const deliveryDate = new Date(estimatedDelivery);
    const today = new Date();
    const diffTime = deliveryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your shipments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-red-100 p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-700 mb-2">Oops! Something went wrong</h3>
            <p className="text-red-600 leading-relaxed">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Your Active Shipments
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Track your packages in real-time and stay updated on delivery progress
          </p>
        </div>

        {shipments.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-8">
              <span className="text-6xl">📦</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Active Shipments</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
              All your packages have been successfully delivered! Ready to ship something new?
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              Create New Shipment
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {shipments.map((shipment) => {
              const daysUntilDelivery = getDaysUntilDelivery(shipment.estimatedDelivery);
              const statusStyle = statusConfig[shipment.status] || statusConfig.pending;
              const progress = getProgressPercentage(shipment.status);
              
              return (
                <div key={shipment.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  {/* Status Header */}
                  <div className={`${statusStyle.bg} p-4 border-b border-gray-100`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{statusStyle.icon}</div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            #{shipment.id.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Shipment ID
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.badge}`}>
                        {shipment.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Progress Bar */}
                    <div className="mb-6">
                      
                      <div className={`w-full h-2 ${statusStyle.progress} rounded-full overflow-hidden`}>
                        <div 
                          className={`h-full ${statusStyle.progressFill} rounded-full transition-all duration-500`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Route Info */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 text-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                          <p className="text-xs font-medium text-gray-600">FROM</p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {shipment.pickup.city || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex-1 px-4">
                          <div className="border-t-2 border-dashed border-gray-300 relative">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              <div className="text-lg">✈️</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                          <p className="text-xs font-medium text-gray-600">TO</p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {shipment.delivery.city || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Shipment Details */}
                    <div className="space-y-4 mb-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">SENDER</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {shipment.senderName || 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">RECEIVER</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {shipment.receiverName || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <p className="text-xs font-medium text-blue-600 mb-1">WEIGHT</p>
                          <p className="text-lg font-bold text-blue-800">
                            {shipment.weight || 'N/A'} <span className="text-sm">kg</span>
                          </p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-xl">
                          <p className="text-xs font-medium text-purple-600 mb-1">DELIVERY</p>
                          <p className={`text-lg font-bold ${
                            daysUntilDelivery <= 1 ? 'text-red-600' : 
                            daysUntilDelivery <= 3 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {daysUntilDelivery > 0 ? `${daysUntilDelivery}d` : 'Due'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <div>
                          <p className="font-medium">Created</p>
                          <p>{new Date(shipment.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Expected</p>
                          <p>{new Date(shipment.estimatedDelivery).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {['pending', 'processing'].includes(shipment.status?.toLowerCase()) ? (
                        <button
                          onClick={() => handleCancelShipment(shipment)}
                          className="flex-1 px-4 py-3 text-sm font-semibold bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 border border-red-200 hover:border-red-300"
                        >
                          Cancel Shipment
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 px-4 py-3 text-sm font-semibold bg-gray-100 text-gray-400 rounded-xl cursor-not-allowed border border-gray-200"
                        >
                          Cannot Cancel
                        </button>
                      )}

                      <button 
                        onClick={() => handleDetailsClick(shipment)} 
                        className="flex-1 px-4 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveShipments;