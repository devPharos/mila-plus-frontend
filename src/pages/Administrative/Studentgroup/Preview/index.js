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
import { getRegistries, getTabsPermissions, tabAllowed } from "~/functions";
import { format, parseISO } from "date-fns";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import { FullGridContext } from "../..";
import FindGeneric from "~/components/Finds/FindGeneric";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import {
  classroomStatusOptions,
  studentgroupStatusOptions,
  yesOrNoOptions,
} from "~/functions/selectPopoverOptions";
import CheckboxInput from "~/components/RegisterForm/CheckboxInput";
import { pdfjs } from "react-pdf";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import PDFViewer from "~/components/PDFViewer";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const InputContext = createContext({});

export default function PagePreview({
  access,
  id,
  defaultFormType = "preview",
}) {
  const { handleOpened, successfullyUpdated, setSuccessfullyUpdated } =
    useContext(FullGridContext);

  const tabsPermissions = getTabsPermissions("studentgroups", FullGridContext);

  const [pageData, setPageData] = useState({
    name: "",
    status: "In Formation",
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
  const { profile } = useSelector((state) => state.user);
  const groupName = profile.groups[0].group.name;
  const [returnToWorkload, setReturnToWorkload] = useState({
    level_id: null,
    languagemode_id: null,
  });
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    document.getElementById("scrollPage").scrollTo(0, 0);
  }, [activeMenu]);

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
            {console.log(tabsPermissions)}
            {id !== "new" && (
              <>
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  name="students"
                  messageOnDisabled="Create the student group to have access to students."
                >
                  <GraduationCap size={16} /> Students
                </RegisterFormMenu>
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  name="Class Planning"
                  disabled={!tabAllowed(tabsPermissions, "class-planning-tab")}
                  messageOnDisabled="You don't have permission to access this tab"
                >
                  <Calendar size={16} /> Class Planning
                </RegisterFormMenu>
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  name="Scope and Sequence"
                  disabled={
                    !tabAllowed(tabsPermissions, "scope-and-sequence-tab")
                  }
                  messageOnDisabled="You don't have permission to access this tab"
                >
                  <Calendar size={16} /> Scope & Sequence
                </RegisterFormMenu>
              </>
            )}
          </div>
          <div className="border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start">
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
              <div
                id="scrollPage"
                className="flex flex-col items-start justify-start text-sm overflow-y-scroll"
              >
                <Form
                  ref={generalForm}
                  onSubmit={handleGeneralFormSubmit}
                  className="w-full"
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
                            readOnly={groupName === "Teacher"}
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
                              studentgroupStatusOptions.find(
                                (opt) => opt.value === pageData.status
                              ) ||
                              studentgroupStatusOptions.find(
                                (opt) => opt.value === "In Formation"
                              )
                            }
                            options={studentgroupStatusOptions}
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
                          readOnly={groupName === "Teacher"}
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
                          readOnly={groupName === "Teacher"}
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
                        <div className="flex flex-row justify-evenly w-full items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFilter(
                                filter === "Terminated" ? null : "Terminated"
                              )
                            }
                            className={`${
                              filter === "Terminated"
                                ? "border border-dashed rounded-md border-gray-500 "
                                : ""
                            }`}
                          >
                            <div className="flex flex-row items-center rounded-md hover:bg-gray-50 justify-start gap-2 p-2">
                              <div className="w-4 h-4 border border-gray-500 bg-gray-200 rounded-sm"></div>
                              <div className="text-xs text-gray-400">
                                Terminated/Canceled
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFilter(
                                filter === "Transferred" ? null : "Transferred"
                              )
                            }
                            className={`${
                              filter === "Transferred"
                                ? "border border-dashed rounded-md border-sky-500 "
                                : ""
                            }`}
                          >
                            <div className="flex flex-row items-center rounded-md hover:bg-sky-50 justify-start gap-2 p-2">
                              <div className="w-4 h-4 border border-gray-500 bg-sky-200 rounded-sm"></div>
                              <div className="text-xs text-sky-400">
                                Transferred
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
                              setFilter(filter === "Active" ? null : "Active")
                            }
                            className={`${
                              filter === "Active"
                                ? "border border-dashed rounded-md border-gray-500 "
                                : ""
                            }`}
                          >
                            <div className="flex flex-row items-center rounded-md hover:bg-gray-50 justify-start gap-2 p-2">
                              <div className="w-4 h-4 border border-gray-500 bg-gray-50 rounded-sm"></div>
                              <div className="text-xs text-gray-600">
                                Active
                              </div>
                            </div>
                          </button>
                        </div>
                        <table className="w-full relative overflow-hidden">
                          <thead className="sticky top-0 border-b bg-white">
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
                                    if (filter === "Active") {
                                      return (
                                        studentGroup.start_date &&
                                        parseISO(studentGroup.start_date) <=
                                          new Date() &&
                                        !studentGroup.end_date
                                      );
                                    } else if (filter === "Not started") {
                                      return (
                                        studentGroup.start_date &&
                                        parseISO(studentGroup.start_date) >
                                          new Date()
                                      );
                                    } else if (filter === "Terminated") {
                                      return studentGroup.student.inactivation;
                                    } else if (filter === "Transferred") {
                                      return (
                                        studentGroup.end_date <=
                                        format(new Date(), "yyyy-MM-dd")
                                      );
                                    } else {
                                      return false;
                                    }
                                  }
                                  return true;
                                })
                                .map((studentGroup) => {
                                  let studentGroupStatus = "Not defined";
                                  if (studentGroup.student.inactivation) {
                                    studentGroupStatus =
                                      studentGroup.student.inactivation.reason;
                                  } else if (
                                    studentGroup.end_date <=
                                    format(new Date(), "yyyy-MM-dd")
                                  ) {
                                    studentGroupStatus = "Transferred";
                                  } else if (
                                    studentGroup.start_date &&
                                    parseISO(studentGroup.start_date) >
                                      new Date()
                                  ) {
                                    studentGroupStatus = "Not started";
                                  } else if (
                                    studentGroup.start_date &&
                                    parseISO(studentGroup.start_date) <=
                                      new Date() &&
                                    (!studentGroup.end_date ||
                                      studentGroup.end_date >
                                        format(new Date(), "yyyy-MM-dd"))
                                  ) {
                                    studentGroupStatus = "Active";
                                  }

                                  return (
                                    <tr
                                      key={studentGroup.id}
                                      className={`text-xs hover:bg-gray-50 border-b ${
                                        studentGroupStatus === "Not started"
                                          ? "bg-amber-50 text-amber-700"
                                          : studentGroupStatus === "Terminated"
                                          ? "bg-gray-100 text-gray-400"
                                          : studentGroupStatus === "Canceled"
                                          ? "bg-gray-100 text-gray-400"
                                          : studentGroupStatus === "Transferred"
                                          ? "bg-sky-50 text-sky-700"
                                          : studentGroupStatus === "Active"
                                          ? ""
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
                                        {studentGroup.start_date &&
                                          format(
                                            parseISO(studentGroup.start_date),
                                            "MM/dd/yyyy"
                                          )}
                                      </td>
                                      <td className="text-xs px-1 py-2 text-center">
                                        {studentGroup.end_date &&
                                          format(
                                            parseISO(studentGroup.end_date),
                                            "MM/dd/yyyy"
                                          )}
                                      </td>
                                      <td className="text-xs px-1 py-2 text-center">
                                        {studentGroupStatus}
                                      </td>
                                    </tr>
                                  );
                                })}
                          </tbody>
                        </table>
                      </InputLineGroup>
                      <InputLineGroup
                        title="Class Planning"
                        activeMenu={activeMenu === "Class Planning"}
                      >
                        <table className="w-full relative overflow-hidden">
                          <thead className="sticky top-0 border-b bg-white">
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
                            {pageData.classes.length > 0 &&
                              pageData.classes
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
                                          {classDate.date &&
                                            format(
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
                                          {classDate.paceguides.length > 0 &&
                                          classDate.paceguides[0].type ===
                                            "Review" ? (
                                            <span>
                                              ({classDate.paceguides[0].type})
                                            </span>
                                          ) : null}
                                          {classDate.paceguides &&
                                            classDate.paceguides
                                              .sort((a, b) =>
                                                a.description < b.description
                                                  ? -1
                                                  : 1
                                              )
                                              .map((paceGuide, index) => {
                                                return (
                                                  <div
                                                    key={index}
                                                    className="text-xs px-2 py-1 bg-gray-100 transition-all ease-in hover:bg-primary hover:text-white border rounded-md flex flex-row items-center justify-start gap-2"
                                                  >
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
                      <InputLineGroup
                        title="Scope and Sequence"
                        activeMenu={activeMenu === "Scope and Sequence"}
                      >
                        <InputLine title="Scope and Sequence">
                          {pageData.workload?.File ? (
                            <PDFViewer
                              download={true}
                              file={{
                                url: pageData.workload?.File?.url,
                              }}
                              height={650}
                            />
                          ) : (
                            <p className="text-sm">No attached file.</p>
                          )}
                        </InputLine>
                      </InputLineGroup>
                    </>
                  ) : (
                    <FormLoading />
                  )}
                </Form>
              </div>
            </InputContext.Provider>
          </div>
        </div>
      ) : null}
    </Preview>
  );
}
