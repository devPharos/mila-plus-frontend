import { Form } from "@unform/web";
import { Building, Pencil, X } from "lucide-react";
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
import { FullGridContext } from "../..";

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

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  async function handleGeneralFormSubmit(data) {
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
        const response = await api.post(`/workloads`, data);
        setOpened(response.data.id);
        setPageData({ ...pageData, ...data });
        setSuccessfullyUpdated(true);
        toast("Saved!", { autoClose: 1000 });
        handleOpened(null);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    } else if (id !== "new") {
      const updated = handleUpdatedFields(data, pageData);

      if (updated.length > 0) {
        const objUpdated = Object.fromEntries(updated);
        try {
          await api.put(`/workloads/${id}`, objUpdated);
          setPageData({ ...pageData, ...objUpdated });
          setSuccessfullyUpdated(true);
          toast("Saved!", { autoClose: 1000 });
          handleOpened(null);
        } catch (err) {
          toast(err.response.data.error, { type: "error", autoClose: 3000 });
        }
      } else {
        console.log(updated);
      }
    }
  }

  useEffect(() => {
    async function getPageData() {
      try {
        const { data } = await api.get(`workloads/${id}`);
        setPageData({
          ...data,
          name: `${data.days_per_week.toString()} day(s) per week, ${data.hours_per_day.toString()} hour(s) per day.`,
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
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }
    async function getLevelsOptions() {
      try {
        const { data } = await api.get(`levels`);
        const levels = data.map(({ id, name, Programcategory }) => {
          const programcategory_name = Programcategory.name;
          return { value: id, label: programcategory_name + " - " + name };
        });
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
    if (id === "new") {
      setFormType("full");
    } else if (id) {
      getPageData();
      getLevelsOptions();
      getLanguageModeOptions();
    }
  }, []);

  return (
    <Preview formType={formType} fullscreen={fullscreen}>
      {pageData ? (
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
                    <FormHeader
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
                        {id === "new" ||
                          (pageData.Level && (
                            <SelectPopover
                              type="text"
                              name="level_id"
                              required
                              title="Level"
                              options={levelOptions}
                              grow
                              defaultValue={
                                pageData.Level
                                  ? {
                                      value: pageData.level_id,
                                      label:
                                        pageData.Level.Programcategory.name +
                                        " - " +
                                        pageData.Level.name,
                                    }
                                  : null
                              }
                              InputContext={InputContext}
                            />
                          ))}
                        {id === "new" ||
                          (pageData.Languagemode && (
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
                          ))}
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
                    </InputLineGroup>
                  </InputContext.Provider>
                </Form>
              </div>
            </div>
          </div>
        )
      ) : null}
    </Preview>
  );
}
