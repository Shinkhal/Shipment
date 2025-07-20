import React, { useState } from 'react';
import { Search, Package, MapPin, Clock, User, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { getShipmentByTrackingId } from '../services/api';

const statusConfig = {
  pending: { 
    color: 'bg-accent/10 text-accent border-accent/20', 
    icon: Clock,
    progress: 20,
    bgColor: 'bg-accent/20'
  },
  processing: { 
    color: 'bg-primary/10 text-primary border-primary/20', 
    icon: Package,
    progress: 40,
    bgColor: 'bg-primary/20'
  },
  shipped: { 
    color: 'bg-primary/10 text-primary border-primary/20', 
    icon: Package,
    progress: 60,
    bgColor: 'bg-primary/20'
  },
  in_transit: { 
    color: 'bg-primary/15 text-primary border-primary/25', 
    icon: Truck,
    progress: 80,
    bgColor: 'bg-primary/25'
  },
  delivered: { 
    color: 'bg-success/10 text-success border-success/20', 
    icon: CheckCircle,
    progress: 100,
    bgColor: 'bg-success/20'
  },
  returned: {
    color: 'bg-accent/10 text-accent border-accent/20',
    icon: AlertCircle,
    progress: 100,
    bgColor: 'bg-accent/20'
  },
  cancelled: {
    color: 'bg-error/10 text-error border-error/20',
    icon: AlertCircle,
    progress: 0,
    bgColor: 'bg-error/20'
  }
};

const TrackShipment = () => {
  const [trackingId, setTrackingId] = useState('');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleTrack = async () => {
    setShipment(null);
    setError('');
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID.');
      return;
    }

    try {
      setLoading(true);
      const res = await getShipmentByTrackingId(trackingId);
      setShipment(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Shipment not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTrack();
    }
  };

  const status = shipment?.status?.toLowerCase();
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
      <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="relative z-10 py-6 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-5xl font-light text-primary mb-4 tracking-tight">
              Track Your Shipment
            </h1>
            <p className="text-textSecondary text-lg sm:text-xl font-light">Monitor your package journey in real-time</p>
          </div>

          {/* Search Section */}
          <div className="bg-surface/70 backdrop-blur-xl rounded-2xl p-4 sm:p-8 shadow-card border border-surface/50 mb-6 sm:mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl"></div>
            <div className="relative flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 text-textSecondary w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter tracking ID"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 sm:pl-14 pr-4 sm:pr-5 py-4 sm:py-5 bg-surface/80 backdrop-blur-sm border border-border/50 rounded-xl text-textPrimary placeholder-textSecondary focus:border-primary/50 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all duration-300 text-base sm:text-lg"
                />
              </div>
              <button
                onClick={handleTrack}
                disabled={loading}
                className="px-6 sm:px-10 py-4 sm:py-5 bg-primary text-surface rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl min-w-[140px] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-accent/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <div className="relative text-sm sm:text-base">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin"></div>
                      Tracking
                    </div>
                  ) : (
                    'Track Package'
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-error/10 backdrop-blur-sm border border-error/20 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-error flex-shrink-0" />
              <p className="text-error font-medium text-base sm:text-lg">{error}</p>
            </div>
          )}

          {/* Shipment Details */}
          {shipment && (
            <div className="space-y-6 sm:space-y-8">
              {/* Status Header */}
              <div className="bg-surface/70 backdrop-blur-xl rounded-2xl p-6 sm:p-10 shadow-card border border-surface/50 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl"></div>
                <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className={`p-3 sm:p-4 rounded-2xl ${config.bgColor} shadow-lg backdrop-blur-sm`}>
                      <StatusIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-3xl font-light text-primary mb-2 sm:mb-3 tracking-wide break-all">
                        {shipment.trackingId}
                      </h2>
                      <span className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium border backdrop-blur-sm ${config.color}`}>
                        {shipment.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full lg:w-80">
                    <div className="flex justify-between text-sm sm:text-base text-textSecondary mb-2 sm:mb-3">
                      <span>Progress</span>
                      <span className="font-medium text-primary">{config.progress}%</span>
                    </div>
                    <div className="w-full bg-border/50 rounded-full h-2 sm:h-3 backdrop-blur-sm">
                      <div 
                        className="h-2 sm:h-3 bg-primary rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{ width: `${config.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route */}
              <div className="bg-surface/70 backdrop-blur-xl rounded-2xl p-6 sm:p-10 shadow-card border border-surface/50 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl"></div>
                <div className="relative">
                  <h3 className="text-xl sm:text-2xl font-light text-primary mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
                    <MapPin className="w-5 h-5 sm:w-7 sm:h-7 text-textSecondary" />
                    Shipping Route
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                    <div className="text-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-success rounded-full mb-3 sm:mb-4 shadow-lg backdrop-blur-sm relative mx-auto">
                        <div className="absolute inset-0 bg-success/20 rounded-full animate-pulse"></div>
                      </div>
                      <p className="font-medium text-primary text-base sm:text-lg">{shipment.pickup?.city || 'Unknown'}</p>
                      <p className="text-textSecondary mt-1 text-sm sm:text-base">Origin</p>
                    </div>
                    <div className="flex-1 px-0 sm:px-12 w-full sm:w-auto">
                      <div className="h-1 bg-gradient-to-r from-success via-primary to-primary w-full rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full mb-3 sm:mb-4 shadow-lg backdrop-blur-sm relative mx-auto">
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                      </div>
                      <p className="font-medium text-primary text-base sm:text-lg">{shipment.delivery?.city || 'Unknown'}</p>
                      <p className="text-textSecondary mt-1 text-sm sm:text-base">Destination</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Package Info */}
                <div className="bg-surface/70 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-card border border-surface/50 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <h3 className="text-lg sm:text-xl font-light text-primary mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-textSecondary" />
                      Package Details
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-textSecondary text-base sm:text-lg">Weight</span>
                        <span className="font-medium text-primary text-base sm:text-lg">{shipment.package?.weight || 'N/A'} kg</span>
                      </div>
                      <div className="flex justify-between items-start py-2">
                        <span className="text-textSecondary text-base sm:text-lg">Description</span>
                        <span className="font-medium text-primary text-base sm:text-lg text-right max-w-xs">{shipment.package?.description || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-surface/70 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-card border border-surface/50 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <h3 className="text-lg sm:text-xl font-light text-primary mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-textSecondary" />
                      Timeline
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-textSecondary text-base sm:text-lg">Created</span>
                        <span className="font-medium text-primary text-base sm:text-lg text-right">{formatDate(shipment.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-textSecondary text-base sm:text-lg">Est. Delivery</span>
                        <span className="font-medium text-primary text-base sm:text-lg text-right">{formatDate(shipment.estimatedDelivery)}</span>
                      </div>
                      {shipment.deliveredAt && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-success text-base sm:text-lg">Delivered</span>
                          <span className="font-medium text-success text-base sm:text-lg text-right">{formatDate(shipment.deliveredAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sender */}
                <div className="bg-surface/70 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-card border border-surface/50 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <h3 className="text-lg sm:text-xl font-light text-primary mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-textSecondary" />
                      Sender
                    </h3>
                    <p className="font-medium text-primary text-base sm:text-lg">{shipment.sender?.name || 'N/A'}</p>
                  </div>
                </div>

                {/* Receiver */}
                <div className="bg-surface/70 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-card border border-surface/50 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <h3 className="text-lg sm:text-xl font-light text-primary mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-textSecondary" />
                      Receiver
                    </h3>
                    <p className="font-medium text-primary text-base sm:text-lg">{shipment.receiver?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackShipment;