import { Filter } from "lucide-react";
import React, { useEffect, useState } from "react";
import Breadcrumbs from "~/components/Breadcrumbs";
import FiltersBar from "~/components/FiltersBar";
import PageHeader from "~/components/PageHeader";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getCurrentPage } from "~/functions";
import api from "~/services/api";

export default function AdministrativeDashboard() {
  const currentPage = getCurrentPage();
  const data = [
    {
      name: "Jan 25",
      uv: 4000,
      pv: 2400,
    },
    {
      name: "Feb 25",
      uv: 3000,
      pv: 1398,
    },
    {
      name: "Mar 25",
      uv: 2000,
      pv: 9800,
    },
    {
      name: "Apr 25",
      uv: 2780,
      pv: 3908,
    },
    {
      name: "May 25",
      uv: 1890,
      pv: 4800,
    },
    {
      name: "Jun 25",
      uv: 2390,
      pv: 3800,
    },
  ];

  // const [data, setData] = useState([]);
  // useEffect(() => {
  //   api
  //     .get("/charts/frequencyControl")
  //     .then((res) => {
  //       console.log(res.data);
  //       setData(res.data);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }, []);

  return (
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4">
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
        <FiltersBar>
          <Filter size={14} /> Custom Filters
        </FiltersBar>
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
        <ResponsiveContainer width="50%" height="50%">
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="students"
              name="Students"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
            />
            <Area
              type="monotone"
              dataKey="studentsUnderLimit"
              name="Students under 80% limit"
              stackId="1"
              stroke="#82ca9d"
              fill="#82ca9d"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
