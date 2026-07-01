export const APP_NAME = 'VietBuy';

export const VND_TO_USD_RATE = 25500;

export const BASE_SERVICE_FEE_USD = 2;

export const SERVICE_FEE_PERCENTAGE = 0.12;

export const SUPPORTED_PLATFORMS = {
  shopee: {
    name: 'Shopee',
    urlPatterns: ['shopee.vn'],
  },
  tiktokshop: {
    name: 'TikTok Shop',
    urlPatterns: ['tiktok.com/shop', 'shop.tiktok.com'],
  },
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Payment',
  paid: 'Payment Received',
  purchasing: 'Purchasing Item',
  purchased: 'Item Purchased',
  shipping: 'Shipping to You',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};
