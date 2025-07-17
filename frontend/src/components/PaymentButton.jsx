import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useShipment } from '../context/ShipmentContext';
import { useAuth } from '../context/AuthContext';
import { createShipment } from '../services/api';
import { toast } from 'react-toastify';
import { loadRazorpayScript } from '../services/razorpay';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/api';

const PaymentButton = ({ rateData, formData, disabled = false }) => {
  const navigate = useNavigate();
  const { addShipment, setSelectedShipment } = useShipment();
  const { user} = useAuth();
  const [confirming, setConfirming] = useState(false);

  const handlePayment = async () => {
    if (!rateData) {
      toast.error("Please wait for rate calculation to complete");
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Razorpay SDK failed to load");
      return;
    }

    setConfirming(true);

    try {
      const token = localStorage.getItem("Shipmenttoken");
      if (!token || !user) {
        toast.error("You must be logged in to proceed");
        navigate("/auth");
        return;
      }

      const amount = Math.round(rateData.breakdown.total);
      const userId = user.uid;

      // Create Razorpay order
      const orderRes = await createRazorpayOrder(amount, userId, token);

      const order = orderRes.data;

      // Razorpay options
      const options = {
  key: process.env.REACT_APP_RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: order.currency,
  name: "Shipment App",
  description: "Shipping payment",
  order_id: order.id,
  handler: async function (response) {
    await handlePaymentSuccess(response, token);
  },
  prefill: {
    name: formData.sender?.name || user.name,
    email: formData.sender?.email || user.email,
    contact: formData.sender?.phone || user.phone,
  },
  method: {
    upi: true,
    card: true,
    netbanking: true,
    wallet: true
  },
  modal: {
    ondismiss: function () {
      setConfirming(false);
      toast.info("Payment cancelled");
    }
  }
};


      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment error:", err);
      handlePaymentError(err);
    } finally {
      setConfirming(false);
    }
  };

  const handlePaymentSuccess = async (response, token) => {
    try {
      // Verify payment
      const verifyRes = await verifyRazorpayPayment({
  razorpay_order_id: response.razorpay_order_id,
  razorpay_payment_id: response.razorpay_payment_id,
  razorpay_signature: response.razorpay_signature,
}, token);

      const verified = verifyRes.data;

      if (verifyRes.status !== 200) {
        toast.error("Payment verification failed");
        return;
      }

      // Create shipment after successful payment
      await createShipmentAfterPayment(verified, token);

    } catch (err) {
      console.error("Error after payment:", err);
      toast.error("Error creating shipment after payment");
    }
  };

  const createShipmentAfterPayment = async (verified, token) => {
    const submissionData = {
      ...formData,
      paymentInfo: {
        ...verified.paymentInfo,
        amount: Math.round(rateData.breakdown.total),
        status: "Paid"
      },
      rateDetails: rateData.rateDetails,
      breakdown: rateData.breakdown,
      estimatedDelivery: rateData.rateDetails?.estimatedDelivery,
    };

    const shipmentRes = await createShipment(submissionData, token);

    if (shipmentRes.status === 200 || shipmentRes.status === 201) {
      const newShipment = {
        ...shipmentRes.data,
        id: shipmentRes.data.id || shipmentRes.data._id,
        trackingId: shipmentRes.data.trackingId,
        status: shipmentRes.data.status,
        createdAt: shipmentRes.data.createdAt || new Date().toISOString(),
        estimatedDelivery: shipmentRes.data.estimatedDelivery,
        formData,
        rateData
      };

      addShipment(newShipment);
      setSelectedShipment(newShipment);

      toast.success("Shipment confirmed after payment!");
      navigate("/success");
    } else {
      toast.error("Failed to create shipment after payment");
    }
  };

  const handlePaymentError = (err) => {
    if (err.response) {
      toast.error(`Payment failed: ${err.response.data.message || err.response.statusText}`);
    } else if (err.request) {
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error("Something went wrong during payment setup");
    }
  };

  return (
    <button
  onClick={handlePayment}
  disabled={confirming || disabled || !rateData}
  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary text-white rounded-lg font-semibold hover:brightness-90 disabled:opacity-60 transition-all shadow-md"
>
  {confirming ? (
    <>
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/80"></div>
      <span>Processing Payment...</span>
    </>
  ) : (
    <>
      <CheckCircle className="w-5 h-5" />
      <span>Pay ₹{rateData?.breakdown?.total || 0} & Confirm Shipment</span>
    </>
  )}
</button>

  );
};

export default PaymentButton;