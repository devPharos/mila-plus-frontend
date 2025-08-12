import { Edit, Loader2, Mail, PlayCircle } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

function I20Process({
  enrollment = null,
  student_id = null,
  setLoading = () => null,
  loading = false,
  handleStartProcess = null,
}) {
  const process = `I-20`;
  const routine = `i20-process`;

  if (!enrollment) {
    return (
      <div className="flex flex-1 w-full flex-col items-start justify-start text-center gap-4 px-4">
        <div className="flex w-96 flex-col items-center justify-center text-center gap-4 border border-gray-200 bg-slate-50 rounded-md p-4">
          {loading ? (
            <div className="w-full bg-slate-300 text-slate-500 border border-slate-400 hover:bg-slate-400 hover:text-white rounded-md py-4 px-4 my-2 px-2 h-6 flex flex-row items-center justify-between text-xs gap-1">
              <strong>Please wait...</strong>
              <Loader2 className="animate-spin" size={14} />
            </div>
          ) : (
            <>
              {console.log(enrollment)}
              <button
                type="button"
                disabled={loading}
                onClick={() => handleStartProcess(routine)}
                className="w-full bg-green-300 text-green-800 border border-green-400 hover:bg-green-400 hover:text-white rounded-md py-4 px-4 my-2 px-2 h-6 flex flex-row items-center justify-between text-xs gap-1"
              >
                <strong>Start {process} Process</strong>
                <PlayCircle size={18} />
              </button>
            </>
          )}
          <p className="text-xs text-gray-500 text-left px-2 border-t pt-4">
            Send this enrollment to DSO for approval.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-1 w-full flex-col items-start justify-start text-center gap-4 px-4">
      <div className="flex w-full flex-row items-center justify-start text-center gap-4 border border-gray-200 bg-slate-50 rounded-md p-4">
        <p className="text-xs">I-20 Process has already been started.</p>
      </div>
    </div>
  );
}

export default I20Process;
