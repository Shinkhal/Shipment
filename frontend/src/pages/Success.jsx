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
      if (navigator.share) {
        if (navigator.canShare && !navigator.canShare(shareData)) {
          toast.error("Your device can't share this content.");
          return;
        }
        await navigator.share(shareData);
        toast.success('Shipment details shared successfully');
      } else {
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-primary" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
               backgroundSize: '20px 20px'
             }} />
      </div>
      
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-success/20 rounded-full blur-xl scale-150"></div>
                <div className="relative bg-surface/90 backdrop-blur-sm border border-success/20 p-6 rounded-2xl shadow-card">
                  <CheckCircle className="w-16 h-16 text-success" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-textPrimary mb-3 tracking-tight">
              Shipment Created Successfully
            </h1>
            <p className="text-lg text-textSecondary max-w-2xl mx-auto">
              Your package is ready for pickup. All details have been confirmed and saved.
            </p>
          </div>

          {/* Tracking ID Card */}
          <div className="mb-8">
            <div className="bg-surface/70 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-card relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/50 via-accent to-accent/50"></div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-textSecondary mb-2 tracking-wide uppercase">
                    Tracking ID
                  </h3>
                  <p className="text-3xl font-bold text-textPrimary font-mono tracking-wider">
                    {shipment.trackingId}
                  </p>
                </div>
                <button
                  onClick={copyTrackingId}
                  className="group flex items-center space-x-3 px-6 py-3 bg-surface/80 backdrop-blur-sm border border-white/20 text-textPrimary rounded-xl hover:bg-accent/10 hover:border-accent/30 transition-all duration-300 shadow-card"
                >
                  <Copy className="w-5 h-5 group-hover:text-accent transition-colors" />
                  <span className="font-medium">Copy</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Shipment Status */}
            <div className="bg-surface/70 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <Truck className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-textPrimary">Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border/30">
                  <span className="text-textSecondary font-medium">Current Status</span>
                  <span className="px-3 py-1 bg-success/10 text-success rounded-lg text-sm font-semibold">
                    {shipment.status || 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/30">
                  <span className="text-textSecondary font-medium">Service Type</span>
                  <span className="text-textPrimary font-semibold">
                    {getServiceTypeDisplay(shipment.formData?.service?.type)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/30">
                  <span className="text-textSecondary font-medium">Created On</span>
                  <span className="text-textPrimary font-semibold">
                    {formatDate(shipment.createdAt)}
                  </span>
                </div>
                {shipment.estimatedDelivery && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-textSecondary font-medium">Est. Delivery</span>
                    <span className="text-success font-semibold">
                      {formatDate(shipment.estimatedDelivery)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Package Details */}
            <div className="bg-surface/70 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <Package className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-textPrimary">Package Info</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border/30">
                  <span className="text-textSecondary font-medium">Description</span>
                  <span className="text-textPrimary font-semibold">
                    {shipment.formData?.package?.description}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/30">
                  <span className="text-textSecondary font-medium">Category</span>
                  <span className="text-textPrimary font-semibold">
                    {shipment.formData?.package?.category}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/30">
                  <span className="text-textSecondary font-medium">Weight</span>
                  <span className="text-textPrimary font-semibold">
                    {shipment.formData?.package?.weight} kg
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-textSecondary font-medium">Declared Value</span>
                  <span className="text-textPrimary font-semibold">
                    {formatCurrency(shipment.formData?.package?.declaredValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Pickup Address */}
            <div className="bg-surface/70 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-textPrimary">Pickup Address</h3>
              </div>
              <div className="space-y-3">
                <div className="pb-3 border-b border-border/30">
                  <p className="font-semibold text-textPrimary text-lg">{shipment.formData?.sender?.name}</p>
                  <p className="text-textSecondary">{shipment.formData?.sender?.phone}</p>
                </div>
                <div className="text-textSecondary leading-relaxed">
                  <p className="mb-1">{shipment.formData?.pickup?.address}</p>
                  <p className="mb-1">
                    {shipment.formData?.pickup?.city}, {shipment.formData?.pickup?.state}
                  </p>
                  <p className="font-medium">PIN: {shipment.formData?.pickup?.pincode}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-surface/70 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-success/10 rounded-xl">
                  <MapPin className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-textPrimary">Delivery Address</h3>
              </div>
              <div className="space-y-3">
                <div className="pb-3 border-b border-border/30">
                  <p className="font-semibold text-textPrimary text-lg">{shipment.formData?.receiver?.name}</p>
                  <p className="text-textSecondary">{shipment.formData?.receiver?.phone}</p>
                </div>
                <div className="text-textSecondary leading-relaxed">
                  <p className="mb-1">{shipment.formData?.delivery?.address}</p>
                  <p className="mb-1">
                    {shipment.formData?.delivery?.city}, {shipment.formData?.delivery?.state}
                  </p>
                  <p className="font-medium">PIN: {shipment.formData?.delivery?.pincode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pickup Schedule */}
          {shipment.formData?.service?.pickupDate && (
            <div className="bg-surface/70 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-card mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-textPrimary">Pickup Schedule</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-between items-center py-3 border-b border-border/30">
                  <span className="text-textSecondary font-medium">Pickup Date</span>
                  <span className="text-textPrimary font-semibold">
                    {formatDate(shipment.formData.service.pickupDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/30">
                  <span className="text-textSecondary font-medium">Preferred Time</span>
                  <span className="text-textPrimary font-semibold">
                    {shipment.formData.service.preferredTime}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={saveCopy}
              className="group flex items-center justify-center space-x-3 px-8 py-4 bg-surface/80 backdrop-blur-sm border border-white/20 text-textPrimary rounded-xl font-medium hover:bg-accent/10 hover:border-accent/30 transition-all duration-300 shadow-card"
            >
              <Download className="w-5 h-5 group-hover:text-accent transition-colors" />
              <span>Save Copy</span>
            </button>
            
            <button
              onClick={handleShare}
              className="group flex items-center justify-center space-x-3 px-8 py-4 bg-surface/80 backdrop-blur-sm border border-white/20 text-textPrimary rounded-xl font-medium hover:bg-accent/10 hover:border-accent/30 transition-all duration-300 shadow-card"
            >
              <Share2 className="w-5 h-5 group-hover:text-accent transition-colors" />
              <span>Share Details</span>
            </button>
          </div>

          {/* Important Note */}
          <div className="bg-surface/60 backdrop-blur-sm border border-accent/20 rounded-2xl p-6 shadow-card">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-2 bg-accent/10 rounded-xl mt-1">
                <Package className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-textPrimary mb-3 text-lg">Important Notes</h4>
                <div className="text-textSecondary space-y-2 leading-relaxed">
                  <p>• Keep your tracking ID safe for future reference</p>
                  <p>• You'll receive SMS/email updates on your shipment status</p>
                  <p>• Ensure someone is available at pickup address during scheduled time</p>
                  <p>• Contact support if you need to make any changes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;