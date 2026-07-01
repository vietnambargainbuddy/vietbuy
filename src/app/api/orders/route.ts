import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { Order } from '@/lib/types'

export async function POST(request: NextRequest) {
  let body: Partial<Order>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const required = [
    'customer_email',
    'customer_name',
    'delivery_address',
    'product_url',
    'platform',
    'product_name',
    'product_image',
    'product_price_vnd',
    'product_price_usd',
    'service_fee_usd',
    'total_usd',
    'quantity',
  ]
  for (const field of required) {
    if (body[field as keyof Order] === undefined || body[field as keyof Order] === null) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
    }
  }

  const { data, error } = await getSupabase()
    .from('orders')
    .insert([{ ...body, status: 'pending' }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')
  const admin = searchParams.get('admin')

  let query = getSupabase().from('orders').select('*').order('created_at', { ascending: false })

  if (admin === 'true') {
    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  }

  if (!email) {
    return NextResponse.json({ error: 'email query parameter is required' }, { status: 400 })
  }

  query = query.eq('customer_email', email)
  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
