import { Request, Response } from 'express';
import prisma from '../config/database';
import { success, fail } from '../utils/response';

export async function getCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return success(res, categories);
}

export async function getCategoryBySlug(req: Request, res: Response) {
  const category = await prisma.category.findUnique({
    where: { slug: req.params.slug },
    include: { _count: { select: { products: true } } },
  });
  if (!category) return fail(res, 'Category not found', 404);
  return success(res, category);
}

export async function createCategory(req: Request, res: Response) {
  const { name, image, color, displayOrder } = req.body;
  if (!name) return fail(res, 'Name is required');
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const category = await prisma.category.create({
    data: { name, slug, image, color, displayOrder: displayOrder || 0 },
  });
  return success(res, category, 201);
}

export async function updateCategory(req: Request, res: Response) {
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return success(res, category);
}

export async function deleteCategory(req: Request, res: Response) {
  await prisma.category.update({ where: { id: req.params.id }, data: { isActive: false } });
  return success(res, { message: 'Category deleted' });
}
