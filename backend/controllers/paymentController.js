// controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from 'dotenv';
import { db } from "../config/firebase.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// CREATE ORDER
// CREATE ORDER (cleaned version)
export const createOrder = async (req, res) => {
  const { amount, userId } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }
  if(!userId){
    return res.status(400).json({ error: "User ID is required" });
  }

  const options = {
    amount: Math.round(amount * 100), // paise
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,  // generic receipt ID
    notes: {
      userId: userId,
    },
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(201).json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      receipt: order.receipt,
      status: order.status,
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
};


// VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  try {
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Just return paymentInfo
    res.status(200).json({
      message: "Payment verified",
      paymentInfo: {
        status: "Paid",
        transactionId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        paidAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ error: "Server error during payment verification" });
  }
};


// REFUND PAYMENT
export const refundPayment = async (req, res) => {
  const { shipmentId } = req.params;

  try {
    const docRef = db.collection("shipments").doc(shipmentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const shipment = doc.data();

    if (!shipment.payment || shipment.payment.status !== "Paid") {
      return res.status(400).json({ error: "Payment not eligible for refund" });
    }

    const paymentId = shipment.payment.transactionId;

    // Razorpay Refund API call
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(shipment.payment.amount * 100), // in paise
      notes: {
        shipmentId,
        reason: "User Cancelled",
      },
    });

    // Update Firestore
    await docRef.update({
      status: "Cancelled",
      cancelledAt: new Date(),
      "payment.status": "Refunded",
      refundedAt: new Date(),
      statusHistory: [
        ...shipment.statusHistory,
        {
          status: "Cancelled",
          timestamp: new Date(),
          description: "Shipment cancelled and refunded to user",
        },
      ],
    });

    return res.status(200).json({
      message: "Refund processed and shipment cancelled",
      refund,
    });
  } catch (err) {
    console.error("Refund error:", err);
    return res.status(500).json({ error: "Refund failed" });
  }
};
