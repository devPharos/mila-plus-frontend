import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Loader2 } from "lucide-react";
import { USDollar } from "~/functions";
import api from "~/services/api";
import { format } from "date-fns";
import { toast } from "react-toastify";

const CustomLabel = (props) => {
  const { x, y, width, height, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y + height - 10}
      fill="#000000"
      textAnchor="middle"
      dominantBaseline="middle"
      className="text-[12px] font-semibold"
    >
      {value.toFixed(1)}%
    </text>
  );
};

export default function ChartDefaultRate({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDefaultRateData();
  }, [filters]);

  function loadDefaultRateData() {
    setLoading(true);
    
    const periodFilter = filters.defaultRateFilter || filters.period;
    
    api
      .get(
        `/reports/default-rate?period_from=${format(
          periodFilter.from,
          "yyyy-MM-dd"
        )}&period_to=${format(periodFilter.to, "yyyy-MM-dd")}&period_by=Due Date`
      )
      .then(({ data }) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        toast(err?.response?.data?.error || "Error loading default rate", {
          type: "error",
          autoClose: 3000,
        });
        setLoading(false);
      });
  }

  if (loading) {
    return (
      <div className="w-full p-3 px-5 border rounded-lg mb-4">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin" size={36} />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalOverdue = data.totalOverdue || 0;
  const defaultRate = data.defaultRate || 0;
  const evolutionData = data.defaultRateEvolution || [];

  return (
    <div className="w-full p-3 px-5 border rounded-lg mb-4">
      <div className="flex flex-row items-center justify-between mb-5">
        <div className="flex flex-col items-start justify-center">
          <h1 className="text-lg font-bold">Delinquency Index</h1>
          <h1 className="text-sm font-extralight text-gray-500">
            Overdue receivables / Total billing
          </h1>
        </div>
        <div className="flex flex-row items-end justify-center gap-4">
          <div className="text-xl font-bold border-b border-l p-2 rounded w-40">
            <h2 className="text-sm font-light text-gray-500">Overdue</h2>
            <span className="text-black">
              {USDollar.format(Math.round(totalOverdue))}
            </span>
          </div>
          <div className="text-xl font-bold border-b border-l p-2 rounded w-40">
            <h2 className="text-sm font-light text-gray-500">Index</h2>
            <span className="text-black">
              {defaultRate.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {evolutionData.length > 0 && (
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={evolutionData}>
            <Tooltip
              contentStyle={{ backgroundColor: "transparent", border: "none" }}
              wrapperStyle={{
                backgroundColor: "rgba(255,255,255, 0.7)",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
              cursor={{ fill: "transparent" }}
              formatter={(value) => `${value.toFixed(2)}%`}
            />
            <CartesianGrid vertical={false} strokeOpacity={0.15} />
            <XAxis dataKey="period" fontSize={12} />
            <YAxis
              width={50}
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <defs>
              <linearGradient id="colorDefaultRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Bar dataKey="rate">
              <LabelList dataKey="rate" content={<CustomLabel />} />
              {evolutionData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  stroke="#8884d8"
                  fill="url(#colorDefaultRate)"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}