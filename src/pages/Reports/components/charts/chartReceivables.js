import React, { useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { USDollar } from "~/functions";

export default function ChartReceivables({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleClick = (data, index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  if (!data) return null;

  return (
    <div className="w-full p-2 px-4 border rounded-lg">
      <div className="flex flex-row items-center justify-between mb-4">
        <div className="flex flex-col items-start justify-center">
          <h1 className="text-lg font-bold">Receivables</h1>
          <h1 className="text-sm font-extralight text-gray-500">
            by Chart of Accounts
          </h1>
        </div>
        <div className="flex flex-row items-end justify-center gap-4">
          <div className="text-xl font-bold border-b border-l p-2 rounded w-40">
            <h2 className="text-sm font-light text-gray-500">Total</h2>
            <span>
              {USDollar.format(
                data.byChartOfAccount?.reduce((a, b) => a + b.total, 0)
              )}
            </span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart width={150} height={40} data={data.byChartOfAccount}>
          <Tooltip
            contentStyle={{ backgroundColor: "transparent", border: "none" }}
            wrapperStyle={{
              backgroundColor: "rgba(255,255,255, 0.7)",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
            cursor={{ fill: "transparent" }}
            labelStyle={{
              display: "none",
            }}
            formatter={(value) => USDollar.format(value)}
          />
          <CartesianGrid vertical={false} strokeOpacity={0.15} />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis
            width={100}
            fontSize={12}
            tickFormatter={(value) => {
              return USDollar.format(value);
            }}
          />
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(238 88 39)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="rgb(238 88 39)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Bar dataKey="total" onClick={handleClick}>
            {data.byChartOfAccount?.map((entry, index) => (
              <Cell
                cursor="pointer"
                key={`cell-${index}`}
                stroke={`${
                  activeIndex !== null && index === activeIndex
                    ? "rgb(238 88 39)"
                    : "#8884d8"
                }`}
                fill={`${
                  activeIndex !== null && index === activeIndex
                    ? "url(#colorAmt)"
                    : "url(#colorUv)"
                }`}
                fillOpacity={0.3}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* <p className="content">{`Uv of "${activeItem.name}": ${activeItem.uv}`}</p> */}
    </div>
  );
}
