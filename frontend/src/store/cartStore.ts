import { create } from 'zustand';
import { Cart, CartItem } from '../types';
import { cartApi } from '../api/cart.api';
import toast from 'react-hot-toast';

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  getItemQuantity: (productId: string) => number;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  loading: false,

  fetchCart: async () => {
    try {
      const res = await cartApi.get();
      set({ cart: res.data.data });
    } catch {
      // not logged in
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ loading: true });
    try {
      const res = await cartApi.addItem(productId, quantity);
      set({ cart: res.data.data, isOpen: true });
      toast.success('Added to cart');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add item';
      toast.error(msg);
    } finally {
      set({ loading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      const res = await cartApi.updateItem(itemId, quantity);
      set({ cart: res.data.data });
    } catch {
      toast.error('Failed to update cart');
    }
  },

  removeItem: async (itemId) => {
    try {
      const res = await cartApi.removeItem(itemId);
      set({ cart: res.data.data });
    } catch {
      toast.error('Failed to remove item');
    }
  },

  clearCart: async () => {
    try {
      await cartApi.clear();
      set({ cart: null });
    } catch {
      // ignore
    }
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  getItemQuantity: (productId) => {
    const item = get().cart?.items.find((i: CartItem) => i.productId === productId);
    return item?.quantity || 0;
  },

  totalItems: () => get().cart?.items.reduce((s: number, i: CartItem) => s + i.quantity, 0) || 0,

  totalPrice: () =>
    get().cart?.items.reduce((s: number, i: CartItem) => s + i.product.price * i.quantity, 0) || 0,
}));
