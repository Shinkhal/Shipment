import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getActiveShipments, cancelShipment, refundShipment } from '../services/api';
import { useShipment } from '../context/ShipmentContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

const ActiveShipments = () => {
  const { user, loading: authLoading } = useAuth();
  const {setSelectedShipment} = useShipment();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const statusConfig = {
    pending: { 
      bg: 'bg-accent/10 backdrop-blur-sm', 
      text: 'text-accent', 
      icon: '⏳', 
      badge: 'bg-accent/20 text-accent border-accent/30 backdrop-blur-sm',
      progress: 'bg-accent/20 backdrop-blur-sm',
      progressFill: 'bg-accent'
    },
    processing: { 
      bg: 'bg-primary/10 backdrop-blur-sm', 
      text: 'text-primary', 
      icon: '⚙️', 
      badge: 'bg-primary/20 text-primary border-primary/30 backdrop-blur-sm',
      progress: 'bg-primary/20 backdrop-blur-sm',
      progressFill: 'bg-primary'
    },
    shipped: { 
      bg: 'bg-success/10 backdrop-blur-sm', 
      text: 'text-success', 
      icon: '📦', 
      badge: 'bg-success/20 text-success border-success/30 backdrop-blur-sm',
      progress: 'bg-success/20 backdrop-blur-sm',
      progressFill: 'bg-success'
    },
    in_transit: { 
      bg: 'bg-success/15 backdrop-blur-sm', 
      text: 'text-success', 
      icon: '🚚', 
      badge: 'bg-success/25 text-success border-success/40 backdrop-blur-sm',
      progress: 'bg-success/25 backdrop-blur-sm',
      progressFill: 'bg-success'
    }
  };

  const getProgressPercentage = (status) => {
    const progressMap = {
      pending: 25,
      processing: 50,
      shipped: 75,
      in_transit: 90
    };
    const key = status?.toLowerCase().replace(/\s+/g, '_');
    return progressMap[key] || 0;
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
      
        <Loader />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Ambient background elements */}
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-error/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex justify-center items-center min-h-screen p-6">
          <div className="max-w-md w-full bg-surface/80 backdrop-blur-xl border border-surface/50 rounded-2xl p-12 shadow-card">
            <div className="text-center">
              <div className="text-6xl mb-6 opacity-60">⚠️</div>
              <h3 className="text-xl font-bold text-error mb-4">Something went wrong</h3>
              <p className="text-textSecondary leading-relaxed mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-primary/90 hover:bg-primary text-surface px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute inset-0 bg-primary/5"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-success/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          
          <h1 className="text-5xl font-bold text-textPrimary mb-4 tracking-tight">
            Active Shipments
          </h1>
          <p className="text-textSecondary text-lg max-w-2xl mx-auto font-medium">
            Track your packages in real-time with our premium logistics platform
          </p>
        </div>

        {shipments.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-surface/80 backdrop-blur-xl border border-surface/50 rounded-2xl mb-8 shadow-card">
              <span className="text-6xl opacity-60">📦</span>
            </div>
            <h3 className="text-2xl font-bold text-textPrimary mb-4">No Active Shipments</h3>
            <p className="text-textSecondary text-lg max-w-md mx-auto mb-8 font-medium">
              All your packages have been successfully delivered. Ready to ship something new?
            </p>
            <button className="bg-primary/90 hover:bg-primary text-surface px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-card hover:shadow-lg backdrop-blur-sm">
              Create New Shipment
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {shipments.map((shipment) => {
              const daysUntilDelivery = getDaysUntilDelivery(shipment.estimatedDelivery);
              const rawStatus = shipment.status || 'pending';
              const statusKey = rawStatus.toLowerCase().replace(/\s+/g, '_');
              const statusStyle = statusConfig[statusKey] || statusConfig['pending'];
              const progress = getProgressPercentage(rawStatus);

              return (
                <div key={shipment.id} className="group">
                  <div className="bg-surface/80 backdrop-blur-xl border border-surface/50 rounded-2xl overflow-hidden hover:shadow-card transition-all duration-500 hover:scale-[1.02] shadow-lg">
                    {/* Status Header */}
                    <div className={`${statusStyle.bg} p-6 border-b border-surface/30`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{statusStyle.icon}</div>
                          <div>
                            <h3 className="font-bold text-textPrimary text-xl tracking-tight">
                              #{shipment.id.slice(-8)}
                            </h3>
                            <p className="text-sm text-textSecondary font-medium mt-1">
                              Shipment ID
                            </p>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-xs font-bold border ${statusStyle.badge}`}>
                          {shipment.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Progress Bar */}
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-textSecondary">Progress</span>
                          <span className="text-sm font-bold text-textPrimary">{progress}%</span>
                        </div>
                        <div className={`w-full h-3 ${statusStyle.progress} rounded-full overflow-hidden`}>
                          <div 
                            className={`h-full ${statusStyle.progressFill} rounded-full transition-all duration-700 ease-out`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Route Info */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 text-center">
                            <div className="w-4 h-4 bg-primary rounded-full mx-auto mb-3"></div>
                            <p className="text-xs font-bold text-textSecondary mb-1 tracking-wider">FROM</p>
                            <p className="text-sm font-bold text-textPrimary truncate">
                              {shipment.pickup.city || 'Unknown'}
                            </p>
                          </div>
                          <div className="flex-1 px-6">
                            <div className="border-t-2 border-dashed border-textSecondary/30 relative">
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="text-lg bg-surface rounded-full p-1">✈️</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 text-center">
                            <div className="w-4 h-4 bg-success rounded-full mx-auto mb-3"></div>
                            <p className="text-xs font-bold text-textSecondary mb-1 tracking-wider">TO</p>
                            <p className="text-sm font-bold text-textPrimary truncate">
                              {shipment.delivery.city || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Shipment Details */}
                      <div className="space-y-6 mb-8">
                        <div className="bg-surface/60 backdrop-blur-sm rounded-xl p-5 border border-surface/30">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-bold text-textSecondary mb-2 tracking-wider">SENDER</p>
                              <p className="text-sm font-semibold text-textPrimary truncate">
                                {shipment.senderName || 'Unknown'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-textSecondary mb-2 tracking-wider">RECEIVER</p>
                              <p className="text-sm font-semibold text-textPrimary truncate">
                                {shipment.receiverName || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20">
                            <p className="text-xs font-bold text-primary mb-2 tracking-wider">WEIGHT</p>
                            <p className="text-lg font-bold text-primary">
                              {shipment.weight || 'N/A'} <span className="text-sm font-medium">kg</span>
                            </p>
                          </div>
                          <div className="text-center p-4 bg-accent/10 backdrop-blur-sm rounded-xl border border-accent/20">
                            <p className="text-xs font-bold text-accent mb-2 tracking-wider">DELIVERY</p>
                            <p className={`text-lg font-bold ${
                              daysUntilDelivery <= 1 ? 'text-error' : 
                              daysUntilDelivery <= 3 ? 'text-accent' : 'text-success'
                            }`}>
                              {daysUntilDelivery > 0 ? `${daysUntilDelivery}d` : 'Due'}
                            </p>
                          </div>
                        </div>
                      </div>

                      

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        {['pending', 'processing'].includes(shipment.status?.toLowerCase()) ? (
                          <button
                            onClick={() => handleCancelShipment(shipment)}
                            className="flex-1 px-5 py-3 text-sm font-semibold bg-error/10 text-error rounded-xl hover:bg-error/20 transition-all duration-300 border border-error/30 backdrop-blur-sm"
                          >
                            Cancel Shipment
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 px-5 py-3 text-sm font-semibold bg-surface/40 text-textSecondary rounded-xl cursor-not-allowed border border-surface/30 backdrop-blur-sm"
                          >
                            Cannot Cancel
                          </button>
                        )}

                        <button 
                          onClick={() => handleDetailsClick(shipment)} 
                          className="flex-1 px-5 py-3 text-sm font-semibold bg-primary/90 hover:bg-primary text-surface rounded-xl transition-all duration-300 shadow-card hover:shadow-lg backdrop-blur-sm"
                        >
                          View Details
                        </button>
                      </div>
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