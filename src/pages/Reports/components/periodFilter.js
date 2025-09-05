import { format, nextSaturday, previousSunday } from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

export default function PeriodFilter({ defaultValue }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const options = [
    { value: format(new Date(), "MM/dd/yyyy"), label: "Today" },
    {
      value:
        format(previousSunday(new Date()), "MM/dd/yyyy") +
        " - " +
        format(nextSaturday(new Date()), "MM/dd/yyyy"),
      label: "This week",
    },
    // "This week",
    // "This month",
    // "This year",
    // "Last 30 days",
    // "Last 12 months",
    // "Entire history",
  ];
  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed top-0 left-0 w-full h-full bg-transparent z-1"
        ></div>
      )}
      <div
        className={`flex flex-col gap-y-2 text-xs bg-zinc-100 rounded p-2 min-w-48 z-10 border ${
          open ? "border-primary shadow-lg" : "border-transparent"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex flex-row justify-between items-center gap-x-2 text-xs cursor-pointer p-1 text-left"
        >
          <strong className="text-sm">{selected.label}</strong>
          <br />
          {selected.value}
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {open && (
          <div className="flex flex-col justify-start items-start gap-2 py-1 border-t border-zinc-300 text-zinc-500">
            {options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setOpen(false);
                  setSelected(option);
                }}
                className="w-full text-left p-1 hover:text-primary hover:bg-zinc-200 rounded cursor-pointer"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
