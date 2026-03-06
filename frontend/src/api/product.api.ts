import api from '../lib/axios';
import { Product, Category, PaginatedResponse, ApiResponse } from '../types';

export const productApi = {
  getAll: (params?: { page?: number; limit?: number; category?: string; search?: string; sortBy?: string }) =>
    api.get<PaginatedResponse<Product>>('/products', { params }),

  getBySlug: (slug: string) => api.get<ApiResponse<Product>>(`/products/${slug}`),

  search: (q: string) => api.get<ApiResponse<Product[]>>('/products/search', { params: { q } }),

  create: (data: Partial<Product>) => api.post<ApiResponse<Product>>('/products', data),

  update: (id: string, data: Partial<Product>) => api.put<ApiResponse<Product>>(`/products/${id}`, data),

  delete: (id: string) => api.delete(`/products/${id}`),
};

export const categoryApi = {
  getAll: () => api.get<ApiResponse<Category[]>>('/categories'),

  create: (data: Partial<Category>) => api.post<ApiResponse<Category>>('/categories', data),

  update: (id: string, data: Partial<Category>) => api.put<ApiResponse<Category>>(`/categories/${id}`, data),

  delete: (id: string) => api.delete(`/categories/${id}`),
};
