import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Package, 
  User, 
  MapPin,  
  Calendar,
  Truck,
  Receipt,
} from 'lucide-react';
import { calculateShippingRate } from '../services/ShippingRate';
import { toast } from 'react-toastify';
import PaymentButton from '../components/PaymentButton';

const ConfirmShipment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [rateData, setRateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formData = location.state?.formData;

  useEffect(() => {
    if (!formData) {
      navigate('/new-shipment');
      return;
    }

    calculateRate();
  }, [formData, navigate,]);

  const calculateRate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare data for rate calculation
      const shipmentData = {
        package: {
          weight: parseFloat(formData.package.weight),
          category: formData.package.category,
          description: formData.package.description,
          declaredValue: parseFloat(formData.package.declaredValue) || 0,
          dimensions: formData.package.dimensions || {}
        },
        service: {
          type: formData.service.type
        },
        pickup: {
          pincode: formData.pickup.pincode
        },
        delivery: {
          pincode: formData.delivery.pincode
        },
        options: {
          codAmount: parseFloat(formData.options?.codAmount) || 0,
          doorDelivery: formData.options?.doorDelivery || false,
          signatureRequired: formData.options?.signatureRequired || false,
          scheduledDelivery: formData.options?.scheduledDelivery || false,
          weekendDelivery: formData.options?.weekendDelivery || false
        }
      };

      const result = calculateShippingRate(shipmentData);
      
      if (result.success) {
        setRateData(result);
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (err) {
      console.error('Rate calculation error:', err);
      const errorMessage = err.message || 'Failed to calculate shipping rate';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-textSecondary font-medium">Calculating shipping rates...</p>
        </div>
      </div>
    );
  }

  const renderContactInfo = () => (
    <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-border/30 p-8">
      <h2 className="text-xl font-semibold text-textPrimary mb-8 flex items-center">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mr-4">
          <User className="w-5 h-5 text-accent" />
        </div>
        Contact Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-primary/5 border border-primary/10">
            <span className="text-xs font-medium text-primary uppercase tracking-wider">Sender</span>
          </div>
          <div className="space-y-3 pl-4">
            <p className="font-semibold text-textPrimary text-lg">{formData.sender.name}</p>
            <p className="text-textSecondary font-medium">{formData.sender.phone}</p>
            {formData.sender.email && (
              <p className="text-textSecondary">{formData.sender.email}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-primary/5 border border-primary/10">
            <span className="text-xs font-medium text-primary uppercase tracking-wider">Receiver</span>
          </div>
          <div className="space-y-3 pl-4">
            <p className="font-semibold text-textPrimary text-lg">{formData.receiver.name}</p>
            <p className="text-textSecondary font-medium">{formData.receiver.phone}</p>
            {formData.receiver.email && (
              <p className="text-textSecondary">{formData.receiver.email}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-border/30 p-8">
      <h2 className="text-xl font-semibold text-textPrimary mb-8 flex items-center">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mr-4">
          <MapPin className="w-5 h-5 text-accent" />
        </div>
        Addresses
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-success/10 border border-success/20">
            <span className="text-xs font-medium text-success uppercase tracking-wider">Pickup Address</span>
          </div>
          <div className="text-textSecondary space-y-2 pl-4">
            <p className="font-medium text-textPrimary">{formData.pickup.address}</p>
            <p>{formData.pickup.city}, {formData.pickup.state}</p>
            <p className="font-medium">PIN: {formData.pickup.pincode}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-success/10 border border-success/20">
            <span className="text-xs font-medium text-success uppercase tracking-wider">Delivery Address</span>
          </div>
          <div className="text-textSecondary space-y-2 pl-4">
            <p className="font-medium text-textPrimary">{formData.delivery.address}</p>
            <p>{formData.delivery.city}, {formData.delivery.state}</p>
            <p className="font-medium">PIN: {formData.delivery.pincode}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPackageDetails = () => (
    <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-border/30 p-8">
      <h2 className="text-xl font-semibold text-textPrimary mb-8 flex items-center">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mr-4">
          <Package className="w-5 h-5 text-accent" />
        </div>
        Package Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-4 bg-background/50 rounded-xl border border-border/30">
            <label className="text-sm font-medium text-textSecondary uppercase tracking-wide mb-2 block">Description</label>
            <p className="text-textPrimary font-medium">{formData.package.description}</p>
          </div>
          <div className="p-4 bg-background/50 rounded-xl border border-border/30">
            <label className="text-sm font-medium text-textSecondary uppercase tracking-wide mb-2 block">Category</label>
            <p className="text-textPrimary font-medium">{formData.package.category}</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="p-4 bg-background/50 rounded-xl border border-border/30">
            <label className="text-sm font-medium text-textSecondary uppercase tracking-wide mb-2 block">Weight</label>
            <p className="text-textPrimary font-medium">{formData.package.weight} kg</p>
          </div>
          {rateData && (
            <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
              <label className="text-sm font-medium text-accent uppercase tracking-wide mb-2 block">Billable Weight</label>
              <p className="text-textPrimary font-semibold">{rateData.rateDetails.weight.billableWeight} kg</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderServiceDetails = () => (
    <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-border/30 p-8">
      <h2 className="text-xl font-semibold text-textPrimary mb-8 flex items-center">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mr-4">
          <Truck className="w-5 h-5 text-accent" />
        </div>
        Service Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-4 bg-background/50 rounded-xl border border-border/30">
            <label className="text-sm font-medium text-textSecondary uppercase tracking-wide mb-2 block">Service Type</label>
            <p className="text-textPrimary font-medium">{formData.service.type}</p>
          </div>
          {rateData && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <label className="text-sm font-medium text-primary uppercase tracking-wide mb-2 block">Transit Time</label>
              <p className="text-textPrimary font-semibold">{rateData.rateDetails.transitDays} days</p>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {formData.service.pickupDate && (
            <div className="p-4 bg-background/50 rounded-xl border border-border/30">
              <label className="text-sm font-medium text-textSecondary uppercase tracking-wide mb-2 block">Pickup Date</label>
              <p className="text-textPrimary font-medium">{formData.service.pickupDate}</p>
            </div>
          )}
          {formData.service.preferredTime && (
            <div className="p-4 bg-background/50 rounded-xl border border-border/30">
              <label className="text-sm font-medium text-textSecondary uppercase tracking-wide mb-2 block">Preferred Time</label>
              <p className="text-textPrimary font-medium">{formData.service.preferredTime}</p>
            </div>
          )}
          {rateData && (
            <div className="p-4 bg-success/5 rounded-xl border border-success/20">
              <label className="text-sm font-medium text-success uppercase tracking-wide mb-2 block">Estimated Delivery</label>
              <p className="text-textPrimary font-semibold">{rateData.rateDetails.estimatedDelivery}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRateBreakdown = () => {
    if (error) {
      return (
        <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-error/30 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-error" />
            </div>
            <p className="font-semibold text-error text-lg mb-2">Error calculating rate</p>
            <p className="text-textSecondary mb-6">{error}</p>
            <button
              onClick={calculateRate}
              className="px-6 py-3 bg-error text-surface rounded-xl font-medium hover:bg-error/90 transition-all duration-200 hover:shadow-lg"
            >
              Retry Calculation
            </button>
          </div>
        </div>
      );
    }

    if (!rateData) return null;

    return (
      <div className="bg-surface/80 backdrop-blur-xl rounded-2xl shadow-card border border-border/30 p-8">
        <h2 className="text-xl font-semibold text-textPrimary mb-8 flex items-center">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mr-4">
            <Receipt className="w-5 h-5 text-accent" />
          </div>
          Rate Breakdown
        </h2>
        
        <div className="space-y-4">
          {/* Service Info */}
          <div className="flex items-center justify-between py-3 px-4 bg-background/30 rounded-xl border border-border/20">
            <span className="text-textSecondary font-medium">Service</span>
            <span className="font-semibold text-textPrimary">{rateData.rateDetails.serviceType}</span>
          </div>
          
          {/* Base Rate */}
          <div className="flex items-center justify-between py-3 px-4">
            <span className="text-textSecondary">Base Amount</span>
            <span className="font-semibold text-textPrimary">₹{rateData.breakdown.baseAmount}</span>
          </div>
          
          {/* Discount */}
          {rateData.breakdown.discount > 0 && (
            <div className="flex items-center justify-between py-3 px-4 bg-success/5 rounded-xl border border-success/20">
              <span className="text-success font-medium">Weight Discount</span>
              <span className="font-semibold text-success">-₹{rateData.breakdown.discount}</span>
            </div>
          )}
          
          {/* Additional Charges */}
          {Object.entries({
            fuelSurcharge: 'Fuel Surcharge',
            remoteAreaCharges: 'Remote Area',
            oversizeCharges: 'Oversize Handling',
            fragileHandling: 'Fragile Handling',
            codCharges: 'COD Charges',
            insurance: 'Insurance',
            doorDelivery: 'Door Delivery',
            signatureRequired: 'Signature Required',
            scheduledDelivery: 'Scheduled Delivery',
            weekendDelivery: 'Weekend Delivery'
          }).map(([key, label]) => 
            rateData.breakdown[key] ? (
              <div key={key} className="flex items-center justify-between py-3 px-4 bg-background/20 rounded-xl">
                <span className="text-textSecondary">{label}</span>
                <span className="font-medium text-textPrimary">₹{rateData.breakdown[key]}</span>
              </div>
            ) : null
          )}
          
          {/* Subtotal */}
          <div className="flex items-center justify-between py-4 px-4 bg-primary/5 rounded-xl border-t border-border/30">
            <span className="font-semibold text-primary">Subtotal</span>
            <span className="font-semibold text-primary">₹{rateData.breakdown.subtotal}</span>
          </div>
          
          {/* GST */}
          <div className="flex items-center justify-between py-3 px-4">
            <span className="text-textSecondary">GST (18%)</span>
            <span className="font-medium text-textPrimary">₹{rateData.breakdown.gst}</span>
          </div>
          
          {/* Total */}
          <div className="flex items-center justify-between py-6 px-6 bg-accent/10 rounded-xl border-2 border-accent/30">
            <span className="text-xl font-bold text-primary">Total Amount</span>
            <span className="text-2xl font-bold text-accent">₹{rateData.breakdown.total}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderDeliveryInfo = () => {
    if (!rateData) return null;

    return (
      <div className="bg-surface/60 backdrop-blur-xl rounded-2xl border border-border/30 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-textPrimary text-lg">Delivery Information</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background/30 rounded-xl">
            <span className="text-textSecondary font-medium">Transit Time</span>
            <span className="font-semibold text-textPrimary">{rateData.rateDetails.transitDays} days</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-success/5 rounded-xl border border-success/20">
            <span className="text-success font-medium">Estimated Delivery</span>
            <span className="font-semibold text-textPrimary">{rateData.rateDetails.estimatedDelivery}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-textPrimary mb-3">Confirm Shipment</h1>
              <p className="text-textSecondary text-lg">Review your shipment details and complete booking</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipment Details */}
          <div className="lg:col-span-2 space-y-8">
            {renderContactInfo()}
            {renderAddresses()}
            {renderPackageDetails()}
            {renderServiceDetails()}
          </div>

          {/* Rate Breakdown & Actions */}
          <div className="space-y-8">
            {renderRateBreakdown()}
            {renderDeliveryInfo()}

            {/* Action Buttons */}
            <div className="space-y-4">
              <PaymentButton 
                rateData={rateData} 
                formData={formData} 
                disabled={!rateData || error}
                className="w-full px-8 py-4 bg-primary text-surface rounded-xl font-semibold hover:bg-primary/90 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              <button
                onClick={() => navigate('/create-shipment', { state: { formData } })}
                className="w-full px-8 py-4 bg-surface/80 backdrop-blur-xl border border-border/30 text-textPrimary rounded-xl font-semibold hover:bg-surface hover:shadow-lg transition-all duration-200"
              >
                Back to Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmShipment;