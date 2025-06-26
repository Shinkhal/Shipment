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
  }, [formData, navigate]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating shipping rates...</p>
        </div>
      </div>
    );
  }

  const renderContactInfo = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <User className="w-6 h-6 text-purple-600 mr-3" />
        Contact Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wide">Sender</h3>
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{formData.sender.name}</p>
            <p className="text-gray-600">{formData.sender.phone}</p>
            {formData.sender.email && (
              <p className="text-gray-600">{formData.sender.email}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wide">Receiver</h3>
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{formData.receiver.name}</p>
            <p className="text-gray-600">{formData.receiver.phone}</p>
            {formData.receiver.email && (
              <p className="text-gray-600">{formData.receiver.email}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <MapPin className="w-6 h-6 text-purple-600 mr-3" />
        Addresses
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wide">Pickup Address</h3>
          <div className="text-gray-600 space-y-1">
            <p>{formData.pickup.address}</p>
            <p>{formData.pickup.city}, {formData.pickup.state}</p>
            <p>PIN: {formData.pickup.pincode}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wide">Delivery Address</h3>
          <div className="text-gray-600 space-y-1">
            <p>{formData.delivery.address}</p>
            <p>{formData.delivery.city}, {formData.delivery.state}</p>
            <p>PIN: {formData.delivery.pincode}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPackageDetails = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Package className="w-6 h-6 text-purple-600 mr-3" />
        Package Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900">{formData.package.description}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Category</label>
            <p className="text-gray-900">{formData.package.category}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Weight</label>
            <p className="text-gray-900">{formData.package.weight} kg</p>
          </div>
          {rateData && (
            <div>
              <label className="text-sm font-medium text-gray-500">Billable Weight</label>
              <p className="text-gray-900">{rateData.rateDetails.weight.billableWeight} kg</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderServiceDetails = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Truck className="w-6 h-6 text-purple-600 mr-3" />
        Service Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Service Type</label>
            <p className="text-gray-900">{formData.service.type}</p>
          </div>
          {rateData && (
            <div>
              <label className="text-sm font-medium text-gray-500">Transit Time</label>
              <p className="text-gray-900">{rateData.rateDetails.transitDays} days</p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {formData.service.pickupDate && (
            <div>
              <label className="text-sm font-medium text-gray-500">Pickup Date</label>
              <p className="text-gray-900">{formData.service.pickupDate}</p>
            </div>
          )}
          {formData.service.preferredTime && (
            <div>
              <label className="text-sm font-medium text-gray-500">Preferred Time</label>
              <p className="text-gray-900">{formData.service.preferredTime}</p>
            </div>
          )}
          {rateData && (
            <div>
              <label className="text-sm font-medium text-gray-500">Estimated Delivery</label>
              <p className="text-gray-900">{rateData.rateDetails.estimatedDelivery}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRateBreakdown = () => {
    if (error) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center text-red-600">
            <p className="font-medium">Error calculating rate</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={calculateRate}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!rateData) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Receipt className="w-6 h-6 text-purple-600 mr-3" />
          Rate Breakdown
        </h2>
        
        <div className="space-y-4">
          {/* Service Info */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Service</span>
            <span className="font-medium">{rateData.rateDetails.serviceType}</span>
          </div>
          
          {/* Base Rate */}
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Base Amount</span>
            <span className="font-medium">₹{rateData.breakdown.baseAmount}</span>
          </div>
          
          {/* Discount */}
          {rateData.breakdown.discount > 0 && (
            <div className="flex items-center justify-between py-2 text-green-600">
              <span>Weight Discount</span>
              <span>-₹{rateData.breakdown.discount}</span>
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
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-gray-600">{label}</span>
                <span>₹{rateData.breakdown[key]}</span>
              </div>
            ) : null
          )}
          
          {/* Subtotal */}
          <div className="flex items-center justify-between py-2 border-t border-gray-200 font-medium">
            <span>Subtotal</span>
            <span>₹{rateData.breakdown.subtotal}</span>
          </div>
          
          {/* GST */}
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">GST (18%)</span>
            <span>₹{rateData.breakdown.gst}</span>
          </div>
          
          {/* Total */}
          <div className="flex items-center justify-between py-3 border-t-2 border-purple-200 text-lg font-bold text-purple-600">
            <span>Total Amount</span>
            <span>₹{rateData.breakdown.total}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderDeliveryInfo = () => {
    if (!rateData) return null;

    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Delivery Information</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Transit Time</span>
            <span className="font-medium">{rateData.rateDetails.transitDays} days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Estimated Delivery</span>
            <span className="font-medium">{rateData.rateDetails.estimatedDelivery}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm Shipment</h1>
              <p className="text-gray-600">Review your shipment details and complete booking</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipment Details */}
          <div className="lg:col-span-2 space-y-6">
            {renderContactInfo()}
            {renderAddresses()}
            {renderPackageDetails()}
            {renderServiceDetails()}
          </div>

          {/* Rate Breakdown & Actions */}
          <div className="space-y-6">
            {renderRateBreakdown()}
            {renderDeliveryInfo()}

            {/* Action Buttons */}
            <div className="space-y-4">
              <PaymentButton 
                rateData={rateData} 
                formData={formData} 
                disabled={!rateData || error} 
              />
              
              <button
                onClick={() => navigate('/create-shipment', { state: { formData } })}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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