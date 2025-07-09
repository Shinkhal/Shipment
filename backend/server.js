import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import shipmentRoutes from './routes/shipmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js'

dotenv.config();

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.use(express.json());

// Routes
app.use('/api/shipments', shipmentRoutes);
app.use('/api/payment',paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
