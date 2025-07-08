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
import Breadcrumbs from "~/components/Breadcrumbs";
import FiltersBar from "~/components/FiltersBar";
import PageHeader from "~/components/PageHeader";

import { getCurrentPage } from "~/functions";
import api from "~/services/api";

export default function FinancialDashboard() {
  const { profile } = useSelector((state) => state.user);
  const currentPage = getCurrentPage();
  const [data, setData] = useState([]);

  async function loadData() {
    await api
      .get("/receivables-dashboard")
      .then((response) => {
        const transformData = response.data.map((item) => {
          return {
            due_date: format(parseISO(item.due_date), "yyyy-MM-dd"),
            balance: item.balance,
            total: item.total,
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
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4">
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
        <FiltersBar></FiltersBar>
      </PageHeader>

      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "start",
          paddingTop: 24,
        }}
      >
        {profile.id === 1 && (
          <>
            <div className="w-full p-4 border rounded-lg">
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
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
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
                      <stop
                        offset="5%"
                        stopColor="rgb(238 88 39)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="rgb(238 88 39)"
                        stopOpacity={0}
                      />
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
                    verticalAlign="top"
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
          </>
        )}
      </div>
    </div>
  );
}
