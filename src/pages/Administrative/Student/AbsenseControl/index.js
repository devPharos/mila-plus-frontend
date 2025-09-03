import { Form } from "@unform/web";
import { Building, NotebookPen, Percent, Search } from "lucide-react";
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
import { Scope } from "@unform/core";
import Input from "~/components/RegisterForm/Input";
import TdRadioInput from "~/components/RegisterForm/TdRadioInput";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import { monthsOptions } from "~/functions/selectPopoverOptions";

export const InputContext = createContext({});

export default function AbsenseControl({
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
    year: new Date().getFullYear(),
    month: (new Date().getMonth() + 1).toString().padStart(2, "0"),
    student: null,
    attendances: [],
  });
  const yearRef = useRef();
  const monthRef = useRef();
  const [openNote, setOpenNote] = useState(null);

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
  const [activeMenu, setActiveMenu] = useState("absencecontrol");

  const generalForm = useRef();

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  function handleGeneralFormSubmit(data) {
    api
      .put(`/attendances/${selected[0].id}`, data)
      .then((res) => {
        toast("Attendance Saved!", { autoClose: 1000 });
        setSuccessfullyUpdated(true);
        handleOpened(null);
      })
      .catch((err) => {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      });
  }

  async function loadData() {
    let year = generalForm?.current?.getFieldValue("year");
    let month = generalForm?.current?.getFieldValue("month");
    if (!year || !month) {
      year = new Date().getFullYear();
      month = (new Date().getMonth() + 1).toString().padStart(2, "0");

      generalForm.current.setData({
        year,
        month,
      });
    }

    const from_date = `${year}-${month}-01`;
    const until_date = `${year}-${month}-31`;
    setPageData({ ...pageData, loaded: false });
    setSuccessfullyUpdated(true);
    const { data } = await api.get(`/absenseControl/${selected[0].id}`, {
      params: {
        from_date,
        until_date,
      },
    });
    setPageData({ year, month, ...data, loaded: true });
  }

  useEffect(() => {
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
              name="absencecontrol"
            >
              <Percent size={16} /> Absences Ctrl.
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
                        access={{ ...access, edit: false }}
                        title={
                          "Absence Control - " +
                          pageData.student?.name +
                          " " +
                          pageData.student?.last_name
                        }
                        registry={registry}
                        InputContext={InputContext}
                      />

                      <InputLineGroup
                        title="Absences Ctrl."
                        activeMenu={activeMenu === "absencecontrol"}
                      >
                        <InputLine title="Details">
                          <Input
                            type="text"
                            title="Student"
                            readOnly
                            grow
                            name="student"
                            InputContext={InputContext}
                            defaultValue={
                              pageData.student?.name +
                              " " +
                              pageData.student?.last_name
                            }
                          />
                          <Input
                            ref={yearRef}
                            type="text"
                            name="year"
                            title="Year"
                            shrink
                            InputContext={InputContext}
                            defaultValue={pageData.year}
                          />
                          <SelectPopover
                            ref={monthRef}
                            name="month"
                            title="Month"
                            shrink
                            options={monthsOptions}
                            InputContext={InputContext}
                            defaultValue={monthsOptions.find(
                              (el) => el.value == pageData.month
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              loadData(
                                yearRef?.current?.value,
                                monthRef?.current?.value
                              );
                            }}
                            className="text-xs bg-mila_orange text-white px-6 py-3 mt-3 rounded-md border cursor-pointer flex flex-row items-center justify-center gap-2"
                          >
                            <Search size={14} /> Search
                          </button>
                        </InputLine>
                        {pageData.totals.groups
                          .sort((a, b) =>
                            a.group?.studentxgroups[0]?.start_date <
                            b.group?.studentxgroups[0]?.start_date
                              ? -1
                              : 1
                          )
                          .map((group, index) => {
                            return group.group?.studentxgroups?.map(
                              (period) => {
                                return (
                                  <InputLine
                                    title={index === 0 && "Groups in period"}
                                  >
                                    <Input
                                      type="text"
                                      name="group"
                                      title="Group Name"
                                      readOnly
                                      grow
                                      defaultValue={group.group.name}
                                      InputContext={InputContext}
                                    />
                                    <Input
                                      type="text"
                                      name="classSD"
                                      title="Class SD"
                                      readOnly
                                      shrink
                                      defaultValue={format(
                                        parseISO(group.group.start_date),
                                        "MM/dd/yyyy"
                                      )}
                                      InputContext={InputContext}
                                    />
                                    <Input
                                      type="text"
                                      name="classED"
                                      title="Class ED"
                                      readOnly
                                      shrink
                                      defaultValue={format(
                                        parseISO(group.group.end_date),
                                        "MM/dd/yyyy"
                                      )}
                                      InputContext={InputContext}
                                    />
                                    <Input
                                      type="text"
                                      name="studentSD"
                                      title="Student SD"
                                      readOnly
                                      shrink
                                      defaultValue={format(
                                        parseISO(period.start_date),
                                        "MM/dd/yyyy"
                                      )}
                                      InputContext={InputContext}
                                    />
                                    {/* <Input
                                    type="text"
                                    name="studentED"
                                    title="Student ED"
                                    readOnly
                                    shrink
                                    defaultValue={
                                      period.end_date
                                        ? format(
                                            parseISO(period.end_date),
                                            "MM/dd/yyyy"
                                          )
                                        : ""
                                    }
                                    InputContext={InputContext}
                                  /> */}
                                    <Input
                                      type="text"
                                      name="totalAbsenses"
                                      title="Absences"
                                      readOnly
                                      shrink
                                      defaultValue={group.totalAbsenses}
                                      InputContext={InputContext}
                                    />
                                    <Input
                                      type="text"
                                      name="frequency"
                                      title="Frequency"
                                      readOnly
                                      shrink
                                      defaultValue={
                                        Math.ceil(group.frequency) + "%"
                                      }
                                      InputContext={InputContext}
                                    />
                                  </InputLine>
                                );
                              }
                            );
                            // return (
                            //   <InputLine
                            //     title={index === 0 && "Groups in period"}
                            //   >
                            //     <Input
                            //       type="text"
                            //       name="group"
                            //       title="Group Name"
                            //       readOnly
                            //       grow
                            //       defaultValue={group.group.name}
                            //       InputContext={InputContext}
                            //     />
                            //     <Input
                            //       type="date"
                            //       name="classSD"
                            //       title="Class SD"
                            //       readOnly
                            //       shrink
                            //       defaultValue={format(
                            //         parseISO(group.group.start_date),
                            //         "yyyy-MM-dd"
                            //       )}
                            //       InputContext={InputContext}
                            //     />
                            //     <Input
                            //       type="date"
                            //       name="classED"
                            //       title="Class ED"
                            //       readOnly
                            //       shrink
                            //       defaultValue={format(
                            //         parseISO(group.group.end_date),
                            //         "yyyy-MM-dd"
                            //       )}
                            //       InputContext={InputContext}
                            //     />
                            //     <Input
                            //       type="date"
                            //       name="studentSD"
                            //       title="Student SD"
                            //       readOnly
                            //       shrink
                            //       defaultValue={
                            //         group.group.studentxgroups?.length > 0
                            //           ? format(
                            //               parseISO(
                            //                 group.group.studentxgroups[0]
                            //                   .start_date
                            //               ),
                            //               "yyyy-MM-dd"
                            //             )
                            //           : null
                            //       }
                            //       InputContext={InputContext}
                            //     />
                            //     <Input
                            //       type="text"
                            //       name="totalAbsenses"
                            //       title="Total Absenses"
                            //       readOnly
                            //       shrink
                            //       defaultValue={group.totalAbsenses}
                            //       InputContext={InputContext}
                            //     />
                            //     <Input
                            //       type="text"
                            //       name="frequency"
                            //       title="% Frequency"
                            //       readOnly
                            //       shrink
                            //       defaultValue={
                            //         Math.ceil(group.frequency) + "%"
                            //       }
                            //       InputContext={InputContext}
                            //     />
                            //   </InputLine>
                            // );
                          })}
                        <InputLine title="Totals in period">
                          <Input
                            type="text"
                            name="totalAbsenses"
                            title="Total Absences"
                            readOnly
                            shrink
                            defaultValue={pageData.totals.totalAbsenses}
                            InputContext={InputContext}
                          />
                          <Input
                            type="text"
                            name="frequency"
                            title="% Frequency"
                            readOnly
                            shrink
                            defaultValue={
                              Math.ceil(pageData.totals.frequency) + "%"
                            }
                            InputContext={InputContext}
                          />
                          <div className="flex flex-1"></div>
                        </InputLine>
                        {pageData.loaded && pageData.attendances.length > 0 && (
                          <InputLine
                            title={`Attendances in ${
                              monthsOptions.find(
                                (m) => m.value == pageData.month
                              ).label
                            }, ${pageData.year}`}
                          >
                            <table className="w-full text-sm text-center">
                              <thead>
                                <tr>
                                  <th></th>
                                  <th></th>
                                  <th></th>
                                  <th colSpan={3}>1st Check</th>
                                  <th></th>
                                  <th colSpan={3}>2nd Check</th>
                                  <th></th>
                                  <th colSpan={2}>Vac & ME</th>
                                </tr>
                                <tr className="bg-gray-100">
                                  <th className="px-2 h-8 text-left">Group</th>
                                  <th className="px-2 h-8 text-left">Date</th>
                                  <th className="px-2 h-8 text-left">Shift</th>
                                  <th className="w-16 bg-yellow-500">L/E</th>
                                  <th className="w-16 bg-green-500">P</th>
                                  <th className="w-16 bg-red-500">A</th>
                                  <th className="w-8"></th>
                                  <th className="w-16 bg-yellow-500">L/E</th>
                                  <th className="w-16 bg-green-500">P</th>
                                  <th className="w-16 bg-red-500">A</th>
                                  <th className="w-8"></th>
                                  <th className="w-16 bg-amber-700">V</th>
                                  <th className="w-16 bg-emerald-500">S</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pageData.attendances
                                  ?.sort((a, b) =>
                                    a.studentgroupclasses.date >
                                    b.studentgroupclasses.date
                                      ? 1
                                      : -1
                                  )
                                  .map((attendance, index) => {
                                    const {
                                      first_check = null,
                                      second_check = null,
                                      vacation_id = null,
                                      medical_excuse_id = null,
                                      shift,
                                      id = null,
                                      dso_note,
                                      studentgroupclasses = [
                                        {
                                          date: null,
                                          studentgroup: {
                                            name: null,
                                          },
                                        },
                                      ],
                                    } = attendance;
                                    return (
                                      <Scope
                                        path={`attendances.${index}`}
                                        key={index}
                                      >
                                        <tr
                                          key={index}
                                          className="text-center even:bg-gray-50"
                                        >
                                          <td className="px-2 h-8 text-left">
                                            {
                                              studentgroupclasses?.studentgroup
                                                ?.name
                                            }
                                          </td>
                                          <td className="px-2 h-8 text-left">
                                            <Input
                                              type="hidden"
                                              name="id"
                                              readOnly
                                              defaultValue={id}
                                              InputContext={InputContext}
                                            />
                                            {console.log(attendance)}
                                            {studentgroupclasses.date
                                              ? format(
                                                  parseISO(
                                                    studentgroupclasses.date
                                                  ),
                                                  "MM/dd"
                                                )
                                              : null}
                                          </td>
                                          <td className="px-2 h-8 text-left">
                                            {shift}
                                          </td>
                                          <TdRadioInput
                                            name={`first_check_${id}`}
                                            value="Present"
                                            options={[
                                              "Late",
                                              "Present",
                                              "Absent",
                                            ]}
                                            readOnly
                                            InputContext={InputContext}
                                            defaultValue={
                                              !first_check || medical_excuse_id
                                                ? "Absent"
                                                : first_check
                                            }
                                          />
                                          <td></td>
                                          <TdRadioInput
                                            name={`second_check_${id}`}
                                            value="Present"
                                            options={[
                                              "Late",
                                              "Present",
                                              "Absent",
                                            ]}
                                            readOnly
                                            InputContext={InputContext}
                                            defaultValue={
                                              !second_check || medical_excuse_id
                                                ? "Absent"
                                                : second_check
                                            }
                                          />
                                          <td></td>
                                          <TdRadioInput
                                            name={`vacation_${id}`}
                                            readOnly
                                            options={["Vacation"]}
                                            InputContext={InputContext}
                                            defaultValue={
                                              vacation_id ? "Vacation" : null
                                            }
                                          />
                                          <TdRadioInput
                                            name={`medical_excuse_${id}`}
                                            readOnly
                                            options={["Medical Excuse"]}
                                            InputContext={InputContext}
                                            defaultValue={
                                              medical_excuse_id
                                                ? "Medical Excuse"
                                                : null
                                            }
                                          />
                                        </tr>
                                        <tr
                                          className={
                                            openNote === id ? "" : "hidden"
                                          }
                                        >
                                          <td colSpan={14}>
                                            <Input
                                              type="text"
                                              name={`dso_note_${id}`}
                                              grow
                                              placeholder="DSO Note..."
                                              className="mb-4 shadow-sm"
                                              rows={3}
                                              InputContext={InputContext}
                                              defaultValue={dso_note}
                                            />
                                          </td>
                                        </tr>
                                      </Scope>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </InputLine>
                        )}
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
