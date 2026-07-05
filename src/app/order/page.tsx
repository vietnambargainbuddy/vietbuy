'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UrlInput from '@/components/UrlInput'
import SearchResults from '@/components/SearchResults'
import ProductCard, { type Product as CardProduct } from '@/components/ProductCard'
import PricingBreakdownDisplay from '@/components/PricingBreakdown'
import OrderForm, { type OrderFormData } from '@/components/OrderForm'
import { calculatePricing, formatVnd } from '@/lib/pricing'
import type { Product as ScrapedProduct, PricingBreakdown, SearchResult } from '@/lib/types'

interface ScrapeResponse {
  product?: ScrapedProduct
  manualEntry?: boolean
  error?: string
}

interface SearchResponse {
  results?: SearchResult[]
  error?: string
}

type Step = 1 | 2 | 3

const STEP_LABELS = ['Search', 'Review Product', 'Your Details']

function toCardProduct(p: ScrapedProduct): CardProduct {
  return {
    name: p.name,
    priceVnd: p.price,
    priceUsd: p.priceUsd,
    images: p.images,
    shopName: p.shopName ?? 'Unknown shop',
    platform: p.platform === 'tiktokshop' ? 'tiktok' : 'shopee',
  }
}

function searchResultToCardProduct(r: SearchResult): CardProduct {
  return {
    name: r.name,
    priceVnd: r.priceVnd,
    priceUsd: r.priceUsd,
    images: r.images.length > 0 ? r.images : r.image ? [r.image] : [],
    shopName: r.shopName || r.shopLocation,
    platform: r.platform,
  }
}

