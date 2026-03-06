import api from '../lib/axios';
import { Cart, ApiResponse } from '../types';

export const cartApi = {
  get: () => api.get<ApiResponse<Cart>>('/cart'),

  addItem: (productId: string, quantity = 1) =>
    api.post<ApiResponse<Cart>>('/cart/items', { productId, quantity }),

  updateItem: (itemId: string, quantity: number) =>
    api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) => api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`),

  clear: () => api.delete('/cart'),
};
