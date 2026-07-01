"use client";

import { useState } from "react";
import { Clipboard, Search, Loader2, AlertCircle } from "lucide-react";

interface UrlInputProps {
  onSubmit: (url: string) => void | Promise<void>;
}

const VALID_PATTERN =
  /^https?:\/\/(www\.)?(shopee\.vn|tiktok\.com|vt\.tiktok\.com|shop\.tiktok\.com)/i;

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
  } catch {
    return false;
  }
  return VALID_PATTERN.test(value.trim());
}

export default function UrlInput({ onSubmit }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) {
      setError("Please paste a product link.");
      return;
    }
    if (!isValidUrl(trimmed)) {
      setError("Only Shopee (shopee.vn) and TikTok Shop links are supported.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onSubmit(trimmed);
    } finally {
      setLoading(false);
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text.trim());
      setError(null);
    } catch {
      setError("Clipboard access denied. Please paste manually.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col gap-3">
      <div
        className={`flex items-center gap-2 bg-white border rounded-2xl px-3 py-2.5 shadow-sm transition
          ${error ? "border-red-400 ring-2 ring-red-200" : "border-gray-300 focus-within:ring-2 focus-within:ring-[#F26522]/40 focus-within:border-[#F26522]"}
        `}
      >
        <button
          type="button"
          onClick={handlePaste}
          className="text-gray-400 hover:text-[#F26522] transition-colors flex-shrink-0"
          aria-label="Paste from clipboard"
        >
          <Clipboard className="w-5 h-5" />
        </button>

        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="Paste a Shopee or TikTok Shop product link..."
          className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent min-w-0"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 bg-[#F26522] hover:bg-[#d9551a] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex-shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {loading ? "Finding…" : "Find Product"}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-600 px-1">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}
