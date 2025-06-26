import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/shipments';

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
