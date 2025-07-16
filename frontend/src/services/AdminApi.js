// src/api/adminApi.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Create a custom Axios instance for admin
const adminAxios = axios.create({
  baseURL: `${BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request automatically
adminAxios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------
// ✅ Admin API Endpoints
// -------------------------

// Login (no token required)
export const adminLogin = (FormData) =>
  axios.post(`${BASE_URL}/admin/login`, FormData);

// Dashboard stats (requires token)
export const fetchDashboardStats = () =>
  adminAxios.get('/dashboard');

// Get all shipments
export const fetchAllShipments = () =>
  adminAxios.get('/shipments');

// Update shipment status
export const updateShipmentStatus = (shipmentId, data) =>
  adminAxios.put(`/shipments/${shipmentId}/status`, data);

// Fetch all users with their shipment count
export const fetchAllUsersWithShipments = () =>
  adminAxios.get('/users/shipments');
