import { Response } from 'express';

export function success(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function paginated(
  res: Response,
  data: unknown,
  meta: { page: number; limit: number; total: number }
) {
  return res.json({
    success: true,
    data,
    meta: { ...meta, totalPages: Math.ceil(meta.total / meta.limit) },
  });
}

export function fail(res: Response, message: string, status = 400) {
  return res.status(status).json({ success: false, message });
}
