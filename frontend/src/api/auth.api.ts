import api from '../lib/axios';
import { User } from '../types';

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post<{ data: { user: User; token: string } }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ data: { user: User; token: string } }>('/auth/login', data),

  getMe: () => api.get<{ data: User }>('/auth/me'),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put<{ data: User }>('/auth/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/me/password', data),
};
