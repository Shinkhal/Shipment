import React, { useState } from 'react';
import { Search, Package, MapPin, Clock, User, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { getShipmentByTrackingId } from '../services/api';

const statusConfig = {
  pending: { 
    color: 'bg-amber-50 text-amber-700 border-amber-200', 
    icon: Clock,
    progress: 20,
    gradient: 'from-amber-400 to-orange-400'
  },
  processing: { 
    color: 'bg-blue-50 text-blue-700 border-blue-200', 
    icon: Package,
    progress: 40,
    gradient: 'from-blue-400 to-indigo-400'
  },
  shipped: { 
    color: 'bg-violet-50 text-violet-700 border-violet-200', 
    icon: Package,
    progress: 60,
    gradient: 'from-violet-400 to-purple-400'
  },
  in_transit: { 
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200', 
    icon: Truck,
    progress: 80,
    gradient: 'from-indigo-400 to-blue-400'
  },
  delivered: { 
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
    icon: CheckCircle,
    progress: 100,
    gradient: 'from-emerald-400 to-green-400'
  },
  returned: {
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: AlertCircle,
    progress: 100,
    gradient: 'from-yellow-400 to-yellow-500'
  },
  cancelled: {
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertCircle,
    progress: 0,
    gradient: 'from-red-400 to-red-500'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold text-slate-800 mb-3">
            Track Your Shipment
          </h1>
          <p className="text-slate-600 text-lg">Monitor your package journey in real-time</p>
        </div>

        {/* Search Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter tracking ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-4 bg-white/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-200"
              />
            </div>
            <button
              onClick={handleTrack}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Tracking
                </div>
              ) : (
                'Track Package'
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Shipment Details */}
        {shipment && (
          <div className="space-y-6">
            {/* Status Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${config.gradient} shadow-md`}>
                    <StatusIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                      {shipment.trackingId}
                    </h2>
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${config.color}`}>
                      {shipment.status}
                    </span>
                  </div>
                </div>
                
                <div className="w-full lg:w-64">
                  <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>Progress</span>
                    <span className="font-medium">{config.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${config.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Route */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
              <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-slate-600" />
                Shipping Route
              </h3>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full mb-3 shadow-md"></div>
                  <p className="font-semibold text-slate-800">{shipment.pickup?.city || 'Unknown'}</p>
                  <p className="text-sm text-slate-500">Origin</p>
                </div>
                <div className="flex-1 px-8">
                  <div className="h-0.5 bg-gradient-to-r from-emerald-400 to-blue-400 w-full rounded-full"></div>
                </div>
                <div className="text-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mb-3 shadow-md"></div>
                  <p className="font-semibold text-slate-800">{shipment.delivery?.city || 'Unknown'}</p>
                  <p className="text-sm text-slate-500">Destination</p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Package Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-3">
                  <Package className="w-5 h-5 text-slate-600" />
                  Package Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Weight</span>
                    <span className="font-semibold text-slate-800">{shipment.package?.weight || 'N/A'} kg</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-slate-600">Description</span>
                    <span className="font-semibold text-slate-800 text-right max-w-xs">{shipment.package?.description || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-600" />
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Created</span>
                    <span className="font-semibold text-slate-800">{formatDate(shipment.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Est. Delivery</span>
                    <span className="font-semibold text-slate-800">{formatDate(shipment.estimatedDelivery)}</span>
                  </div>
                  {shipment.deliveredAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-600">Delivered</span>
                      <span className="font-semibold text-emerald-700">{formatDate(shipment.deliveredAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sender */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-600" />
                  Sender
                </h3>
                <p className="font-semibold text-slate-800">{shipment.sender?.name || 'N/A'}</p>
              </div>

              {/* Receiver */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-600" />
                  Receiver
                </h3>
                <p className="font-semibold text-slate-800">{shipment.receiver?.name || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackShipment;