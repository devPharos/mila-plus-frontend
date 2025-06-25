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
import RegisterFormMenu from "~/components/RegisterForm/Menu";
import api from "~/services/api";
import { Zoom, toast } from "react-toastify";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { getRegistries, handleUpdatedFields } from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import CountryList from "country-list-with-dial-code-and-flag";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import { FullGridContext } from "../..";
import FindGeneric from "~/components/Finds/FindGeneric";

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
    email: "",
    user_id: null,
    loaded: false,
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

  useEffect(() => {
    async function getCountriesList() {
      const countriesList = CountryList.getAll().map((country) => {
        return {
          value: country.dial_code,
          label: country.flag + " " + country.dial_code + " " + country.name,
          code: country.dial_code,
          name: country.name,
        };
      });

      return countriesList;
    }
    async function getPageData() {
      const ddiOptions = await getCountriesList();
      if (id !== "new") {
        try {
          const { data } = await api.get(`/agents/${id}`);
          setPageData({ ...data, loaded: true, ddiOptions });
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
      } else {
        setPageData({ ...pageData, loaded: true, ddiOptions });
        setFormType("full");
      }
    }
    getPageData();
  }, []);

  async function handleGeneralFormSubmit(data) {
    if (successfullyUpdated) {
      toast("No need to be saved!", {
        autoClose: 1000,
        type: "info",
        transition: Zoom,
      });
      return;
    }
    if (!data.user_id) {
      delete data.user_id;
    }
    if (id === "new") {
      try {
        const response = await api.post(`/agents`, { ...data });
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
      console.log(updated);

      if (updated.length > 0) {
        const objUpdated = Object.fromEntries(updated);
        try {
          await api.put(`/agents/${id}`, { ...objUpdated });
          setPageData({ ...pageData, ...objUpdated });
          setSuccessfullyUpdated(true);
          toast("Saved!", { autoClose: 1000 });
          handleOpened(null);
        } catch (err) {
          console.log(err);
          toast(err.response.data.error, { type: "error", autoClose: 3000 });
        }
      } else {
        // console.log(updated)
      }
    }
  }

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  async function handleInactivate() {
    try {
      await api.delete(`/agents/${id}`);
      toast("Agent Inactivated!", { autoClose: 1000 });
      handleOpened(null);
    } catch (err) {
      toast(err.response.data.error, { type: "error", autoClose: 3000 });
    }
  }

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
            <div className="flex flex-1 flex-col items-left px-4 py-2 gap-1">
              <p className="border-b mb-1 pb-1">Agent Information</p>
              <div className="flex flex-row items-center gap-1 text-xs">
                <strong>Name:</strong> {pageData.name}
              </div>
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
                      handleInactivate,
                      canceled: pageData.canceled_at,
                    }}
                  >
                    {pageData.loaded ? (
                      <>
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
                          <FindGeneric
                            route="filials"
                            title="Filial"
                            scope="filial"
                            required
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
                              grow
                              title="Name"
                              defaultValue={pageData.name}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="email"
                              grow
                              title="E-mail"
                              defaultValue={pageData.email}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine>
                            <Input
                              type="text"
                              name="user_id"
                              disabled
                              grow
                              title="User"
                              defaultValue={pageData.user_id}
                              InputContext={InputContext}
                            />
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
        )
      ) : null}
    </Preview>
  );
}
