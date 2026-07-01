import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

interface CheckoutBody {
  orderId: string
  productName: string
  totalUsd: number
  customerEmail: string
}

export async function POST(request: NextRequest) {
  let body: CheckoutBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { orderId, productName, totalUsd, customerEmail } = body

  if (!orderId || !productName || !totalUsd || !customerEmail) {
    return NextResponse.json(
      { error: 'orderId, productName, totalUsd, and customerEmail are required' },
      { status: 400 }
    )
  }

  const baseUrl = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(totalUsd * 100),
            product_data: {
              name: productName,
            },
          },
        },
      ],
      success_url: `${baseUrl}/orders/${orderId}?success=true`,
      cancel_url: `${baseUrl}/order?cancelled=true`,
      metadata: { orderId },
    })

    return NextResponse.json({ sessionUrl: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
