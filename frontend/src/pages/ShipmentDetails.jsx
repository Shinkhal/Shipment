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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-border p-12 text-center max-w-lg w-full">
          <div className="w-24 h-24 bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-textPrimary mb-3">No Shipment Selected</h2>
          <p className="text-textSecondary mb-8 text-lg">Please select a shipment from your dashboard to view its details</p>
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-surface rounded-xl hover:bg-primary/90 transition-all duration-300 font-semibold shadow-card hover:shadow-lg"
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
          color: 'bg-success/20 text-success border-success/30',
          bgGlass: 'bg-success/5 backdrop-blur-xl',
          icon: CheckCircle,
          iconColor: 'text-success'
        };
      case 'in-transit':
      case 'in transit':
        return {
          color: 'bg-primary/20 text-primary border-primary/30',
          bgGlass: 'bg-primary/5 backdrop-blur-xl',
          icon: Truck,
          iconColor: 'text-primary'
        };
      case 'pending':
        return {
          color: 'bg-accent/20 text-accent border-accent/30',
          bgGlass: 'bg-accent/5 backdrop-blur-xl',
          icon: Clock,
          iconColor: 'text-accent'
        };
      case 'cancelled':
        return {
          color: 'bg-error/20 text-error border-error/30',
          bgGlass: 'bg-error/5 backdrop-blur-xl',
          icon: Package,
          iconColor: 'text-error'
        };
      default:
        return {
          color: 'bg-textSecondary/20 text-textSecondary border-textSecondary/30',
          bgGlass: 'bg-textSecondary/5 backdrop-blur-xl',
          icon: Package,
          iconColor: 'text-textSecondary'
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-border p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">
                  Shipment Details
                </h1>
                <div className="flex items-center gap-3">
                  <p className="text-textSecondary font-mono text-lg">Tracking ID: {trackingId}</p>
                </div>
                <div className='flex items-center gap-3'>
                  <p className="text-textSecondary text-sm">Shipment ID: {id}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-surface/60 backdrop-blur-sm hover:bg-surface/80 text-textPrimary rounded-xl transition-all duration-300 font-medium border border-border hover:border-textSecondary/30"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleSaveCopy}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-xl hover:bg-accent/90 transition-all duration-300 font-medium shadow-card hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Status Hero Section */}
        <div className={`${statusConfig.bgGlass} rounded-2xl p-8 mb-8 border border-border`}>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 bg-surface/80 backdrop-blur-sm rounded-full mb-4 shadow-card`}>
                <StatusIcon className={`w-10 h-10 ${statusConfig.iconColor}`} />
              </div>
              <h2 className="text-2xl font-bold text-textPrimary mb-2">
                Shipment Status - {status === 'delivered' ? 'Successfully Delivered!' : 
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
            <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-border p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-textPrimary">Route Information</h3>
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex-1 text-center">
                    <div className="w-6 h-6 bg-primary rounded-full mx-auto mb-4 shadow-sm"></div>
                    <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-6 border border-primary/20">
                      <p className="text-sm font-bold text-primary mb-2">PICKUP LOCATION</p>
                      <p className="text-xl font-bold text-textPrimary">{pickup?.city || 'N/A'}</p>
                      <p className="text-textSecondary mt-1">{pickup?.address || 'Address not available'}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 px-8">
                    <div className="relative">
                      <div className="border-t-2 border-dashed border-border"></div>
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-surface/80 backdrop-blur-sm p-2 rounded-full shadow-card border border-border">
                        <div className="text-2xl">✈️</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center">
                    <div className="w-6 h-6 bg-success rounded-full mx-auto mb-4 shadow-sm"></div>
                    <div className="bg-success/5 backdrop-blur-sm rounded-xl p-6 border border-success/20">
                      <p className="text-sm font-bold text-success mb-2">DELIVERY LOCATION</p>
                      <p className="text-xl font-bold text-textPrimary">{delivery?.city || 'N/A'}</p>
                      <p className="text-textSecondary mt-1">{delivery?.address || 'Address not available'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* People Information */}
            <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-border p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-accent/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-textPrimary">Sender & Receiver</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-accent/5 backdrop-blur-sm rounded-xl p-6 border border-accent/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">S</span>
                    </div>
                    <p className="font-bold text-accent">SENDER</p>
                  </div>
                  <p className="text-xl font-bold text-textPrimary mb-2">{sender?.name || 'Unknown Sender'}</p>
                  <p className="text-textSecondary">{sender?.email || 'Email not available'}</p>
                  <p className="text-textSecondary">{sender?.phone || 'Phone not available'}</p>
                </div>
                
                <div className="bg-success/5 backdrop-blur-sm rounded-xl p-6 border border-success/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                      <span className="text-surface font-bold text-sm">R</span>
                    </div>
                    <p className="font-bold text-success">RECEIVER</p>
                  </div>
                  <p className="text-xl font-bold text-textPrimary mb-2">{receiver?.name || 'Unknown Receiver'}</p>
                  <p className="text-textSecondary">{receiver?.email || 'Email not available'}</p>
                  <p className="text-textSecondary">{receiver?.phone || 'Phone not available'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-8">
            {/* Package Details */}
            <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-border p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Weight className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-textPrimary">Package Info</h3>
              </div>
              
              <div className="space-y-6">
                <div className="bg-accent/5 backdrop-blur-sm rounded-xl p-4 text-center border border-accent/20">
                  <p className="text-sm font-bold text-accent mb-1">WEIGHT</p>
                  <p className="text-2xl font-bold text-textPrimary">
                    {pkg.weight ? `${pkg.weight} kg` : 'N/A'}
                  </p>
                </div>
                
                <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
                  <p className="text-sm font-bold text-primary mb-2">DESCRIPTION</p>
                  <p className="text-textPrimary font-medium">
                    {pkg.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-border p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-textPrimary">Timeline</h3>
              </div>
              
              <div className="space-y-6">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-3 h-3 bg-primary rounded-full"></div>
                  <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
                    <p className="text-sm font-bold text-primary mb-1">CREATED</p>
                    <p className="text-textPrimary font-medium">{formatDateTime(createdAt)}</p>
                  </div>
                </div>
                
                {estimatedDelivery && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-3 h-3 bg-accent rounded-full"></div>
                    <div className="bg-accent/5 backdrop-blur-sm rounded-xl p-4 border border-accent/20">
                      <p className="text-sm font-bold text-accent mb-1">ESTIMATED DELIVERY</p>
                      <p className="text-textPrimary font-medium">{formatDateTime(estimatedDelivery)}</p>
                    </div>
                  </div>
                )}
                
                {deliveredAt && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-3 h-3 bg-success rounded-full"></div>
                    <div className="bg-success/5 backdrop-blur-sm rounded-xl p-4 border border-success/20">
                      <p className="text-sm font-bold text-success mb-1">DELIVERED</p>
                      <p className="text-textPrimary font-medium">{formatDateTime(deliveredAt)}</p>
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