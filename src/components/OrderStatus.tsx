import { Check } from "lucide-react";

export type OrderStatusValue =
  | "paid"
  | "purchasing"
  | "purchased"
  | "shipping"
  | "delivered";

interface OrderStatusProps {
  currentStatus: OrderStatusValue;
}

const STEPS: { key: OrderStatusValue; label: string }[] = [
  { key: "paid", label: "Paid" },
  { key: "purchasing", label: "Purchasing" },
  { key: "purchased", label: "Purchased" },
  { key: "shipping", label: "Shipping" },
  { key: "delivered", label: "Delivered" },
];

const STATUS_INDEX: Record<OrderStatusValue, number> = {
  paid: 0,
  purchasing: 1,
  purchased: 2,
  shipping: 3,
  delivered: 4,
};

export default function OrderStatus({ currentStatus }: OrderStatusProps) {
  const activeIndex = STATUS_INDEX[currentStatus] ?? 0;

  return (
    <div className="w-full">
      <div className="hidden sm:flex items-center">
        {STEPS.map((step, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                    ${isDone ? "bg-green-500 text-white" : ""}
                    ${isActive ? "bg-[#F26522] text-white ring-4 ring-[#F26522]/20" : ""}
                    ${!isDone && !isActive ? "bg-gray-100 text-gray-400" : ""}
                  `}
                >
                  {isDone ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap
                    ${isDone ? "text-green-600" : ""}
                    ${isActive ? "text-[#F26522]" : ""}
                    ${!isDone && !isActive ? "text-gray-400" : ""}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${
                    i < activeIndex ? "bg-green-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex sm:hidden flex-col gap-0">
        {STEPS.map((step, i) => {
          const isDone = i < activeIndex;
          const isActive = i === activeIndex;
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0
                    ${isDone ? "bg-green-500 text-white" : ""}
                    ${isActive ? "bg-[#F26522] text-white ring-4 ring-[#F26522]/20" : ""}
                    ${!isDone && !isActive ? "bg-gray-100 text-gray-400" : ""}
                  `}
                >
                  {isDone ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 h-8 mt-1 ${
                      i < activeIndex ? "bg-green-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>

              <span
                className={`text-sm font-medium pt-1.5
                  ${isDone ? "text-green-600" : ""}
                  ${isActive ? "text-[#F26522]" : ""}
                  ${!isDone && !isActive ? "text-gray-400" : ""}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
