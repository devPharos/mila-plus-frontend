import { Loader2, Table2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast, Zoom } from "react-toastify";
import api, { baseURL } from "~/services/api";

// import { Container } from './styles';

function ClassSchedule() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const snapshotDateRef = useRef();

  function handleGenerateReport() {
    setError(false);
    setLoading(true);
    const snapshot_date = snapshotDateRef.current.value;

    if (!snapshot_date) {
      setLoading(false);
      setTimeout(() => {
        toast("Date is required!", {
          autoClose: 1500,
          type: "error",
          transition: Zoom,
        });
        setError("snapshot_date");
      }, 300);
      return;
    }

    api
      .post(`/reports/classSchedule`, {
        snapshot_date,
      })
      .then(({ data }) => {
        saveAs(`${baseURL}/get-file/${data.name}`, `${data.name}.xlsx`);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }

  useEffect(() => {
    setTimeout(() => {
      setError(null);
    }, 3000);
  }, [error]);
  return (
    <div className="flex flex-col items-center gap-2 border rounded-lg hover:scale-105 duration-300 ease-in-out">
      <h2 className="text-md font-bold border-b w-full text-center bg-zinc-100 px-2 py-1 text-primary">
        Class Schedule
      </h2>
      <div className="flex flex-row items-end gap-2 p-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold flex-1 text-center">Date</label>
          <input
            type="date"
            name="snapshot_date"
            ref={snapshotDateRef}
            className={`transition ease-in-out duration-300 w-36 text-xs text-gray-500 p-2 border rounded ${
              error === "snapshot_date" && "border-red-500"
            }`}
          />
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleGenerateReport()}
            className="text-md font-bold bg-secondary border text-zinc-500 hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Table2 size={16} />
            )}{" "}
            Generate Worksheet
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClassSchedule;
