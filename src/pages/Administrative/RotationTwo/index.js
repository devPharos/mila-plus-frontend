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
  Sheet,
  Table2,
} from "lucide-react";
import api, { baseURL } from "~/services/api";
import { format, parseISO } from "date-fns";
import StudentDetail from "./components/studentDetail";
import EditResult from "./components/editResult";
import { toast } from "react-toastify";

export default function RotationTwo() {
  const [loading, setLoading] = useState(true);
  const currentPage = getCurrentPage();
  const [groups, setGroups] = useState([]);
  const levelRef = useRef();
  const shiftRef = useRef();
  const [shift, setShift] = useState("");
  const [level, setLevel] = useState("");

  async function getGroups() {
    try {
      const { data } = await api.get(`/rotation2`);
      setGroups(
        data.map((group) => {
          let shift = "";
          if (group.morning) {
            shift = "Morning";
          }
          if (group.afternoon) {
            if (shift) {
              shift += "/";
            }
            shift += "Afternoon";
          }
          if (group.evening) {
            if (shift) {
              shift += "/";
            }
            shift += "Evening";
          }
          return {
            ...group,
            shift,
          };
        })
      );
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  let teachers = [];
  for (let group of groups) {
    if (!teachers.find((teacher) => teacher.id === group.staff.id)) {
      teachers.push(group.staff);
    }
  }

  async function handlePassAndFailAnalysis() {
    console.log({ level, shift });
    // api
    //   .post(`/reports/passAndFailAnalysis`, {
    //     shift,
    //     level,
    //   })
    //   .then(({ data }) => {
    //     saveAs(`${baseURL}/get-file/${data.name}`, `${data.name}.xlsx`);
    //     setLoading(false);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     setLoading(false);
    //   });
  }

  useEffect(() => {
    getGroups();
  }, []);

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
                <div className="flex min-w-36 flex-col gap-2">
                  <label className="text-xs font-bold flex-1 text-left">
                    Shift
                  </label>
                  <select
                    className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded`}
                    onChange={(e) => setShift(e.target.value)}
                    ref={shiftRef}
                  >
                    <option value="">Please select...</option>
                    {groups
                      .sort((a, b) => (a.shift > b.shift ? 1 : -1))
                      .filter((group, index, self) => {
                        return (
                          self.findIndex((t) => t.shift === group.shift) ===
                          index
                        );
                      })
                      .map((group, index) => (
                        <option value={group.shift} key={index}>
                          {group.shift}
                        </option>
                      ))}
                  </select>
                </div>
                {shift && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Level
                    </label>
                    <select
                      className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded`}
                      ref={levelRef}
                    >
                      {groups
                        .filter((group) => group.shift === shift)
                        .sort((a, b) => (a.level.name > b.level.name ? 1 : -1))
                        .map((group, index) => (
                          <option value={group.level?.name} key={index}>
                            {group.level?.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                {shift && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setLevel(levelRef.current.value)}
                      className="text-md font-bold bg-secondary border text-zinc-500 hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {shift && level && (
            <div className="flex w-full flex-row gap-4 px-4 justify-start items-start rounded-tr-2xl">
              <button
                type="button"
                disabled={loading}
                onClick={handlePassAndFailAnalysis}
                className="text-md font-bold bg-secondary border text-zinc-500 hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
              >
                {shift} - {level} - Pass & Fail Analysis
                <Table2 size={16} />
              </button>
            </div>
          )}
          {shift && level && (
            <div className="flex w-full flex-row gap-4 px-4 justify-start items-start rounded-tr-2xl">
              <div className="flex w-full flex-col items-center gap-2 border rounded-lg duration-300 ease-in-out hover:bg-zinc-50 hover:border-zinc-400">
                <div className="flex flex-row w-full items-end gap-4 p-2">
                  <div className="flex flex-grow flex-col gap-1">
                    <label className="text-xs font-bold flex-1 text-left">
                      Resume
                    </label>
                    <div className="flex flex-row items-start justify-start gap-2 w-full">
                      {groups
                        .filter(
                          (group) =>
                            group.level.name === level && group.shift === shift
                        )
                        .map((group, index) => {
                          return (
                            <div
                              key={index}
                              className="w-64 border p-2 text-sm rounded-lg flex flex-col gap-1 justify-start items-start"
                            >
                              <div className="text-xs font-bold">
                                {group?.staff?.name} {group?.staff?.last_name}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {loading && (
        <div className="flex justify-center items-center h-screen absolute top-0 left-0 w-full bg-gray-500 bg-opacity-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-700" />
        </div>
      )}
    </>
  );
}
