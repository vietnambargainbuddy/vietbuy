import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing stripe signature or webhook secret' }, { status: 400 })
  }

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 })
  }

  let event: import('stripe').Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as import('stripe').Stripe.Checkout.Session
    const orderId = session.metadata?.orderId

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId in session metadata' }, { status: 400 })
    }

    const { error } = await getSupabase()
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_id: session.payment_intent as string,
      })
      .eq('id', orderId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
