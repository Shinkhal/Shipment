// routes/payment.js
import express from "express";
import {
  createOrder,
  verifyPayment, refundPayment
} from "../controllers/paymentController.js";
import { verifyFirebaseToken } from "../middlewares/authMiddleware.js"

const router = express.Router();

router.post('/create-order',verifyFirebaseToken, createOrder);
router.post("/verify",verifyFirebaseToken, verifyPayment);
router.post('/refund/:shipmentId',verifyFirebaseToken, refundPayment);


export default router;
