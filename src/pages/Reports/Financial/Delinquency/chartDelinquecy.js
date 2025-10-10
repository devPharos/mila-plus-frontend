import React, { useEffect, useState, memo } from "react";
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
import { format, parse } from "date-fns";
import api from "~/services/api";
import { toast } from "react-toastify";
import DefaultRateModal from "./defaultModal";

const USDollar = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const formatPeriodLabel = (period) => {
  const date = parse(period, "yyyy-MM", new Date());
  return format(date, "MMM yyyy");
};

const CustomLabelBase = (props) => {
  const { x, y, width, height, value } = props;
  if (value === 0) return null;
  return (
    <text
      x={x + width / 2}
      y={y + height - 10}
      fill="#000000"
      textAnchor="middle"
      dominantBaseline="middle"
      className="text-[12px] font-semibold"
      style={{ pointerEvents: "none" }}
    >
      {value.toFixed(1)}%
    </text>
  );
};
const CustomLabel = memo(CustomLabelBase);

const HoverBand = ({ onClickEntry, ...props }) => {
  const { x, width, height, payload } = props;
  if (!payload || !payload[0]) return null;
  const entry = payload[0].payload;
  if (!entry || entry.rate === 0) return null;
  return (
    <rect
      x={x}
      y={0}
      width={width}
      height={height}
      fill="rgba(136, 132, 216, 0.1)"
      style={{ cursor: "pointer" }}
      onClick={() => onClickEntry(entry)}
    />
  );
};

const CustomTooltip = ({ active, payload, onClickEntry }) => {
  if (!(active && payload && payload.length)) return null;
  const data = payload[0].payload;
  return (
    <div
      className="bg-black text-white rounded-lg shadow-lg p-3 cursor-pointer"
      onClick={() => onClickEntry(data)}
    >
      <p className="font-semibold mb-1">{formatPeriodLabel(data.period)}</p>
      <p className="text-sm mb-2">
        <span className="font-medium">{data.rate.toFixed(2)}%</span> delinquency
      </p>
      {data.rate > 0 && <p className="text-xs text-gray-300 border-t border-gray-600 pt-2">Click for details</p>}
    </div>
  );
};

const CustomXAxisTickBase = (props) => {
  const { x, y, payload } = props;
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const formattedLabel = formatPeriodLabel(payload.value);
  if (isMobile) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-45)" className="text-[10px]">
          {formattedLabel}
        </text>
      </g>
    );
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" className="text-[12px]">
        {formattedLabel}
      </text>
    </g>
  );
};
const CustomXAxisTick = memo(CustomXAxisTickBase);

export default function ChartDefaultRate({ filters }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (filters?.defaultRateFilter) {
      loadDefaultRateData();
    }
  }, [filters?.defaultRateFilter]);

  async function loadDefaultRateData() {
    setLoading(true);
    try {
      const { from, to } = filters.defaultRateFilter;
      const response = await api.get("/reports/default-rate", {
        params: {
          period_from: format(from, "yyyy-MM-dd"),
          period_to: format(to, "yyyy-MM-dd"),
          period_by: "Due Date",
        },
      });
      setData(response.data);
    } catch (err) {
      console.error("Error loading default rate:", err);
      toast(err?.response?.data?.error || "Error loading default rate data", { type: "error", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
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

  const openByEntry = (entry) => {
    if (!entry) return;
    const idx = evolutionData.findIndex((d) => d.period === entry.period);
    setActiveIndex(idx >= 0 ? idx : null);
    if (entry.rate > 0) {
      const [year, month] = entry.period.split("-");
      const periodFrom = `${year}-${month}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const periodTo = `${year}-${month}-${lastDay}`;
      setSelectedPeriod({
        from: periodFrom,
        to: periodTo,
        period: formatPeriodLabel(entry.period),
        rate: entry.rate,
        overdue: entry.overdue,
        total: entry.total,
      });
      setIsModalOpen(true);
    }
  };

  return (
    <div className="w-full p-3 px-5 border rounded-lg mb-4">
      <div className={`flex ${isMobile ? "flex-col gap-4" : "flex-row"} items-${isMobile ? "start" : "center"} justify-between mb-5`}>
        <div className="flex flex-col items-start justify-center">
          <h1 className={`${isMobile ? "text-base" : "text-lg"} font-bold`}>Delinquency Index</h1>
          <h1 className={`${isMobile ? "text-xs" : "text-sm"} font-extralight text-gray-500`}>Overdue receivables / Total billing</h1>
        </div>
       
      </div>

      {evolutionData.length > 0 && (
        <div className={isMobile ? "overflow-x-auto -mx-3 px-3" : ""}>
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 150} minWidth={isMobile ? 500 : undefined}>
            <BarChart data={evolutionData} margin={isMobile ? { bottom: 30 } : undefined}>
              <Tooltip content={(p) => <CustomTooltip {...p} onClickEntry={openByEntry} />} cursor={<HoverBand onClickEntry={openByEntry} />} animationDuration={0} isAnimationActive={false} />
              <CartesianGrid vertical={false} strokeOpacity={0.15} />
              <XAxis dataKey="period" fontSize={isMobile ? 10 : 12} tick={<CustomXAxisTick />} height={isMobile ? 60 : 30} />
              <YAxis width={isMobile ? 35 : 50} fontSize={isMobile ? 10 : 12} tickFormatter={(value) => `${value}%`} />
              <defs>
                <linearGradient id="colorDefaultRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Bar
                dataKey="rate"
                onClick={(data) => {
                  if (data && data.payload) openByEntry(data.payload);
                }}
              >
                <LabelList dataKey="rate" content={<CustomLabel />} />
                {evolutionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} stroke={index === activeIndex ? "rgb(238 88 39)" : "#8884d8"} fill="url(#colorDefaultRate)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <DefaultRateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} periodData={selectedPeriod} />
    </div>
  );
}
