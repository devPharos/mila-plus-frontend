import { Form } from "@unform/web";
import { Building, Lock, LockOpen } from "lucide-react";
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
import { format, parseISO, set } from "date-fns";
import CheckboxInput from "~/components/RegisterForm/CheckboxInput";
import { Scope } from "@unform/core";
import Input from "~/components/RegisterForm/Input";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import { yesOrNoOptions } from "~/functions/selectPopoverOptions";
import TdRadioInput from "~/components/RegisterForm/TdRadioInput";
import { useSelector } from "react-redux";

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
  const { profile } = useSelector((state) => state.user);
  const groupName = profile.groups[0].group.name;
  const [pageData, setPageData] = useState({
    attendance: {
      date: null,
      paceguides: [],
    },
    pending_paceguides: [],
    pendingPaceguides: [],
    otherPaceGuides: [],
    studentGroupProgress: {
      content: 0,
      class: 0,
    },
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
  const [attendanceId, setAttendanceId] = useState(null);
  const [lastAttendance, setLastAttendance] = useState({
    date: null,
  });

  const generalForm = useRef();

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  function handleGeneralFormSubmit(data) {
    if (data.lock && data.grades) {
      api
        .post(`/studentgroups/grades/${selected[0].id}`, {
          grades: data.grades,
          studentgroupclass_id: data.studentgroupclass_id,
        })
        .then((res) => {
          toast("Grades saved!", { autoClose: 1000 });
          handleOpened(null);
        })
        .catch((err) => {
          toast(err.response.data.error, {
            type: "error",
            autoClose: 1000,
          });
        });
      return;
    }
    function exect() {
      api
        .post(`/studentgroups/attendance/${selected[0].id}`, data)
        .then((res) => {
          toast("Attendance saved!", { autoClose: 1000 });
          handleOpened(null);
        })
        .catch((err) => {
          toast(err.response.data.error, {
            type: "error",
            autoClose: 1000,
          });
        });
    }
    if (
      data.paceguides.filter((paceguide) => paceguide.checked === "true")
        .length === 0
    ) {
      toast("At least one content must be marked as Done!", {
        type: "error",
        autoClose: 1000,
      });
      return;
    }
    if (data.lock) {
      alertBox({
        title: "Attention!",
        descriptionHTML:
          "Are you sure you want to Lock this attendance? \n This operation cannot be undone.",
        buttons: [
          {
            title: "No",
            class: "cancel",
          },
          {
            title: "Yes",
            onPress: async () => {
              exect();
            },
          },
        ],
      });
    } else {
      exect();
    }
  }

  useEffect(() => {
    async function loadData() {
      setPageData({ ...pageData, loaded: false });
      const { data } = await api.get(
        `/studentgroups/attendance/${selected[0].id}?attendanceId=${attendanceId}`
      );
      if (!attendanceId) {
        setLastAttendance({ date: data.attendance.date });
      }
      setTimeout(() => {
        setPageData({ ...data, loaded: true });
        // const calcClassPercentage = (
        //   (data.otherPaceGuides.filter((other) => other.locked_at).length /
        //     data.otherPaceGuides.length) *
        //   100
        // ).toFixed(0);
        // setClassPercentage(calcClassPercentage);
      }, 200);
    }
    loadData();
  }, [attendanceId]);

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
              <Building size={16} /> Attendance
            </RegisterFormMenu>
            {pageData.attendance?.paceguides?.find((paceguide) =>
              paceguide.type.includes("Test")
            ) && (
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                disabled={!pageData.attendance.locked_at}
                messageOnDisabled="Avaiable only on locked attendances that have given tests."
                name="grades"
              >
                <Building size={16} /> Grades
              </RegisterFormMenu>
            )}
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
                        <InputLine title="Resume">
                          <div className="flex flex-row items-center justify-start gap-2 px-2 pb-4 max-w-full overflow-x-scroll">
                            {pageData.otherPaceGuides
                              .filter((other) =>
                                groupName === "Teacher"
                                  ? other.date <= lastAttendance?.date
                                  : true
                              )
                              .map((otherClass, index) => {
                                let month = null;
                                if (
                                  index === 0 ||
                                  format(parseISO(otherClass.date), "LLL") !==
                                    format(
                                      parseISO(
                                        pageData.otherPaceGuides[index - 1].date
                                      ),
                                      "LLL"
                                    )
                                ) {
                                  month = (
                                    <div className="pl-2 font-bold min-w-12 max-w-24 border-r border-gray-300 text-xs pr-1 mr-1">
                                      {format(
                                        parseISO(otherClass.date),
                                        "LLL, yyyy"
                                      )}
                                    </div>
                                  );
                                }
                                return (
                                  <>
                                    {month}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setAttendanceId(otherClass.id)
                                      }
                                      className={`flex flex-col items-center justify-center rounded-lg border ${
                                        pageData.attendance.date ===
                                        otherClass.date
                                          ? "border-mila_orange border-solid"
                                          : "border-gray-300 border-dashed"
                                      } text-xs min-w-24 max-w-24`}
                                    >
                                      <div className={`px-2 py-1 text-sm`}>
                                        {format(
                                          parseISO(otherClass.date),
                                          "do"
                                        )}
                                      </div>
                                      <div className="bg-gray-100 py-1 text-black w-full flex flex-row items-center justify-center gap-2">
                                        {otherClass.locked_at ? (
                                          <span className="font-bold text-nowrap w-full flex flex-row items-center justify-center gap-2">
                                            <Lock
                                              size={16}
                                              className="text-mila_orange"
                                            />{" "}
                                            Locked{" "}
                                          </span>
                                        ) : (
                                          <span className="text-nowrap w-full flex flex-row items-center justify-center gap-2">
                                            <LockOpen
                                              size={16}
                                              className="text-primary"
                                            />{" "}
                                            Open
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                  </>
                                );
                              })}
                          </div>
                        </InputLine>
                        <InputLine>
                          <div className="w-full flex flex-col gap-4 items-center justify-start">
                            <div className="w-full flex flex-row justify-start items-center gap-2">
                              <div className="w-16">Content</div>
                              <div className="w-12 text-center">
                                {pageData.studentGroupProgress.content}%
                              </div>
                              <div className="flex flex-row w-full bg-gray-100 h-6">
                                <div
                                  className={`bg-emerald-500 h-full`}
                                  style={{
                                    width: `${pageData.studentGroupProgress.content}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="w-full flex flex-row justify-start items-center gap-2">
                              <div className="w-16">Class</div>
                              <div className="w-12 text-center">
                                {pageData.studentGroupProgress.class}%
                              </div>
                              <div className="flex flex-row w-full bg-gray-100 h-6">
                                <div
                                  className={`bg-amber-500 h-full`}
                                  style={{
                                    width: `${pageData.studentGroupProgress.class}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </InputLine>
                        <InputLine title="Attendance">
                          <SelectPopover
                            name="lock"
                            grow
                            title="Lock this attendance?"
                            readOnly={pageData.attendance.locked_at}
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
                                              className="text-center even:bg-gray-50"
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
                                              <TdRadioInput
                                                name={`first_check_${shift}_${student.id}`}
                                                value="Late"
                                                options={[
                                                  "Late",
                                                  "Present",
                                                  "Absent",
                                                ]}
                                                readOnly={
                                                  pageData.attendance.locked_at
                                                }
                                                InputContext={InputContext}
                                                defaultValue={
                                                  first_check || "Absent"
                                                }
                                              />
                                              <td></td>
                                              <TdRadioInput
                                                name={`second_check_${shift}_${student.id}`}
                                                value="Late"
                                                options={[
                                                  "Late",
                                                  "Present",
                                                  "Absent",
                                                ]}
                                                readOnly={
                                                  pageData.attendance.locked_at
                                                }
                                                InputContext={InputContext}
                                                defaultValue={
                                                  second_check || "Absent"
                                                }
                                              />
                                              <td></td>
                                              <TdRadioInput
                                                name={`vacation_${shift}_${student.id}`}
                                                value="Late"
                                                readOnly
                                                options={["Vacation"]}
                                                InputContext={InputContext}
                                              />
                                              <TdRadioInput
                                                name={`medical_excuse_${shift}_${student.id}`}
                                                value="Late"
                                                readOnly
                                                options={["Medical Excuse"]}
                                                InputContext={InputContext}
                                              />
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
                          <div className="w-full overflow-y-scroll">
                            <table className="w-full text-sm text-center overflow-y-scroll ">
                              <thead className="">
                                <tr className="bg-white sticky top-0 z-10">
                                  <th className="w-20">Scheduled for today</th>
                                  <th className="w-56">Type</th>
                                  <th className="text-left">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pageData.attendance?.paceguides
                                  .sort((a, b) =>
                                    a.status + a.description >
                                    b.status + b.description
                                      ? 1
                                      : -1
                                  )
                                  ?.concat(
                                    pageData.pendingPaceguides?.filter(
                                      (paceguide) =>
                                        !pageData.attendance?.paceguides.find(
                                          (attendance) =>
                                            attendance.id === paceguide.id
                                        )
                                    )
                                  )
                                  .map((paceguide, index) => {
                                    return (
                                      <>
                                        {index ===
                                          pageData.attendance?.paceguides
                                            .length && (
                                          <tr className="bg-white sticky top-0 z-20">
                                            <th className="w-20">
                                              Not given contents
                                            </th>
                                            <th className="w-56">Type</th>
                                            <th className="text-left">
                                              Description
                                            </th>
                                          </tr>
                                        )}
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
                                              readOnly={
                                                pageData.attendance.locked_at
                                              }
                                              defaultValue={
                                                (!pageData.attendance?.status &&
                                                  index <
                                                    pageData.attendance
                                                      ?.paceguides.length) ||
                                                paceguide.status === "Done"
                                              }
                                            />
                                          </td>
                                          <td>{paceguide.type}</td>
                                          <td className="text-left">
                                            {paceguide.description}
                                          </td>
                                        </tr>
                                      </>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </InputLine>
                      </InputLineGroup>
                      <InputLineGroup
                        title="Grades"
                        activeMenu={activeMenu === "grades"}
                      >
                        {pageData.attendance?.paceguides
                          ?.filter((paceguide) =>
                            paceguide.type.includes("Test")
                          )
                          .map((paceguide, index) => {
                            return (
                              <Scope path={`grades`} key={index}>
                                <InputLine title={paceguide.description}>
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
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {pageData.attendance?.studentgroup?.students.map(
                                        (student, index) => {
                                          const {
                                            first_check = null,
                                            second_check = null,
                                          } =
                                            pageData.attendance?.attendances?.find(
                                              (attendance) =>
                                                attendance.student_id ===
                                                student.id
                                            ) || {};
                                          if (
                                            first_check === "Absent" &&
                                            second_check === "Absent"
                                          ) {
                                            return null;
                                          }
                                          return (
                                            <Scope
                                              path={`students.${index}`}
                                              key={index}
                                            >
                                              <tr
                                                key={index}
                                                className={`text-xs hover:bg-gray-100 ${
                                                  student.id ===
                                                  pageData.attendance
                                                    ?.student_id
                                                    ? "bg-gray-100"
                                                    : ""
                                                } even:bg-gray-50`}
                                              >
                                                <td className="px-2 py-2 text-left">
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
                                                  <Input
                                                    type="text"
                                                    name="score"
                                                    centeredText
                                                    grow
                                                    defaultValue={
                                                      paceguide.grades?.find(
                                                        (grade) =>
                                                          grade.student_id ===
                                                          student.id
                                                      )?.score || "0"
                                                    }
                                                    InputContext={InputContext}
                                                  />
                                                </td>
                                                <td>
                                                  <SelectPopover
                                                    name="discarded"
                                                    grow
                                                    readOnly
                                                    options={yesOrNoOptions}
                                                    defaultValue={
                                                      yesOrNoOptions.find(
                                                        (type) =>
                                                          type.value ===
                                                          paceguide.grades?.find(
                                                            (grade) =>
                                                              grade.student_id ===
                                                              student.id
                                                          )?.discarded
                                                      ) || yesOrNoOptions[1]
                                                    }
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
                            );
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
