import React, { useContext, useEffect, useRef, useState } from "react";
import { FullGridContext } from "..";
import { getCurrentPage } from "~/functions";
import PageHeader from "~/components/PageHeader";
import Breadcrumbs from "~/components/Breadcrumbs";
import FiltersBar from "~/components/FiltersBar";
import {
  CalendarX2,
  Edit,
  Eye,
  Filter,
  Save,
  Search,
  Send,
} from "lucide-react";
import api from "~/services/api";
import { format, parseISO } from "date-fns";
import StudentDetail from "./components/studentDetail";
import EditResult from "./components/editResult";
import { toast } from "react-toastify";

export default function RotationOne() {
  const [loading, setLoading] = useState(true);
  const currentPage = getCurrentPage();
  const [groups, setGroups] = useState([]);
  const groupRef = useRef();
  const statusRef = useRef();
  const [error, setError] = useState(false);
  const [statuses, setStatuses] = useState(["Ongoing"]);
  const [status, setStatus] = useState("");
  const [data, setData] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [edit, setEdit] = useState(null);

  const group = data?.studentGroup;
  const students = data?.students;

  const {
    accessModule,
    activeFilters,
    gridData,
    gridDetails,
    gridHeader,
    handleFilters,
    handleOpened,
    limit,
    loadingData,
    opened,
    orderBy,
    page,
    pages,
    search,
    setActiveFilters,
    setGridData,
    setGridDetails,
    setGridHeader,
    setLimit,
    setLoadingData,
    setOpened,
    setOrderBy,
    setPage,
    setPages,
    setSearch,
    setTotalRows,
    setSuccessfullyUpdated,
    successfullyUpdated,
    totalRows,
  } = useContext(FullGridContext);

  async function getGroup(id) {
    setLoading(true);
    try {
      const { data } = await api.get(`/rotation/group/${id}`);
      console.log(data);
      setData(data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  function handleSearchGroup() {
    setLoading(true);
    if (groupRef.current.value) {
      getGroup(groupRef.current.value);
    } else {
      setLoading(false);
    }
  }

  async function getGroups() {
    try {
      const { data } = await api.get(`/rotation/listGroups?status=${status}`);
      setGroups(
        data.map((group) => ({
          id: group.id,
          name: group.name,
          status: group.status,
        }))
      );
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  async function handleFinishRotation() {
    try {
      const { data } = await api.post(`/rotation`, { students });
      toast(`The 1st step was saved successfully`, { autoClose: 1000 });
      getGroup(id);
    } catch (err) {
      console.log(err);
      toast(err.response?.data?.error, { type: "error", autoClose: 3000 });
    }
  }

  useEffect(() => {
    getGroups();
  }, [status]);

  useEffect(() => {
    if (group?.id && !edit) {
      getGroup(group.id);
    }
  }, [edit]);

  return (
    <>
      <div className="h-full bg-white flex flex-1 gap-4 flex-col justify-start items-start rounded-tr-2xl px-4 ">
        <PageHeader>
          <Breadcrumbs currentPage={currentPage} />
          <FiltersBar>
            <Filter size={14} /> Custom Filters
          </FiltersBar>
        </PageHeader>

        <div className="flex flex-col w-full gap-4 justify-start items-start rounded-tr-2xl overflow-y-scroll pb-8">
          <div className="w-full flex flex-row px-4 justify-start items-center rounded-tr-2xl gap-4">
            <div className="bg-zinc-50 h-20 flex flex-col items-center gap-2 border rounded-lg duration-300 ease-in-out hover:bg-zinc-50 hover:border-zinc-400">
              <div className="flex flex-row items-end gap-2 p-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold flex-1 text-left">
                    Status
                  </label>
                  <select
                    className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded ${
                      error === "snapshot_date" && "border-red-500"
                    }`}
                    name="group_id"
                    onChange={(e) => setStatus(e.target.value)}
                    ref={statusRef}
                  >
                    <option value="">All</option>
                    {statuses.map((status, index) => (
                      <option value={status} key={index}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold flex-1 text-left">
                    Group
                  </label>
                  <select
                    className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded ${
                      error === "snapshot_date" && "border-red-500"
                    }`}
                    name="group_id"
                    ref={groupRef}
                  >
                    <option value="">...</option>
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
                    onClick={handleSearchGroup}
                    className="text-md font-bold bg-secondary border text-zinc-500 hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {group && (
            <div className="flex w-full flex-row gap-4 px-4 justify-start items-start rounded-tr-2xl">
              <div className="flex w-full flex-col items-center gap-2 border rounded-lg duration-300 ease-in-out hover:bg-zinc-50 hover:border-zinc-400">
                <div className="flex flex-row w-full items-end gap-4 p-2">
                  <div className="flex flex-grow flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Language Mode
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded`}
                    >
                      {group.languagemode?.name}
                    </div>
                  </div>
                  <div className="flex flex-grow flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Level
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded`}
                    >
                      {group.level?.Programcategory?.name} &gt;{" "}
                      {group.level?.name}
                    </div>
                  </div>
                  <div className="flex flex-grow flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Workload
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded`}
                    >
                      {group.workload?.name}
                    </div>
                  </div>
                  <div className="flex flex-grow flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Shift
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded`}
                    >
                      {group.morning && "Morning, "}
                      {group.afternoon && "Afternoon, "}
                      {group.evening && "Evening"}
                    </div>
                  </div>
                  <div className="flex flex-grow flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Classroom No.
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded`}
                    >
                      {group.classroom?.class_number}
                    </div>
                  </div>
                  <div className="flex flex-grow flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Max No. of Students
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded`}
                    >
                      {group.classroom?.quantity_of_students}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row w-full items-end gap-4 p-2 border-t border-dotted">
                  <div className="flex flex-grow flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Start Date
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded`}
                    >
                      {group.start_date &&
                        format(parseISO(group.start_date), "MM/dd/yyyy")}
                    </div>
                  </div>
                  <div className="flex flex-grow flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      End Date
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded`}
                    >
                      {group.end_date &&
                        format(parseISO(group.end_date), "MM/dd/yyyy")}
                    </div>
                  </div>
                  <div className="flex flex-grow flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Total Days
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded`}
                    >
                      {group.total_classes}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Mon
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 text-xs text-gray-500 p-2 rounded`}
                    >
                      <input type="checkbox" disabled checked={group.monday} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Tue
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 text-xs text-gray-500 p-2  rounded`}
                    >
                      <input type="checkbox" disabled checked={group.tuesday} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Wed
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 text-xs text-gray-500 p-2  rounded`}
                    >
                      <input
                        type="checkbox"
                        disabled
                        checked={group.wednesday}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Thu
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 text-xs text-gray-500 p-2  rounded`}
                    >
                      <input
                        type="checkbox"
                        disabled
                        checked={group.thursday}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Fri
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 text-xs text-gray-500 p-2  rounded`}
                    >
                      <input type="checkbox" disabled checked={group.friday} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Sat
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 text-xs text-gray-500 p-2  rounded`}
                    >
                      <input
                        type="checkbox"
                        disabled
                        checked={group.saturday}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col border px-2 border-dashed border-emerald-600 rounded">
                    <label className="text-xs font-bold flex-1 p-1 text-center text-emerald-600">
                      Content
                    </label>
                    <div
                      className={`w-full transition text-emerald-500 ease-in-out duration-300 text-md p-1 rounded`}
                    >
                      {group.content_percentage}%{" "}
                      <span className="text-xs">DONE</span>
                    </div>
                  </div>
                  <div className="flex flex-col border px-2 border-dashed border-red-600 rounded">
                    <label className="text-xs font-bold flex-1 p-1 text-center text-red-600">
                      Class
                    </label>
                    <div
                      className={`w-full transition ease-in-out duration-300 w-36 text-md text-red-500 p-1 rounded`}
                    >
                      {group.class_percentage}%{" "}
                      <span className="text-xs">DONE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {group && (
            <>
              {group.content_percentage === 100 &&
              group.class_percentage === 100 ? (
                <div className="flex w-full flex-row gap-4 px-4 py-0 justify-end items-start rounded-tr-2xl">
                  <button
                    type="button"
                    onClick={handleFinishRotation}
                    className="text-md font-bold bg-white border border-primary text-primary hover:border-white hover:bg-primary hover:text-white rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1 transition ease-in-out duration-300"
                  >
                    Save Rotation first step
                    <Save size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex w-full flex-row gap-4 px-4 py-0 justify-end items-start rounded-tr-2xl text-sm text-black/60 ">
                  <div className="border border-red-400 text-red-400 p-1 rounded border-dashed">
                    To conclude this rotation, all class and content must be
                    given...
                  </div>
                </div>
              )}
            </>
          )}
          {students?.length > 0 && (
            <div className="flex-1 flex w-full flex-row gap-4 px-4 py-0 justify-start items-start rounded-tr-2xl">
              <div className="flex w-full flex-col items-center gap-2 border rounded-lg duration-300 ease-in-out hover:border-zinc-400">
                <table className="w-full text-sm text-center">
                  <thead className="sticky top-0 border-b bg-zinc-100">
                    <tr>
                      <th className="border-0 rounded p-2 hover:bg-gray-100 w-[43px]">
                        #
                      </th>
                      <th className="border rounded p-2 hover:bg-gray-100 text-left">
                        Student
                      </th>
                      <th className="border rounded p-2 hover:bg-gray-100 text-center">
                        Vacation Days
                      </th>
                      <th className="border rounded p-2 hover:bg-gray-100 text-center">
                        Frequency %
                      </th>
                      <th className="border rounded p-2 hover:bg-gray-100 text-center">
                        Final Average Grade
                      </th>
                      <th className="border rounded p-2 hover:bg-gray-100 text-center">
                        Result
                      </th>
                      <th className="border rounded p-2 hover:bg-gray-100 text-center">
                        Actions
                      </th>
                      <th className="border rounded p-2 hover:bg-gray-100 text-center">
                        Level History
                      </th>
                      <th className="border rounded p-2 hover:bg-gray-100 text-center">
                        Next Level
                      </th>
                      <th className="border rounded p-2 hover:bg-gray-100 text-center">
                        Start Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => {
                      const {
                        name,
                        frequency,
                        vacation_days,
                        final_average_score,
                        start_date,
                        result,
                        next_level_name,
                      } = student;
                      return (
                        <tr
                          key={index}
                          className="border-b even:bg-zinc-50 text-zinc-500 h-12 hover:bg-zinc-100"
                        >
                          <td>{(index + 1).toString()}</td>
                          <td className="text-left">{name}</td>
                          <td>
                            {vacation_days > 0 && (
                              <div className="w-full flex flex-row justify-center gap-1 items-center">
                                {vacation_days}
                                <CalendarX2 size={12} />
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="w-full flex flex-row justify-center items-center">
                              <div
                                className={`${
                                  frequency >= 80
                                    ? "bg-emerald-400"
                                    : "bg-red-400"
                                } text-black/80 w-16 rounded`}
                              >
                                {frequency}%
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="w-full flex flex-row justify-center items-center">
                              <div
                                className={`${
                                  final_average_score >= 80
                                    ? "bg-emerald-400"
                                    : "bg-red-400"
                                } text-black/80 w-16 rounded`}
                              >
                                {final_average_score || 0}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="w-full flex flex-row justify-center items-center gap-1">
                              <div
                                className={`${
                                  result === "PASS"
                                    ? "bg-emerald-400"
                                    : "bg-red-400"
                                } text-black/80 w-20 rounded`}
                              >
                                {result}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="w-full flex flex-row justify-center items-center">
                              <button
                                onClick={() => setShowDetails(student)}
                                className="p-2 rounded hover:bg-zinc-200 cursor-pointer"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => setEdit(student)}
                                className="p-2 rounded hover:bg-zinc-200 cursor-pointer"
                              >
                                <Edit size={16} />
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="w-full flex flex-col justify-center items-center gap-1">
                              <div className="w-full flex flex-row justify-center items-center gap-1">
                                <div
                                  className={`${
                                    result === "PASS"
                                      ? "bg-emerald-400"
                                      : "bg-red-400"
                                  } text-black/80 w-4 h-4 rounded`}
                                ></div>
                                <div
                                  className={`bg-zinc-300 text-black/80 w-4 h-4 rounded`}
                                ></div>
                                <div
                                  className={`bg-zinc-300 text-black/80 w-4 h-4 rounded`}
                                ></div>
                                <div
                                  className={`bg-zinc-300 text-black/80 w-4 h-4 rounded`}
                                ></div>
                                <div
                                  className={`bg-zinc-300 text-black/80 w-4 h-4 rounded`}
                                ></div>
                              </div>
                              <div className="w-full flex flex-row justify-center items-center gap-1">
                                <div
                                  className={`bg-zinc-300 text-black/80 w-4 h-4 rounded`}
                                ></div>
                                <div
                                  className={`bg-zinc-300 text-black/80 w-4 h-4 rounded`}
                                ></div>
                                <div
                                  className={`bg-zinc-300 text-black/80 w-4 h-4 rounded`}
                                ></div>
                                <div
                                  className={`bg-zinc-300 text-black/80 w-4 h-4 rounded`}
                                ></div>
                                <div
                                  className={`bg-zinc-300 text-black/80 w-4 h-4 rounded`}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="text-xs">{next_level_name}</td>
                          <td className="text-xs">
                            {start_date &&
                              format(parseISO(start_date), "MM/dd/yyyy")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modal */}
      {showDetails && (
        <StudentDetail setShowDetails={setShowDetails} student={showDetails} />
      )}

      {edit && <EditResult setEdit={setEdit} student={edit} />}
      {loading && (
        <div className="flex justify-center items-center h-screen absolute top-0 left-0 w-full bg-gray-500 bg-opacity-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-700" />
        </div>
      )}
    </>
  );
}
