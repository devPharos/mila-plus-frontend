import React, { useEffect, useState } from "react";
import { Users, UserCheck, Clock, Loader2 } from "lucide-react";
import api from "~/services/api";

export default function StudentSummaryCard() {
  const [data, setData] = useState({
    inClass: 0,
    waiting: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  async function fetchSummary() {
    try {
      setLoading(true);
      const { data: response } = await api.get("/enrollment-stats/summary");
      
      setData({
        inClass: response.in_class || 0,
        waiting: response.waiting || 0,
        total: response.total || 0
      });
    } catch (err) {
      console.error("Error fetching student summary:", err);
      setData({
        inClass: 0,
        waiting: 0,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full max-w-sm mb-4 mt-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-full">
          <Users className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Student</h2>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
            ) : (
              <span>
                {data.total}
                <span className="text-sm font-normal text-gray-500 ml-1">Registered</span>
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600">In Class</span>
          </div>
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
            ) : (
              <span className="inline-flex items-center justify-center bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded min-w-[40px]">
                {data.inClass}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">Waiting</span>
          </div>
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
            ) : (
              <span className="inline-flex items-center justify-center bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded min-w-[40px]">
                {data.waiting}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between opacity-50">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600">School Waiting List</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded min-w-[40px]">
              0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}