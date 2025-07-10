import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, CreditCard,  AlertCircle } from 'lucide-react';

const CancellationSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate('/active');
    return null;
  }

  const { shipmentId, wasPaid, refundAmount, refundId, refundedAt } = state;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cancellation Successful</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <div className="flex items-center text-white">
              <Package className="h-5 w-5 mr-2" />
              <span className="font-medium">Shipment Details</span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-4">
            {/* Shipment ID */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Shipment ID</span>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                #{shipmentId}
              </span>
            </div>

            {/* Payment Status */}
            <div className="py-3">
              {wasPaid ? (
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <CreditCard className="h-5 w-5 text-green-600 mr-3" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-green-800">Refund Processed</h3>
                      <p className="text-sm text-green-700">Your payment has been refunded</p>
                    </div>
                  </div>

                  {/* Refund Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Refund Amount</span>
                      <span className="text-lg font-bold text-green-600">₹{refundAmount.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Refund ID</span>
                      <span className="text-sm font-mono text-gray-900">{refundId}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Processed At</span>
                      <span className="text-sm text-gray-900">
                        {new Date(refundedAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Refund Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Refund Processing Time</p>
                        <p>The refund will be credited to your original payment method within 5-7 business days.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <AlertCircle className="h-5 w-5 text-gray-600 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-800">No Payment Made</h3>
                    <p className="text-sm text-gray-600">No refund was needed as no payment was processed</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancellationSuccess;