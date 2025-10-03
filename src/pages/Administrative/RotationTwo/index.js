import React, { useContext, useEffect, useRef, useState } from "react";
import { getCurrentPage } from "~/functions";
import PageHeader from "~/components/PageHeader";
import Breadcrumbs from "~/components/Breadcrumbs";
import FiltersBar from "~/components/FiltersBar";
import {
  ClipboardPlus,
  Equal,
  Filter,
  Plus,
  Rotate3d,
  Search,
  Table2,
  TreePalm,
  X,
} from "lucide-react";
import api, { baseURL } from "~/services/api";
import { AlertContext } from "~/App";
import { toast } from "react-toastify";

export default function RotationTwo() {
  const { alertBox } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  const currentPage = getCurrentPage();
  const [groups, setGroups] = useState([]);
  const levelRef = useRef();
  const shiftRef = useRef();
  const [shift, setShift] = useState("");
  const [level, setLevel] = useState("");
  const [requiredGroups, setRequiredGroups] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    levels: [],
    shifts: [],
  });
  const [editting, setEditting] = useState(false);
  const defaultNewGroup = {
    rotations: [],
    classroom_id: null,
    teacher_id: null,
  };
  const [newGroups, setNewGroups] = useState([]);
  const [dragged, setDragged] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);

  let teachers = [];
  for (let group of groups) {
    if (!teachers.find((teacher) => teacher.id === group?.staff?.id)) {
      teachers.push(group.staff);
    }
  }

  async function handlePassAndFailAnalysis() {
    console.log({ level, shift });
    api
      .post(`/reports/passAndFailAnalysis`, {
        shift,
        level,
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
  async function getGroups() {
    try {
      const { data } = await api.get(
        `/rotation2?morning=${shift.morning}&afternoon=${shift.afternoon}&evening=${shift.evening}&level_id=${level}`
      );
      setGroups(data.groups);
      setRequiredGroups(data.requiredGroups);
      setLoading(false);
      return data.groups;
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  async function loadData() {
    async function getTeachers() {
      try {
        const { data } = await api.get(
          `/staffs?limit=50&page=1&orderBy=name&orderASC=ASC&search=&type=Faculty`
        );
        return data.rows.map((teacher) => {
          return {
            value: teacher.id,
            label: teacher.name + " - " + teacher.last_name,
          };
        });
      } catch (err) {
        console.log(err);
      }
    }
    async function getClassrooms() {
      try {
        const { data } = await api.get(
          `/classrooms?limit=50&page=1&orderBy=class_number&orderASC=ASC&search=&type=null`
        );
        return data.rows.map((classroom) => {
          return {
            value: classroom.id,
            label: classroom.class_number,
          };
        });
      } catch (err) {
        console.log(err);
      }
    }
    async function getLevels() {
      try {
        const { data: levelsData } = await api.get(`/levels`);
        const levels = levelsData.rows;
        for (let level of levels) {
          level.order = 0;
          if (level.name === "Basic") {
            level.order = 1;
          } else if (level.name === "Pre-Intermediate") {
            level.order = 2;
          } else if (level.name === "Intermediate") {
            level.order = 3;
          } else if (level.name === "Pre-Advanced") {
            level.order = 4;
          } else if (level.name === "Advanced") {
            level.order = 5;
          } else if (level.name === "Proficient") {
            level.order = 6;
          } else if (level.name === "MBE1") {
            level.order = 7;
          } else if (level.name === "MBE2") {
            level.order = 8;
          } else {
            level.order = 99;
          }
        }
        return levels.sort((a, b) => a.order - b.order);
      } catch (err) {
        console.log(err);
      }
    }
    async function getShifts() {
      try {
        const { data: shiftsData } = await api.get(`/shifts`);
        for (let shift of shiftsData) {
          shift.name = "";
          shift.order = shift.morning ? 1 : shift.afternoon ? 2 : 3;
          if (shift.morning) {
            shift.name = "Morning";
          }
          if (shift.afternoon) {
            if (shift.morning) {
              shift.name += "/";
            }
            shift.name += "Afternoon";
          }
          if (shift.evening) {
            if (shift.name) {
              shift.name += "/";
            }
            shift.name += "Evening";
          }
        }
        return shiftsData.sort((a, b) => a.order - b.order);
      } catch (err) {
        console.log(err);
      }
    }
    const levels = await getLevels();
    const shifts = await getShifts();
    const teachers = await getTeachers();
    const classrooms = await getClassrooms();
    setFilterOptions({
      levels,
      shifts,
      teachers,
      classrooms,
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleDragOver(group, index) {
    setDraggedOver({ group: group.id, index });
  }

  function handleDropDragged(e, newgroup, index) {
    e.preventDefault();
    const oldGroup = newGroups.find((el) => el.id === dragged.group);
    const student = oldGroup.rotations.find(
      (el) => el.student.registration_number === dragged.student
    );
    if (draggedOver.group === oldGroup.id) {
      return;
    }
    oldGroup.rotations = oldGroup.rotations.filter(
      (el) => el.student.registration_number !== dragged.student
    );

    const newGroup = newGroups.find((el) => el.id === newgroup.id);
    newGroup.rotations = [...newGroup.rotations, student];

    const editGroups = [
      ...newGroups.filter(
        (el) => el.id !== oldGroup.id && el.id !== newgroup.id
      ),
      oldGroup,
      newGroup,
    ];

    setNewGroups(editGroups);
    setDragged(null);
    setDraggedOver(null);
  }

  function handleRemoveEmptyClass(group) {
    setEditting(true);
    setNewGroups(newGroups.filter((el) => el.id !== group.id));
  }

  async function handleFinishRotation() {
    for (let group of newGroups) {
      if (
        group.classroom_id === null ||
        group.teacher_id === null ||
        !group.name
      ) {
        alertBox({
          title: "Attention!",
          descriptionHTML:
            "Please define a name, classroom and a teacher for each class.",
          buttons: [
            {
              title: "Ok",
              class: "cancel",
            },
          ],
        });
        return;
      }
    }
    alertBox({
      title: "Attention!",
      descriptionHTML:
        "Are you sure you want to finish this rotation? This action cannot be undone.",
      buttons: [
        {
          title: "No",
          class: "cancel",
        },
        {
          title: "Yes",
          onPress: async () => {
            api
              .post(`/rotation2`, {
                groups: newGroups,
                level_id: level,
                workload_id: newGroups[0]?.workload_id,
                morning: shift.morning,
                afternoon: shift.afternoon,
                evening: shift.evening,
              })
              .then(({ data }) => {
                toast("Rotation realized!", { autoClose: 1000 });
                reset();
              })
              .catch((err) => {
                console.log(err);
                toast(err.response.data.error, {
                  type: "error",
                  autoClose: 3000,
                });
              });
          },
        },
      ],
    });
  }

  function reset() {
    setNewGroups([]);
    setDragged(null);
    setDraggedOver(null);
    setShift(null);
    setLevel(null);
    shiftRef.current.value = "";
    levelRef.current.value = "";
  }

  function handleSetClassroom(e, group) {
    group.classroom_id = e.target.value;
    const editGroups = [...newGroups.filter((el) => el.id !== group.id), group];
    setNewGroups(editGroups);
  }

  function handleSetGroupName(e, group) {
    group.name = e.target.value;
    const editGroups = [...newGroups.filter((el) => el.id !== group.id), group];
    setNewGroups(editGroups);
  }

  function handleSetTeacher(e, group) {
    group.teacher_id = e.target.value;
    const editGroups = [...newGroups.filter((el) => el.id !== group.id), group];
    setNewGroups(editGroups);
  }

  async function handleSearch() {
    const retGroups = await getGroups();
    setNewGroups(
      retGroups.map((group) => ({
        ...group,
        classroom_id: null,
        teacher_id: null,
        name: null,
      }))
    );
  }

  const requiredGroupsConcluded =
    (requiredGroups?.length === newGroups?.length &&
      requiredGroups?.length > 0 &&
      groups?.length > 0) ||
    editting;

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
                    onChange={(e) =>
                      setShift(
                        filterOptions?.shifts.find(
                          (shift) => shift.name === e.target.value
                        )
                      )
                    }
                    ref={shiftRef}
                  >
                    <option value="">Please select...</option>
                    {filterOptions?.shifts?.map((shift, index) => (
                      <option value={shift.name} key={index}>
                        {shift.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold flex-1 text-left">
                    Level
                  </label>
                  <select
                    className={`w-full transition ease-in-out duration-300 w-36 text-xs bg-white text-gray-500 p-2 border rounded`}
                    ref={levelRef}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option value="">Please select...</option>
                    {filterOptions?.levels?.map((level, index) => (
                      <option value={level.id} key={index}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-row gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSearch}
                    className="text-md font-bold bg-secondary border text-zinc-500 hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
                  >
                    <Search size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handlePassAndFailAnalysis}
                    className="text-md font-bold bg-secondary border text-zinc-500 hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
                  >
                    {shift.name || "All periods"} - Pass & Fail Analysis
                    <Table2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {!requiredGroupsConcluded ? (
            <div className="flex w-full flex-row gap-4 px-4 justify-start items-start rounded-tr-2xl">
              <div className="flex w-full flex-col items-center gap-2 border rounded-lg duration-300 ease-in-out hover:bg-zinc-50 hover:border-zinc-400">
                <div className="flex flex-row w-full items-end gap-4 p-2">
                  <div className="flex flex-grow flex-col gap-1">
                    <div className="flex flex-row items-start justify-start gap-2 w-full text-xs">
                      <div className="p-2 rounded-lg flex flex-col gap-1 justify-start items-start font-bold">
                        <div className="">Groups</div>
                        <div className="">Teachers</div>
                        <div className="">Status</div>
                      </div>
                      {requiredGroups
                        .sort((a, b) => (a.name > b.name ? 1 : -1))
                        .map((group, index) => {
                          return (
                            <div
                              key={index}
                              className="p-2 text-xs rounded-lg flex flex-col gap-1 justify-start items-start"
                            >
                              <div className="text-center w-full">
                                {group?.name}
                              </div>
                              <div className="text-center w-full">
                                {group?.staff?.name} {group?.staff?.last_name}
                              </div>
                              <div
                                className={`text-center w-full font-bold ${
                                  group?.rotation_status === "Not started"
                                    ? "text-red-400"
                                    : "text-emerald-400"
                                }`}
                              >
                                {group?.rotation_status}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {requiredGroupsConcluded && (
            <>
              <div className="flex w-full flex-row gap-4 px-4 justify-start items-start rounded-tr-2xl">
                <div className="flex w-full flex-col items-center gap-2 border rounded-lg duration-300 ease-in-out hover:bg-zinc-50 hover:border-zinc-400">
                  <div className="flex flex-row w-full items-end gap-4 p-2">
                    <div className="flex flex-grow flex-col gap-1">
                      <div className="flex flex-row items-start justify-start gap-2 w-full text-xs">
                        <div className="p-2 rounded-lg flex flex-col gap-1 justify-start items-start font-bold">
                          <div className="">Groups</div>
                          <div className="">Teachers</div>
                          <div className="">In Vacation</div>
                          <div className="">Medical Excuse</div>
                          <div className="">Active</div>
                        </div>
                        {groups?.length &&
                          groups.map((group, index) => {
                            return (
                              <div
                                key={index}
                                className="p-2 text-xs rounded-lg flex flex-col gap-1 justify-start items-start"
                              >
                                <div className="text-center w-full">
                                  {group?.name}
                                </div>
                                <div className="text-center w-full">
                                  {group?.staff?.name} {group?.staff?.last_name}
                                </div>
                                <div className="text-center w-full">
                                  {group?.rotations?.filter(
                                    (rotation) =>
                                      rotation.student.vacations.length > 0
                                  )?.length || 0}
                                </div>
                                <div className="text-center w-full">
                                  {group?.rotations?.filter(
                                    (rotation) =>
                                      rotation.student.medical_excuses.length >
                                      0
                                  )?.length || 0}
                                </div>
                                <div className="text-center w-full">
                                  {group?.rotations?.filter(
                                    (rotation) =>
                                      rotation.student.medical_excuses
                                        .length === 0 &&
                                      rotation.student.vacations.length === 0
                                  )?.length || 0}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-row gap-4 px-4 justify-start items-start rounded-tr-2xl">
                <div className="flex w-full flex-row justify-start items-start pb-2 gap-4">
                  <button
                    onClick={() =>
                      setNewGroups([
                        ...newGroups,
                        {
                          ...defaultNewGroup,
                          id: new Date().getTime(),
                        },
                      ])
                    }
                    className="border bg-secondary text-primary rounded-md p-1 px-2 h-8 mt-3 flex flex-row items-center justify-center text-xs gap-1 hover:border-primary"
                  >
                    <Plus size={16} /> Classroom
                  </button>
                  <button
                    onClick={handleFinishRotation}
                    className="bg-primary text-white rounded-md p-1 px-2 h-8 mt-3 flex flex-row items-center justify-center text-xs gap-1 hover:bg-mila_orange"
                  >
                    <Rotate3d size={16} /> Finish Rotation
                  </button>
                </div>
              </div>

              <div className="flex w-full flex-row gap-4 px-4 justify-start items-start rounded-tr-2xl">
                <div className="flex flex-row items-start justify-start gap-2 w-full text-xs">
                  {newGroups
                    .sort((a, b) => (a.id > b.id ? 1 : -1))
                    .map((group, index) => {
                      return (
                        <div
                          key={index}
                          className={`w-[360px] relative text-xs rounded-lg flex flex-col gap-2 py-2 justify-start items-start border sticky top-0 bg-white`}
                          onDragOver={() => handleDragOver(group, index)}
                          onDragOverCapture={(e) => e.preventDefault()}
                          onDragLeave={() => setDraggedOver(null)}
                          onDrop={(e) => {
                            handleDropDragged(e, group, index);
                          }}
                        >
                          {group?.rotations?.length === 0 && (
                            <button
                              onClick={() => handleRemoveEmptyClass(group)}
                              className="text-left w-full px-2 border-b border-zinc-100 pb-2 flex flex-row items-center justify-center gap-2 text-red-400 hover:text-red-600 cursor-pointer"
                            >
                              <X size={16} />
                              Remove Empty Class
                            </button>
                          )}
                          <div className="text-left w-full px-2 border-b border-zinc-100 pb-2">
                            <label className="text-xs font-bold flex-1 text-left">
                              Group Name<span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              name="group_name"
                              className="w-full py-2 px-2 rounded-lg bg-zinc-100"
                              onChange={(e) => handleSetGroupName(e, group)}
                            />
                          </div>
                          <div className="text-left w-full px-2 border-b border-zinc-100 pb-2">
                            <label className="text-xs font-bold flex-1 text-left">
                              Classroom<span className="text-red-400">*</span>
                            </label>
                            <select
                              name="classroom"
                              className="w-full py-2 px-2 rounded-lg bg-zinc-100"
                              onChange={(e) => handleSetClassroom(e, group)}
                            >
                              <option value="">
                                Please select a classroom...
                              </option>
                              {filterOptions?.classrooms?.map(
                                (classRoom, index) => {
                                  return (
                                    <option
                                      value={classRoom.value}
                                      key={index}
                                      className="p-2 rounded-lg flex flex-col gap-1 justify-start items-start"
                                    >
                                      {classRoom.label}
                                    </option>
                                  );
                                }
                              )}
                            </select>
                          </div>
                          <div className="text-left w-full px-2 border-b border-zinc-100 pb-2">
                            <label className="text-xs font-bold flex-1 text-left">
                              Teacher<span className="text-red-400">*</span>
                            </label>
                            <select
                              name="teacher"
                              className="w-full py-2 px-2 rounded-lg bg-zinc-100"
                              onChange={(e) => handleSetTeacher(e, group)}
                            >
                              <option value="">
                                Please select a teacher...
                              </option>
                              {filterOptions?.teachers?.map(
                                (teacher, index) => {
                                  return (
                                    <option
                                      value={teacher.value}
                                      key={index}
                                      className="p-2 rounded-lg flex flex-col gap-1 justify-start items-start"
                                    >
                                      {teacher.label}
                                    </option>
                                  );
                                }
                              )}
                            </select>
                          </div>
                          <div className="text-left w-full px-2 border-b border-zinc-100 pb-2 flex flex-row items-center justify-start gap-2">
                            <div className="text-lg w-8 h-8 text-left bg-zinc-100 rounded-lg flex flex-row items-center justify-center">
                              {group.rotations.length}{" "}
                            </div>
                            <strong className="text-xs">
                              Students
                              <br />
                              in this group
                            </strong>
                          </div>
                          <div className="flex flex-col justify-start items-start w-full">
                            {group.rotations
                              .sort((a, b) =>
                                a.student.name > b.student.name ? 1 : -1
                              )
                              .map((rotation, index) => {
                                const student = rotation.student;
                                return (
                                  <div
                                    key={index}
                                    onDragStart={() =>
                                      setDragged({
                                        group: group.id,
                                        student: student.registration_number,
                                      })
                                    }
                                    draggable={true}
                                    className={`flex flex-row items-center text-xs border-b w-full hover:bg-emerald-100 ${
                                      student?.registration_number ===
                                      dragged?.student
                                        ? "bg-emerald-400 opacity-30 cursor-grabbing border-dashed border-zinc-400 "
                                        : "cursor-grab"
                                    } active:bg-emerald-200`}
                                    onDragEnd={() => setDragged(null)}
                                  >
                                    <div className="p-2 rounded-lg flex flex-col gap-1 justify-start items-start">
                                      <Equal size={16} />
                                    </div>
                                    <div className="p-2 flex-1 rounded-lg flex flex-col justify-start items-start">
                                      <span className="text-sm">
                                        {student.name} {student.last_name}
                                      </span>
                                      <br />
                                      <strong className="text-[11px]">
                                        {student.registration_number}
                                      </strong>
                                      <br />
                                      <strong className="text-[11px]">
                                        Previous Teacher:
                                      </strong>
                                      {student?.teacher?.name}{" "}
                                      {student?.teacher?.last_name}
                                    </div>
                                    <div className="px-2">
                                      {student.vacations.length > 0 && (
                                        <div className="flex flex-col items-center gap-1 text-xs">
                                          <TreePalm size={16} />
                                          <span className="text-xs">
                                            Vacation
                                          </span>
                                        </div>
                                      )}
                                      {student.medical_excuses.length > 0 && (
                                        <div className="flex flex-col items-center gap-1 text-xs">
                                          <ClipboardPlus size={16} />
                                          <span className="text-xs">M.E.</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>

                          {draggedOver &&
                            dragged &&
                            dragged.group !== group.id &&
                            draggedOver.group === group.id && (
                              <div className="absolute top-0 left-0 flex flew-row items-center justify-center w-full h-full bg-emerald-400 bg-opacity-50"></div>
                            )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
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
