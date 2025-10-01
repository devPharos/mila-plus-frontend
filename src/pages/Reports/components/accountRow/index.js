import { ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { USDollar } from "~/functions";
import React from "react";

export default function AccountRow({
  key,
  item,
  index,
  firstLevelIndex,
  setFirstLevelIndex,
  inactiveMenu,
}) {
  const isFirstLevelActive = index === firstLevelIndex;

  return (
    <tbody key={key}>
      <tr className="bg-white odd:bg-zinc-50 hover:bg-zinc-200 group">
        <td
          onClick={() => setFirstLevelIndex(isFirstLevelActive ? null : index)}
          className="min-w-[250px] text-left font-bold border-b py-2 px-1 cursor-pointer gap-2 sticky left-0 group-hover:bg-zinc-200 bg-white group-odd:bg-zinc-50"
        >
          <div className="flex flex-row items-center gap-2">
            <ChevronRight
              size={16}
              className={`transition duration-300 ${
                isFirstLevelActive && "rotate-90"
              }`}
            />
            {item.name}
          </div>
        </td>
        {item.periods.map((period, periodIndex) => (
          <td className="border-b py-2 px-1 min-w-16" key={periodIndex}>
            {USDollar.format(Math.round(period.total))}
          </td>
        ))}
      </tr>
      {isFirstLevelActive &&
        item.children?.map((child, childIndex) => (
          <tr
            key={childIndex}
            className="bg-white odd:bg-zinc-50 hover:bg-zinc-100 group"
          >
            <td className="text-left font-bold border-b py-2 px-1 pl-8 sticky left-0 group-hover:bg-zinc-100 bg-white group-odd:bg-zinc-50">
              <div className="flex flex-row items-center gap-2">
                {child.children?.length ? (
                  <ChevronRight size={16} />
                ) : (
                  <div className="w-0"></div>
                )}
                {child.name}
              </div>
            </td>
            {child.periods.map((childPeriod, childPeriodIndex) => (
              <td className="border-b py-2 px-1" key={childPeriodIndex}>
                {USDollar.format(Math.round(childPeriod.total))}
              </td>
            ))}
          </tr>
        ))}
    </tbody>
  );
}
