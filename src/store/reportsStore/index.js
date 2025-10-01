import { create } from "zustand";
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

export const periodByOptions = [
  {
    value: "Due Date",
    label: "Due Date",
  },
  {
    value: "Settlement Date",
    label: "Settlement Date",
  },
  {
    value: "Competence Date",
    label: "Competence Date",
  },
];
const createPeriodOptions = () => [
  { from: new Date(), to: new Date(), label: "Today" },
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
  { from: subDays(new Date(), 30), to: new Date(), label: "Last 30 days" },
  {
    from: addDays(subMonths(new Date(), 12), 1),
    to: new Date(),
    label: "Last 12 months",
  },
  { from: new Date(), to: new Date(), label: "Custom" },
];

const useReportsStore = create((set) => {
  const periodOptions = createPeriodOptions();
  const defaultPeriod = periodOptions.find((o) => o.label === "This month");
  return {
    filters: {
      report: "Received",
      period: {
        label: defaultPeriod.label,
        from: defaultPeriod.from,
        to: defaultPeriod.to,
      },
      period_by: periodByOptions[0],
    },
    chartOfAccountSelected: null,
    setChartOfAccountSelected: (chartOfAccountSelected) =>
      set({ chartOfAccountSelected }),
    periodOptions,
    periodByOptions,
    setFilters: (filters) => {
      if (filters.report === "Received") {
        set({
          filters: {
            ...filters,
            period_by: periodByOptions.find(
              (o) => o.label === "Settlement Date"
            ),
          },
        });
      } else if (filters.report === "Outstanding") {
        set({
          filters: {
            ...filters,
            period_by: periodByOptions.find(
              (o) => o.label === "Competence Date"
            ),
          },
        });
      } else if (filters.report === "Renegotiated") {
        set({
          filters: {
            ...filters,
            period_by: periodByOptions.find((o) => o.label === "Due Date"),
          },
        });
      } else {
        set({ filters });
      }
    },
  };
});

export default useReportsStore;
