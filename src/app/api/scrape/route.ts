import { NextRequest, NextResponse } from 'next/server'
import { Product, Platform } from '@/lib/types'
import { calculatePricing } from '@/lib/pricing'

function detectPlatform(url: string): Platform | null {
  if (url.includes('shopee.vn')) return 'shopee'
  if (url.includes('tiktok.com/shop') || url.includes('shop.tiktok.com')) return 'tiktokshop'
  return null
}

function extractMetaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1].trim()
  }
  return null
}

function extractJsonLd(html: string): Record<string, unknown> | null {
  const match = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)
  if (!match?.[1]) return null
  try {
    const parsed = JSON.parse(match[1])
    if (Array.isArray(parsed)) {
      return parsed.find((item) => item['@type'] === 'Product') ?? null
    }
    if (parsed['@type'] === 'Product') return parsed
    return null
  } catch {
    return null
  }
}

function extractPriceFromHtml(html: string): number | null {
  const patterns = [
    /["']price["']\s*:\s*["']?([\d.,]+)["']?/,
    /class=["'][^"']*price[^"']*["'][^>]*>([\d.,]+)/,
    /data-price=["']([\d.,]+)["']/,
    /itemprop=["']price["'][^>]*content=["']([\d.,]+)["']/,
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      const cleaned = match[1].replace(/[.,\s]/g, (c) => (c === '.' && match[1].indexOf(',') > -1 ? '' : c === ',' ? '' : c))
      const num = parseFloat(cleaned.replace(/,/g, ''))
      if (!isNaN(num) && num > 0) return num
    }
  }
  return null
}

function extractImages(html: string): string[] {
  const images: string[] = []
  const ogImage = extractMetaContent(html, 'og:image')
  if (ogImage) images.push(ogImage)
  const twitterImage = extractMetaContent(html, 'twitter:image')
  if (twitterImage && !images.includes(twitterImage)) images.push(twitterImage)
  return images
}

export async function POST(request: NextRequest) {
  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { url } = body
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  const platform = detectPlatform(url)
  if (!platform) {
    return NextResponse.json(
      { error: 'URL must be from shopee.vn or TikTok Shop' },
      { status: 400 }
    )
  }

  let html: string
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    })
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch product page', manualEntry: true },
        { status: 200 }
      )
    }
    html = await response.text()
  } catch {
    return NextResponse.json(
      { error: 'Failed to reach product page. Please enter product details manually.', manualEntry: true },
      { status: 200 }
    )
  }

  const jsonLd = extractJsonLd(html)
  const name =
    (jsonLd?.name as string | undefined) ??
    extractMetaContent(html, 'og:title') ??
    extractMetaContent(html, 'twitter:title') ??
    null

  let priceVnd: number | null = null
  if (jsonLd?.offers) {
    const offers = jsonLd.offers as Record<string, unknown>
    const offerPrice = (Array.isArray(offers) ? offers[0]?.price : offers.price) as string | number | undefined
    if (offerPrice !== undefined) {
      const parsed = parseFloat(String(offerPrice).replace(/,/g, ''))
      if (!isNaN(parsed)) priceVnd = parsed
    }
  }
  if (!priceVnd) {
    priceVnd = extractPriceFromHtml(html)
  }

  const images = extractImages(html)
  const shopName =
    (jsonLd?.brand as Record<string, unknown> | undefined)?.name as string | undefined ??
    extractMetaContent(html, 'og:site_name') ??
    null

  if (!name && !priceVnd) {
    return NextResponse.json(
      {
        error: 'Could not extract product information. Please enter product details manually.',
        manualEntry: true,
      },
      { status: 200 }
    )
  }

  const priceUsd = priceVnd ? calculatePricing(priceVnd, 1).productPriceUsd : 0

  const product: Product = {
    url,
    platform,
    name: name ?? 'Unknown Product',
    price: priceVnd ?? 0,
    priceUsd,
    images,
    shopName: shopName ?? undefined,
  }

  return NextResponse.json({ success: true, product })
}
