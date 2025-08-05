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
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { Zoom, toast } from "react-toastify";
import api from "~/services/api";
import { getRegistries } from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { FullGridContext } from "../..";
import FindGeneric from "~/components/Finds/FindGeneric";
import { yesOrNoOptions } from "~/functions/selectPopoverOptions";

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
    father_id: null,
    name: "",
    code: "",
    Father: {
      name: "",
    },
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
  const visibilityOptions = [
    { value: "All", label: "All" },
    { value: "Filial Only", label: "Filial Only" },
    { value: "Holding Only", label: "Holding Only" },
  ];

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
        // console.log(data)
        const response = await api.post(`/costcenters`, data);
        setOpened(response.data.id);
        setPageData({ ...pageData, ...data });
        setSuccessfullyUpdated(true);
        toast("Saved!", { autoClose: 1000 });
        handleOpened(null);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    } else if (id !== "new") {
      try {
        await api.put(`/costcenters/${id}`, data);
        setPageData({ ...pageData, ...data });
        setSuccessfullyUpdated(true);
        toast("Saved!", { autoClose: 1000 });
        handleOpened(null);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }
  }

  useEffect(() => {
    async function getPageData() {
      try {
        const { data } = await api.get(`costcenters/${id}`);
        setPageData({ ...data, loaded: true });
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
    if (id === "new") {
      setFormType("full");
    } else if (id) {
      getPageData();
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
                    {id === "new" || pageData.loaded ? (
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
                            route="costcenters"
                            title="Father Account"
                            scope="Father"
                            InputContext={InputContext}
                            defaultValue={{
                              id: pageData.Father?.id,
                              code: pageData.Father?.code,
                              name: pageData.Father?.name,
                            }}
                            fields={[
                              {
                                title: "Code",
                                name: "code",
                              },
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
                              title="Name"
                              grow
                              defaultValue={pageData.name}
                              InputContext={InputContext}
                            />
                            <SelectPopover
                              type="select"
                              isSearchable
                              name="profit_and_loss"
                              required
                              title="Profit and Loss"
                              options={yesOrNoOptions}
                              grow
                              defaultValue={yesOrNoOptions.find(
                                (type) =>
                                  type.value === pageData.profit_and_loss
                              )}
                              InputContext={InputContext}
                            />
                            <SelectPopover
                              type="text"
                              isSearchable
                              name="visibility"
                              required
                              title="Visibility"
                              options={visibilityOptions}
                              grow
                              defaultValue={
                                pageData.visibility
                                  ? visibilityOptions.find(
                                      (f) => f.value === pageData.visibility
                                    )
                                  : null
                              }
                              InputContext={InputContext}
                            />
                            <SelectPopover
                              type="text"
                              isSearchable
                              name="allow_use"
                              required
                              title="Allows Posting"
                              options={yesOrNoOptions}
                              grow
                              defaultValue={yesOrNoOptions.find(
                                (f) => f.value === pageData.allow_use
                              )}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine title="Other Data">
                            <Input
                              title="Old Code"
                              type="text"
                              name="old_code"
                              readOnly
                              grow
                              defaultValue={pageData.old_code}
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
