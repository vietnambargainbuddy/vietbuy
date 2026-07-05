import Link from 'next/link'
import { ShoppingBag, CreditCard, Truck, Search, CheckCircle, Headphones, Globe } from 'lucide-react'

const HOW_IT_WORKS = [
  {
    icon: Search,
    step: '1',
    title: 'Search a Product',
    description: 'Type what you want — we search Tiki, Lazada & more to find the best deals.',
  },
  {
    icon: CreditCard,
    step: '2',
    title: 'Pay Securely',
    description: 'Pay in USD with any major card. We buy the item on your behalf in Vietnam.',
  },
  {
    icon: Truck,
    step: '3',
    title: 'Get Delivered',
    description: 'We deliver directly to your hotel, guesthouse, or address in Vietnam.',
  },
]

const BENEFITS = [
  {
    icon: CheckCircle,
    title: 'No account needed',
    description: 'Skip the sign-up hassle. No Vietnamese phone number required.',
  },
  {
    icon: CreditCard,
    title: 'Pay with any card',
    description: 'Visa, Mastercard, Amex — pay in USD, no currency conversion headaches.',
  },
  {
    icon: Truck,
    title: 'Hotel delivery',
    description: 'Items delivered right to your accommodation anywhere in Vietnam.',
  },
  {
    icon: Headphones,
    title: 'English support',
    description: 'Our team communicates in English throughout the entire process.',
  },
]

export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F26522] to-[#e05510] text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-4xl mx-auto px-4 py-20 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <ShoppingBag className="w-3.5 h-3.5" />
            Tiki · Lazada · Shopee
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            Shop Vietnam,{' '}
            <span className="text-white/90">Hassle-Free</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/85 max-w-xl mx-auto mb-10 leading-relaxed">
            Buy from Vietnam&apos;s top e-commerce platforms without an account. We handle everything — you just
            search, pay, and receive.
          </p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 bg-white text-[#F26522] font-bold text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-white/95 transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            Start Shopping
          </Link>
          <p className="text-sm text-white/60 mt-4">No account required · English support</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Three simple steps to get any Vietnamese product delivered to you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map(({ icon: Icon, step, title, description }) => (
            <div
              key={step}
              className="flex flex-col items-center text-center gap-4"
            >
              <div className="relative">
                <div className="w-16 h-16 bg-[#F26522]/10 rounded-2xl flex items-center justify-center">
                  <Icon className="w-7 h-7 text-[#F26522]" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#F26522] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {step}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Why Choose VietBuy?
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Shopping in Vietnam just got easier for tourists and expats.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 flex gap-4 shadow-sm border border-gray-100"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-[#F26522]/10 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#F26522]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-br from-[#F26522] to-[#e05510] rounded-3xl p-10 text-white">
          <Globe className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to shop Vietnam?</h2>
          <p className="text-white/80 mb-8 max-w-sm mx-auto">
            Search for any product and we&apos;ll handle the rest.
          </p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 bg-white text-[#F26522] font-bold text-sm px-7 py-3.5 rounded-xl hover:bg-white/95 transition-colors shadow-md"
          >
            Place an Order
          </Link>
        </div>
      </section>
    </div>
  )
}
