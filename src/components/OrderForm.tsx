"use client";

import { useState } from "react";

export interface OrderFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  quantity: number;
}

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
}

const INITIAL: OrderFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  quantity: 1,
};

export default function OrderForm({ onSubmit }: OrderFormProps) {
  const [form, setForm] = useState<OrderFormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormData, string>>>({});

  function set<K extends keyof OrderFormData>(key: K, value: OrderFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email.";
    if (!form.address.trim()) next.address = "Delivery address is required.";
    if (form.quantity < 1) next.quantity = "Quantity must be at least 1.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-lg">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Full name <span className="text-[#F26522]">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Jane Smith"
          className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition"
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Email <span className="text-[#F26522]">*</span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="jane@example.com"
          className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition"
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Phone <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+1 555 000 0000"
          className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Delivery address <span className="text-[#F26522]">*</span>
        </label>
        <textarea
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Hotel name, room number, street address…"
          rows={3}
          className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition resize-none"
        />
        {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Delivery notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Leave at front desk, call on arrival…"
          rows={2}
          className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition resize-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Quantity <span className="text-[#F26522]">*</span>
        </label>
        <input
          type="number"
          min={1}
          value={form.quantity}
          onChange={(e) => set("quantity", Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#F26522]/40 focus:border-[#F26522] transition w-24"
        />
        {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
      </div>

      <button
        type="submit"
        className="mt-1 bg-[#F26522] hover:bg-[#d9551a] text-white font-semibold text-sm py-3 rounded-xl transition-colors"
      >
        Place Order
      </button>
    </form>
  );
}
