import React, { useState } from 'react';
import { Search, Package, MapPin, Clock, User, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { getShipmentByTrackingId } from '../services/api';

const statusConfig = {
  pending: { 
    color: 'from-amber-400 to-orange-500', 
    bg: 'bg-amber-50 border-amber-200', 
    text: 'text-amber-800',
    icon: Clock,
    progress: 20
  },
  processing: { 
    color: 'from-blue-400 to-indigo-500', 
    bg: 'bg-blue-50 border-blue-200', 
    text: 'text-blue-800',
    icon: Package,
    progress: 40
  },
  shipped: { 
    color: 'from-purple-400 to-pink-500', 
    bg: 'bg-purple-50 border-purple-200', 
    text: 'text-purple-800',
    icon: Package,
    progress: 60
  },
  in_transit: { 
    color: 'from-indigo-400 to-blue-500', 
    bg: 'bg-indigo-50 border-indigo-200', 
    text: 'text-indigo-800',
    icon: Truck,
    progress: 80
  },
  delivered: { 
    color: 'from-green-400 to-emerald-500', 
    bg: 'bg-green-50 border-green-200', 
    text: 'text-green-800',
    icon: CheckCircle,
    progress: 100
  },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
            Track Your Shipment
          </h1>
          <p className="text-slate-600 text-lg">Enter your tracking ID to get real-time updates</p>
        </div>

        {/* Search Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 mb-8 hover:shadow-2xl transition-all duration-500">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter Tracking ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 text-lg hover:bg-white/90"
              />
            </div>
            <button
              onClick={handleTrack}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Tracking...
                </div>
              ) : (
                'Track'
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 flex items-center gap-3 animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Shipment Details */}
        {shipment && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Status Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${config.color} shadow-lg`}>
                    <StatusIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">
                      {shipment.trackingId}
                    </h2>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full font-semibold ${config.bg} ${config.text} border-2`}>
                      {shipment.status}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full sm:w-48">
                  <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>Progress</span>
                    <span>{config.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${config.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${config.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-slate-600" />
                <h3 className="text-xl font-bold text-slate-800">Shipping Route</h3>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-slate-800">{shipment.pickup?.city || 'Unknown'}</p>
                  <p className="text-sm text-slate-600">Origin</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-slate-800">{shipment.delivery?.city || 'Unknown'}</p>
                  <p className="text-sm text-slate-600">Destination</p>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Package Info */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-bold text-slate-800">Package Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Weight:</span>
                    <span className="font-semibold text-slate-800">{shipment.package?.weight || 'N/A'} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Description:</span>
                    <span className="font-semibold text-slate-800 text-right">{shipment.package?.description || 'No description'}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-bold text-slate-800">Timeline</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Created:</span>
                    <span className="font-semibold text-slate-800">{formatDate(shipment.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Est. Delivery:</span>
                    <span className="font-semibold text-slate-800">{formatDate(shipment.estimatedDelivery)}</span>
                  </div>
                  {shipment.deliveredAt && (
                    <div className="flex justify-between">
                      <span className="text-green-600">Delivered:</span>
                      <span className="font-semibold text-green-700">{formatDate(shipment.deliveredAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sender Info */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-bold text-slate-800">Sender</h3>
                </div>
                <p className="font-semibold text-slate-800">{shipment.sender?.name || 'N/A'}</p>
              </div>

              {/* Receiver Info */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-bold text-slate-800">Receiver</h3>
                </div>
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