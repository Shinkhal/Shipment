import express from 'express';
import { login, dashboard , getAllShipments, updateShipmentStatus, getAllUserwithShipments} from '../controllers/adminController.js';
import { verifyAdminToken } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/dashboard', verifyAdminToken, dashboard);
router.get('/shipments', verifyAdminToken, getAllShipments);
router.put('/shipments/:id/status', verifyAdminToken, updateShipmentStatus);
router.get('/users/shipments', verifyAdminToken, getAllUserwithShipments);

export default router;
