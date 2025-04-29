import { Form } from "@unform/web";
import { Calendar, GraduationCap, Trash } from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Input from "~/components/RegisterForm/Input";
import RegisterFormMenu from "~/components/RegisterForm/Menu";
import api from "~/services/api";
import { Zoom, toast } from "react-toastify";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { getRegistries } from "~/functions";
import { format, parseISO } from "date-fns";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import { FullGridContext } from "../..";
import FindGeneric from "~/components/Finds/FindGeneric";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import {
  classroomStatusOptions,
  yesOrNoOptions,
} from "~/functions/selectPopoverOptions";
import { Scope } from "@unform/core";
import CheckboxInput from "~/components/RegisterForm/CheckboxInput";

export const InputContext = createContext({});

export default function PagePreview({
  access,
  id,
  defaultFormType = "preview",
}) {
  const {
    handleOpened,
    setOpened,
    successfullyUpdated,
    setSuccessfullyUpdated,
  } = useContext(FullGridContext);
  const [pageData, setPageData] = useState({
    name: "",
    status: "",
    private: false,
    level: null,
    languagemode: null,
    classroom: null,
    workload: null,
    staff: null,
    students: [],
    studentxgroups: [],
    start_date: null,
    end_date: null,
    classes: [],
  });
  const [formType, setFormType] = useState(defaultFormType);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("general");
  const [registry, setRegistry] = useState({
    created_by: null,
    created_at: null,
    updated_by: null,
    updated_at: null,
    canceled_by: null,
    canceled_at: null,
  });
  const generalForm = useRef();
  const auth = useSelector((state) => state.auth);
  const [returnStudent, setReturnStudent] = useState(null);
  const [returnToWorkload, setReturnToWorkload] = useState({
    level_id: null,
    languagemode_id: null,
  });
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    async function getPageData() {
      if (id !== "new") {
        try {
          const { data } = await api.get(`/studentgroups/${id}`);
          setPageData({
            ...data,
            loaded: true,
          });
          setReturnToWorkload({
            level_id: data.level?.id,
            languagemode_id: data.languagemode?.id,
          });
          const {
            created_by,
            created_at,
            updated_by,
            updated_at,
            canceled_by,
            canceled_at,
          } = data;
          const registries = await getRegistries({
            created_by,
            created_at,
            updated_by,
            updated_at,
            canceled_by,
            canceled_at,
          });
          setRegistry(registries);
        } catch (err) {
          // console.log(err);
          toast(err.response.data.error, { type: "error", autoClose: 3000 });
        }
      } else {
        setPageData({ ...pageData, loaded: true });
        setFormType("full");
      }
    }
    getPageData();
  }, []);

  async function handleGeneralFormSubmit(data) {
    // return;
    if (successfullyUpdated) {
      toast("No need to be saved!", {
        autoClose: 1000,
        type: "info",
        transition: Zoom,
      });
      return;
    }
    const { start_date } = data;
    if (start_date) {
      data.start_date = format(parseISO(start_date), "yyyyMMdd");
    }
    if (id === "new") {
      try {
        delete data.id;
        await api.post(`/studentgroups`, {
          ...data,
        });
        setSuccessfullyUpdated(true);
        toast("Saved!", { autoClose: 1000 });
        handleOpened(null);
      } catch (err) {
        console.log(err);
        // toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    } else if (id !== "new") {
      try {
        await api.put(`/studentgroups/${id}`, {
          ...data,
        });
        setSuccessfullyUpdated(true);
        toast("Saved!", { autoClose: 1000 });
        handleOpened(null);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }
  }

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  useEffect(() => {
    if (returnStudent) {
      if (pageData.students.find((el) => el.id === returnStudent.id)) {
        toast("Student already added!", {
          autoClose: 1000,
          type: "info",
          transition: Zoom,
        });
        setReturnStudent(null);
        return;
      } else {
        setPageData({
          ...pageData,
          students: [...pageData.students, returnStudent],
        });
      }
    }
  }, [returnStudent]);

  function removeStudent(id) {
    setPageData({
      ...pageData,
      students: pageData.students.filter((el) => el.id !== id),
    });
  }

  return (
    <Preview formType={formType} fullscreen={fullscreen}>
      {pageData ? (
        <div className="flex h-full flex-row items-start justify-between gap-4">
          <div className="flex flex-col items-center justify-between text-xs w-40 gap-4">
            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="general"
            >
              <GraduationCap size={16} /> Student Group
            </RegisterFormMenu>
            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="students"
              disabled={id === "new"}
              messageOnDisabled="Create the student group to have access to students."
            >
              <GraduationCap size={16} /> Students
            </RegisterFormMenu>
            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="Class Planning"
              disabled={pageData.classes.length === 0}
              messageOnDisabled="Create the student group to have access to Class Planning."
            >
              <Calendar size={16} /> Class Planning
            </RegisterFormMenu>
          </div>
          <div className="border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start">
            <div className="flex flex-col items-start justify-start text-sm overflow-y-scroll">
              <Form
                ref={generalForm}
                onSubmit={handleGeneralFormSubmit}
                className="w-full"
              >
                <InputContext.Provider
                  value={{
                    id,
                    generalForm,
                    setSuccessfullyUpdated,
                    fullscreen,
                    setFullscreen,
                    successfullyUpdated,
                    handleCloseForm,
                    handleInactivate: () => null,
                    canceled: pageData.canceled_at,
                  }}
                >
                  {pageData.loaded ? (
                    <>
                      <FormHeader
                        access={access}
                        title={`Student Group: ${pageData.name || "new"}`}
                        registry={registry}
                        InputContext={InputContext}
                      />
                      <InputLineGroup
                        title="general"
                        activeMenu={activeMenu === "general"}
                      >
                        <FindGeneric
                          route="filials"
                          title="Filial"
                          scope="filial"
                          required
                          readOnly={
                            id !== "new" && pageData.status !== "In Formation"
                          }
                          InputContext={InputContext}
                          defaultValue={
                            id === "new" && auth.filial.id !== 1
                              ? {
                                  id: auth.filial.id,
                                  name: auth.filial.name,
                                }
                              : {
                                  id: pageData.filial?.id,
                                  name: pageData.filial?.name,
                                }
                          }
                          fields={[
                            {
                              title: "Name",
                              name: "name",
                            },
                          ]}
                        />
                        <InputLine title="General Data">
                          <Input
                            type="text"
                            name="name"
                            required
                            grow
                            title="Name"
                            defaultValue={pageData.name}
                            InputContext={InputContext}
                          />
                          <SelectPopover
                            name="status"
                            required
                            grow
                            title="Status"
                            readOnly
                            isSearchable
                            defaultValue={
                              classroomStatusOptions.find(
                                (opt) => opt.value === pageData.status
                              ) ||
                              classroomStatusOptions.find(
                                (opt) => opt.value === "In Formation"
                              )
                            }
                            options={classroomStatusOptions}
                            InputContext={InputContext}
                          />
                          <SelectPopover
                            name="private"
                            required
                            grow
                            title="Private"
                            readOnly={
                              id !== "new" && pageData.status !== "In Formation"
                            }
                            options={yesOrNoOptions}
                            isSearchable
                            defaultValue={yesOrNoOptions.find(
                              (type) => type.value === pageData.private
                            )}
                            InputContext={InputContext}
                          />
                        </InputLine>
                        <InputLine>
                          <Input
                            type="date"
                            name="start_date"
                            required
                            grow
                            title="Start Date"
                            readOnly={
                              id !== "new" && pageData.status !== "In Formation"
                            }
                            defaultValue={
                              pageData?.start_date
                                ? format(
                                    parseISO(pageData.start_date),
                                    "yyyy-MM-dd"
                                  )
                                : ""
                            }
                            InputContext={InputContext}
                          />
                          <Input
                            type="date"
                            name="end_date"
                            readOnly
                            grow
                            title="End Date"
                            defaultValue={
                              pageData?.end_date
                                ? format(
                                    parseISO(pageData.end_date),
                                    "yyyy-MM-dd"
                                  )
                                : ""
                            }
                            InputContext={InputContext}
                          />
                        </InputLine>
                        <FindGeneric
                          route="levels"
                          title="Level"
                          scope="level"
                          readOnly={
                            id !== "new" && pageData.status !== "In Formation"
                          }
                          required
                          InputContext={InputContext}
                          defaultValue={{
                            id: pageData.level?.id,
                            name: pageData.level?.name,
                            Programcategory:
                              pageData.level?.Programcategory?.name,
                          }}
                          setReturnFindGeneric={(level) =>
                            setReturnToWorkload({
                              ...returnToWorkload,
                              level_id: level.id,
                            })
                          }
                          fields={[
                            {
                              title: "Name",
                              name: "name",
                            },
                            {
                              title: "Program Category",
                              name: "name",
                              model: "Programcategory",
                            },
                          ]}
                        />
                        <FindGeneric
                          route="languagemodes"
                          title="Language Mode"
                          scope="languagemode"
                          readOnly={
                            id !== "new" && pageData.status !== "In Formation"
                          }
                          required
                          InputContext={InputContext}
                          defaultValue={{
                            id: pageData.languagemode?.id,
                            name: pageData.languagemode?.name,
                          }}
                          setReturnFindGeneric={(level) =>
                            setReturnToWorkload({
                              ...returnToWorkload,
                              languagemode_id: level.id,
                            })
                          }
                          fields={[
                            {
                              title: "Name",
                              name: "name",
                            },
                          ]}
                        />
                        <FindGeneric
                          route="workloads"
                          title="Workload"
                          scope="workload"
                          required
                          type={
                            returnToWorkload.level_id +
                            "," +
                            returnToWorkload.languagemode_id
                          }
                          InputContext={InputContext}
                          readOnly={
                            id !== "new" && pageData.status !== "In Formation"
                          }
                          defaultValue={{
                            id: pageData.workload?.id,
                            name: pageData.workload?.name,
                            Level: pageData.level?.name,
                            Languagemode: pageData.languagemode?.name,
                          }}
                          fields={[
                            {
                              title: "Name",
                              name: "name",
                            },
                            {
                              title: "Level",
                              name: "name",
                              model: "Level",
                            },
                            {
                              title: "Language Mode",
                              name: "name",
                              model: "Languagemode",
                            },
                          ]}
                        />
                        <InputLine title="Week days" left>
                          <CheckboxInput
                            name="monday"
                            shrink
                            title="Monday"
                            readOnly={
                              id !== "new" && pageData.status !== "In Formation"
                            }
                            options={yesOrNoOptions}
                            isSearchable
                            defaultValue={pageData.monday}
                            InputContext={InputContext}
                          />
                          <CheckboxInput
                            name="tuesday"
                            shrink
                            title="Tuesday"
                            readOnly={
                              id !== "new" && pageData.status !== "In Formation"
                            }
                            options={yesOrNoOptions}
                            isSearchable={false}
                            defaultValue={pageData.tuesday}
                            InputContext={InputContext}
                          />
                          <CheckboxInput
                            name="wednesday"
                            shrink
                            title="Wednesday"
                            readOnly={
                              id !== "new" && pageData.status !== "In Formation"
                            }
                            options={yesOrNoOptions}
                            isSearchable={false}
                            defaultValue={pageData.wednesday}
                            InputContext={InputContext}
                          />
                          <CheckboxInput
                            name="thursday"
                            shrink
                            title="Thursday"
                            readOnly={
                              id !== "new" && pageData.status !== "In Formation"
                            }
                            options={yesOrNoOptions}
                            isSearchable={false}
                            defaultValue={pageData.thursday}
                            InputContext={InputContext}
                          />
                          <CheckboxInput
                            name="friday"
                            shrink
                            title="Friday"
                            readOnly={
                              id !== "new" && pageData.status !== "In Formation"
                            }
                            options={yesOrNoOptions}
                            isSearchable={false}
                            defaultValue={pageData.friday}
                            InputContext={InputContext}
                          />
                          <CheckboxInput
                            name="saturday"
                            shrink
                            title="Saturday"
                            readOnly={
                              id !== "new" && pageData.status !== "In Formation"
                            }
                            options={yesOrNoOptions}
                            isSearchable={false}
                            defaultValue={pageData.saturday}
                            InputContext={InputContext}
                          />
                          <CheckboxInput
                            name="sunday"
                            shrink
                            title="Sunday"
                            readOnly={
                              id !== "new" && pageData.status !== "In Formation"
                            }
                            options={yesOrNoOptions}
                            isSearchable={false}
                            defaultValue={pageData.sunday}
                            InputContext={InputContext}
                          />
                        </InputLine>
                        <InputLine title="Shift" left>
                          <CheckboxInput
                            name="morning"
                            shrink
                            title="Morning"
                            readOnly={
                              id !== "new" && pageData.status !== "In Formation"
                            }
                            options={yesOrNoOptions}
                            isSearchable={false}
                            defaultValue={pageData.morning}
                            InputContext={InputContext}
                          />
                          <CheckboxInput
                            name="afternoon"
                            shrink
                            title="Afternoon"
                            readOnly={
                              id !== "new" && pageData.status !== "In Formation"
                            }
                            options={yesOrNoOptions}
                            isSearchable={false}
                            defaultValue={pageData.afternoon}
                            InputContext={InputContext}
                          />
                          <CheckboxInput
                            name="evening"
                            shrink
                            title="Evening"
                            readOnly={
                              id !== "new" && pageData.status !== "In Formation"
                            }
                            options={yesOrNoOptions}
                            isSearchable={false}
                            defaultValue={pageData.evening}
                            InputContext={InputContext}
                          />
                        </InputLine>
                        <FindGeneric
                          route="classrooms"
                          title="Classroom"
                          scope="classroom"
                          required
                          InputContext={InputContext}
                          type="Active"
                          defaultValue={{
                            id: pageData.classroom?.id,
                            class_number: pageData.classroom?.class_number,
                            quantity_of_students:
                              pageData.classroom?.quantity_of_students,
                          }}
                          fields={[
                            {
                              title: "Class Number",
                              name: "class_number",
                            },
                            {
                              title: "Quantity of Students",
                              name: "quantity_of_students",
                            },
                          ]}
                        />
                        <FindGeneric
                          route="staffs"
                          title="Teacher"
                          scope="staff"
                          required
                          type="Faculty"
                          InputContext={InputContext}
                          defaultValue={{
                            id: pageData.staff?.id,
                            name: pageData.staff?.name,
                            last_name: pageData.staff?.last_name,
                          }}
                          fields={[
                            {
                              title: "Name",
                              name: "name",
                            },
                            {
                              title: "Last Name",
                              name: "last_name",
                            },
                          ]}
                        />
                      </InputLineGroup>
                      <InputLineGroup
                        title="students"
                        activeMenu={activeMenu === "students"}
                      >
                        {/* {pageData.status === "In Formation" && (
                          <FindGeneric
                            route="students"
                            title="Find student to add to the group"
                            scope="student"
                            type="Waiting"
                            setReturnFindGeneric={setReturnStudent}
                            InputContext={InputContext}
                            defaultValue={{
                              id: pageData.student?.id,
                              name: pageData.student?.name,
                              last_name: pageData.student?.last_name,
                              registration_number:
                                pageData.student?.registration_number,
                              status: pageData.student?.status,
                            }}
                            fields={[
                              {
                                title: "Name",
                                name: "name",
                              },
                              {
                                title: "Last Name",
                                name: "last_name",
                              },
                              {
                                title: "Registration Number",
                                name: "registration_number",
                              },
                              {
                                title: "Status",
                                name: "status",
                              },
                            ]}
                          />
                        )} */}
                        {/* Legendas */}
                        <div className="flex flex-row justify-evenly w-full items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFilter(filter === "Left" ? null : "Left")
                            }
                            className={`${
                              filter === "Left"
                                ? "border border-dashed rounded-md border-gray-500 "
                                : ""
                            }`}
                          >
                            <div className="flex flex-row items-center rounded-md hover:bg-gray-50 justify-start gap-2 p-2">
                              <div className="w-4 h-4 border border-gray-500 bg-gray-200 rounded-sm"></div>
                              <div className="text-xs text-gray-400">
                                Left the group
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFilter(
                                filter === "Not started" ? null : "Not started"
                              )
                            }
                            className={`${
                              filter === "Not started"
                                ? "border border-dashed rounded-md border-gray-500 "
                                : ""
                            }`}
                          >
                            <div className="flex flex-row items-center rounded-md hover:bg-gray-50 justify-start gap-2 p-2">
                              <div className="w-4 h-4 border border-gray-500 bg-amber-50 rounded-sm"></div>
                              <div className="text-xs text-amber-700">
                                Not started yet
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFilter(filter === "Ongoing" ? null : "Ongoing")
                            }
                            className={`${
                              filter === "Ongoing"
                                ? "border border-dashed rounded-md border-gray-500 "
                                : ""
                            }`}
                          >
                            <div className="flex flex-row items-center rounded-md hover:bg-gray-50 justify-start gap-2 p-2">
                              <div className="w-4 h-4 border border-gray-500 bg-gray-50 rounded-sm"></div>
                              <div className="text-xs text-gray-600">
                                Ongoing
                              </div>
                            </div>
                          </button>
                        </div>
                        <table className="w-full relative overflow-hidden">
                          <thead className="sticky top-[95px] border-b bg-white">
                            <tr>
                              <th className="text-xs border rounded p-2 hover:bg-gray-100 text-left">
                                Name
                              </th>
                              <th className="text-xs border rounded p-2 hover:bg-gray-100 text-left">
                                Last Name
                              </th>
                              <th className="text-xs border rounded p-2 hover:bg-gray-100 text-center">
                                Registration Number
                              </th>
                              <th className="text-xs border rounded p-2 hover:bg-gray-100 text-center">
                                Start Date
                              </th>
                              <th className="text-xs border rounded p-2 hover:bg-gray-100 text-center">
                                End Date
                              </th>
                              <th className="text-xs border rounded p-2 hover:bg-gray-100 text-center">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageData.studentxgroups &&
                              pageData.studentxgroups.length > 0 &&
                              pageData.studentxgroups
                                .sort((a, b) =>
                                  a.student.name +
                                    a.student.last_name +
                                    a.start_date +
                                    a.end_date >
                                  b.student.name +
                                    b.student.last_name +
                                    b.start_date +
                                    b.end_date
                                    ? 1
                                    : -1
                                )
                                .filter((studentGroup) => {
                                  if (filter) {
                                    if (filter === "Ongoing") {
                                      return (
                                        parseISO(studentGroup.start_date) <=
                                          new Date() && !studentGroup.end_date
                                      );
                                    } else if (filter === "Not started") {
                                      return (
                                        parseISO(studentGroup.start_date) >
                                        new Date()
                                      );
                                    } else if (filter === "Left") {
                                      return (
                                        studentGroup.end_date &&
                                        parseISO(studentGroup.end_date) <=
                                          new Date()
                                      );
                                    } else {
                                      return false;
                                    }
                                  }
                                  return true;
                                })
                                .map((studentGroup) => {
                                  return (
                                    <tr
                                      key={studentGroup.id}
                                      className={`text-xs hover:bg-gray-50 border-b ${
                                        parseISO(studentGroup.start_date) >
                                        new Date()
                                          ? "bg-amber-50 text-amber-700"
                                          : studentGroup.end_date &&
                                            parseISO(studentGroup.end_date) <=
                                              new Date()
                                          ? "bg-gray-100 text-gray-400"
                                          : ""
                                      }`}
                                    >
                                      <td className="text-xs px-2 py-2">
                                        {studentGroup.student.name}
                                      </td>
                                      <td className="text-xs px-2 py-2">
                                        {studentGroup.student.last_name}
                                      </td>
                                      <td className="text-xs px-2 py-2 text-center">
                                        {
                                          studentGroup.student
                                            .registration_number
                                        }
                                      </td>
                                      <td className="text-xs px-2 py-2 text-center">
                                        {format(
                                          parseISO(studentGroup.start_date),
                                          "MM/dd/yyyy"
                                        )}
                                      </td>
                                      <td className="text-xs px-1 py-2 text-center">
                                        {studentGroup.end_date
                                          ? format(
                                              parseISO(studentGroup.end_date),
                                              "MM/dd/yyyy"
                                            )
                                          : null}
                                      </td>
                                      <td className="text-xs px-1 py-2 text-center">
                                        {studentGroup.student.status}
                                      </td>
                                    </tr>
                                  );
                                })}
                            {/* {pageData.students
                              .sort(
                                (a, b) =>
                                  a.name + a.last_name > b.name + b.last_name
                              )
                              .map((student, index) => {
                                return (
                                  <div
                                    className="flex flex-row justify-center items-center relative w-full"
                                    key={index}
                                  >
                                    <Scope
                                      key={index}
                                      path={`students[${index}]`}
                                    >
                                      <InputLine>
                                        <Input
                                          type="hidden"
                                          name="id"
                                          defaultValue={student.id}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="name"
                                          grow
                                          readOnly
                                          title={index === 0 && "Name"}
                                          defaultValue={student.name}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="last_name"
                                          grow
                                          readOnly
                                          title={index === 0 && "Last Name"}
                                          defaultValue={student.last_name}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="registration_number"
                                          grow
                                          readOnly
                                          title={
                                            index === 0 && "Registration Number"
                                          }
                                          defaultValue={
                                            student.registration_number
                                          }
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="status"
                                          grow
                                          readOnly
                                          title={index === 0 && "Status"}
                                          defaultValue={student.status}
                                          InputContext={InputContext}
                                        />
                                      </InputLine>
                                    </Scope>
                                  </div>
                                );
                              })} */}
                          </tbody>
                        </table>
                      </InputLineGroup>
                      <InputLineGroup
                        title="Class Planning"
                        activeMenu={activeMenu === "Class Planning"}
                      >
                        <table className="w-full relative overflow-hidden">
                          <thead className="sticky top-[95px] border-b bg-white">
                            <tr>
                              <th className="text-xs max-w-8 w-8 bg-white border rounded p-2 hover:bg-gray-100 text-center">
                                #
                              </th>
                              <th className="text-xs max-w-10 w-10 bg-white border rounded p-2 hover:bg-gray-100 text-center">
                                Date
                              </th>
                              <th className="text-xs bg-white border rounded p-2 hover:bg-gray-100 text-left">
                                Notes
                              </th>
                              <th className="text-xs bg-white border rounded p-2 hover:bg-gray-100 text-left">
                                Content Planned
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageData.classes
                              .sort((a, b) => (a.date < b.date ? -1 : 1))
                              .map((classDate, index) => {
                                return (
                                  <tr
                                    key={index}
                                    className="text-xs hover:bg-gray-50 border-b"
                                  >
                                    <td className="text-xs px-1 py-2">
                                      <div className="text-center">
                                        {index + 1}
                                      </div>
                                    </td>
                                    <td className="text-xs px-1 py-2 text-center">
                                      <strong className="text-sm">
                                        {format(
                                          parseISO(classDate.date),
                                          "MM/dd"
                                        )}
                                      </strong>
                                      <br />
                                      {classDate.weekday}
                                    </td>
                                    <td className="text-xs px-1 py-2">
                                      {classDate.notes}
                                    </td>
                                    <td className="text-xs px-1 py-2">
                                      <div className="flex flex-row items-center justify-start gap-2">
                                        {classDate.paceguides &&
                                          classDate.paceguides
                                            .sort((a, b) =>
                                              a.description < b.description
                                                ? -1
                                                : 1
                                            )
                                            .map((paceGuide) => {
                                              return (
                                                <div className="text-xs px-2 py-1 bg-gray-100 transition-all ease-in hover:bg-primary hover:text-white border rounded-md">
                                                  {paceGuide.description}
                                                </div>
                                              );
                                            })}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </InputLineGroup>
                    </>
                  ) : (
                    <FormLoading />
                  )}
                </InputContext.Provider>
              </Form>
            </div>
          </div>
        </div>
      ) : null}
    </Preview>
  );
}
