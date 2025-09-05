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
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import DatePicker from "react-datepicker";

export default function PeriodFilter({ defaultValue }) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date("2014/02/08"));
  const [endDate, setEndDate] = useState(new Date("2014/02/10"));
  const options = [
    {
      from: new Date(),
      to: new Date(),
      label: "Today",
    },
    {
      from: previousSunday(new Date()),

      to: nextSaturday(new Date()),
      label: "This week",
    },
    {
      from: parseISO(format(new Date(), "yyyy-MM-01")),
      to: lastDayOfMonth(new Date()),
      label: "This month",
    },
    {
      from: parseISO(format(new Date(), "yyyy-01-01")),
      to: parseISO(format(new Date(), "yyyy-12-31")),
      label: "This year",
    },
    {
      from: subDays(new Date(), 30),
      to: new Date(),
      label: "Last 30 days",
    },
    {
      from: addDays(subMonths(new Date(), 12), 1),
      to: new Date(),
      label: "Last 12 months",
    },
    {
      from: parseISO("2000-01-01"),
      to: new Date(),
      label: "Entire history",
    },
    {
      from: null,
      to: null,
      label: "Custom",
    },
  ];
  const [selected, setSelected] = useState(
    options.find((o) => o.label === defaultValue)
  );
  return (
    <div className="flex flex-row justify-start items-center">
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
          <div className="flex flex-col">
            <strong className="text-sm">{selected.label}</strong>
            {selected.label !== "Custom" && (
              <>
                <br />
                {selected.from
                  ? format(selected.from, "MM/dd/yyyy")
                  : null} -{" "}
                {selected.to ? format(selected.to, "MM/dd/yyyy") : null}
              </>
            )}
          </div>
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
      {selected.label === "Custom" && (
        <div className="flex flex-row justify-between items-center gap-x-2 text-xs cursor-pointer p-1 text-left">
          {/* <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
          /> */}
        </div>
      )}
    </div>
  );
}
