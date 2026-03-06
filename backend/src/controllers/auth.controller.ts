import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { signToken } from '../utils/jwt';
import { success, fail } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export async function register(req: Request, res: Response) {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return fail(res, 'Name, email and password are required');
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return fail(res, 'Email already registered');

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, phone },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
  const token = signToken({ id: user.id, role: user.role });
  return success(res, { user, token }, 201);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return fail(res, 'Email and password required');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return fail(res, 'Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return fail(res, 'Invalid credentials', 401);

  const token = signToken({ id: user.id, role: user.role });
  const { password: _, ...safeUser } = user;
  return success(res, { user: safeUser, token });
}

export async function getMe(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });
  if (!user) return fail(res, 'User not found', 404);
  return success(res, user);
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const { name, phone } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name, phone },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
  return success(res, user);
}

export async function changePassword(req: AuthRequest, res: Response) {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return fail(res, 'User not found', 404);

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return fail(res, 'Current password is incorrect');

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  return success(res, { message: 'Password updated' });
}
