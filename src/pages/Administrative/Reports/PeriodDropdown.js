import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function PeriodDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = new Date(value, 0, 1);

  const handleYearChange = (date) => {
    onChange(date.getFullYear().toString());
    setIsOpen(false);
  };

  return (
    <div className="relative mt-4 mb-4 w-56">
      <div
        className="flex cursor-pointer flex-col rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm hover:border-gray-400"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xs text-gray-500">Period</span>
        <span className="text-base font-bold text-gray-900">{value}</span>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ChevronDown className="h-5 w-5 text-gray-600" />
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1">
            <DatePicker
              selected={selectedDate}
              onChange={handleYearChange}
              showYearPicker
              dateFormat="yyyy"
              yearItemNumber={9}
              minDate={new Date(2010, 0, 1)}
              maxDate={new Date()}
              inline
            />
          </div>
        </>
      )}
    </div>
  );
}