import { format, parseISO } from "date-fns";
import { ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { USDollar } from "~/functions";
import useReportsStore from "~/store/reportsStore";

export default function GridReceivables({ data }) {
  if (!data) return null;
  const [firstLevelIndex, setFirstLevelIndex] = useState(null);
  const { chartOfAccountSelected, setChartOfAccountSelected } =
    useReportsStore();

  useEffect(() => {
    console.log({
      chartOfAccountSelected,
      index: data?.byChartOfAccount?.findIndex(
        (item) => item.code === chartOfAccountSelected
      ),
    });
    if (!chartOfAccountSelected) {
      setFirstLevelIndex(null);
    } else {
      setFirstLevelIndex(0);
    }
  }, [chartOfAccountSelected]);

  return (
    <div
      id="grid"
      className="flex w-full flex-1 flex-col justify-center items-center mt-4 select-none overflow-x-scroll"
    >
      {chartOfAccountSelected && (
        <div className="w-full flex flex-row items-center justify-start gap-2 my-2">
          <button
            type="button"
            onClick={() => setChartOfAccountSelected(null)}
            className="bg-white border text-xs rounded p-2 hover:bg-gray-100 flex flex-row items-center justify-center gap-2"
          >
            <X size={12} />
          </button>
          <span className="text-xs text-gray-500">
            Filtering
            <br />
            <strong>
              {
                data?.byChartOfAccount?.find(
                  (item) => item.code === chartOfAccountSelected
                ).name
              }
            </strong>
          </span>
        </div>
      )}
      <div className="flex w-full flex-row items-center justify-start">
        <table className="w-full text-center text-xs text-zinc-500 rounded-lg overflow-hidden shadow-sm">
          <tr className="bg-zinc-100 text-zinc-950">
            <td className="min-w-[250px] text-left font-bold border-b p-2 sticky left-0 bg-zinc-100">
              Chart of Accounts
            </td>
            {data?.periods?.map((item, index) => (
              <td className="font-bold border-b p-2" key={index}>
                {format(parseISO(item.period + "-01"), "MMM/yyyy")}
              </td>
            ))}
          </tr>
          {data?.byChartOfAccount
            ?.filter(
              (item) =>
                !chartOfAccountSelected || item.code === chartOfAccountSelected
            )
            ?.map((item, index) => {
              return (
                <>
                  <tr
                    key={index}
                    className="bg-white odd:bg-zinc-50 hover:bg-zinc-200 group"
                  >
                    <td
                      onClick={() =>
                        setFirstLevelIndex(
                          index === firstLevelIndex ? null : index
                        )
                      }
                      className="min-w-[250px] text-left font-bold border-b p-2 cursor-pointer gap-2 sticky left-0 group-hover:bg-zinc-200 bg-white group-odd:bg-zinc-50"
                    >
                      <div className="flex flex-row items-center gap-2">
                        <ChevronRight
                          size={16}
                          className={`transition duration-300 ${
                            index === firstLevelIndex && "rotate-90"
                          }`}
                        />
                        {item.name}
                      </div>
                    </td>
                    {item.periods.map((item, index) => (
                      <td className="border-b p-2 min-w-24" key={index}>
                        {USDollar.format(Math.round(item.total))}
                      </td>
                    ))}
                  </tr>
                  {firstLevelIndex === index &&
                    item.children?.map((item, index) => (
                      <tr
                        key={index}
                        className="bg-white odd:bg-zinc-50 hover:bg-zinc-100 group"
                      >
                        <td className="text-left font-bold border-b p-2 pl-8 sticky left-0 group-hover:bg-zinc-100 bg-white group-odd:bg-zinc-50">
                          <div className="flex flex-row items-center gap-2">
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
                          </div>
                        </td>
                        {item.periods.map((item, index) => (
                          <td className="border-b p-2" key={index}>
                            {USDollar.format(Math.round(item.total))}
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
