// GridReceivables.jsx (Refatorado)
import { format, parseISO } from "date-fns";
import { ChevronRight, Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { USDollar } from "~/functions";
import useReportsStore from "~/store/reportsStore";
import AccountRow from "../accountRow";

export default function GridReceivables({ data }) {
  if (!data) return null;
  const [firstLevelIndex, setFirstLevelIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const { chartOfAccountSelected, setChartOfAccountSelected } =
    useReportsStore();

  useEffect(() => {
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
      <div className="w-full flex flex-row items-center justify-end gap-2 my-2">
        {showAll ? (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex flex-row items-center gap-2 hover:bg-zinc-100 p-2 rounded"
          >
            <EyeOff size={12} /> Show only with values
          </button>
        ) : (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex flex-row items-center gap-2 hover:bg-zinc-100 p-2 rounded"
          >
            <Eye size={12} /> Show all chart of accounts
          </button>
        )}
      </div>
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
                )?.name
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
            ?.filter(
              (item) =>
                showAll ||
                item.periods.reduce((acc, period) => acc + period.total, 0) > 0
            )
            ?.map((item, index) => (
              <AccountRow
                key={index}
                item={item}
                index={index}
                firstLevelIndex={firstLevelIndex}
                setFirstLevelIndex={setFirstLevelIndex}
              />
            ))}
        </table>
      </div>
    </div>
  );
}
