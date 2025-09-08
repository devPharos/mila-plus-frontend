import { format, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { USDollar } from "~/functions";

export default function GridReceivables({ data }) {
  if (!data) return null;
  const [firstLevelIndex, setFirstLevelIndex] = useState(null);

  return (
    <div className="flex w-full flex-1 flex-col justify-center items-center mt-4 select-none">
      <div className="flex w-full flex-row items-center justify-center">
        <table className="w-full text-center text-xs text-zinc-500 rounded-lg overflow-hidden shadow-sm">
          <tr className="bg-zinc-100 text-zinc-950">
            <td className="w-[300px] text-left font-bold border-b p-2">
              Chart of Accounts
            </td>
            {data?.periods?.map((item, index) => (
              <td className="font-bold border-b p-2" key={index}>
                {format(parseISO(item.period + "-01"), "MMM/yyyy")}
              </td>
            ))}
          </tr>
          {data?.byChartOfAccount?.map((item, index) => {
            return (
              <>
                <tr key={index} className="odd:bg-zinc-50 hover:bg-zinc-200">
                  <td
                    onClick={() =>
                      setFirstLevelIndex(
                        index === firstLevelIndex ? null : index
                      )
                    }
                    className="text-left font-bold border-b p-2 cursor-pointer flex flex-row items-center gap-2"
                  >
                    <ChevronRight
                      size={16}
                      className={`transition duration-300 ${
                        index === firstLevelIndex && "rotate-90"
                      }`}
                    />
                    {item.name}
                  </td>
                  {item.periods.map((item, index) => (
                    <td className="border-b p-2" key={index}>
                      {USDollar.format(item.total)}
                    </td>
                  ))}
                </tr>
                {firstLevelIndex === index &&
                  item.children?.map((item, index) => (
                    <tr key={index} className="hover:bg-zinc-100">
                      <td className="text-left font-bold border-b p-2 pl-8 flex flex-row items-center gap-2">
                        {item.children?.length ? (
                          <ChevronRight
                            size={16}
                            className={`transition duration-300 ${
                              index === firstLevelIndex && "rotate-90"
                            }`}
                          />
                        ) : (
                          <div className="w-0"></div>
                        )}
                        {item.name}
                      </td>
                      {item.periods.map((item, index) => (
                        <td className="border-b p-2" key={index}>
                          {USDollar.format(item.total)}
                        </td>
                      ))}
                    </tr>
                  ))}
              </>
            );
          })}
        </table>
      </div>
    </div>
  );
}
