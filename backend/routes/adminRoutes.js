import express from 'express';
import { login, dashboard , getAllShipments, updateShipmentStatus} from '../controllers/adminController.js';
import { verifyAdminToken } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/dashboard', verifyAdminToken, dashboard);
router.get('/shipments', verifyAdminToken, getAllShipments);
router.put('/shipments/:id/status', verifyAdminToken, updateShipmentStatus);

export default router;
