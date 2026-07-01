import Image from "next/image";
import { Store } from "lucide-react";

export type Platform = "shopee" | "tiktok";

export interface Product {
  name: string;
  priceVnd: number;
  priceUsd: number;
  images: string[];
  shopName: string;
  platform: Platform;
}

interface ProductCardProps {
  product: Product;
}

const PLATFORM_LABELS: Record<Platform, string> = {
  shopee: "Shopee",
  tiktok: "TikTok Shop",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  shopee: "bg-[#F26522] text-white",
  tiktok: "bg-black text-white",
};

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

export default function ProductCard({ product }: ProductCardProps) {
  const { name, priceVnd, priceUsd, images, shopName, platform } = product;
  const imageUrl = images[0] ?? "";

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden w-full max-w-sm">
      <div className="relative w-full aspect-square bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 384px"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 text-sm">
            No image
          </div>
        )}
        <span
          className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${PLATFORM_COLORS[platform]}`}
        >
          {PLATFORM_LABELS[platform]}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <p className="text-sm text-gray-800 font-medium line-clamp-2 leading-snug">
          {name}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Store className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{shopName}</span>
        </div>

        <div className="mt-1">
          <p className="text-[#F26522] font-bold text-lg leading-tight">
            {formatUsd(priceUsd)}
          </p>
          <p className="text-xs text-gray-400">{formatVnd(priceVnd)} + service fee</p>
        </div>
      </div>
    </div>
  );
}
