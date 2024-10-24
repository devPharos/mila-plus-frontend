import { Form } from "@unform/web";
import {
  Building,
  FileText,
  Pencil,
  PlusCircle,
  Route,
  Trash,
  X,
} from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Input from "~/components/RegisterForm/Input";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import RegisterFormMenu from "~/components/RegisterForm/Menu";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { Zoom, toast } from "react-toastify";
import api from "~/services/api";
import { getRegistries, handleUpdatedFields } from "~/functions";
import { Scope } from "@unform/core";
import { AlertContext } from "~/App";
import FormLoading from "~/components/RegisterForm/FormLoading";
import FileInput from "~/components/RegisterForm/FileInput";
import uploadFile from "~/functions/uploadFile";

export const InputContext = createContext({});

export default function PagePreview({
  access,
  id,
  handleOpened,
  setOpened,
  defaultFormType = "preview",
  successfullyUpdated,
  setSuccessfullyUpdated,
}) {
  const [pageData, setPageData] = useState({
    name: "",
    paceGuides: [],
    loaded: false,
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
  const [levelOptions, setLevelOptions] = useState([]);
  const [languageModeOptions, setLanguageModeOptions] = useState([]);
  const typesOptions = [
    {
      value: "Content",
      label: "Content",
    },
    {
      value: "Review",
      label: "Review",
    },
    {
      value: "Progress Test",
      label: "Progress Test",
    },
    {
      value: "First Survey",
      label: "First Survey",
    },
    {
      value: "Second Survey",
      label: "Second Survey",
    },
    {
      value: "Midterm Oral Test",
      label: "Midterm Oral Test",
    },
    {
      value: "Midterm Written Test",
      label: "Midterm Written Test",
    },
    {
      value: "Final Oral Test",
      label: "Final Oral Test",
    },
    {
      value: "Final Written Test",
      label: "Final Written Test",
    },
    {
      value: "Feedback Day",
      label: "Feedback Day",
    },
    {
      value: "Viewpoint Listening Task",
      label: "Viewpoint Listening Task",
    },
    {
      value: "Case Study",
      label: "Case Study",
    },
    {
      value: "Extra Content",
      label: "Extra Content",
    },
  ].sort((a, b) => a.label > b.label);
  const { alertBox } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  async function handleGeneralFormSubmit(data) {
    setLoading(true);
    if (successfullyUpdated) {
      toast("No need to be saved!", {
        autoClose: 1000,
        type: "info",
        transition: Zoom,
      });
      setLoading(false);
      return;
    }
    const { data: levelData } = await api.get(`levels/${data.level_id}`);
    const restHours = levelData.total_hours % data.hours_per_day;
    if (restHours > 0) {
      toast(
        "The number of hours per day must be evenly divisible by the total hours of the level!",
        { autoClose: 3000, type: "info", transition: Zoom }
      );
      const inputRef = generalForm.current.getFieldRef("hours_per_day").current;
      inputRef.select();
      setLoading(false);
      return;
    }
    if (id === "new") {
      try {
        if (data.file_id) {
          const file = data.file_id;
          let myPromise = await uploadFile(file, "Scope and Sequence");
          Promise.all([myPromise]).then((files) => {
            data.file_id = files[0];
            create(data);
          });
          return;
        } else {
          create(data);
        }
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
        setLoading(false);
      }
    } else if (id !== "new") {
      if (data.file_id) {
        const file = data.file_id;
        let myPromise = await uploadFile(file, "Scope and Sequence");
        Promise.all([myPromise]).then((files) => {
          data.file_id = files[0];

          const updated = handleUpdatedFields(data, pageData);

          if (updated.length > 0) {
            const objUpdated = Object.fromEntries(updated);
            if (objUpdated.hours_per_day || objUpdated.days_per_week) {
              alertBox({
                title: "Attention!",
                descriptionHTML:
                  "<p>You`re going to loose this workload <strong>Pace Guide</strong>.<br/>Are you sure about this action?</p>",
                buttons: [
                  {
                    title: "Cancel",
                    class: "cancel",
                  },
                  {
                    onPress: async () => {
                      send(objUpdated);
                    },
                    title: "Ok",
                  },
                ],
              });
            } else {
              send(objUpdated);
            }
          } else {
            console.log(updated);
          }
        });
      } else {
        const updated = handleUpdatedFields(data, pageData);
        if (updated.length > 0) {
          const objUpdated = Object.fromEntries(updated);
          if (objUpdated.hours_per_day || objUpdated.days_per_week) {
            alertBox({
              title: "Attention!",
              descriptionHTML:
                "<p>You`re going to loose this workload <strong>Pace Guide</strong>.<br/>Are you sure about this action?</p>",
              buttons: [
                {
                  title: "Cancel",
                  class: "cancel",
                },
                {
                  onPress: async () => {
                    send(objUpdated);
                  },
                  title: "Ok",
                },
              ],
            });
          } else {
            send(objUpdated);
          }
        } else {
          console.log(updated);
        }
      }
    }
  }

  async function create(data) {
    const response = await api.post(`/workloads`, data);
    setOpened(response.data.id);
    setPageData({ ...pageData, ...data });
    setSuccessfullyUpdated(true);
    toast("Saved!", { autoClose: 1000 });
    handleOpened(null);
    setLoading(false);
  }

  async function send(objUpdated) {
    try {
      await api.put(`/workloads/${id}`, objUpdated);
      setPageData({ ...pageData, ...objUpdated });
      setSuccessfullyUpdated(true);
      toast("Saved!", { autoClose: 1000 });
      handleOpened(null);
      setLoading(false);
    } catch (err) {
      toast(err.response.data.error, { type: "error", autoClose: 3000 });
      setLoading(false);
    }
  }

  useEffect(() => {
    async function getPageData() {
      try {
        const { data } = await api.get(`workloads/${id}`);
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
        const totalClasses =
          Math.round(data.Level.total_hours / data.hours_per_day) || 0;
        const defaultPaceGuides = [];
        for (let classDay = 1; classDay < totalClasses + 1; classDay++) {
          defaultPaceGuides.push({ day: classDay, data: [] });
        }
        const { data: paceGuidesData } = await api.get(
          `paceguides_by_workload/${id}`
        );
        paceGuidesData.length > 0 &&
          paceGuidesData.map((paceGuide) => {
            return defaultPaceGuides[paceGuide.day - 1].data.push(paceGuide);
          });
        setPageData({
          ...data,
          loaded: true,
          paceGuides: defaultPaceGuides,
          name: `${data.days_per_week.toString()} day(s) per week, ${data.hours_per_day.toString()} hour(s) per day.`,
        });
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }
    async function getLevelsOptions() {
      try {
        const { data } = await api.get(`levels`);
        const levels = data.map(
          ({ id, name, total_hours, Programcategory }) => {
            const programcategory_name = Programcategory.name;
            return {
              value: id,
              label:
                programcategory_name +
                " - " +
                name +
                " (" +
                total_hours.toString() +
                "h)",
            };
          }
        );
        setLevelOptions(levels);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }
    async function getLanguageModeOptions() {
      try {
        const { data } = await api.get(`languagemodes`);
        const languagesmodes = data.map(({ id, name }) => {
          return { value: id, label: name };
        });
        setLanguageModeOptions(languagesmodes);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }
    getLevelsOptions();
    getLanguageModeOptions();
    if (id === "new") {
      setFormType("full");
    } else if (id) {
      getPageData();
    }
  }, []);

  function handleAddContent(day) {
    setSuccessfullyUpdated(false);
    const addedPaces = pageData.paceGuides.map((paceGuide) => {
      if (paceGuide.day === day) {
        paceGuide.data.push({ type: "", description: "" });
        return paceGuide;
      } else {
        return paceGuide;
      }
    });
    setPageData({ ...pageData, paceGuides: addedPaces });
  }

  function handleRemoveContent(day, index) {
    setSuccessfullyUpdated(false);
    const removedPace = pageData.paceGuides.map((paceGuide) => {
      if (paceGuide.day === day) {
        const newData = paceGuide.data.filter(
          (_, indexGuide) => index !== indexGuide
        );
        paceGuide.data = newData;
        return paceGuide;
      } else {
        return paceGuide;
      }
    });

    const newData = generalForm.current.getData();
    newData.paceGuides
      .filter((pace) => pace.day == day)[0]
      .data.splice(index, 1);
    generalForm.current.setData(newData);

    setPageData({ ...pageData, paceGuides: removedPace });
  }

  return (
    <>
      {/* <AlertBox /> */}
      <Preview formType={formType} fullscreen={fullscreen}>
        {id !== "new" && !pageData.name ? null : pageData ? (
          formType === "preview" ? (
            <div className="border h-full rounded-xl overflow-hidden flex flex-col justify-start gap-1 overflow-y-scroll">
              <div className="relative bg-gray-100 h-16 px-4 py-2 flex flex-row items-start justify-start">
                <button
                  onClick={() => setFormType("full")}
                  className="absolute top-2 right-20 text-md font-bold bg-mila_orange text-white rounded-md p-1 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1"
                >
                  <Pencil size={16} color="#fff" /> Open
                </button>
                <button
                  onClick={() => handleOpened(null)}
                  className="absolute top-2 right-2 text-md font-bold bg-secondary rounded-md p-1 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1"
                >
                  <X size={16} /> Close
                </button>
                <h2 style={{ fontSize: 24 }}>{pageData.name}</h2>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-row items-start justify-between gap-4">
              <div className="flex flex-col items-center justify-between text-xs w-32 gap-4">
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  name="general"
                >
                  <Building size={16} /> General
                </RegisterFormMenu>
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  disabled={id === "new"}
                  messageOnDisabled="Create the workload to have access to Pace Guide."
                  activeMenu={activeMenu}
                  name="Pace Guide"
                >
                  <Route size={16} /> Pace Guide
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
                            loading={loading}
                            access={access}
                            title={pageData.name}
                            registry={registry}
                            InputContext={InputContext}
                          />

                          <InputLineGroup
                            title="GENERAL"
                            activeMenu={activeMenu === "general"}
                          >
                            <InputLine title="General Data">
                              <Input
                                type="text"
                                name="name"
                                readOnly
                                required
                                title="Name"
                                grow
                                defaultValue={pageData.name}
                                InputContext={InputContext}
                              />
                              <SelectPopover
                                type="text"
                                name="level_id"
                                required
                                title="Level"
                                options={levelOptions}
                                grow
                                defaultValue={
                                  pageData.Level && {
                                    value: pageData.level_id,
                                    label:
                                      pageData.Level.Programcategory.name +
                                      " - " +
                                      pageData.Level.name +
                                      " (" +
                                      pageData.Level.total_hours.toString() +
                                      "h)",
                                  }
                                }
                                InputContext={InputContext}
                              />
                              <SelectPopover
                                type="text"
                                name="languagemode_id"
                                required
                                title="Language Mode"
                                options={languageModeOptions}
                                grow
                                defaultValue={
                                  pageData.Languagemode
                                    ? {
                                        value: pageData.languagemode_id,
                                        label: pageData.Languagemode.name,
                                      }
                                    : null
                                }
                                InputContext={InputContext}
                              />
                            </InputLine>
                            <InputLine title="Configurations">
                              <Input
                                type="text"
                                name="days_per_week"
                                workloadUpdateName
                                onlyInt
                                required
                                title="Days per Week"
                                grow
                                defaultValue={pageData.days_per_week}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="hours_per_day"
                                workloadUpdateName
                                onlyFloat
                                required
                                title="Hours per Day"
                                grow
                                defaultValue={pageData.hours_per_day}
                                InputContext={InputContext}
                              />
                            </InputLine>
                            <InputLine title="Scope and Sequence">
                              {pageData.File ? (
                                <div className="flex flex-row justify-center items-center gap-2 mt-2">
                                  File Attached:
                                  <a
                                    href={pageData.File.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-row justify-center items-center gap-2 border p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-all hover:border-primary"
                                  >
                                    <FileText size={16} color="#000" /> Scope
                                    and Sequence
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPageData({ ...pageData, File: null })
                                    }
                                    className="flex flex-row justify-center items-center gap-2 border p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-all hover:border-primary"
                                  >
                                    <Trash size={16} color="#fff" /> Delete
                                  </button>
                                </div>
                              ) : (
                                <FileInput
                                  type="file"
                                  name="file_id"
                                  title="File"
                                  grow
                                  InputContext={InputContext}
                                />
                              )}
                            </InputLine>
                          </InputLineGroup>

                          <InputLineGroup
                            title="Pace Guide"
                            activeMenu={activeMenu === "Pace Guide"}
                          >
                            {pageData.paceGuides.map(
                              (paceGuide, indexGuide) => {
                                return (
                                  <Scope
                                    key={indexGuide}
                                    path={`paceGuides[${indexGuide}]`}
                                  >
                                    <h3 className="font-bold pl-4 pb-2 mt-4 border-b w-full">
                                      Class {paceGuide.day} - Details
                                    </h3>
                                    {paceGuide.data.map((classes, index) => {
                                      return (
                                        <Scope
                                          key={index}
                                          path={`data[${index}]`}
                                        >
                                          <InputLine>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleRemoveContent(
                                                  paceGuide.day,
                                                  index
                                                )
                                              }
                                            >
                                              <Trash
                                                size={14}
                                                className="mt-4"
                                              />
                                            </button>
                                            <SelectPopover
                                              type="text"
                                              name="type"
                                              required
                                              title="Type"
                                              options={typesOptions}
                                              grow
                                              defaultValue={{
                                                value: classes.type,
                                                label: classes.type,
                                              }}
                                              InputContext={InputContext}
                                            />
                                            <Input
                                              type="text"
                                              name="description"
                                              required
                                              title="Description"
                                              grow
                                              defaultValue={classes.description}
                                              InputContext={InputContext}
                                            />
                                          </InputLine>
                                        </Scope>
                                      );
                                    })}
                                    <Input
                                      type="hidden"
                                      name="day"
                                      required
                                      title="Day"
                                      defaultValue={paceGuide.day}
                                      InputContext={InputContext}
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAddContent(paceGuide.day)
                                      }
                                      className="bg-slate-100 border ml-6 py-1 px-2 text-xs flex flex-row justify-center items-center gap-2 rounded-md transition-all hover:border-primary hover:text-primary"
                                    >
                                      <PlusCircle size={16} /> detail to class{" "}
                                      {paceGuide.day}
                                    </button>
                                  </Scope>
                                );
                              }
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
          )
        ) : null}
      </Preview>
    </>
  );
}
