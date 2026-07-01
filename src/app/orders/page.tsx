'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Package, Loader2 } from 'lucide-react'
import type { Order, OrderStatus } from '@/lib/types'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { formatUsd } from '@/lib/pricing'

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  purchasing: 'bg-indigo-100 text-indigo-700',
  purchased: 'bg-purple-100 text-purple-700',
  shipping: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

export default function OrdersPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setOrders(null)
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(trimmed)}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to fetch orders.')
        return
      }
      const data: Order[] = await res.json()
      setOrders(data)
    } catch {
      setError('Something went wrong. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Package className="w-10 h-10 text-[#F26522] mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Orders</h1>
          <p className="text-gray-500 text-sm">
            Enter the email address you used when placing your order.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#F26522] hover:bg-[#d9551a] disabled:opacity-60 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? 'Searching…' : 'Find Orders'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {orders !== null && orders.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            No orders found for <span className="font-medium text-gray-700">{email}</span>.
          </div>
        )}

        {orders && orders.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">
              Found {orders.length} order{orders.length !== 1 ? 's' : ''} for{' '}
              <span className="font-medium text-gray-700">{email}</span>
            </p>
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:border-[#F26522]/40 hover:shadow-md transition-all"
              >
                {order.product_image ? (
                  <img
                    src={order.product_image}
                    alt={order.product_name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1 mb-0.5">
                    {order.product_name}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {' · '}
                    {formatUsd(order.total_usd)}
                  </p>
                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                      STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <svg
                  className="w-4 h-4 text-gray-300 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
