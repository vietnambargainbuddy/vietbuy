"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";

interface ProductSearchProps {
  onUrlSubmit: (url: string) => void | Promise<void>;
  onKeywordSearch: (keyword: string) => void | Promise<void>;
}

export default function UrlInput({ onUrlSubmit, onKeywordSearch }: ProductSearchProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      setError("Please enter a product name or paste a link.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (trimmed.startsWith("http")) {
        await onUrlSubmit(trimmed);
      } else {
        await onKeywordSearch(trimmed);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col gap-3">
      <div
        className={`flex items-center gap-2 bg-white border rounded-2xl px-3 py-2.5 shadow-sm transition
          ${error ? "border-red-400 ring-2 ring-red-200" : "border-gray-300 focus-within:ring-2 focus-within:ring-[#F26522]/40 focus-within:border-[#F26522]"}
        `}
      >
        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />

        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          placeholder="What are you looking for? e.g. coffee, phone case, snacks..."
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
          {loading ? "Searching..." : "Search"}
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
