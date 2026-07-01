"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#F26522]">
          <ShoppingBag className="w-6 h-6" />
          VietBuy
        </Link>

        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/order" className="hover:text-[#F26522] transition-colors">
            Buy
          </Link>
          <Link
            href="/orders"
            className="hover:text-[#F26522] transition-colors"
          >
            Track Order
          </Link>
        </div>

        <button
          className="sm:hidden p-1 text-gray-600 hover:text-[#F26522] transition-colors"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3 text-sm font-medium text-gray-700">
          <Link
            href="/order"
            className="hover:text-[#F26522] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Buy
          </Link>
          <Link
            href="/orders"
            className="hover:text-[#F26522] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Track Order
          </Link>
        </div>
      )}
    </nav>
  );
}
