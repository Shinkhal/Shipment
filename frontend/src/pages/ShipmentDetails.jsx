import React from 'react';
import { useShipment } from '../context/ShipmentContext';
import { useNavigate } from 'react-router-dom';
import {
  Package, ArrowLeft, User, MapPin,
  Calendar, Weight, Download, Clock,
  CheckCircle, Truck, Share2
} from 'lucide-react';
import { generateShipmentPDF } from '../services/pdfService';
import { toast } from 'react-toastify';

const ShipmentDetails = () => {
  const { selectedShipment } = useShipment();
  const navigate = useNavigate();

  if (!selectedShipment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center max-w-lg w-full">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Shipment Selected</h2>
          <p className="text-gray-600 mb-8 text-lg">Please select a shipment from your dashboard to view its details</p>
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const {
    trackingId,
    id,
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

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          gradient: 'from-green-50 to-emerald-50',
          icon: CheckCircle,
          iconColor: 'text-green-600'
        };
      case 'in-transit':
      case 'in transit':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          gradient: 'from-blue-50 to-indigo-50',
          icon: Truck,
          iconColor: 'text-blue-600'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          gradient: 'from-yellow-50 to-orange-50',
          icon: Clock,
          iconColor: 'text-yellow-600'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          gradient: 'from-red-50 to-pink-50',
          icon: Package,
          iconColor: 'text-red-600'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          gradient: 'from-gray-50 to-slate-50',
          icon: Package,
          iconColor: 'text-gray-600'
        };
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
  const handleShare = async () => {
  // Check if the required data exists before building the share text
  const trackingId = selectedShipment?.trackingId || 'N/A';
  const senderName = selectedShipment?.sender?.name || selectedShipment?.formData?.sender?.name || 'N/A';
  const receiverName = selectedShipment?.receiver?.name || selectedShipment?.formData?.receiver?.name || 'N/A';
  
  // Safely extract pickup address
  const pickupAddress = selectedShipment?.pickup?.address || selectedShipment?.formData?.pickup?.address || 'N/A';
  const pickupCity = selectedShipment?.pickup?.city || selectedShipment?.formData?.pickup?.city || 'N/A';
  const pickupState = selectedShipment?.pickup?.state || selectedShipment?.formData?.pickup?.state || 'N/A';
  const pickupPincode = selectedShipment?.pickup?.pincode || selectedShipment?.formData?.pickup?.pincode || 'N/A';
  
  // Safely extract delivery address
  const deliveryAddress = selectedShipment?.delivery?.address || selectedShipment?.formData?.delivery?.address || 'N/A';
  const deliveryCity = selectedShipment?.delivery?.city || selectedShipment?.formData?.delivery?.city || 'N/A';
  const deliveryState = selectedShipment?.delivery?.state || selectedShipment?.formData?.delivery?.state || 'N/A';
  const deliveryPincode = selectedShipment?.delivery?.pincode || selectedShipment?.formData?.delivery?.pincode || 'N/A';
  
  // Format estimated delivery date
  const estimatedDelivery = selectedShipment?.estimatedDelivery 
    ? new Date(selectedShipment.estimatedDelivery).toLocaleDateString('en-IN')
    : 'Not specified';

  const shareText = `📦 Shipment Details
Tracking ID: ${trackingId}
Sender: ${senderName}
Receiver: ${receiverName}
Pickup Address: ${pickupAddress}, ${pickupCity}, ${pickupState} - ${pickupPincode}
Delivery Address: ${deliveryAddress}, ${deliveryCity}, ${deliveryState} - ${deliveryPincode}
Estimated Delivery: ${estimatedDelivery}`;

  const shareData = {
    title: 'Shipment Details',
    text: shareText,
  };

  try {
    if (navigator.share) {
      if (navigator.canShare && !navigator.canShare(shareData)) {
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareText}`);
        return;
      }

      await navigator.share(shareData);
    } else {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareText}`);
       
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = `${shareData.title}\n\n${shareText}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Shipment details copied to clipboard!');
      }
    }
  } catch (error) {
    console.error('Share failed:', error);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareText}`);
        
      } else {
        toast.error('Unable to share or copy shipment details');
      }
    } catch (clipboardError) {
      console.error('Clipboard fallback failed:', clipboardError);
      toast.error('Unable to share or copy shipment details');
    }
  }
};

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Shipment Details
                </h1>
                <div className="flex items-center gap-3">
                  <p className="text-gray-600 font-mono text-lg">Tracking ID: {trackingId}</p>
                  
                </div>
                <div className='flex items-center gap-3'>
                  <p className="text-gray-500 text-sm">Shipment ID: {id}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleSaveCopy}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Status Hero Section */}
        <div className={`bg-gradient-to-r ${statusConfig.gradient} rounded-3xl p-8 mb-8 border border-gray-100`}>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg`}>
                <StatusIcon className={`w-10 h-10 ${statusConfig.iconColor}`} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2"> Shipment Stauts- 
                {status === 'delivered' ? 'Successfully Delivered!' : 
                 status === 'in-transit' || status === 'in transit' ? 'On Its Way!' :
                 status === 'pending' ? 'Being Processed' : 
                 status?.replace('_', ' ').toUpperCase()}
              </h2>
              
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="xl:col-span-2 space-y-8">
            {/* Route Information */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Route Information</h3>
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex-1 text-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full mx-auto mb-4 shadow-lg"></div>
                    <div className="bg-blue-50 rounded-2xl p-6">
                      <p className="text-sm font-bold text-blue-600 mb-2">PICKUP LOCATION</p>
                      <p className="text-xl font-bold text-gray-900">{pickup?.city || 'N/A'}</p>
                      <p className="text-gray-600 mt-1">{pickup?.address || 'Address not available'}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 px-8">
                    <div className="relative">
                      <div className="border-t-4 border-dashed border-gray-300"></div>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg">
                        <div className="text-2xl">✈️</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full mx-auto mb-4 shadow-lg"></div>
                    <div className="bg-green-50 rounded-2xl p-6">
                      <p className="text-sm font-bold text-green-600 mb-2">DELIVERY LOCATION</p>
                      <p className="text-xl font-bold text-gray-900">{delivery?.city || 'N/A'}</p>
                      <p className="text-gray-600 mt-1">{delivery?.address || 'Address not available'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* People Information */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Sender & Receiver</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <p className="font-bold text-purple-600">SENDER</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-2">{sender?.name || 'Unknown Sender'}</p>
                  <p className="text-gray-600">{sender?.email || 'Email not available'}</p>
                  <p className="text-gray-600">{sender?.phone || 'Phone not available'}</p>
                </div>
                
                <div className="bg-green-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">R</span>
                    </div>
                    <p className="font-bold text-green-600">RECEIVER</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-2">{receiver?.name || 'Unknown Receiver'}</p>
                  <p className="text-gray-600">{receiver?.email || 'Email not available'}</p>
                  <p className="text-gray-600">{receiver?.phone || 'Phone not available'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-8">
            {/* Package Details */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                  <Weight className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Package Info</h3>
              </div>
              
              <div className="space-y-6">
                <div className="bg-orange-50 rounded-2xl p-4 text-center">
                  <p className="text-sm font-bold text-orange-600 mb-1">WEIGHT</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pkg.weight ? `${pkg.weight} kg` : 'N/A'}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-sm font-bold text-gray-600 mb-2">DESCRIPTION</p>
                  <p className="text-gray-900 font-medium">
                    {pkg.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Timeline</h3>
              </div>
              
              <div className="space-y-6">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm font-bold text-blue-600 mb-1">CREATED</p>
                    <p className="text-gray-900 font-medium">{formatDateTime(createdAt)}</p>
                  </div>
                </div>
                
                {estimatedDelivery && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <p className="text-sm font-bold text-yellow-600 mb-1">ESTIMATED DELIVERY</p>
                      <p className="text-gray-900 font-medium">{formatDateTime(estimatedDelivery)}</p>
                    </div>
                  </div>
                )}
                
                {deliveredAt && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm font-bold text-green-600 mb-1">DELIVERED</p>
                      <p className="text-gray-900 font-medium">{formatDateTime(deliveredAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetails;