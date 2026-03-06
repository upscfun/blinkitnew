import api from '../lib/axios';
import { Order, Address, PaginatedResponse, ApiResponse } from '../types';

export const orderApi = {
  create: (data: { addressId: string; paymentMethod?: string; couponCode?: string; note?: string }) =>
    api.post<ApiResponse<Order>>('/orders', data),

  getMyOrders: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Order>>('/orders/my', { params }),

  getById: (id: string) => api.get<ApiResponse<Order>>(`/orders/my/${id}`),

  cancel: (id: string) => api.post(`/orders/my/${id}/cancel`),

  // Admin
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<PaginatedResponse<Order>>('/orders', { params }),

  updateStatus: (id: string, status: string) =>
    api.put<ApiResponse<Order>>(`/orders/${id}/status`, { status }),
};

export const addressApi = {
  getAll: () => api.get<ApiResponse<Address[]>>('/addresses'),

  create: (data: Partial<Address>) => api.post<ApiResponse<Address>>('/addresses', data),

  update: (id: string, data: Partial<Address>) => api.put<ApiResponse<Address>>(`/addresses/${id}`, data),

  delete: (id: string) => api.delete(`/addresses/${id}`),
};
