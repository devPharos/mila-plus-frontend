import { FileText, Loader2, Table2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast, Zoom } from "react-toastify";
import api, { baseURL } from "~/services/api";

function EvaluationChart() {
  const [loading, setLoading] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [error, setError] = useState(false);
  const [groups, setGroups] = useState([]);
  const groupRef = useRef();

  function handleGenerateReport() {
    setError(false);
    setLoading(true);
    const group_id = groupRef.current.value;

    if (!group_id) {
      setLoading(false);
      setTimeout(() => {
        toast("Group is required!", {
          autoClose: 1500,
          type: "error",
          transition: Zoom,
        });
        setError("group_id");
      }, 300);
      return;
    }

    api
      .post(`/reports/evaluationChart`, {
        group_id,
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

  function handleGeneratePDF() {
    setError(false);
    setLoadingPDF(true);
    const group_id = groupRef.current.value;

    if (!group_id) {
      setLoadingPDF(false);
      setTimeout(() => {
        toast("Group is required!", {
          autoClose: 1500,
          type: "error",
          transition: Zoom,
        });
        setError("group_id");
      }, 300);
      return;
    }

    api
      .post(`/reports/evaluationChartPDF`, {
        group_id,
      }, {
        responseType: "blob",
      })
      .then(({ data }) => {
        const pdfBlob = new Blob([data], { type: "application/pdf" });
        saveAs(pdfBlob, `evaluation_chart_${group_id}.pdf`);
        setLoadingPDF(false);
      })
      .catch((err) => {
        console.log(err);
        setLoadingPDF(false);
      });
  }

  async function getGroups() {
    try {
      const { data } = await api.get("/studentgroups?limit=100");
      setGroups(data.rows.map((group) => ({ id: group.id, name: group.name })));
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setError(null);
    }, 3000);
    getGroups();
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-2 border rounded-lg hover:scale-105 duration-300 ease-in-out min-w-[500px]">
      <h2 className="text-md font-bold border-b w-full text-center bg-zinc-100 px-2 py-1 text-primary">
        Evaluation Chart
      </h2>
      <div className="w-full flex flex-row items-end gap-2 p-2">
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-xs font-bold flex-1 text-center">Group</label>
          <select
            className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded ${error === "snapshot_date" && "border-red-500"
              }`}
            name="group_id"
            ref={groupRef}
          >
            <option value="">Select a group...</option>
            {groups.length > 0 &&
              groups.map((group) => (
                <option value={group.id} key={group.id}>
                  {group.name}
                </option>
              ))}
          </select>
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
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={loadingPDF}
            onClick={() => handleGeneratePDF()}
            className="text-md font-bold bg-secondary border text-zinc-500 hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
          >
            {loadingPDF ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} />
            )}{" "}
            PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default EvaluationChart;