import { Form } from "@unform/web";
import { Building, NotebookPen, Search } from "lucide-react";
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

export const InputContext = createContext({});

export default function AttendanceAdjustments({
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
    from_date: null,
    until_date: null,
  });
  const untilDateRef = useRef();
  const fromDateRef = useRef();
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
  const [activeMenu, setActiveMenu] = useState("general");

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

  async function loadData(from_date = null, until_date = null) {
    setPageData({ ...pageData, loaded: false });
    setSuccessfullyUpdated(true);
    setTimeout(async () => {
      const { data } = await api.get(`/attendances/${selected[0].id}`, {
        params: {
          from_date,
          until_date,
        },
      });
      setPageData({ from_date, until_date, ...data, loaded: true });
    }, 500);
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
                        title={
                          "Attendance Adjustments - " +
                          pageData.student?.registration_number +
                          " - " +
                          pageData.student?.name +
                          " " +
                          pageData.student?.last_name
                        }
                        registry={registry}
                        InputContext={InputContext}
                      />

                      <InputLineGroup
                        title="GENERAL"
                        activeMenu={activeMenu === "general"}
                      >
                        <InputLine title="Details">
                          <Input
                            defaultRef={fromDateRef}
                            type="date"
                            name="from_date"
                            required
                            title="From Date"
                            grow
                            defaultValue={pageData.from_date}
                            InputContext={InputContext}
                          />
                          <Input
                            defaultRef={untilDateRef}
                            type="date"
                            name="until_date"
                            required
                            title="Until Date"
                            grow
                            defaultValue={pageData.until_date}
                            InputContext={InputContext}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              loadData(
                                fromDateRef?.current?.value,
                                untilDateRef?.current?.value
                              );
                            }}
                            className="text-xs bg-gray-100 px-6 py-3 mt-3 rounded-md border cursor-pointer flex flex-row items-center justify-center gap-2"
                          >
                            <Search size={14} /> Search
                          </button>
                        </InputLine>
                        {pageData.loaded && (
                          <InputLine>
                            <table className="w-full text-sm text-center">
                              <thead>
                                <tr>
                                  <th></th>
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
                                  <th className="px-2 h-8 text-left">Notes</th>
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
                                  ?.filter(
                                    (attendance) => attendance.status !== "T"
                                  )
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
                                              attendance.studentgroupclasses
                                                .studentgroup.name
                                            }
                                          </td>
                                          <td className="px-2 h-8 text-left">
                                            <Input
                                              type="hidden"
                                              name="id"
                                              defaultValue={id}
                                              InputContext={InputContext}
                                            />
                                            {format(
                                              parseISO(
                                                attendance.studentgroupclasses
                                                  .date
                                              ),
                                              "MM/dd"
                                            )}
                                          </td>
                                          <td className="px-2 h-8 text-left">
                                            {shift}
                                          </td>
                                          <td className="px-2 h-8 text-left">
                                            <NotebookPen
                                              size={14}
                                              className={`cursor-pointer ${
                                                attendance.dso_note
                                                  ? "text-mila_orange"
                                                  : ""
                                              }`}
                                              onClick={() =>
                                                setOpenNote(
                                                  openNote === id ? null : id
                                                )
                                              }
                                            />
                                          </td>
                                          <TdRadioInput
                                            name={`first_check_${id}`}
                                            value="Present"
                                            options={[
                                              "Late",
                                              "Present",
                                              "Absent",
                                            ]}
                                            readOnly={
                                              medical_excuse_id || vacation_id
                                            }
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
                                            readOnly={
                                              medical_excuse_id || vacation_id
                                            }
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
                                              className="mb-4 shadow-sm"
                                              rows={3}
                                              InputContext={InputContext}
                                              defaultValue={attendance.dso_note}
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
