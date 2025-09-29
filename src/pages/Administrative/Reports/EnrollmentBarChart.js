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
import { Loader2, Calendar, ArrowLeft } from "lucide-react";
import api from "~/services/api";

const parseISO = (dateStr) => new Date(dateStr.replace(/-/g, '/'));

const format = (date, formatStr) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (formatStr === 'MMM') {
    return months[date.getMonth()];
  } else if (formatStr === 'MMMM yyyy') {
    return `${fullMonths[date.getMonth()]} ${date.getFullYear()}`;
  }
  return date.toISOString();
};

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

  const [viewMode, setViewMode] = useState("months"); 
  const [processData, setProcessData] = useState(null);
  const [processLoading, setProcessLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const categoryColors = [
    "#8884d8", 
    "#8884d8", 
    "#8884d8", 
    "#8884d8", 
    "#ee5827", 
    "#ee5827", 
  ];

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

  async function fetchProcessData(month) {
    try {
      setProcessLoading(true);
      const resp = await api.get("/enrollment-stats/process-by-month", {
        params: { month }
      });
      setProcessData(resp.data);
      setSelectedMonth(month);
      setViewMode("categories");
    } catch (err) {
      console.error("Error fetching process data:", err);
    } finally {
      setProcessLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    fetchSummary();
  }, [year]);

  const handleMonthClick = (entry, index) => {
    setActiveIndex(index);
    if (entry && entry.month) {
      fetchProcessData(entry.month);
    }
  };

  const handleBackClick = () => {
    setViewMode("months");
    setProcessData(null);
    setSelectedMonth(null);
    setActiveIndex(null);
  };

  if (loading || processLoading) {
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
          <div className="flex items-center gap-2">
            {viewMode === "categories" && (
              <button
                onClick={handleBackClick}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-xl font-bold">
              {viewMode === "months"
                ? "Students in Class"
                : `Students In Class - Process Type`}
            </h1>
          </div>
          <h1 className="text-base font-extralight text-gray-500">
            {viewMode === "months"
              ? (year ? `Year ${year}` : "This year")
              : `${format(parseISO(selectedMonth + "-01"), "MMMM yyyy")} - Total: ${processData?.total_active_students || 0} students`}
          </h1>
        </div>

        {viewMode === "months" && (
          <div className="flex flex-row items-end justify-center gap-4">
            <div className="text-xl font-bold border-b border-l p-2 rounded w-40">
              <h2 className="text-sm font-light text-gray-500">In Class</h2>
              {summaryLoading ? (
                <div className="h-7 w-24 bg-gray-200 animate-pulse rounded mt-1" />
              ) : (
                <span>{summary.inClass.toLocaleString()}</span>
              )}
            </div>
            <div className="text-xl font-bold border-b border-l p-2 rounded w-40">
              <h2 className="text-base font-light text-gray-500">Waiting</h2>
              {summaryLoading ? (
                <div className="h-7 w-24 bg-gray-200 animate-pulse rounded mt-1" />
              ) : (
                <span>{summary.waiting.toLocaleString()}</span>
              )}
            </div>
          </div>
        )}

        {viewMode === "categories" && processData?.process_types && (
          <div className="flex flex-row items-end justify-center gap-4">
          
            <div className="text-xl font-bold border-b border-l p-2 rounded w-40">
              <div className="flex items-center gap-1"> 
                <div className="w-3 h-3 rounded-sm bg-[#8884d8]"></div> 
                <h2 className="text-sm font-light text-gray-500">F1</h2>
              </div>
              <span>{processData.process_types.f1.toLocaleString()}</span>
            </div>
            <div className="text-xl font-bold border-b border-l p-2 rounded w-40">
              <div className="flex items-center gap-1"> 
                <div className="w-3 h-3 rounded-sm bg-[#ee5827]"></div> 
                <h2 className="text-base font-light text-gray-500">Non-F1</h2>
              </div>
              <span>{processData.process_types.non_f1.toLocaleString()}</span>
            </div>
          </div>
        )}


      </div>

      <ResponsiveContainer width="100%" height={150}>
        {viewMode === "months" ? (

          <BarChart data={data} barCategoryGap="80%">
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
              fontSize={12}
              tickFormatter={(value) => format(parseISO(value + "-01"), "MMM")}
            />
            <YAxis
              width={50}
              fontSize={12}
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
            <Bar dataKey="students" onClick={handleMonthClick}>
              <LabelList
                dataKey="students"
                position="insideBottom"
                offset={6}
                className="text-[12px] font-semibold"
                fill="#111827"
              />
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
        ) : (
          <BarChart data={processData?.categories || []}>
            <Tooltip
              contentStyle={{ backgroundColor: "transparent", border: "none" }}
              wrapperStyle={{
                backgroundColor: "rgba(255,255,255, 0.7)",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
              cursor={{ fill: "transparent" }}
              formatter={(value) => `${value} students`}
            />
            <CartesianGrid vertical={false} strokeOpacity={0.15} />

            <XAxis
              dataKey="name"
              fontSize={12}
              interval={0}
            />

            <YAxis
              width={50}
              fontSize={12}
              tickFormatter={(value) => value.toLocaleString()}
              domain={[0, (dataMax) => Math.round(dataMax * 1.1)]}
            />

            <defs>
              <linearGradient id="colorCategory0" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCategory1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCategory2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCategory3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCategory4" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ee5827" stopOpacity={1} />
                <stop offset="95%" stopColor="#ee5827" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="colorCategory5" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ee5827" stopOpacity={1} />
                <stop offset="95%" stopColor="#ee5827" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <Bar dataKey="count">
              <LabelList
                dataKey="count"
                position="insideBottom"
                offset={6}
                className="text-[12px] font-semibold"
                fill="#111827"
              />
              {processData?.categories.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  stroke={categoryColors[index % categoryColors.length]}
                  fill={`url(#colorCategory${index % categoryColors.length})`}
                  fillOpacity={0.3}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}