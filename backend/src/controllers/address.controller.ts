import { Response } from 'express';
import prisma from '../config/database';
import { success, fail } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export async function getAddresses(req: AuthRequest, res: Response) {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.id },
    orderBy: { isDefault: 'desc' },
  });
  return success(res, addresses);
}

export async function createAddress(req: AuthRequest, res: Response) {
  const { label, street, landmark, city, state, pincode, lat, lng, isDefault } = req.body;
  if (!street || !city || !state || !pincode) {
    return fail(res, 'street, city, state, pincode are required');
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user!.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: { userId: req.user!.id, label, street, landmark, city, state, pincode, lat, lng, isDefault: isDefault || false },
  });
  return success(res, address, 201);
}

export async function updateAddress(req: AuthRequest, res: Response) {
  const address = await prisma.address.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
  });
  if (!address) return fail(res, 'Address not found', 404);

  if (req.body.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user!.id },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({ where: { id: req.params.id }, data: req.body });
  return success(res, updated);
}

export async function deleteAddress(req: AuthRequest, res: Response) {
  const address = await prisma.address.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
  });
  if (!address) return fail(res, 'Address not found', 404);
  await prisma.address.delete({ where: { id: req.params.id } });
  return success(res, { message: 'Address deleted' });
}
