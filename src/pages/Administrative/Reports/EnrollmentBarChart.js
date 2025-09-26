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
} from "recharts";
import { Loader2, Calendar, UserCheck, Clock } from "lucide-react";
import { parseISO, format } from "date-fns";
import api from "~/services/api";

export default function EnrollmentBarChart({ year }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [summary, setSummary] = useState({
    inClass: 0,
    waiting: 0,
    total: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

  async function fetchData() {
    try {
      setLoading(true);

      const params = {};
      if (typeof year === "number") params.year = year;

      const resp = await api.get("/enrollment-stats/month", { params });
      setData(resp.data || []);
    } catch (err) {
      console.error("Error fetching enrollment stats:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummary() {
    try {
      setSummaryLoading(true);
      const resp = await api.get("/enrollment-stats/summary");
      const r = resp.data || {};
      setSummary({
        inClass: r.in_class || 0,
        waiting: r.waiting || 0,
        total: r.total || 0,
      });
    } catch (err) {
      console.error("Error fetching student summary:", err);
      setSummary({ inClass: 0, waiting: 0, total: 0 });
    } finally {
      setSummaryLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    fetchSummary();
  }, [year]);

  const handleClick = (_entry, index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  if (loading) {
    return (
      <div className="w-full p-3 px-5 border rounded-lg">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin" size={36} />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full p-3 px-5 border rounded-lg">
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <Calendar className="w-14 h-14 mb-2" />
          <p className="text-base">
            No enrollment data for {year ?? new Date().getFullYear()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-3 px-5 border rounded-lg">
      <div className="flex flex-row items-center justify-between mb-5">
        <div className="flex flex-col items-start justify-center">
          <h1 className="text-xl font-bold">Students in Class</h1>
          <h1 className="text-base font-extralight text-gray-500">
            {year ? `Year ${year}` : "This month"}
          </h1>
        </div>
        <div className="flex flex-row items-end justify-center gap-5">
          <div className="text-2xl font-bold border-b border-l p-3 rounded w-44">
            <h2 className="text-base font-light text-gray-500">
              In Class
            </h2>
            {summaryLoading ? (
              <div className="h-7 w-24 bg-gray-200 animate-pulse rounded mt-1" />
            ) : (
              <span>{summary.inClass.toLocaleString()}</span>
            )}
          </div>
          <div className="text-2xl font-bold border-b border-l p-3 rounded w-44">
            <h2 className="text-base font-light text-gray-500">
              Waiting
            </h2>
            {summaryLoading ? (
              <div className="h-7 w-24 bg-gray-200 animate-pulse rounded mt-1" />
            ) : (
              <span>{summary.waiting.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <Tooltip
            contentStyle={{ backgroundColor: "transparent", border: "none" }}
            wrapperStyle={{
              backgroundColor: "rgba(255,255,255, 0.7)",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
            cursor={{ fill: "transparent" }}
            labelStyle={{ display: "none" }}
            formatter={(value) => `${value} students`}
          />
          <CartesianGrid vertical={false} strokeOpacity={0.15} />
          <XAxis
            dataKey="month"
            fontSize={14}
            tickFormatter={(value) => format(parseISO(value + "-01"), "MMM")}
          />
          <YAxis
            width={50}
            fontSize={14}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <defs>
            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorStudentsActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(238 88 39)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="rgb(238 88 39)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Bar dataKey="students" onClick={handleClick}>
            {data.map((_entry, index) => (
              <Cell
                cursor="pointer"
                key={`cell-${index}`}
                stroke={
                  activeIndex !== null && index === activeIndex
                    ? "rgb(238 88 39)"
                    : "#8884d8"
                }
                fill={
                  activeIndex !== null && index === activeIndex
                    ? "url(#colorStudentsActive)"
                    : "url(#colorStudents)"
                }
                fillOpacity={0.3}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
