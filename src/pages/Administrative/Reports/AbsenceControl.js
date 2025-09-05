import { Loader2, Table2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast, Zoom } from "react-toastify";
import api, { baseURL } from "~/services/api";

// import { Container } from './styles';

function AbsenceControl() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const fromDateRef = useRef();
  const untilDateRef = useRef();

  function handleGenerateReport() {
    setError(false);
    setLoading(true);
    const from_date = fromDateRef.current.value;
    const until_date = untilDateRef.current.value;

    if (!from_date) {
      setLoading(false);
      setTimeout(() => {
        toast("From date is required!", {
          autoClose: 1500,
          type: "error",
          transition: Zoom,
        });
        setError("from_date");
      }, 300);
      return;
    }

    if (!until_date) {
      setLoading(false);
      setTimeout(() => {
        toast("Until date is required!", {
          autoClose: 1500,
          type: "error",
          transition: Zoom,
        });
        setError("until_date");
      }, 300);
      return;
    }

    api
      .post(`/reports/studentsUnderLimit`, {
        from_date,
        until_date,
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
        Absence Control
      </h2>
      <div className="flex flex-row items-end gap-2 p-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold flex-1 text-center">
            From date
          </label>
          <input
            type="date"
            name="from_date"
            ref={fromDateRef}
            className={`transition ease-in-out duration-300 w-36 text-xs text-gray-500 p-2 border rounded ${
              error === "from_date" && "border-red-500"
            }`}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold flex-1 text-center">
            Until date
          </label>
          <input
            type="date"
            name="until_date"
            ref={untilDateRef}
            className={`transition ease-in-out duration-300 w-36 text-xs text-gray-500 p-2 border rounded ${
              error === "until_date" && "border-red-500"
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

export default AbsenceControl;