export default function OrderPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [isManualEntry, setIsManualEntry] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardProduct, setCardProduct] = useState<CardProduct | null>(null)
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [productUrl, setProductUrl] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const [manualForm, setManualForm] = useState({
    name: '',
    price_vnd: '',
    image_url: '',
  })
  const [manualErrors, setManualErrors] = useState<Record<string, string>>({})

  async function handleScrape(url: string) {
    setError(null)
    setSearchResults([])
    setProductUrl(url)
    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    const data: ScrapeResponse = await res.json()

    if (data.manualEntry) {
      setIsManualEntry(true)
      setStep(2)
      return
    }

    if (!res.ok || data.error) {
      setError(data.error ?? 'Failed to fetch product. Please try again.')
      return
    }

    if (data.product) {
      const card = toCardProduct(data.product)
      const p = calculatePricing(data.product.price, quantity)
      setCardProduct(card)
      setPricing(p)
      setIsManualEntry(false)
      setStep(2)
    }
  }

  async function handleKeywordSearch(keyword: string) {
    setError(null)
    setSearchResults([])
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword }),
    })
    const data: SearchResponse = await res.json()

    if (!res.ok || data.error) {
      setError(data.error ?? 'Search failed. Please try again.')
      return
    }

    setSearchResults(data.results ?? [])
  }

  function handleResultSelect(result: SearchResult) {
    const card = searchResultToCardProduct(result)
    const p = calculatePricing(result.priceVnd, quantity)
    setCardProduct(card)
    setPricing(p)
    setProductUrl(result.productUrl)
    setIsManualEntry(false)
    setSearchResults([])
    setStep(2)
  }

  function validateManual(): boolean {
    const errs: Record<string, string> = {}
    if (!manualForm.name.trim()) errs.name = 'Product name is required.'
    const price = parseInt(manualForm.price_vnd, 10)
    if (!manualForm.price_vnd || isNaN(price) || price <= 0) {
      errs.price_vnd = 'Enter a valid price in VND.'
    }
    setManualErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateManual()) return
    const price = parseInt(manualForm.price_vnd, 10)
    const card: CardProduct = {
      name: manualForm.name.trim(),
      priceVnd: price,
      priceUsd: price / 25500,
      images: manualForm.image_url.trim() ? [manualForm.image_url.trim()] : [],
      shopName: 'Manual entry',
      platform: 'shopee',
    }
    const p = calculatePricing(price, quantity)
    setCardProduct(card)
    setPricing(p)
    setIsManualEntry(false)
  }

  async function handleOrderSubmit(data: OrderFormData) {
    if (!cardProduct || !pricing) return
    setSubmitLoading(true)
    setError(null)
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_url: productUrl,
          product_name: cardProduct.name,
          product_image: cardProduct.images[0] ?? '',
          product_price_vnd: cardProduct.priceVnd,
          product_price_usd: cardProduct.priceUsd,
          service_fee_usd: pricing.serviceFeeUsd,
          total_usd: pricing.totalUsd,
          quantity: data.quantity,
          customer_name: data.name,
          customer_email: data.email,
          customer_phone: data.phone,
          delivery_address: data.address,
          delivery_notes: data.notes,
          platform: cardProduct.platform,
        }),
      })

      if (!orderRes.ok) {
        const err = await orderRes.json()
        setError(err.error ?? 'Failed to create order. Please try again.')
        return
      }

      const order = await orderRes.json()

      const checkoutRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          productName: cardProduct.name,
          totalUsd: pricing.totalUsd,
          customerEmail: data.email,
        }),
      })

      if (!checkoutRes.ok) {
        const err = await checkoutRes.json()
        setError(err.error ?? 'Failed to start checkout. Please try again.')
        return
      }

      const { sessionUrl: stripeUrl } = await checkoutRes.json()
      router.push(stripeUrl)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            {STEP_LABELS.map((label, i) => {
              const num = (i + 1) as Step
              const isDone = step > num
              const isActive = step === num
              return (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                        ${isDone ? 'bg-green-500 text-white' : ''}
                        ${isActive ? 'bg-[#F26522] text-white ring-4 ring-[#F26522]/20' : ''}
                        ${!isDone && !isActive ? 'bg-gray-200 text-gray-400' : ''}
                      `}
                    >
                      {isDone ? '✓' : num}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        isActive ? 'text-[#F26522]' : isDone ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mb-5 ${
                        step > num ? 'bg-green-400' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Find Your Product</h1>
            <p className="text-sm text-gray-500 mb-6">
              Search for any product or paste a direct link
            </p>
            <UrlInput onUrlSubmit={handleScrape} onKeywordSearch={handleKeywordSearch} />
            <SearchResults results={searchResults} onSelect={handleResultSelect} />
          </div>
        )}

        {step === 2 && isManualEntry && !cardProduct && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Enter Product Details</h2>
            <p className="text-sm text-gray-500 mb-6">
              We couldn&apos;t fetch this product automatically. Please enter the details manually.
            </p>
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Product name <span className="text-[#F26522]">*</span>
                </label>
                <input
                  type="text"
                  value={manualForm.name}
                  onChange={(e) => setManualForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Vietnamese Coffee Kit"
                  className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition"
                />
                {manualErrors.name && (
                  <p className="text-xs text-red-500">{manualErrors.name}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Price in VND <span className="text-[#F26522]">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={manualForm.price_vnd}
                  onChange={(e) => setManualForm((f) => ({ ...f, price_vnd: e.target.value }))}
                  placeholder="e.g. 250000"
                  className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition"
                />
                {manualErrors.price_vnd && (
                  <p className="text-xs text-red-500">{manualErrors.price_vnd}</p>
                )}
                {manualForm.price_vnd && !isNaN(parseInt(manualForm.price_vnd)) && (
                  <p className="text-xs text-gray-400">
                    ≈ {formatVnd(parseInt(manualForm.price_vnd))}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Image URL{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  value={manualForm.image_url}
                  onChange={(e) => setManualForm((f) => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://..."
                  className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-600 font-semibold text-sm py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#F26522] hover:bg-[#d9551a] text-white font-semibold text-sm py-3 rounded-xl transition-colors"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && cardProduct && pricing && (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Review Your Product</h2>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <ProductCard product={cardProduct} />
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => {
                        const q = Math.max(1, parseInt(e.target.value, 10) || 1)
                        setQuantity(q)
                        setPricing(calculatePricing(cardProduct.priceVnd, q))
                      }}
                      className="w-20 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition"
                    />
                  </div>
                  <PricingBreakdownDisplay pricing={pricing} quantity={quantity} />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep(1)
                  setCardProduct(null)
                  setPricing(null)
                  setIsManualEntry(false)
                }}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold text-sm py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-[#F26522] hover:bg-[#d9551a] text-white font-semibold text-sm py-3 rounded-xl transition-colors"
              >
                Continue to Checkout
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your Details</h2>
            <p className="text-sm text-gray-500 mb-6">
              Where should we deliver your order?
            </p>
            <OrderForm onSubmit={handleOrderSubmit} />
            {submitLoading && (
              <p className="text-sm text-gray-400 mt-4 text-center animate-pulse">
                Creating your order…
              </p>
            )}
            <button
              onClick={() => setStep(2)}
              className="mt-3 w-full border border-gray-200 text-gray-500 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back to Product
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
