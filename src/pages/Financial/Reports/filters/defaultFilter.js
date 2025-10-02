import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import useReportsStore from "~/store/reportsStore";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subWeeks, subYears } from "date-fns";

export default function DefaultRateFilter() {
  const [open, setOpen] = useState(false);
  const { filters, setFilters } = useReportsStore();
  
  const now = new Date();
  
  const defaultRateOptions = [
    { 
      label: "Last Week", 
      value: "last_week",
      from: startOfWeek(subWeeks(now, 1), { weekStartsOn: 0 }),
      to: endOfWeek(subWeeks(now, 1), { weekStartsOn: 0 })
    },
    { 
      label: "Last Month", 
      value: "last_month",
      from: startOfMonth(subMonths(now, 1)),
      to: endOfMonth(subMonths(now, 1))
    },
    { 
      label: "Last 3 Months", 
      value: "last_3_months",
      from: startOfMonth(subMonths(now, 3)),
      to: endOfMonth(now)
    },
    { 
      label: "Last Year", 
      value: "last_year",
      from: startOfYear(subYears(now, 1)),
      to: endOfYear(subYears(now, 1))
    },
    { 
      label: "This Year", 
      value: "this_year",
      from: startOfYear(now),
      to: now
    },
  ];

  const [selected, setSelected] = useState(
    filters.defaultRateFilter || defaultRateOptions[4]
  );

  useEffect(() => {
    if (!filters.defaultRateFilter) {
      setFilters({
        ...filters,
        defaultRateFilter: defaultRateOptions[4]
      });
    }
  }, []);

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
            <span>Period</span>
            <strong className="text-sm">{selected?.label}</strong>
          </div>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {open && (
          <div className="flex flex-col justify-start items-start gap-2 py-1 border-t border-zinc-300 text-zinc-500">
            {defaultRateOptions.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setFilters({
                    ...filters,
                    defaultRateFilter: option,
                  });
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