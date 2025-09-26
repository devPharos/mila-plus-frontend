import { ChevronDown } from "lucide-react";
import React from "react";

export default function PeriodDropdown({ value, onChange }) {
  const displayValue = value;

  return (
    <div className="relative mt-4 mb-4 w-56">
      <div className="flex cursor-pointer flex-col rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm hover:border-gray-400">
        <span className="text-xs text-gray-500">Period</span>
        <span className="text-base font-bold text-gray-900">
          {displayValue}
        </span>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ChevronDown className="h-5 w-5 text-gray-600" />
      </div>

      <select
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="2025">2025</option>
        <option value="2024">2024</option>
      </select>
    </div>
  );
}
