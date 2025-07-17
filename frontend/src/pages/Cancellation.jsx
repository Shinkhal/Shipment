import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, CreditCard, AlertCircle } from 'lucide-react';

const CancellationSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate('/active');
    return null;
  }

  const { shipmentId, wasPaid, refundAmount, refundId, refundedAt } = state;

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
        <div className="max-w-lg mx-auto">
          
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-success/20 rounded-full blur-xl scale-150"></div>
                <div className="relative bg-surface/90 backdrop-blur-sm border border-success/20 p-6 rounded-2xl shadow-card">
                  <CheckCircle className="w-16 h-16 text-success" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-textPrimary mb-3 tracking-tight">
              Cancellation Successful
            </h1>
            <p className="text-lg text-textSecondary">
              Your shipment has been successfully cancelled
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-surface/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-card overflow-hidden mb-6">
            
            {/* Header */}
            <div className="relative bg-surface/50 backdrop-blur-sm border-b border-white/10 px-6 py-4">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success/50 via-success to-success/50"></div>
              <div className="flex items-center text-textPrimary">
                <div className="p-2 bg-success/10 rounded-xl mr-3">
                  <Package className="h-5 w-5 text-success" />
                </div>
                <span className="font-semibold">Shipment Details</span>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              
              {/* Shipment ID */}
              <div className="flex items-center justify-between py-4 border-b border-border/30">
                <span className="text-sm font-medium text-textSecondary">Shipment ID</span>
                <span className="text-sm font-mono bg-surface/80 backdrop-blur-sm border border-white/20 px-3 py-2 rounded-lg text-textPrimary">
                  #{shipmentId}
                </span>
              </div>

              {/* Payment Status */}
              <div className="py-2">
                {wasPaid ? (
                  <div className="space-y-6">
                    
                    {/* Refund Processed Alert */}
                    <div className="bg-success/10 backdrop-blur-sm border border-success/20 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-success/20 rounded-xl mr-3">
                          <CreditCard className="h-5 w-5 text-success" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-success mb-1">Refund Processed</h3>
                          <p className="text-sm text-textSecondary">Your payment has been successfully refunded</p>
                        </div>
                      </div>
                    </div>

                    {/* Refund Details */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-border/30">
                        <span className="text-sm font-medium text-textSecondary">Refund Amount</span>
                        <span className="text-xl font-bold text-success">₹{refundAmount.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-border/30">
                        <span className="text-sm font-medium text-textSecondary">Refund ID</span>
                        <span className="text-sm font-mono text-textPrimary bg-surface/60 px-2 py-1 rounded-lg">
                          {refundId}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm font-medium text-textSecondary">Processed At</span>
                        <span className="text-sm text-textPrimary font-medium">
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
                    <div className="bg-accent/10 backdrop-blur-sm border border-accent/20 rounded-xl p-4">
                      <div className="flex items-start">
                        <div className="p-2 bg-accent/20 rounded-xl mr-3 flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-accent" />
                        </div>
                        <div className="text-sm text-textSecondary">
                          <p className="font-semibold text-textPrimary mb-2">Refund Processing Time</p>
                          <p className="leading-relaxed">
                            The refund will be credited to your original payment method within 5-7 business days.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface/60 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-textSecondary/10 rounded-xl mr-3">
                        <AlertCircle className="h-5 w-5 text-textSecondary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-textPrimary mb-1">No Payment Made</h3>
                        <p className="text-sm text-textSecondary">No refund was needed as no payment was processed</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <div className="bg-surface/60 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-card">
              <p className="text-sm text-textSecondary">
                Need help? Contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationSuccess;