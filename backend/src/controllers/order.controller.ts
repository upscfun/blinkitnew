import { Response } from 'express';
import prisma from '../config/database';
import { success, paginated, fail } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

const DELIVERY_FEE = 20;
const FREE_DELIVERY_ABOVE = 199;

export async function createOrder(req: AuthRequest, res: Response) {
  const { addressId, paymentMethod = 'COD', couponCode, note } = req.body;
  if (!addressId) return fail(res, 'addressId required');

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: req.user!.id },
  });
  if (!address) return fail(res, 'Address not found', 404);

  const cart = await prisma.cart.findUnique({
    where: { userId: req.user!.id },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) return fail(res, 'Cart is empty');

  // Check stock and compute subtotal
  let subtotal = 0;
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return fail(res, `Insufficient stock for ${item.product.name}`);
    }
    subtotal += item.product.price * item.quantity;
  }

  // Apply coupon
  let discount = 0;
  if (couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (!coupon) return fail(res, 'Invalid or expired coupon');
    if (subtotal < coupon.minOrder) {
      return fail(res, `Min order ₹${coupon.minOrder} required for this coupon`);
    }
    if (coupon.type === 'PERCENT') {
      discount = (subtotal * coupon.discount) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discount;
    }
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    });
  }

  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total = subtotal - discount + deliveryFee;

  const order = await prisma.order.create({
    data: {
      userId: req.user!.id,
      addressId,
      paymentMethod: paymentMethod as never,
      subtotal,
      deliveryFee,
      discount,
      total,
      couponCode,
      note,
      estimatedTime: 15,
      items: {
        create: cart.items.map(item => ({
          productId: item.productId,
          name: item.product.name,
          image: item.product.images[0] || null,
          price: item.product.price,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true, address: true },
  });

  // Decrement stock and clear cart
  for (const item of cart.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return success(res, order, 201);
}

export async function getMyOrders(req: AuthRequest, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: req.user!.id },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { items: true, address: true },
    }),
    prisma.order.count({ where: { userId: req.user!.id } }),
  ]);

  return paginated(res, orders, { page, limit, total });
}

export async function getOrderById(req: AuthRequest, res: Response) {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: { items: true, address: true },
  });
  if (!order) return fail(res, 'Order not found', 404);
  return success(res, order);
}

export async function cancelOrder(req: AuthRequest, res: Response) {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: { items: true },
  });
  if (!order) return fail(res, 'Order not found', 404);
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    return fail(res, 'Order cannot be cancelled at this stage');
  }

  await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });

  // Restore stock
  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }

  return success(res, { message: 'Order cancelled' });
}

// Admin controllers
export async function getAllOrders(req: AuthRequest, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status as string;

  const where = status ? { status: status as never } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { items: true, address: true, user: { select: { name: true, email: true, phone: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return paginated(res, orders, { page, limit, total });
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  const { status } = req.body;
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
    include: { items: true, address: true },
  });
  return success(res, order);
}
