import { Request, Response } from 'express';
import prisma from '../config/database';
import { success } from '../utils/response';

export async function getDashboardStats(_req: Request, res: Response) {
  const [totalUsers, totalOrders, totalProducts, totalCategories, recentOrders, revenue] =
    await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } },
      }),
    ]);

  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  return success(res, {
    totalUsers,
    totalOrders,
    totalProducts,
    totalCategories,
    totalRevenue: revenue._sum.total || 0,
    recentOrders,
    ordersByStatus,
  });
}

export async function getUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return success(res, users);
}

export async function getCoupons(_req: Request, res: Response) {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  return success(res, coupons);
}

export async function createCoupon(req: Request, res: Response) {
  const coupon = await prisma.coupon.create({ data: req.body });
  return success(res, coupon, 201);
}

export async function updateCoupon(req: Request, res: Response) {
  const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data: req.body });
  return success(res, coupon);
}

export async function deleteCoupon(req: Request, res: Response) {
  await prisma.coupon.delete({ where: { id: req.params.id } });
  return success(res, { message: 'Coupon deleted' });
}
