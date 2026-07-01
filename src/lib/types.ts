export type OrderStatus = 'pending' | 'paid' | 'purchasing' | 'purchased' | 'shipping' | 'delivered' | 'cancelled' | 'refunded';

export type Platform = 'shopee' | 'tiktokshop';

export interface Product {
  url: string;
  platform: Platform;
  name: string;
  price: number;
  priceUsd: number;
  images: string[];
  variants?: ProductVariant[];
  shopName?: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
  selected?: string;
}

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  delivery_address: string;
  delivery_notes?: string;
  product_url: string;
  platform: Platform;
  product_name: string;
  product_image: string;
  product_price_vnd: number;
  product_price_usd: number;
  service_fee_usd: number;
  total_usd: number;
  quantity: number;
  variant?: string;
  status: OrderStatus;
  stripe_payment_id?: string;
  tracking_number?: string;
  admin_notes?: string;
}

export interface PricingBreakdown {
  productPriceVnd: number;
  productPriceUsd: number;
  serviceFeeUsd: number;
  totalUsd: number;
}

export interface UpdateOrderBody {
  status?: OrderStatus;
  tracking_number?: string;
  admin_notes?: string;
}
