import { Form } from "@unform/web";
import { Armchair, GraduationCap, Trash } from "lucide-react";
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
import { getRegistries, handleUpdatedFields } from "~/functions";
import { format, parseISO } from "date-fns";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import { FullGridContext } from "../..";
import FindGeneric from "~/components/Finds/FindGeneric";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import {
  classroomStatusOptions,
  optionsStatus,
  yesOrNoOptions,
} from "~/functions/selectPopoverOptions";
import DatePicker from "~/components/RegisterForm/DatePicker";
import { Scope } from "@unform/core";

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
    programcategory: null,
    languagemode: null,
    classroom: null,
    workload: null,
    staff: null,
    students: [],
    start_date: null,
    end_date: null,
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
  const [filialOptions, setFilialOptions] = useState([]);
  const generalForm = useRef();
  const auth = useSelector((state) => state.auth);
  const [returnStudent, setReturnStudent] = useState(null);

  useEffect(() => {
    async function getPageData() {
      if (id !== "new") {
        try {
          const { data } = await api.get(`/studentgroups/${id}`);
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
    const { start_date, end_date } = data;
    console.log({ start_date, end_date });
    if (start_date) {
      data.start_date = format(parseISO(start_date), "yyyyMMdd");
    }
    if (end_date) {
      data.end_date = format(parseISO(end_date), "yyyyMMdd");
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
                          readOnly={pageData.students.length > 0}
                          InputContext={InputContext}
                          defaultValue={
                            id === "new"
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
                            readOnly={pageData.students.length > 0}
                            isSearchable
                            defaultValue={classroomStatusOptions.find(
                              (opt) => opt.value === pageData.status
                            )}
                            options={classroomStatusOptions}
                            InputContext={InputContext}
                          />
                          <SelectPopover
                            name="private"
                            required
                            grow
                            title="Private"
                            readOnly={pageData.students.length > 0}
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
                            readOnly={pageData.students.length > 0}
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
                            required
                            grow
                            title="End Date"
                            readOnly={pageData.students.length > 0}
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
                          route="programcategories"
                          title="Program Category"
                          scope="programcategory"
                          readOnly={pageData.students.length > 0}
                          required
                          InputContext={InputContext}
                          defaultValue={{
                            id: pageData.programcategory?.id,
                            name: pageData.programcategory?.name,
                          }}
                          fields={[
                            {
                              title: "Name",
                              name: "name",
                            },
                          ]}
                        />
                        <FindGeneric
                          route="languagemodes"
                          title="Language Mode"
                          scope="languagemode"
                          readOnly={pageData.students.length > 0}
                          required
                          InputContext={InputContext}
                          defaultValue={{
                            id: pageData.languagemode?.id,
                            name: pageData.languagemode?.name,
                          }}
                          fields={[
                            {
                              title: "Name",
                              name: "name",
                            },
                          ]}
                        />
                        <FindGeneric
                          route="classrooms"
                          title="Classroom"
                          scope="classroom"
                          required
                          InputContext={InputContext}
                          readOnly={pageData.students.length > 0}
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
                          route="workloads"
                          title="Workload"
                          scope="workload"
                          required
                          InputContext={InputContext}
                          readOnly={pageData.students.length > 0}
                          defaultValue={{
                            id: pageData.workload?.id,
                            name: pageData.workload?.name,
                            days_per_week: pageData.workload?.days_per_week,
                            hours_per_day: pageData.workload?.hours_per_day,
                          }}
                          fields={[
                            {
                              title: "Name",
                              name: "name",
                            },
                            {
                              title: "Days per Week",
                              name: "days_per_week",
                            },
                            {
                              title: "Hours per Day",
                              name: "hours_per_day",
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
                              title: "Registration Number",
                              name: "registration_number",
                            },
                            {
                              title: "Name",
                              name: "name",
                            },
                            {
                              title: "Last Name",
                              name: "last_name",
                            },
                            {
                              title: "Status",
                              name: "status",
                            },
                          ]}
                        />
                        <InputLine title="Students in Group">
                          <div className="flex flex-col justify-center items-start relative w-full">
                            {pageData.students
                              .sort((a, b) => a.name > b.name)
                              .map((student, index) => {
                                return (
                                  <div
                                    className="flex flex-row justify-center items-center relative w-full"
                                    key={index}
                                  >
                                    <button
                                      className="mt-2"
                                      type="button"
                                      onClick={() => {
                                        removeStudent(student.id);
                                        setSuccessfullyUpdated(false);
                                      }}
                                    >
                                      <Trash size={18} />
                                    </button>
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
                                          name="registration_number"
                                          grow
                                          readOnly
                                          title="Registration Number"
                                          defaultValue={
                                            student.registration_number
                                          }
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="name"
                                          grow
                                          readOnly
                                          title="Name"
                                          defaultValue={student.name}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="last_name"
                                          grow
                                          readOnly
                                          title="Last Name"
                                          defaultValue={student.last_name}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="status"
                                          grow
                                          readOnly
                                          title="Status"
                                          defaultValue={student.status}
                                          InputContext={InputContext}
                                        />
                                      </InputLine>
                                    </Scope>
                                  </div>
                                );
                              })}
                          </div>
                        </InputLine>
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
