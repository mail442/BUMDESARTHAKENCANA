/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  nama: string;
  description: string;
  price: number;
  unit: 'kg' | 'butir';
  stock: number;
  imageUrl: string;
  category: string;
  isPromo?: boolean;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface PromoBanner {
  id: string;
  text: string;
  isActive: boolean;
  type: 'info' | 'promo' | 'warning';
  updatedAt: string;
}

export type PaymentMethod = 'COD' | 'Transfer';
export type OrderStatus = 'Belum Bayar' | 'Dikemas' | 'Dikirim' | 'Selesai' | 'Batal';

export interface Order {
  id: string;
  customerName: string;
  address: string;
  dusun: string;
  whatsapp: string;
  items: OrderItem[];
  subtotal?: number;
  biayaOngkir?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'customer';
}
