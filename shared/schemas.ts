import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(80),
  email: z.email('Enter a valid email').toLowerCase(),
  password: z.string().min(8, 'Use at least 8 characters').max(128),
});
export const loginSchema = registerSchema.pick({ email: true, password: true });
export const addressSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  line1: z.string().trim().min(5).max(180),
  locality: z.string().trim().max(80).default(''),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code'),
  type: z.enum(['Home', 'Work']).default('Home'),
});
export const cartLineSchema = z.object({
  productId: z.number().int().positive(),
  size: z.string().min(1).max(20),
  quantity: z.number().int().min(1).max(10),
});
export const cartSchema = z.object({ items: z.array(cartLineSchema).max(50) });
export const checkoutSchema = z.object({
  items: z.array(cartLineSchema).min(1).max(50),
  address: addressSchema,
  coupon: z.enum(['', 'WELCOME10']).default(''),
  idempotencyKey: z.uuid(),
  clearCart: z.boolean().default(true),
});
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(100),
  comment: z.string().trim().min(10).max(1000),
});
export type AddressInput = z.input<typeof addressSchema>;
export type Address = z.infer<typeof addressSchema> & { id?: string };
export type User = { id: string; name: string; email: string };
export type Order = {
  id: string;
  createdAt: string;
  status: 'placed' | 'cancelled';
  address: Address;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon: string;
  items: {
    productId: number;
    title: string;
    image: string;
    size: string;
    quantity: number;
    price: number;
  }[];
};
