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
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import { yesOrNoOptions } from "~/functions/selectPopoverOptions";

export const InputContext = createContext({});

export default function GradesAdjustments({
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
  const [activeMenu, setActiveMenu] = useState("Grades");

  const generalForm = useRef();

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  function handleGeneralFormSubmit(data) {
    for (let grade of data.grades.students) {
      if (
        (grade.score !== grade.old_score ||
          grade.discarded.toString() !== grade.old_discarded ||
          grade.old_dso_note) &&
        !grade.dso_note
      ) {
        console.log({ grade });
        toast("Notes are required when changing scores!", {
          type: "error",
          autoClose: 3000,
        });
        return;
      }
    }

    api
      .put(`/grades/${selected[0].id}`, data)
      .then((res) => {
        toast("Grades Updated!", { autoClose: 1000 });
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
      const { data } = await api.get(`/grades/${selected[0].id}`, {
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
              name="Grades"
            >
              <Building size={16} /> Grades
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
                          "Grades Adjustments - " +
                          pageData.student?.name +
                          " " +
                          pageData.student?.last_name
                        }
                        registry={registry}
                        InputContext={InputContext}
                      />

                      <InputLineGroup
                        title="Grades"
                        activeMenu={activeMenu === "Grades"}
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
                        {pageData.attendances?.map((attendance, index) => {
                          return attendance.studentgroupclasses.paceguides
                            ?.filter((paceguide) =>
                              paceguide.type.includes("Test")
                            )
                            .map((paceguide, index) => {
                              return (
                                <Scope path={`grades`} key={index}>
                                  <InputLine
                                    title={
                                      paceguide.description +
                                      " - " +
                                      attendance.studentgroupclasses
                                        .studentgroup.name
                                    }
                                  >
                                    <Input
                                      type="hidden"
                                      name="id"
                                      defaultValue={paceguide.id}
                                      InputContext={InputContext}
                                    />
                                    <table className="w-full text-sm text-center">
                                      <thead>
                                        <tr className="bg-gray-100">
                                          <th className="px-2 h-8 text-left">
                                            Student
                                          </th>
                                          <th className="w-36 bg-emerald-400">
                                            Score
                                          </th>
                                          <th className="w-36 bg-red-400">
                                            Discard Score
                                          </th>
                                          <th className="w-96 ">
                                            Notes (Required when changed)
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {attendance.studentgroupclasses.grades
                                          .filter(
                                            (grade) =>
                                              grade.student_id ===
                                              pageData.student.id
                                          )
                                          .map((grade, index) => {
                                            return (
                                              <Scope
                                                path={`students.${index}`}
                                                key={index}
                                              >
                                                <tr
                                                  key={index}
                                                  className={`text-xs hover:bg-gray-100 even:bg-gray-50`}
                                                >
                                                  <td className="px-2 py-2 text-left">
                                                    <Input
                                                      type="hidden"
                                                      name="id"
                                                      defaultValue={grade.id}
                                                      InputContext={
                                                        InputContext
                                                      }
                                                    />
                                                    {pageData.student.name}{" "}
                                                    {pageData.student.last_name}
                                                  </td>
                                                  <td>
                                                    <Input
                                                      type="hidden"
                                                      name="old_score"
                                                      defaultValue={
                                                        grade.score || "0"
                                                      }
                                                      InputContext={
                                                        InputContext
                                                      }
                                                    />
                                                    <Input
                                                      type="text"
                                                      name="score"
                                                      centeredText
                                                      grow
                                                      defaultValue={
                                                        grade.score || "0"
                                                      }
                                                      InputContext={
                                                        InputContext
                                                      }
                                                    />
                                                  </td>
                                                  <td>
                                                    <Input
                                                      type="hidden"
                                                      name="old_discarded"
                                                      defaultValue={
                                                        grade.discarded
                                                      }
                                                      InputContext={
                                                        InputContext
                                                      }
                                                    />
                                                    <SelectPopover
                                                      name="discarded"
                                                      grow
                                                      options={yesOrNoOptions}
                                                      defaultValue={
                                                        yesOrNoOptions.find(
                                                          (type) =>
                                                            type.value ===
                                                            grade.discarded
                                                        ) || yesOrNoOptions[1]
                                                      }
                                                      InputContext={
                                                        InputContext
                                                      }
                                                    />
                                                  </td>
                                                  <td className="px-2 h-8 text-left">
                                                    <Input
                                                      type="hidden"
                                                      name="old_dso_note"
                                                      defaultValue={
                                                        grade.dso_note
                                                      }
                                                      InputContext={
                                                        InputContext
                                                      }
                                                    />
                                                    <Input
                                                      type="text"
                                                      name="dso_note"
                                                      grow
                                                      required={false}
                                                      defaultValue={
                                                        grade.dso_note
                                                      }
                                                      InputContext={
                                                        InputContext
                                                      }
                                                    />
                                                  </td>
                                                </tr>
                                              </Scope>
                                            );
                                          })}
                                      </tbody>
                                    </table>
                                  </InputLine>
                                </Scope>
                              );
                            });
                        })}
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
