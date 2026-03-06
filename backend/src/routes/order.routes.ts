import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/my/:id', getOrderById);
router.post('/my/:id/cancel', cancelOrder);

// Admin
router.get('/', requireAdmin, getAllOrders);
router.put('/:id/status', requireAdmin, updateOrderStatus);

export default router;
