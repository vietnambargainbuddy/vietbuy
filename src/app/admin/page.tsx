'use client'

import { useState } from 'react'
import { Lock, Loader2, ChevronDown, ChevronUp, Save } from 'lucide-react'
import type { Order, OrderStatus } from '@/lib/types'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import { formatUsd } from '@/lib/pricing'

const ALL_STATUSES: OrderStatus[] = [
  'pending', 'paid', 'purchasing', 'purchased', 'shipping', 'delivered', 'cancelled', 'refunded',
]

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

interface EditState {
  status: OrderStatus
  tracking_number: string
  admin_notes: string
  saving: boolean
  error: string | null
}

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'admin'
    if (password === expected) {
      onAuth()
    } else {
      setError('Incorrect password.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm mx-4">
        <div className="text-center mb-6">
          <Lock className="w-10 h-10 text-[#F26522] mx-auto mb-3" />
          <h1 className="text-xl font-bold text-gray-900">Admin Access</h1>
          <p className="text-sm text-gray-500 mt-1">Enter the admin password to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null) }}
            placeholder="Password"
            autoFocus
            className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            className="bg-[#F26522] hover:bg-[#d9551a] text-white font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

function OrderRow({
  order,
  onSave,
}: {
  order: Order
  onSave: (id: string, patch: Partial<Order>) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [edit, setEdit] = useState<EditState>({
    status: order.status,
    tracking_number: order.tracking_number ?? '',
    admin_notes: order.admin_notes ?? '',
    saving: false,
    error: null,
  })

  async function handleSave() {
    setEdit((e) => ({ ...e, saving: true, error: null }))
    try {
      await onSave(order.id, {
        status: edit.status,
        tracking_number: edit.tracking_number || undefined,
        admin_notes: edit.admin_notes || undefined,
      })
    } catch {
      setEdit((e) => ({ ...e, error: 'Failed to save.' }))
    } finally {
      setEdit((e) => ({ ...e, saving: false }))
    }
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm items-center">
          <span className="font-mono text-xs text-gray-500 truncate">{order.id.slice(0, 8)}…</span>
          <span className="text-gray-800 font-medium line-clamp-1">{order.product_name}</span>
          <span className="hidden sm:block text-gray-600 truncate">{order.customer_name}</span>
          <span className="hidden sm:block">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-500'
              }`}
            >
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </span>
          </span>
          <div className="hidden sm:flex items-center justify-between">
            <span className="font-semibold text-[#F26522]">{formatUsd(order.total_usd)}</span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </div>

      {expanded && (
        <div className="bg-gray-50 border-t border-gray-100 px-4 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium text-gray-800">Customer:</span> {order.customer_name}
            </div>
            <div>
              <span className="font-medium text-gray-800">Email:</span> {order.customer_email}
            </div>
            {order.customer_phone && (
              <div>
                <span className="font-medium text-gray-800">Phone:</span> {order.customer_phone}
              </div>
            )}
            <div>
              <span className="font-medium text-gray-800">Date:</span>{' '}
              {new Date(order.created_at).toLocaleString()}
            </div>
            <div className="sm:col-span-2">
              <span className="font-medium text-gray-800">Address:</span> {order.delivery_address}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Status</label>
              <select
                value={edit.status}
                onChange={(e) => setEdit((s) => ({ ...s, status: e.target.value as OrderStatus }))}
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition bg-white"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Tracking Number</label>
              <input
                type="text"
                value={edit.tracking_number}
                onChange={(e) => setEdit((s) => ({ ...s, tracking_number: e.target.value }))}
                placeholder="e.g. VN1234567890"
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Admin Notes</label>
              <textarea
                value={edit.admin_notes}
                onChange={(e) => setEdit((s) => ({ ...s, admin_notes: e.target.value }))}
                placeholder="Internal notes…"
                rows={2}
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition resize-none"
              />
            </div>

            {edit.error && <p className="text-xs text-red-500">{edit.error}</p>}

            <button
              onClick={handleSave}
              disabled={edit.saving}
              className="flex items-center justify-center gap-2 bg-[#F26522] hover:bg-[#d9551a] disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
            >
              {edit.saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {edit.saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all')

  async function fetchOrders() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/orders')
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to load orders.')
        return
      }
      const data: Order[] = await res.json()
      setOrders(data)
    } catch {
      setError('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }

  function handleAuth() {
    setAuthenticated(true)
    fetchOrders()
  }

  async function handleSave(id: string, patch: Partial<Order>) {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? 'Failed to save.')
    }
    const updated: Order = await res.json()
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
  }

  if (!authenticated) {
    return <PasswordGate onAuth={handleAuth} />
  }

  const filterTabs: Array<{ key: OrderStatus | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    ...ALL_STATUSES.map((s) => ({ key: s, label: ORDER_STATUS_LABELS[s] })),
  ]

  const filtered =
    activeFilter === 'all' ? orders : orders.filter((o) => o.status === activeFilter)

  const counts: Partial<Record<OrderStatus | 'all', number>> = { all: orders.length }
  for (const o of orders) {
    counts[o.status] = (counts[o.status] ?? 0) + 1
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-white transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {filterTabs.map(({ key, label }) => {
            const count = counts[key] ?? 0
            const isActive = activeFilter === key
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  isActive
                    ? 'bg-[#F26522] text-white border-[#F26522]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {label}
                {count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {loading && orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading orders…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No orders found.</div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="hidden sm:grid grid-cols-5 gap-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span>Order ID</span>
              <span>Product</span>
              <span>Customer</span>
              <span>Status</span>
              <span>Total</span>
            </div>
            {filtered.map((order) => (
              <OrderRow key={order.id} order={order} onSave={handleSave} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
