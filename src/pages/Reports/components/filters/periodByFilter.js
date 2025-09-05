import {
  addDays,
  format,
  lastDayOfMonth,
  nextSaturday,
  parseISO,
  previousSunday,
  subDays,
  subMonths,
} from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import DatePicker from "react-datepicker";
import useReportsStore from "~/store/reportsStore";

export default function PeriodByFilter() {
  const [open, setOpen] = useState(false);
  const { filters, setFilters, periodByOptions } = useReportsStore();
  const [selected, setSelected] = useState(filters.period_by);
  return (
    <div className="flex flex-row justify-start items-start gap-2 h-16">
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed top-0 left-0 w-full h-full bg-transparent z-1"
        ></div>
      )}
      <div
        className={`flex flex-col gap-y-2 text-xs bg-zinc-100 rounded p-1 min-h-12 min-w-48 z-10 border ${
          open ? "border-primary shadow-lg" : "border-transparent"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex flex-row justify-between items-center gap-x-2 text-xs cursor-pointer p-1 text-left"
        >
          <div className="flex flex-col">
            <span>Filter by</span>
            <strong className="text-sm">{selected?.label}</strong>
          </div>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {open && (
          <div className="flex flex-col justify-start items-start gap-2 py-1 border-t border-zinc-300 text-zinc-500">
            {periodByOptions.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setFilters({ ...filters, period_by: option });
                  setOpen(false);
                  setSelected(option);
                }}
                className="w-full text-left p-1 hover:text-primary hover:bg-zinc-200 rounded cursor-pointer"
              >
                {option?.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
