import React, { useEffect, useRef, useState } from "react";
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

const parseISO = (s) => new Date(s.replace(/-/g, "/"));
const format = (date, fmt) => {
  const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const MF = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  if (fmt === "MMM") return M[date.getMonth()];
  if (fmt === "MMMM yyyy") return `${MF[date.getMonth()]} ${date.getFullYear()}`;
  return date.toISOString();
};

const WhiteCard = ({ children }) => (
  <div className="relative">
    <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-[0_6px_24px_rgba(0,0,0,0.08)] p-3">
      {children}
    </div>
    <div className="pointer-events-none absolute left-1/2 -bottom-[6px] -translate-x-1/2">
      <div className="relative">
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-gray-200" />
        <div className="absolute left-1/2 -top-[7px] -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-white" />
      </div>
    </div>
  </div>
);

const CustomMonthTooltip = ({ active, payload }) => {
  const [first, setFirst] = useState(true);
  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setFirst(false), 50);
      return () => clearTimeout(t);
    }
    setFirst(true);
  }, [active]);

  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const monthName = format(parseISO(d.month + "-01"), "MMMM yyyy");

  return (
    <div className={`transition-all duration-200 ease-out ${first ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
      <WhiteCard>
        <p className="mb-1 font-semibold">{monthName}</p>
        <p className="mb-2 text-sm">
          <span className="font-medium">{(d.students ?? 0).toLocaleString()}</span> students
        </p>
        <div className="border-t border-gray-200" />
        <p className="pt-2 text-xs text-gray-500">Click for more details</p>
      </WhiteCard>
    </div>
  );
};

const CustomCategoryTooltip = ({ active, payload }) => {
  const [first, setFirst] = useState(true);
  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setFirst(false), 50);
      return () => clearTimeout(t);
    }
    setFirst(true);
  }, [active]);

  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  if (d?.count == null) return null;

  return (
    <div className={`transition-all duration-200 ease-out ${first ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
      <div className="relative">
        <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-[0_6px_24px_rgba(0,0,0,0.08)] p-3">
          <p className="mb-1 font-semibold">{d.name}</p>
          <p className="text-sm">
            <span className="font-medium">{(d.count ?? 0).toLocaleString()}</span> students
          </p>
        </div>
        <div className="pointer-events-none absolute left-1/2 -bottom-[6px] -translate-x-1/2">
          <div className="relative">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-gray-200" />
            <div className="absolute left-1/2 -top-[7px] -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

function MonthPillTickFactory({
  activeIndex,
  hoveredIndex,
  onTickClick,
  onTickHover,
  color = "#4C4C59",
  highlightFill = "#EEB39F",
  highlightText = "#111827",
}) {
  return function MonthPillTick(props) {
    const { x, y, payload, index } = props;
    const date = parseISO(payload.value + "-01");
    const label = format(date, "MMM");
    const hot = activeIndex === index || hoveredIndex === index;

    const pillW = 46;
    const pillH = 22;
    const rx = 12;

    return (
      <g
        transform={`translate(${x},${y + 14})`}
        cursor="pointer"
        onClick={() => onTickClick?.(index)}
        onMouseEnter={() => onTickHover?.(index)}
        onMouseLeave={() => onTickHover?.(null)}
      >
        <rect
          x={-pillW / 2}
          y={-pillH + 2}
          width={pillW}
          height={pillH}
          rx={rx}
          fill={hot ? highlightFill : "#ffffff"}
          stroke={hot ? highlightFill : color}
          opacity={hot ? 1 : 0.35}
        />
        <text
          textAnchor="middle"
          dy={-6}
          className="text-[12px] font-semibold"
          fill={hot ? highlightText : color}
        >
          {label}
        </text>
      </g>
    );
  };
}

export default function EnrollmentBarChart({ year }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [summary, setSummary] = useState({ inClass: 0, waiting: 0, total: 0 });
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [viewMode, setViewMode] = useState("months");
  const [processData, setProcessData] = useState(null);
  const [processLoading, setProcessLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const didAnimateMonths = useRef(false);
  const didAnimateCats = useRef(false);

  const activeYear = typeof year === "number" ? year : new Date().getFullYear();

  async function fetchData() {
    try {
      setLoading(true);
      const params = {};
      if (typeof year === "number") params.year = year;
      const resp = await api.get("/enrollment-stats/month", { params });
      const raw = resp.data || [];
      setData(raw.map(d => ({ month: d.month, students: Number(d.students ?? 0) })));
    } catch {
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
      setSummary({ inClass: r.in_class || 0, waiting: r.waiting || 0, total: r.total || 0 });
    } catch {
      setSummary({ inClass: 0, waiting: 0, total: 0 });
    } finally {
      setSummaryLoading(false);
    }
  }

  async function fetchProcessData(month) {
    try {
      setProcessLoading(true);
      const resp = await api.get("/enrollment-stats/process-by-month", { params: { month } });
      setProcessData(resp.data);
      setSelectedMonth(month);
      setViewMode("categories");
      didAnimateCats.current = false;
    } catch {
    } finally {
      setProcessLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    fetchSummary();
    didAnimateMonths.current = false;
  }, [year]);

  const handleMonthClick = (entry, index) => {
    setActiveIndex(index);
    if (entry?.month) fetchProcessData(entry.month);
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

  if (!data?.length) {
    return (
      <div className="w-full p-3 px-5 border rounded-lg">
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <Calendar className="w-14 h-14 mb-2" />
          <p className="text-base">No enrollment data for {activeYear}</p>
        </div>
      </div>
    );
  }

  const MonthPillTick = MonthPillTickFactory({
    activeIndex,
    hoveredIndex,
    onTickClick: (idx) => {
      const entry = data[idx];
      if (!entry) return;
      setActiveIndex(idx);
      if (entry?.month) fetchProcessData(entry.month);
    },
    onTickHover: (idx) => setHoveredIndex(idx),
    color: "#4C4C59",
    highlightFill: "#EEB39F",
    highlightText: "#111827",
  });

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
              {viewMode === "months" ? "Students in Class" : "Students In Class - Process Type"}
            </h1>
          </div>

          {viewMode === "months" ? (
            <div className="text-base">
              <span className="text-gray-500">This year</span>
              <span className="mx-1 text-gray-400">–</span>
              <span className="font-semibold text-gray-900">{activeYear}</span>
            </div>
          ) : (
            <h1 className="text-base font-extralight text-gray-500">
              {`${format(parseISO(selectedMonth + "-01"), "MMMM yyyy")} - `}
              <span className="font-bold">Total: {processData?.total_active_students || 0} students</span>
            </h1>
          )}
        </div>

        {viewMode === "months" ? (
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
        ) : (
          <div className="flex flex-row items-end justify-center gap-4">
            <div className="text-xl font-bold border-b border-l p-2 rounded w-40">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#403D8A]" />
                <h2 className="text-sm font-light text-gray-500">F1</h2>
              </div>
              <span>{processData?.process_types?.f1?.toLocaleString() || 0}</span>
            </div>
            <div className="text-xl font-bold border-b border-l p-2 rounded w-40">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#EE5827]" />
                <h2 className="text-base font-light text-gray-500">Non-F1</h2>
              </div>
              <span>{processData?.process_types?.non_f1?.toLocaleString() || 0}</span>
            </div>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={150}>
        {viewMode === "months" ? (
          <BarChart
            data={data}
            barCategoryGap="80%"
            margin={{ top: 0, right: 0, bottom: 16, left: 0 }}
          >
            <Tooltip content={<CustomMonthTooltip />} position={{ y: -80 }} offset={-65} cursor={{ fill: "transparent" }} />
            <CartesianGrid vertical={false} strokeOpacity={0.15} />
            <XAxis
              dataKey="month"
              tick={<MonthPillTick />}
              axisLine={false}
              tickLine={false}
              height={28}
              tickMargin={8}
            />
            <YAxis width={50} fontSize={12} tickFormatter={(v) => v.toLocaleString()} />
            <defs>
              <style>{`.bar-label { transition: fill 0.2s ease; }`}</style>
            </defs>
            <Bar
              dataKey="students"
              onClick={(e, idx) => handleMonthClick(data[idx], idx)}
              radius={[8, 8, 8, 8]}
              isAnimationActive={!didAnimateMonths.current}
              animationBegin={80}
              animationDuration={600}
              animationEasing="ease-out"
              onAnimationEnd={() => (didAnimateMonths.current = true)}
              onMouseMove={(_, idx) => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <LabelList
                dataKey="students"
                isAnimationActive={false}
                content={(props) => {
                  const { x, y, width, height, value, index } = props;
                  const val = Number(value ?? 0);
                  const hot = hoveredIndex === index || activeIndex === index;
                  const isZeroOrLow = val === 0 || height < 25;
                  const fill = isZeroOrLow ? "#111827" : (hot ? "#111827" : "#FFFFFF");
                  const yPos = isZeroOrLow ? y - 8 : y + height - 12;
                  
                  return (
                    <text
                      x={x + width / 2}
                      y={yPos}
                      fill={fill}
                      textAnchor="middle"
                      className="text-[14px] font-semibold bar-label"
                      pointerEvents="none"
                    >
                      {val.toLocaleString()}
                    </text>
                  );
                }}
              />
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  cursor="pointer"
                  fill={
                    hoveredIndex === index || (activeIndex !== null && index === activeIndex)
                      ? "#EEB39F"
                      : "#EE5827"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <BarChart
            data={processData?.categories || []}
            margin={{ top: 20, right: 0, bottom: 16, left: 0 }}
          >
            <Tooltip content={<CustomCategoryTooltip />} position={{ y: -60 }} offset={-50} cursor={{ fill: "transparent" }} />
            <CartesianGrid vertical={false} strokeOpacity={0.15} />
            <XAxis dataKey="name" fontSize={13} fontWeight={600} fill="#1f2937" interval={0} axisLine={false} tickLine={false} />
            <YAxis width={50} fontSize={12} tickFormatter={(v) => v.toLocaleString()} domain={[0, (max) => Math.round(max * 1.1)]} axisLine={false} tickLine={false} />
            <Bar
              dataKey="count"
              radius={[8, 8, 8, 8]}
              isAnimationActive={!didAnimateCats.current}
              animationBegin={80}
              animationDuration={600}
              animationEasing="ease-out"
              onAnimationEnd={() => (didAnimateCats.current = true)}
            >
              <LabelList
                dataKey="count"
                isAnimationActive={false}
                content={(props) => {
                  const { x, y, width, height, value } = props;
                  const val = Number(value ?? 0);
                  const isLowBar = height < 30;
                  const yPos = isLowBar ? y - 8 : y + height - 12;
                  
                  return (
                    <text
                      x={x + width / 2}
                      y={yPos}
                      textAnchor="middle"
                      className="text-[14px] font-semibold"
                      fill={isLowBar ? "#111827" : "#FFFFFF"}
                      pointerEvents="none"
                    >
                      {val.toLocaleString()}
                    </text>
                  );
                }}
              />
              {(processData?.categories || []).map((_, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={i < 4 ? "#403D8A" : "#EE5827"}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}