import axios from 'axios';

const backendurl = process.env.REACT_APP_BACKEND_URL;

const BASE_URL = `${backendurl}/shipments`;

// 🔐 Auth header helper
const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// 1️⃣ Create new shipment
export const createShipment = async (data, token) =>
  axios.post(`${BASE_URL}/create`, data, authHeader(token));

// 2️⃣ Get active shipments
export const getActiveShipments = async (token) =>
  axios.get(`${BASE_URL}/active`, authHeader(token));

// 3️⃣ Get shipment history with optional filters
export const getShipmentHistory = async (filters, token) => {
  const params = new URLSearchParams(filters).toString();
  return axios.get(`${BASE_URL}/history?${params}`, authHeader(token));
};

// 4️⃣ Track by tracking ID (public)
export const getShipmentByTrackingId = async (trackingId) =>
  axios.get(`${BASE_URL}/tracking/${trackingId}`);

// 5️⃣ Cancel a shipment
export const cancelShipment = async (shipmentId, token) =>
  axios.put(`${BASE_URL}/${shipmentId}/cancel`, {}, authHeader(token));

export const refundShipment = async (shipmentId, token) =>
  axios.post(`${backendurl}/payment/refund/${shipmentId}`, {}, authHeader(token));



// 6️⃣ Create Razorpay Order
export const createRazorpayOrder = async (amount, userId, token) =>
  axios.post(
    `${backendurl}/payment/create-order`,
    { amount, userId },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );


// 7️⃣ Verify Razorpay payment
export const verifyRazorpayPayment = async (paymentDetails, token) =>
  axios.post(`${backendurl}/payment/verify`, paymentDetails, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

// 🔍 Health check API (ping backend)
export const pingBackend = async () =>
  axios.get(`${backendurl}/health`);
