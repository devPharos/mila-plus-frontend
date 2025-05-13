import { Form } from "@unform/web";
import { Building } from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import RegisterFormMenu from "~/components/RegisterForm/Menu";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { toast } from "react-toastify";
import api from "~/services/api";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { FullGridContext } from "../..";
import { AlertContext } from "~/App";
import { format, parseISO } from "date-fns";
import CheckboxInput from "~/components/RegisterForm/CheckboxInput";
import { Scope } from "@unform/core";
import Input from "~/components/RegisterForm/Input";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import { yesOrNoOptions } from "~/functions/selectPopoverOptions";

export const InputContext = createContext({});

export default function Attendance({
  access,
  id,
  defaultFormType = "preview",
  selected,
  handleOpened,
}) {
  const { alertBox } = useContext(AlertContext);
  const { successfullyUpdated, setSuccessfullyUpdated } =
    useContext(FullGridContext);
  const [pageData, setPageData] = useState({
    attendance: {
      date: null,
    },
    pending_paceguides: [],
    pendingPaceguides: [],
  });

  const [registry, setRegistry] = useState({
    created_by: null,
    created_at: null,
    updated_by: null,
    updated_at: null,
    canceled_by: null,
    canceled_at: null,
  });
  const [formType, setFormType] = useState(defaultFormType);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("general");

  const generalForm = useRef();

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  function handleGeneralFormSubmit(data) {
    // console.log(data);
    // return;
    api
      .post(`/studentgroups/attendance/${selected[0].id}`, data)
      .then((res) => {
        toast("Attendance saved!", { autoClose: 1000 });
        handleOpened(null);
      })
      .catch((err) => {
        toast(err.response.data.error, { type: "error", autoClose: 1000 });
      });
  }

  useEffect(() => {
    async function loadData() {
      const { data } = await api.get(
        `/studentgroups/attendance/${selected[0].id}`
      );
      setPageData({ ...data, loaded: true });
    }
    loadData();
  }, []);

  return (
    <Preview formType={formType} fullscreen={fullscreen}>
      {pageData ? (
        <div className="flex h-full flex-row items-start justify-between gap-4">
          <div className="flex flex-col items-center justify-between text-xs w-32 gap-4">
            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="general"
            >
              <Building size={16} /> General
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
                  }}
                >
                  {id === "new" || pageData.loaded ? (
                    <>
                      <FormHeader
                        access={access}
                        title={`Attendance - ${format(
                          parseISO(pageData.attendance?.date),
                          "MM/dd/yyyy"
                        )}`}
                        registry={registry}
                        InputContext={InputContext}
                      />

                      <InputLineGroup
                        title="GENERAL"
                        activeMenu={activeMenu === "general"}
                      >
                        <Input
                          type="hidden"
                          name="studentgroupclass_id"
                          defaultValue={pageData.attendance?.id}
                          InputContext={InputContext}
                        />
                        <InputLine title="General">
                          <SelectPopover
                            name="lock"
                            grow
                            title="Lock this attendance?"
                            InputContext={InputContext}
                            options={yesOrNoOptions}
                            defaultValue={
                              pageData.attendance?.locked_at
                                ? yesOrNoOptions[0]
                                : yesOrNoOptions[1]
                            }
                          />
                          <Input
                            type="text"
                            name="staff_name"
                            title="Teacher's Name"
                            readOnly
                            grow
                            defaultValue={
                              pageData.attendance?.studentgroup.staff?.name +
                              " " +
                              pageData.attendance?.studentgroup.staff?.last_name
                            }
                            InputContext={InputContext}
                          />
                        </InputLine>
                        {pageData.attendance?.shift
                          ?.split("/")
                          .map((shift, index) => (
                            <Scope path={`shifts.${index}`} key={index}>
                              <InputLine title={shift}>
                                <Input
                                  type="hidden"
                                  name="date"
                                  defaultValue={pageData.attendance?.date}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="hidden"
                                  name="shift"
                                  defaultValue={shift}
                                  InputContext={InputContext}
                                />
                                <table className="w-full text-sm text-center">
                                  <thead>
                                    <tr>
                                      <th></th>
                                      <th colSpan={3}>1st Check</th>
                                      <th></th>
                                      <th colSpan={3}>2nd Check</th>
                                      <th></th>
                                      <th colSpan={2}>Vac & ME</th>
                                    </tr>
                                    <tr className="bg-gray-100">
                                      <th className="px-2 h-8 text-left">
                                        Student
                                      </th>
                                      <th className="w-20 bg-yellow-500">L</th>
                                      <th className="w-20 bg-green-500">P</th>
                                      <th className="w-20 bg-red-500">A</th>
                                      <th></th>
                                      <th className="w-20 bg-yellow-500">L</th>
                                      <th className="w-20 bg-green-500">P</th>
                                      <th className="w-20 bg-red-500">A</th>
                                      <th></th>
                                      <th className="w-20 bg-amber-700">V</th>
                                      <th className="w-20 bg-emerald-500">S</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {pageData.attendance?.studentgroup?.students?.map(
                                      (student, index) => {
                                        const {
                                          first_check = null,
                                          second_check = null,
                                        } =
                                          pageData.attendance?.attendances?.find(
                                            (attendance) =>
                                              attendance.student_id ===
                                                student.id &&
                                              attendance.shift === shift
                                          ) || {};
                                        return (
                                          <Scope
                                            path={`students.${index}`}
                                            key={index}
                                          >
                                            <tr
                                              key={index}
                                              className="text-center"
                                            >
                                              <td className="px-2 h-8 text-left">
                                                <Input
                                                  type="hidden"
                                                  name="id"
                                                  defaultValue={student.id}
                                                  InputContext={InputContext}
                                                />
                                                {student.name}{" "}
                                                {student.last_name}
                                              </td>
                                              <td>
                                                <CheckboxInput
                                                  name={`first_check_late`}
                                                  InputContext={InputContext}
                                                  defaultValue={
                                                    first_check === "Late"
                                                  }
                                                />
                                              </td>
                                              <td>
                                                <CheckboxInput
                                                  name={`first_check_present`}
                                                  InputContext={InputContext}
                                                  defaultValue={
                                                    first_check === "Present"
                                                  }
                                                />
                                              </td>
                                              <td>
                                                <CheckboxInput
                                                  name={`first_check_absent`}
                                                  InputContext={InputContext}
                                                  defaultValue={
                                                    first_check === "Absent"
                                                  }
                                                />
                                              </td>
                                              <td></td>
                                              <td>
                                                <CheckboxInput
                                                  name={`second_check_late`}
                                                  InputContext={InputContext}
                                                  defaultValue={
                                                    second_check === "Late"
                                                  }
                                                />
                                              </td>
                                              <td>
                                                <CheckboxInput
                                                  name={`second_check_present`}
                                                  InputContext={InputContext}
                                                  defaultValue={
                                                    second_check === "Present"
                                                  }
                                                />
                                              </td>
                                              <td>
                                                <CheckboxInput
                                                  name={`second_check_absent`}
                                                  InputContext={InputContext}
                                                  defaultValue={
                                                    second_check === "Absent"
                                                  }
                                                />
                                              </td>
                                              <td></td>
                                              <td>
                                                <CheckboxInput
                                                  name={`vacation`}
                                                  readOnly
                                                  InputContext={InputContext}
                                                />
                                              </td>
                                              <td>
                                                <CheckboxInput
                                                  name={`medical_excuse`}
                                                  readOnly
                                                  InputContext={InputContext}
                                                />
                                              </td>
                                            </tr>
                                          </Scope>
                                        );
                                      }
                                    )}
                                  </tbody>
                                </table>
                              </InputLine>
                            </Scope>
                          ))}
                        <InputLine title="Program">
                          <div className="w-full h-96 overflow-y-scroll">
                            <table className="w-full text-sm text-center overflow-y-scroll h-96">
                              <thead className="sticky top-0">
                                <tr className="bg-white">
                                  <th className="w-20"></th>
                                  <th className="w-56">Type</th>
                                  <th className="text-left">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pageData.attendance?.paceguides?.map(
                                  (paceguide, index) => (
                                    <tr key={index}>
                                      <Input
                                        type="hidden"
                                        name={`paceguides.${index}.id`}
                                        defaultValue={paceguide.id}
                                        InputContext={InputContext}
                                      />
                                      <td>
                                        <CheckboxInput
                                          name={`paceguides.${index}.checked`}
                                          InputContext={InputContext}
                                          defaultValue={
                                            !paceguide.status ||
                                            paceguide.status === "Done"
                                          }
                                        />
                                      </td>
                                      <td>{paceguide.type}</td>
                                      <td className="text-left">
                                        {paceguide.description}
                                      </td>
                                    </tr>
                                  )
                                )}
                                {pageData.pendingPaceguides
                                  ?.filter(
                                    (paceguide) =>
                                      !pageData.attendance?.paceguides.find(
                                        (attendance) =>
                                          attendance.id === paceguide.id &&
                                          attendance.status === "Done"
                                      )
                                  )
                                  .map((paceguide, index) => {
                                    return (
                                      <tr key={index}>
                                        <Input
                                          type="hidden"
                                          name={`paceguides.${index}.id`}
                                          defaultValue={paceguide.id}
                                          InputContext={InputContext}
                                        />
                                        <td>
                                          <CheckboxInput
                                            name={`paceguides.${index}.checked`}
                                            InputContext={InputContext}
                                            defaultValue={
                                              paceguide.status === "Done"
                                            }
                                          />
                                        </td>
                                        <td>{paceguide.type}</td>
                                        <td className="text-left">
                                          {paceguide.description}
                                        </td>
                                      </tr>
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
                </InputContext.Provider>
              </Form>
            </div>
          </div>
        </div>
      ) : null}
    </Preview>
  );
}
