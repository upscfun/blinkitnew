import { Request, Response } from 'express';
import prisma from '../config/database';
import { success, paginated, fail } from '../utils/response';

export async function getProducts(req: Request, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const search = (req.query.search as string) || '';
  const categorySlug = req.query.category as string;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const order = (req.query.order as string) || 'desc';

  const where: Record<string, unknown> = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ];
  }
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return paginated(res, products, { page, limit, total });
}

export async function getProductBySlug(req: Request, res: Response) {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { category: true },
  });
  if (!product || !product.isActive) return fail(res, 'Product not found', 404);
  return success(res, product);
}

export async function createProduct(req: Request, res: Response) {
  const { name, description, price, mrp, images, categoryId, stock, unit, brand, tags } = req.body;
  if (!name || !price || !mrp || !categoryId) {
    return fail(res, 'name, price, mrp and categoryId are required');
  }
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now();

  const product = await prisma.product.create({
    data: { name, slug, description, price, mrp, images: images || [], categoryId, stock: stock || 0, unit: unit || '1 pc', brand, tags: tags || [] },
    include: { category: true },
  });
  return success(res, product, 201);
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;
  const product = await prisma.product.update({
    where: { id },
    data: req.body,
    include: { category: true },
  });
  return success(res, product);
}

export async function deleteProduct(req: Request, res: Response) {
  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
  return success(res, { message: 'Product deleted' });
}

export async function searchProducts(req: Request, res: Response) {
  const q = req.query.q as string;
  if (!q) return success(res, []);

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 10,
    include: { category: { select: { name: true, slug: true } } },
  });
  return success(res, products);
}
