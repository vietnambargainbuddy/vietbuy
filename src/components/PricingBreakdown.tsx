import type { PricingBreakdown as PricingData } from '@/lib/types'
import { formatVnd, formatUsd } from '@/lib/pricing'
import { VND_TO_USD_RATE } from '@/lib/constants'

interface Props {
  pricing: PricingData
  quantity?: number
}

export default function PricingBreakdown({ pricing, quantity = 1 }: Props) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 w-full max-w-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Price Breakdown</h3>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>
            Product{quantity > 1 ? ` × ${quantity}` : ''}
          </span>
          <span>{formatVnd(pricing.productPriceVnd)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Product (USD)</span>
          <span>{formatUsd(pricing.productPriceUsd)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Service fee</span>
          <span>{formatUsd(pricing.serviceFeeUsd)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span className="text-[#F26522]">{formatUsd(pricing.totalUsd)}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Exchange rate: {new Intl.NumberFormat('en-US').format(VND_TO_USD_RATE)} VND / USD
      </p>
    </div>
  )
}
