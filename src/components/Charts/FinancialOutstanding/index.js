import { format, parseISO } from "date-fns";
import React, { PureComponent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "~/services/api";
// import { Container } from './styles';

export default function ChartFinancialOutstanding() {
  const [data, setData] = useState([]);

  async function loadData() {
    await api
      .get("/receivables-dashboard")
      .then((response) => {
        const transformData = response.data.map((item) => {
          return {
            due_date: format(parseISO(item.due_date), "yyyy-MM-dd"),
            balance: Math.round(item.balance, 2),
            total: Math.round(item.total, 2),
          };
        });
        setData(transformData);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="w-full p-2 px-4 border rounded-lg">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col items-start justify-center">
          <h1 className="text-lg font-bold">Received and Outstanding amount</h1>
          <h1 className="text-sm font-extralight text-gray-500">
            Showing total for the last 3 months
          </h1>
        </div>
        <div className="flex flex-row items-end justify-center gap-4">
          <div className="text-xl font-bold border-b border-l p-2 rounded w-40">
            <h2 className="text-sm font-light text-gray-500">Received</h2>
            <span>$ {data.reduce((a, b) => a + b.total, 0).toFixed(2)}</span>
          </div>
          <div className="text-xl font-bold border-b border-l p-2 bg-slate-50 rounded w-40">
            <h2 className="text-sm font-light text-gray-500">Outstanding</h2>
            <span>$ {data.reduce((a, b) => a + b.balance, 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          width={500}
          height={400}
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid vertical={false} strokeOpacity={0.15} />
          <XAxis
            dataKey="due_date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={16}
            tickFormatter={(value) => {
              return format(parseISO(value), "MMMM, do");
            }}
            tick={{
              fill: "#86868C",
              fontSize: 10,
              fontWeight: 500,
            }}
          />
          <Tooltip />
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
          <Area
            type="monotone"
            dataKey="total"
            name="Received Amount"
            stackId="1"
            stroke="#8884d8"
            fill="url(#colorUv)"
            fillOpacity={0.3}
            unit=" $"
          />
          <Area
            type="monotone"
            dataKey="balance"
            name="Outstanding Amount"
            stackId="1"
            stroke="rgb(238 88 39)"
            fill="url(#colorAmt)"
            fillOpacity={0.3}
            unit=" $"
          />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{
              lineHeight: "18px",
              fontSize: 12,
              marginTop: -10,
            }}
            iconType="plainline"
            align="right"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
