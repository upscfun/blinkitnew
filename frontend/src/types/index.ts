export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  color?: string;
  displayOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  mrp: number;
  images: string[];
  categoryId: string;
  category?: Category;
  stock: number;
  unit: string;
  brand?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface Address {
  id: string;
  label: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'UPI' | 'CARD' | 'WALLET';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  addressId: string;
  address: Address;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  note?: string;
  estimatedTime?: number;
  items: OrderItem[];
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
