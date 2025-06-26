import React from 'react';
import { useShipment } from '../context/ShipmentContext';
import { useNavigate } from 'react-router-dom';
import {
  Package, ArrowLeft, User, MapPin,
  Calendar, Weight, Download
} from 'lucide-react';
import { generateShipmentPDF } from '../services/pdfService';
import { toast } from 'react-toastify';

const ShipmentDetails = () => {
  const { selectedShipment } = useShipment();
  const navigate = useNavigate();

  if (!selectedShipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No shipment selected</h2>
          <p className="text-gray-500 mb-6">Please select a shipment to view its details</p>
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const {
    trackingId,
    status,
    sender,
    receiver,
    package: pkg = {},
    pickup,
    delivery,
    createdAt,
    estimatedDelivery,
    deliveredAt
  } = selectedShipment;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-transit':
      case 'in transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleSaveCopy = () => {
    try {
      generateShipmentPDF(selectedShipment);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Error generating PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Shipment Details</h1>
            <p className="text-gray-500">Tracking ID: {trackingId}</p>
          </div>
          <button
            onClick={handleSaveCopy}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <Download className="w-4 h-4" />
            Save Copy
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Info */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">General Information</h2>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tracking ID</span>
              <span className="text-gray-900 font-mono">{trackingId}</span>
            </div>
          </div>

          {/* Sender & Receiver */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">Sender & Receiver</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sender</span>
                <span className="text-gray-900">{sender?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Receiver</span>
                <span className="text-gray-900">{receiver?.name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">Pickup & Delivery</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Pickup City</span>
                <span className="text-gray-900">{pickup?.city || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery City</span>
                <span className="text-gray-900">{delivery?.city || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Weight className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">Package Details</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Weight</span>
                <span className="text-gray-900">{pkg.weight ? `${pkg.weight} kg` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Description</span>
                <span className="text-gray-900">{pkg.description || 'N/A'}</span>
              </div>
              
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">Timeline</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Created At</span>
              <span className="text-gray-900">{formatDateTime(createdAt)}</span>
            </div>
            {estimatedDelivery && (
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Delivery</span>
                <span className="text-gray-900">{formatDateTime(estimatedDelivery)}</span>
              </div>
            )}
            {deliveredAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Delivered At</span>
                <span className="text-gray-900 font-medium">{formatDateTime(deliveredAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetails;
