import { PricingBreakdown } from './types';
import { VND_TO_USD_RATE, BASE_SERVICE_FEE_USD, SERVICE_FEE_PERCENTAGE } from './constants';

export function calculatePricing(priceVnd: number, quantity: number): PricingBreakdown {
  const productPriceVnd = priceVnd * quantity;
  const productPriceUsd = productPriceVnd / VND_TO_USD_RATE;
  const serviceFeeUsd = BASE_SERVICE_FEE_USD + productPriceUsd * SERVICE_FEE_PERCENTAGE;
  const totalUsd = productPriceUsd + serviceFeeUsd;

  return {
    productPriceVnd,
    productPriceUsd: Math.round(productPriceUsd * 100) / 100,
    serviceFeeUsd: Math.round(serviceFeeUsd * 100) / 100,
    totalUsd: Math.round(totalUsd * 100) / 100,
  };
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
