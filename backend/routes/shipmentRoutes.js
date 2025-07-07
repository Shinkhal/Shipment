import express from 'express';
import { createShipment, getActiveShipments, getShipmentHistory, getShipmentByTrackingId, cancelShipment} from '../controllers/shipmentController.js';
import { verifyFirebaseToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', verifyFirebaseToken, createShipment);
router.get('/active', verifyFirebaseToken, getActiveShipments);
router.get('/history', verifyFirebaseToken, getShipmentHistory);
router.get('/tracking/:trackingId', getShipmentByTrackingId);
router.put('/:id/cancel', verifyFirebaseToken, cancelShipment);


export default router;