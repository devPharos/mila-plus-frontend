import { X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "~/services/api";

export default function StudentDetail({ student, setShowDetails }) {
  if (!student) return null;
  const { name } = student;
  const [tests, setTests] = useState([]);

  async function getStudentTests() {
    try {
      const { data } = await api.get(
        `/grades/${student.student_id}/${student.studentgroup_id}`
      );
      setTests(data);
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    getStudentTests();
  }, []);

  let cumulativePercentage = 0;
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10">
      <div className="w-full h-full pt-32 flex flex-col items-center justify-center gap-4">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-y-scroll">
          <div className="flex flex-col items-center justify-center gap-4 p-4">
            <div className="w-full flex flex-row items-center justify-between gap-4 pb-2 border-b">
              <h1 className="text-sm font-bold">{name}</h1>
              <div className="text-xl font-bold cursor-pointer">
                <X size={22} onClick={() => setShowDetails(null)} />
              </div>
            </div>
            <div className="w-full flex flex-row items-center justify-center gap-4">
              <table className="w-full text-sm text-center">
                <thead className="sticky top-0 border-b bg-zinc-100">
                  <tr>
                    <th className="border rounded p-2 hover:bg-gray-100 text-left">
                      Test
                    </th>
                    <th className="border rounded p-2 hover:bg-gray-100 text-center">
                      Weight %
                    </th>
                    <th className="border rounded p-2 hover:bg-gray-100 text-center">
                      Score
                    </th>
                    <th className="border rounded p-2 hover:bg-gray-100 text-center">
                      Weight x Score
                    </th>
                    <th className="border rounded p-2 hover:bg-gray-100 text-center">
                      Discarded
                    </th>
                    <th className="border rounded p-2 hover:bg-gray-100 text-center">
                      Vacation
                    </th>
                    <th className="border rounded p-2 hover:bg-gray-100 text-center">
                      Medical Excuse
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test, index) => {
                    const {
                      name,
                      score,
                      percentage,
                      discarded,
                      medical_excuse,
                      vacation,
                    } = test;
                    cumulativePercentage += percentage;

                    return (
                      <>
                        <tr
                          key={index}
                          className="border-b even:bg-zinc-50 text-zinc-500 text-xs hover:bg-zinc-100"
                        >
                          <td className="text-left p-2">{name}</td>
                          <td>{percentage}%</td>
                          <td>{score || 0}</td>
                          <td>{(score * percentage) / 100 || 0}</td>
                          <td>{discarded ? "Yes" : "No"}</td>
                          <td>{medical_excuse ? "Yes" : "No"}</td>
                          <td>{vacation ? "Yes" : "No"}</td>
                        </tr>
                        {/* {cumulativePercentage === 100 && (
                          <tr className="border-b bg-zinc-100 text-zinc-500 text-xs font-bold">
                            <td className="text-left p-2"></td>
                            <td></td>
                            <td></td>
                            <td colSpan={10}></td>
                          </tr>
                        )} */}
                      </>
                    );
                  })}
                  <tr className="border-b bg-zinc-100 text-zinc-500 text-xs font-bold">
                    <td className="text-left p-2">Final Average Grade</td>
                    <td></td>
                    <td>
                      <div
                        className={`${
                          student.final_average_score >= 70
                            ? "bg-emerald-400"
                            : "bg-red-400"
                        } rounded text-white p-1`}
                      >
                        {student.final_average_score || 0}
                      </div>
                    </td>
                    <td colSpan={10}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
