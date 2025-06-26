import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Package,
  MapPin,
  Calendar,
  Truck,
  Copy,
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { generateShipmentPDF } from '../services/pdfService';
import { useShipment } from '../context/ShipmentContext';

const SuccessPage = () => {
  const {selectedShipment} = useShipment();
  const navigate = useNavigate();
  const shipment = selectedShipment;

  // If no shipment data, redirect to create shipment
  if (!shipment) {
    navigate('/new-shipment');
    return null;
  }

  const copyTrackingId = () => {
    navigator.clipboard.writeText(shipment.trackingId);
    toast.success('Tracking ID copied to clipboard');
  };

  const saveCopy = () => {
    try {
      generateShipmentPDF(shipment);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Error generating PDF');
    }
  };

  const handleShare = async () => {
  const shareText = `📦 Shipment Details
  Tracking ID: ${shipment.trackingId}
  Sender: ${shipment.formData?.sender?.name}
  Receiver: ${shipment.formData?.receiver?.name}
  Pickup Address: ${shipment.formData?.pickup?.address}, ${shipment.formData?.pickup?.city}, ${shipment.formData?.pickup?.state} - ${shipment.formData?.pickup?.pincode}
  Delivery Address: ${shipment.formData?.delivery?.address}, ${shipment.formData?.delivery?.city}, ${shipment.formData?.delivery?.state} - ${shipment.formData?.delivery?.pincode}
  Estimated Delivery: ${shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString('en-IN') : 'Not specified'}`;

  const shareData = {
    title: 'Shipment Details',
    text: shareText,
  };

  try {
    // Check if Web Share API is supported
    if (navigator.share) {
      // Optional: check if shareData is compatible
      if (navigator.canShare && !navigator.canShare(shareData)) {
        toast.error("Your device can't share this content.");
        return;
      }

      await navigator.share(shareData);
      toast.success('Shipment details shared successfully');
    } else {
      // Fallback for unsupported browsers: copy to clipboard
      await navigator.clipboard.writeText(`${shareData.title}\n${shareText}`);
      toast.success('Shipment details copied to clipboard!');
    }
  } catch (error) {
    console.error('Share failed:', error);
    toast.error('Error sharing shipment details');
  }
};


  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getServiceTypeDisplay = (type) => {
    const serviceMap = {
      'Standard': 'Standard (3-5 days)',
      'Express': 'Express (1-2 days)',
      'SameDay': 'Same Day'
    };
    return serviceMap[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shipment Created Successfully!
          </h1>
          <p className="text-gray-600">
            Your package is ready for pickup. Here are your shipment details.
          </p>
        </div>

        {/* Tracking ID Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Tracking ID
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {shipment.trackingId}
              </p>
            </div>
            <button
              onClick={copyTrackingId}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Shipment Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Truck className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span className="font-semibold text-purple-600">
                  {shipment.status || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Type:</span>
                <span className="font-semibold">
                  {getServiceTypeDisplay(shipment.formData?.service?.type)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created On:</span>
                <span className="font-semibold">
                  {formatDate(shipment.createdAt)}
                </span>
              </div>
              {shipment.estimatedDelivery && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Delivery:</span>
                  <span className="font-semibold text-green-600">
                    {formatDate(shipment.estimatedDelivery)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Package className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Package Info</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Description:</span>
                <span className="font-semibold">
                  {shipment.formData?.package?.description}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-semibold">
                  {shipment.formData?.package?.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weight:</span>
                <span className="font-semibold">
                  {shipment.formData?.package?.weight} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Declared Value:</span>
                <span className="font-semibold">
                  {formatCurrency(shipment.formData?.package?.declaredValue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Pickup Address */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Pickup Address</h3>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">{shipment.formData?.sender?.name}</p>
              <p className="text-gray-600">{shipment.formData?.sender?.phone}</p>
              <div className="text-gray-700">
                <p>{shipment.formData?.pickup?.address}</p>
                <p>
                  {shipment.formData?.pickup?.city}, {shipment.formData?.pickup?.state}
                </p>
                <p>PIN: {shipment.formData?.pickup?.pincode}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Delivery Address</h3>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">{shipment.formData?.receiver?.name}</p>
              <p className="text-gray-600">{shipment.formData?.receiver?.phone}</p>
              <div className="text-gray-700">
                <p>{shipment.formData?.delivery?.address}</p>
                <p>
                  {shipment.formData?.delivery?.city}, {shipment.formData?.delivery?.state}
                </p>
                <p>PIN: {shipment.formData?.delivery?.pincode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Schedule */}
        {shipment.formData?.service?.pickupDate && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Pickup Schedule</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Pickup Date:</span>
                <span className="font-semibold">
                  {formatDate(shipment.formData.service.pickupDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Preferred Time:</span>
                <span className="font-semibold">
                  {shipment.formData.service.preferredTime}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={saveCopy}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Save Copy</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Details</span>
            </button>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-1 rounded-full mt-0.5">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Important Notes:</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Keep your tracking ID safe for future reference</li>
                <li>• You'll receive SMS/email updates on your shipment status</li>
                <li>• Ensure someone is available at pickup address during scheduled time</li>
                <li>• Contact support if you need to make any changes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;