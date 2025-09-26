import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Loader2, Calendar } from "lucide-react";
import { parseISO, format } from "date-fns";
import api from "~/services/api";

export default function EnrollmentBarChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const availableYears = [];
  for (let year = 2024; year <= currentYear; year++) {
    availableYears.push(year);
  }

  async function fetchData(year) {
    try {
      setLoading(true);
      const { data } = await api.get("/enrollment-stats/month", {
        params: {
          year: year,
        },
      });
      setData(data);
    } catch (err) {
      console.error("Error fetching enrollment stats:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
  };

  return (
    <div className="w-full h-80 p-4 border rounded-lg bg-white">
      <div className="relative">
        <h2 className="text-md font-bold border-b w-full text-center bg-zinc-100 px-2 py-1 text-primary">
          Students in Class
        </h2>
        
        <div className="absolute top-0 right-2 flex items-center gap-2 h-full">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 cursor-pointer"
            disabled={loading}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={(value) =>
                format(parseISO(value + "-01"), "MMM/yy")
              }
              interval={0}
            />
            <YAxis allowDecimals={false} />
            <Tooltip
              labelFormatter={(value) =>
                format(parseISO(value + "-01"), "MMMM yyyy")
              }
              formatter={(value) => [`${value} students`, "Enrolled"]}
            />
            <Bar dataKey="students" fill="#F97316" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="students"
                position="insideBottom"
                fill="#FFFFFF"
                offset={10}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {!loading && data.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Calendar className="w-12 h-12 mb-2" />
          <p className="text-sm">No enrollment data for {selectedYear}</p>
        </div>
      )}
    </div>
  );
}