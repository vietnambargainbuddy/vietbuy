import { NextRequest, NextResponse } from 'next/server'
import { calculatePricing } from '@/lib/pricing'
import type { SearchResult, Platform } from '@/lib/types'

export const maxDuration = 15

const TIKI_API = 'https://tiki.vn/api/v2/products'
const LAZADA_API = 'https://www.lazada.vn/catalog/'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

interface TikiItem {
  id: number
  name: string
  price: number
  original_price: number
  discount_rate: number
  thumbnail_url: string
  rating_average: number
  review_count: number
  quantity_sold?: { value: number; text: string }
  url_path: string
  seller?: { name: string; is_best_store: boolean }
  badges_new?: { code: string }[]
}

interface LazadaItem {
  itemId: string
  name: string
  price: string
  originalPrice: string
  discount: string
  image: string
  ratingScore: string
  review: string
  itemSoldCntShow: string
  location: string
  sellerName: string
  brandName: string
  itemUrl: string
  isOfficialStore: boolean
}

function parseSold(text: string): number {
  if (!text) return 0
  const match = text.match(/([\d.]+)\s*K/i)
  if (match) return Math.round(parseFloat(match[1]) * 1000)
  const num = parseInt(text.replace(/\D/g, ''), 10)
  return isNaN(num) ? 0 : num
}

async function searchTiki(keyword: string): Promise<SearchResult[]> {
  try {
    const url = `${TIKI_API}?q=${encodeURIComponent(keyword)}&limit=10&page=1&sort=top_seller`
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const json = await res.json()
    const items: TikiItem[] = json.data ?? []

    return items.map((item) => {
      const priceVnd = item.price
      const priceUsd = calculatePricing(priceVnd, 1).productPriceUsd
      const badges = item.badges_new?.map((b) => b.code) ?? []

      return {
        id: String(item.id),
        name: item.name,
        image: item.thumbnail_url ?? '',
        images: item.thumbnail_url ? [item.thumbnail_url] : [],
        priceVnd,
        priceUsd,
        ...(item.original_price > item.price
          ? { originalPriceVnd: item.original_price }
          : {}),
        sold: item.quantity_sold?.value ?? 0,
        rating: item.rating_average ?? 0,
        ratingCount: item.review_count ?? 0,
        shopName: item.seller?.name ?? 'Tiki',
        shopLocation: 'Vietnam',
        isOfficialShop: item.seller?.is_best_store ?? false,
        isVerified: badges.includes('authentic_brand') || badges.includes('tikinow'),
        brand: undefined,
        ...(item.discount_rate > 0 ? { discount: `-${item.discount_rate}%` } : {}),
        productUrl: `https://tiki.vn/${item.url_path}`,
        platform: 'tiki' as Platform,
      }
    })
  } catch {
    return []
  }
}

async function searchLazada(keyword: string): Promise<SearchResult[]> {
  try {
    const url = `${LAZADA_API}?q=${encodeURIComponent(keyword)}&ajax=true`
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const json = await res.json()
    const items: LazadaItem[] = json.mods?.listItems ?? []

    return items.map((item) => {
      const priceVnd = parseInt(String(item.price).replace(/\D/g, ''), 10) || 0
      const originalPriceVnd = parseInt(String(item.originalPrice).replace(/\D/g, ''), 10) || 0
      const priceUsd = calculatePricing(priceVnd, 1).productPriceUsd

      return {
        id: item.itemId,
        name: item.name,
        image: item.image?.startsWith('//') ? `https:${item.image}` : item.image ?? '',
        images: item.image
          ? [item.image.startsWith('//') ? `https:${item.image}` : item.image]
          : [],
        priceVnd,
        priceUsd,
        ...(originalPriceVnd > priceVnd ? { originalPriceVnd } : {}),
        sold: parseSold(item.itemSoldCntShow),
        rating: parseFloat(item.ratingScore) || 0,
        ratingCount: parseInt(item.review, 10) || 0,
        shopName: item.sellerName ?? 'Lazada',
        shopLocation: item.location ?? 'Vietnam',
        isOfficialShop: !!item.isOfficialStore,
        isVerified: !!item.brandName,
        brand: item.brandName || undefined,
        discount: item.discount || undefined,
        productUrl: item.itemUrl?.startsWith('//')
          ? `https:${item.itemUrl}`
          : `https://www.lazada.vn${item.itemUrl ?? ''}`,
        platform: 'lazada' as Platform,
      }
    })
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  let body: { keyword?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { keyword } = body
  if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
    return NextResponse.json({ error: 'keyword is required' }, { status: 400 })
  }

  const [tikiResults, lazadaResults] = await Promise.all([
    searchTiki(keyword.trim()),
    searchLazada(keyword.trim()),
  ])

  const allResults = [...tikiResults, ...lazadaResults]

  allResults.sort((a, b) => {
    if (a.isOfficialShop !== b.isOfficialShop) return a.isOfficialShop ? -1 : 1
    if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1
    if (b.rating !== a.rating) return b.rating - a.rating
    return b.sold - a.sold
  })

  const results = allResults.slice(0, 8)

  if (results.length === 0) {
    return NextResponse.json({
      results: [],
      error: 'No products found. Try a different keyword.',
    })
  }

  return NextResponse.json({ results })
}
