import { Loader2, Table2 } from "lucide-react";
import React, { useRef, useState } from "react";
import api, { baseURL } from "~/services/api";

// import { Container } from './styles';

function AbsenceControl() {
  const [loading, setLoading] = useState(false);
  const fromDateRef = useRef();
  const untilDateRef = useRef();
  function handleAbsenceControl() {
    setLoading(true);
    const from_date = fromDateRef.current.value;
    const until_date = untilDateRef.current.value;

    api
      .post(`/absenceControl/studentsUnderLimit`, {
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
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="flex flex-col">
        <label className="text-xs font-bold flex-1">From date</label>
        <input
          type="date"
          name="from_date"
          ref={fromDateRef}
          className="text-xs text-gray-500 p-2"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-bold flex-1">Until date</label>
        <input
          type="date"
          name="until_date"
          ref={untilDateRef}
          className="text-xs text-gray-500 p-2"
        />
      </div>
      <button
        type="button"
        disabled={loading}
        onClick={() => handleAbsenceControl()}
        className="text-md font-bold bg-secondary border hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Table2 size={16} />
        )}{" "}
        Absence Control
      </button>
    </div>
  );
}

export default AbsenceControl;
