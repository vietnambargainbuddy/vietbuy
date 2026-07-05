"use client";

import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import type { SearchResult } from "@/lib/types";

interface SearchResultsProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatSold(sold: number): string {
  if (sold >= 1000) return `${(sold / 1000).toFixed(1)}k sold`;
  return `${sold} sold`;
}

export default function SearchResults({ results, onSelect }: SearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
      {results.map((result) => (
        <div
          key={result.id}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-[#F26522]/30 transition-all group"
        >
          <div className="relative w-full aspect-square bg-gray-100">
            <Image
              src={result.image || result.images[0] || ""}
              alt={result.name}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
              <span className={`text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                result.platform === 'tiki' ? 'bg-[#1A94FF]' : 'bg-[#F57224]'
              }`}>
                {result.platform === 'tiki' ? 'Tiki' : 'Lazada'}
              </span>
              {result.isOfficialShop && (
                <span className="bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  Official
                </span>
              )}
              {result.isVerified && (
                <span className="bg-green-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  Authentic ✓
                </span>
              )}
            </div>
          </div>

          <div className="p-3 flex flex-col gap-2">
            <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-snug">
              {result.name}
            </p>

            <div>
              <p className="text-[#F26522] font-bold text-sm">{formatUsd(result.priceUsd)}</p>
              {result.originalPriceVnd ? (
                <p className="text-[10px] text-gray-400 line-through">
                  {formatVnd(result.originalPriceVnd)}
                </p>
              ) : (
                <p className="text-[10px] text-gray-400">{formatVnd(result.priceVnd)}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                {result.rating.toFixed(1)}
              </span>
              <span>{formatSold(result.sold)}</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{result.shopName}</span>
            </div>

            <button
              onClick={() => onSelect(result)}
              className="mt-1 w-full bg-[#F26522] hover:bg-[#d9551a] text-white text-xs font-semibold py-2 rounded-xl transition-colors"
            >
              Select
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
