import { Response } from 'express';
import prisma from '../config/database';
import { success, fail } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { include: { category: { select: { name: true, slug: true } } } },
        },
      },
    },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: { include: { category: { select: { name: true, slug: true } } } },
          },
        },
      },
    });
  }
  return cart;
}

export async function getCart(req: AuthRequest, res: Response) {
  const cart = await getOrCreateCart(req.user!.id);
  return success(res, cart);
}

export async function addToCart(req: AuthRequest, res: Response) {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return fail(res, 'productId required');

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) return fail(res, 'Product not found', 404);
  if (product.stock < quantity) return fail(res, 'Insufficient stock');

  const cart = await getOrCreateCart(req.user!.id);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
  }

  const updated = await getOrCreateCart(req.user!.id);
  return success(res, updated);
}

export async function updateCartItem(req: AuthRequest, res: Response) {
  const { quantity } = req.body;
  const { itemId } = req.params;

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }

  const cart = await getOrCreateCart(req.user!.id);
  return success(res, cart);
}

export async function removeFromCart(req: AuthRequest, res: Response) {
  await prisma.cartItem.delete({ where: { id: req.params.itemId } });
  const cart = await getOrCreateCart(req.user!.id);
  return success(res, cart);
}

export async function clearCart(req: AuthRequest, res: Response) {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  return success(res, { message: 'Cart cleared' });
}
