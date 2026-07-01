'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Package, MapPin, Truck } from 'lucide-react'
import OrderStatus from '@/components/OrderStatus'
import type { Order, OrderStatus as OrderStatusType } from '@/lib/types'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { formatUsd } from '@/lib/pricing'

type OrderStatusValue = 'paid' | 'purchasing' | 'purchased' | 'shipping' | 'delivered'

const TRACKABLE_STATUSES = new Set<OrderStatusType>(['paid', 'purchasing', 'purchased', 'shipping', 'delivered'])

function isTrackable(status: OrderStatusType): status is OrderStatusValue {
  return TRACKABLE_STATUSES.has(status)
}

const STATUS_BADGE: Record<OrderStatusType, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  purchasing: 'bg-indigo-100 text-indigo-700',
  purchased: 'bg-purple-100 text-purple-700',
  shipping: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
}

export default function OrderDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    setShowSuccess(new URLSearchParams(window.location.search).get('success') === 'true')
  }, [])

  useEffect(() => {
    if (!id) return
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.error ?? 'Order not found.')
          return
        }
        const data: Order = await res.json()
        setOrder(data)
      } catch {
        setError('Failed to load order. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#F26522] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading order…</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Order not found</h2>
          <p className="text-sm text-gray-500 mb-6">{error ?? 'This order does not exist.'}</p>
          <Link
            href="/orders"
            className="inline-block bg-[#F26522] text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-[#d9551a] transition-colors"
          >
            Find My Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-green-800">Payment received!</p>
              <p className="text-sm text-green-700 mt-0.5">
                Thank you for your order. We&apos;ll start processing it shortly.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
              <p className="text-sm font-mono font-medium text-gray-700">{order.id}</p>
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-500'
              }`}
            >
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>

          <div className="flex gap-4 items-start">
            {order.product_image ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <Image
                  src={order.product_image}
                  alt={order.product_name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-7 h-7 text-gray-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                {order.product_name}
              </p>
              {order.quantity > 1 && (
                <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
              )}
              <p className="text-base font-bold text-[#F26522] mt-1">
                {formatUsd(order.total_usd)}
              </p>
            </div>
          </div>
        </div>

        {isTrackable(order.status) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-5">Order Progress</h2>
            <OrderStatus currentStatus={order.status as OrderStatusValue} />
          </div>
        )}

        {order.tracking_number && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5 flex items-center gap-3">
            <Truck className="w-5 h-5 text-[#F26522] flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Tracking Number</p>
              <p className="text-sm font-mono font-medium text-gray-800">{order.tracking_number}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-800">Delivery Address</h2>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{order.delivery_address}</p>
          {order.delivery_notes && (
            <p className="text-xs text-gray-400 mt-2">{order.delivery_notes}</p>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/orders" className="text-sm text-[#F26522] font-medium hover:underline">
            ← View all orders
          </Link>
        </div>
      </div>
    </div>
  )
}
