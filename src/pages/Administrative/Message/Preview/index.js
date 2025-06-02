import { Form } from "@unform/web";
import { GraduationCap, MessageSquareShare } from "lucide-react";
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
import { toast } from "react-toastify";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { getRegistries } from "~/functions";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import { FullGridContext } from "../..";
import FindGeneric from "~/components/Finds/FindGeneric";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import {
  messageMethodOptions,
  messageToStudentsOptions,
  messageTypeOptions,
  yesOrNoOptions,
} from "~/functions/selectPopoverOptions";
import Textarea from "~/components/RegisterForm/Textarea";
import CheckboxInput from "~/components/RegisterForm/CheckboxInput";
import { Scope } from "@unform/core";
import { AlertContext } from "~/App";

export const InputContext = createContext({});

export default function PagePreview({
  access,
  id,
  defaultFormType = "preview",
}) {
  const { alertBox } = useContext(AlertContext);
  const { handleOpened, successfullyUpdated, setSuccessfullyUpdated } =
    useContext(FullGridContext);
  const [pageData, setPageData] = useState({
    class_number: "",
    status: "Active",
    quantity_of_students: 0,
    students: [],
    levels: [],
    groups: [],
  });
  const [formType, setFormType] = useState(defaultFormType);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("message");
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
  const [filters, setFilters] = useState({
    studentsToReceive: messageToStudentsOptions[0],
    shifts: {
      morning: {
        value: true,
      },
      afternoon: {
        value: true,
      },
      evening: {
        value: true,
      },
    },
    level_id: null,
  });

  useEffect(() => {
    document.getElementById("scrollPage").scrollTo(0, 0);
  }, [activeMenu]);

  async function getPageData() {
    if (id !== "new") {
      try {
        const { data } = await api.get(`/messages/${id}`);
        setPageData({
          ...data,
          loaded: true,
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
      const { data: students } = await api.get(`/messages-students`);
      setPageData({ ...pageData, students, loaded: true });
      setFormType("full");
    }
  }

  useEffect(() => {
    getPageData();
  }, []);

  async function handleGeneralFormSubmit(data) {
    if (!data.students.find((student) => student.selected === "true")) {
      toast("At least one student must be selected!", {
        type: "error",
        autoClose: 3000,
      });
      return;
    }
    alertBox({
      title: "Attention!",
      descriptionHTML: `Are you sure you want to send this message to <strong>${data.students_to_receive}</strong>? \n This action cannot be undone.`,
      buttons: [
        {
          title: "No",
          class: "cancel",
        },
        {
          title: "Yes",
          onPress: () => {
            api
              .post(`/messages`, {
                ...data,
              })
              .then((response) => {
                toast(response.data.message, { autoClose: 1000 });
                handleOpened(null);
              })
              .catch((err) => {
                if (err.message) {
                  toast(err.message, {
                    type: "error",
                    autoClose: 3000,
                  });
                } else {
                  toast(err.response.data.error, {
                    type: "error",
                    autoClose: 3000,
                  });
                }
              });
          },
        },
      ],
    });
    return;
  }

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  useEffect(() => {
    const filtered = [];
    const filteredLevels = [];
    const filteredGroups = [];
    if (filters.studentsToReceive.value === "All students in filial") {
      for (let student of pageData.students) {
        student.message = true;
        filtered.push(student);
      }
      setPageData({
        ...pageData,
        students: filtered,
      });
    } else {
      if (pageData.students.length > 0) {
        for (let student of pageData.students) {
          student.message = false;

          if (student.studentgroup) {
            if (filters.shifts.morning.value && student.studentgroup.morning) {
              student.message = true;
            }
            if (
              filters.shifts.afternoon.value &&
              student.studentgroup.afternoon
            ) {
              student.message = true;
            }
            if (filters.shifts.evening.value && student.studentgroup.evening) {
              student.message = true;
            }

            if (student.message) {
              if (
                !filteredLevels.find(
                  (level) => level.value === student.studentgroup.level_id
                )
              ) {
                filteredLevels.push({
                  label: student.studentgroup.level.name,
                  value: student.studentgroup.level_id,
                });
              }
              if (
                !filteredGroups.find(
                  (group) => group.value === student.studentgroup.id
                )
              ) {
                filteredGroups.push({
                  label: student.studentgroup.name,
                  value: student.studentgroup.id,
                });
              }
            }

            if (filters.level_id?.value) {
              if (student.studentgroup.level_id !== filters.level_id.value) {
                student.message = false;
              }
            }
            if (filters.group_id?.value) {
              if (student.studentgroup.id !== filters.group_id.value) {
                student.message = false;
              }
            }
            console.log(filters, student.message);
          } else {
            student.message = false;
          }
          filtered.push(student);
        }
        setPageData({
          ...pageData,
          students: filtered,
          levels: filteredLevels,
          groups: filteredGroups,
        });
      }
    }
  }, [filters]);

  return (
    <Preview formType={formType} fullscreen={fullscreen}>
      {pageData ? (
        <div className="flex h-full flex-row items-start justify-between gap-4">
          <div className="flex flex-col items-center justify-between text-xs w-40 gap-4">
            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="message"
            >
              <MessageSquareShare size={16} /> Message
            </RegisterFormMenu>
            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="students"
            >
              <GraduationCap size={16} /> Students
            </RegisterFormMenu>
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
                        access={{ ...access, edit: false }}
                        title={`${
                          pageData.subject ? pageData.subject : "New Message"
                        }`}
                        registry={registry}
                        InputContext={InputContext}
                        createText="Send Message"
                        createIcon={<MessageSquareShare size={16} />}
                      />
                      <InputLineGroup
                        title="message"
                        activeMenu={activeMenu === "message"}
                      >
                        <FindGeneric
                          route="filials"
                          title="Filial"
                          scope="filial"
                          required
                          InputContext={InputContext}
                          readOnly={id !== "new"}
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
                        <InputLine title="Message Information">
                          <SelectPopover
                            name="type"
                            required
                            grow
                            title="Type"
                            isSearchable
                            readOnly={id !== "new"}
                            defaultValue={messageTypeOptions.find(
                              (opt) => opt.value === pageData.type
                            )}
                            options={messageTypeOptions}
                            InputContext={InputContext}
                          />
                          <SelectPopover
                            name="method"
                            required
                            grow
                            title="Method"
                            isSearchable
                            readOnly={id !== "new"}
                            // defaultValue={messageMethodOptions.find(
                            //   (opt) => opt.value === pageData.method
                            // )}
                            defaultValue={messageMethodOptions[0]}
                            options={messageMethodOptions}
                            InputContext={InputContext}
                          />
                          <Input
                            name="subject"
                            required
                            grow
                            title="Subject"
                            readOnly={id !== "new"}
                            defaultValue={pageData.subject}
                            InputContext={InputContext}
                          />
                        </InputLine>
                        <InputLine>
                          <Textarea
                            name="content"
                            required
                            grow
                            title="Content"
                            readOnly={id !== "new"}
                            defaultValue={pageData.content}
                            InputContext={InputContext}
                            rows={10}
                          />
                        </InputLine>
                      </InputLineGroup>
                      <InputLineGroup
                        title="students"
                        activeMenu={activeMenu === "students"}
                      >
                        {id === "new" && (
                          <>
                            <InputLine title={`Students`}>
                              <SelectPopover
                                name="students_to_receive"
                                required
                                grow
                                title="Students to receive message:"
                                isSearchable
                                options={messageToStudentsOptions}
                                defaultValue={
                                  filters.studentsToReceive
                                    ? messageToStudentsOptions.find(
                                        (opt) =>
                                          opt.value ===
                                          filters.studentsToReceive.value
                                      )
                                    : null
                                }
                                onChange={(value) => {
                                  setFilters({
                                    ...filters,
                                    studentsToReceive: value,
                                  });
                                }}
                                InputContext={InputContext}
                              />
                              {console.log(
                                pageData.students.filter(
                                  (student) => student.message === true
                                )
                              )}
                            </InputLine>
                            {filters.studentsToReceive?.value ===
                              "Selected students in filial" && (
                              <>
                                <InputLine title="Filters">
                                  <SelectPopover
                                    name="morning"
                                    title="Morning shift"
                                    isSearchable
                                    shrink
                                    options={yesOrNoOptions}
                                    InputContext={InputContext}
                                    defaultValue={yesOrNoOptions[0]}
                                    onChange={(value) => {
                                      setFilters({
                                        ...filters,
                                        shifts: {
                                          ...filters.shifts,
                                          morning: value,
                                        },
                                      });
                                    }}
                                  />
                                  <SelectPopover
                                    name="afternoon"
                                    title="Afternoon shift"
                                    isSearchable
                                    shrink
                                    options={yesOrNoOptions}
                                    InputContext={InputContext}
                                    defaultValue={yesOrNoOptions[0]}
                                    onChange={(value) => {
                                      setFilters({
                                        ...filters,
                                        shifts: {
                                          ...filters.shifts,
                                          afternoon: value,
                                        },
                                      });
                                    }}
                                  />
                                  <SelectPopover
                                    name="evening"
                                    title="Evening shift"
                                    isSearchable
                                    shrink
                                    options={yesOrNoOptions}
                                    InputContext={InputContext}
                                    defaultValue={yesOrNoOptions[0]}
                                    onChange={(value) => {
                                      setFilters({
                                        ...filters,
                                        shifts: {
                                          ...filters.shifts,
                                          evening: value,
                                        },
                                      });
                                    }}
                                  />
                                  <SelectPopover
                                    name="level"
                                    title="Levels"
                                    isSearchable
                                    grow
                                    options={[
                                      {
                                        value: null,
                                        label: "All Levels",
                                      },
                                      ...pageData.levels,
                                    ]}
                                    defaultValue={{
                                      value: null,
                                      label: "All Levels",
                                    }}
                                    InputContext={InputContext}
                                    onChange={(value) => {
                                      setFilters({
                                        ...filters,
                                        level_id: value,
                                      });
                                    }}
                                  />
                                  <SelectPopover
                                    name="groups"
                                    title="Groups"
                                    isSearchable
                                    grow
                                    options={[
                                      {
                                        value: null,
                                        label: "All Groups",
                                      },
                                      ...pageData.groups,
                                    ]}
                                    defaultValue={{
                                      value: null,
                                      label: "All Groups",
                                    }}
                                    InputContext={InputContext}
                                    onChange={(value) => {
                                      setFilters({
                                        ...filters,
                                        group_id: value,
                                      });
                                    }}
                                  />
                                </InputLine>
                              </>
                            )}
                          </>
                        )}
                        <InputLine title={`Filtered Students`}>
                          <div className="w-full overflow-y-scroll">
                            <table className="w-full text-sm text-center overflow-y-scroll">
                              <thead className="">
                                <tr className="bg-white sticky top-0">
                                  <th className="w-20">Sel.</th>
                                  <th className="text-left">Student</th>
                                  <th>Level</th>
                                  <th>Student Group</th>
                                  <th>Shifts</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pageData.students
                                  .filter(
                                    (student) =>
                                      student.message ||
                                      typeof student.message === "undefined"
                                  )
                                  .map((student, index) => {
                                    if (student.student) {
                                      student = student.student;
                                    }
                                    return (
                                      <Scope
                                        path={`students[${index}]`}
                                        key={index}
                                      >
                                        <tr
                                          key={index}
                                          className={`text-xs hover:bg-gray-50 border-b ${
                                            student.id === pageData.student_id
                                              ? "bg-gray-100"
                                              : ""
                                          } even:bg-gray-50`}
                                        >
                                          <td className="px-2 py-2 text-center w-20">
                                            <CheckboxInput
                                              name={`selected`}
                                              defaultValue="true"
                                              InputContext={InputContext}
                                              readOnly={
                                                filters.studentsToReceive
                                                  .value ===
                                                "All students in filial"
                                              }
                                            />
                                          </td>
                                          <td className="px-2 py-2 text-left">
                                            <Input
                                              type="hidden"
                                              name={`id`}
                                              defaultValue={student.id}
                                              InputContext={InputContext}
                                            />
                                            <strong>
                                              {student.name} {student.last_name}
                                            </strong>
                                            <br />
                                            {student.email}
                                          </td>
                                          <td className="px-2 py-2 text-center">
                                            {student.studentgroup?.level?.name}
                                          </td>
                                          <td className="px-2 py-2 text-center">
                                            {student.studentgroup?.name}
                                          </td>
                                          <td className="px-2 py-2 text-center">
                                            {student.studentgroup?.morning &&
                                              "Morning"}
                                            {student.studentgroup?.afternoon
                                              ? student.studentgroup?.morning
                                                ? " / Afternoon"
                                                : "Afternoon"
                                              : ""}
                                            {student.studentgroup?.evening
                                              ? student.studentgroup?.morning ||
                                                student.studentgroup?.afternoon
                                                ? " / Evening"
                                                : "Evening"
                                              : ""}
                                          </td>
                                        </tr>
                                      </Scope>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
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
