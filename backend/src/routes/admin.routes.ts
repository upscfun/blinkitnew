import { Router } from 'express';
import { getDashboardStats, getUsers, getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

export default router;
