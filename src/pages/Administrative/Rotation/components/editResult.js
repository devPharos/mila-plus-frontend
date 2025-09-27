import { X } from "lucide-react";
import { useRef } from "react";
import { toast } from "react-toastify";
import api from "~/services/api";

export default function EditResult({ studentGroup, setEdit, group }) {
  if (!studentGroup) return null;
  const { name, last_name } = studentGroup.frequency.student;
  const totalInGroup = studentGroup?.frequency?.totals?.groups.find(
    (g) => g.group.id === group.id
  ) || { frequency: 0 };
  const frequency = parseInt(totalInGroup.frequency?.toFixed(0)) || 0;
  const score = totalInGroup.score;
  const options = [
    {
      label: "PASS",
      value: "PASS",
    },
    {
      label: "FAIL",
      value: "FAIL",
    },
  ];
  const resultRef = useRef();
  const reasonRef = useRef();

  async function handleSave() {
    if (!resultRef.current.value || !reasonRef.current.value) {
      toast("Please fill in the fields", { type: "error", autoClose: 3000 });
      return;
    }
    try {
      const { data } = await api.put(`/rotation/students/${studentGroup.id}`, {
        result: resultRef.current.value,
        reason: reasonRef.current.value,
      });
      toast(`${result} Result for ${name} ${last_name}`, { autoClose: 1000 });
      setEdit(null);
    } catch (err) {
      console.log(err);
      toast(err.response?.data?.error, { type: "error", autoClose: 3000 });
    }
  }
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10">
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
          <div className="flex flex-col items-center justify-center gap-4 p-4">
            <div className="w-full flex flex-row items-center justify-between gap-4 pb-2 border-b">
              <h1 className="text-sm font-bold">
                {name} <span className="font-extralight">{last_name}</span>
              </h1>
              <div className="text-xl font-bold cursor-pointer">
                <X size={22} onClick={() => setEdit(null)} />
              </div>
            </div>
            <div className="w-full flex flex-row items-start justify-center gap-2">
              <div className="flex-1 flex flex-row items-center justify-center gap-2">
                <div className="flex flex-col items-start justify-center gap-2">
                  <label className="text-xs font-bold flex-1 text-left">
                    Frequency
                  </label>
                  <div className="flex flex-row items-center justify-center gap-2 w-full">
                    <span className="text-sm font-bold">{frequency || 0}%</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-row items-center justify-center gap-2">
                <div className="flex flex-col items-start justify-center gap-2">
                  <label className="text-xs font-bold flex-1 text-left">
                    Final Average Score
                  </label>
                  <div className="flex flex-row items-center justify-center gap-2 w-full">
                    <span className="text-sm font-bold">{score || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-row items-center justify-center gap-4">
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <div className="w-full flex flex-row items-center justify-between gap-2">
                  <div className="w-full flex flex-col items-start justify-center gap-2">
                    <label className="text-xs font-bold flex-1 text-left">
                      Result
                    </label>
                    <select
                      ref={resultRef}
                      className={`w-full transition ease-in-out duration-300 w-full text-xs bg-white text-gray-500 p-2 border rounded`}
                      name="group_id"
                    >
                      {options.map((option, index) => {
                        const selected =
                          (score >= 80 && option.value === "PASS") ||
                          (score < 80 && option.value === "FAIL");

                        return (
                          <option
                            key={index}
                            value={option.value}
                            selected={selected}
                          >
                            {option.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="w-full flex flex-row items-center justify-between gap-2">
                  <div className="w-full flex flex-col items-start justify-center gap-2">
                    <label className="text-xs font-bold flex-1 text-left">
                      Reason
                    </label>
                    <textarea
                      ref={reasonRef}
                      className={`w-full transition ease-in-out duration-300 w-full text-xs bg-white text-gray-500 p-2 border rounded`}
                      name="group_id"
                      placeholder="Enter a reason"
                    ></textarea>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="text-md font-bold bg-secondary border text-zinc-500 hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEdit(null)}
                    className="text-md font-bold bg-secondary border text-zinc-500 hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
