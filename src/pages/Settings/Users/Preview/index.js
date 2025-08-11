import { Form } from "@unform/web";
import {
  Building,
  Edit,
  Loader,
  Loader2,
  Lock,
  Mail,
  Pencil,
  PlusCircle,
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
import RegisterFormMenu from "~/components/RegisterForm/Menu";
import api from "~/services/api";
import { Zoom, toast } from "react-toastify";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { getRegistries, handleUpdatedFields } from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import { Scope } from "@unform/core";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { FullGridContext } from "../..";
import FindGeneric from "~/components/Finds/FindGeneric";
import { NavLink } from "react-router-dom";
import { AlertContext } from "~/App";
import { useSelector } from "react-redux";

export const InputContext = createContext({});

export default function PagePreview({
  access,
  id,
  defaultFormType = "preview",
}) {
  const auth = useSelector((state) => state.auth);
  const {
    handleOpened,
    setOpened,
    successfullyUpdated,
    setSuccessfullyUpdated,
  } = useContext(FullGridContext);
  const [pageData, setPageData] = useState({
    filial: { id: null, name: null },
    name: "",
    email: "",
    group_id: null,
    filials: [{ id: null, name: null }],
    groups: [],
    loaded: false,
    staff: { id: null, name: null, last_name: null, email: null },
  });
  const [formType, setFormType] = useState(defaultFormType);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("general");
  const [loading, setLoading] = useState(false);

  const [registry, setRegistry] = useState({
    created_by: null,
    created_at: null,
    updated_by: null,
    updated_at: null,
    canceled_by: null,
    canceled_at: null,
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const generalForm = useRef();
  const { alertBox } = useContext(AlertContext);

  async function getPageData() {
    try {
      const { data } = await api.get(`users/${id}`);
      setPageData({
        ...data,
        group_id: data.groups[0].group.id,
        loaded: true,
      });
      setSelectedGroup(data.groups[0].group);
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

  useEffect(() => {
    if (id === "new") {
      setFormType("full");
    } else if (id !== "new") {
      getPageData();
    }
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
    if (id === "new") {
      try {
        const response = await api.post(`/users/filial`, data);
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
          await api.put(`/users/${id}`, objUpdated);
          setPageData({ ...pageData, ...objUpdated });
          setSuccessfullyUpdated(true);
          toast("Saved!", { autoClose: 1000 });
          handleOpened(null);
        } catch (err) {
          console.log(err);
          toast(err.response.data.error, { type: "error", autoClose: 3000 });
        }
      } else {
        console.log(updated);
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
      await api.delete(`users/${id}`);
      toast("Group Inactivated!", { autoClose: 1000 });
      handleOpened(null);
    } catch (err) {
      toast(err.response.data.error, { type: "error", autoClose: 3000 });
    }
  }

  function handleAddFilial() {
    setSuccessfullyUpdated(false);
    const addedFilials = [...pageData.filials];
    const newFilial = { id: null, filial_id: null, filial: { id: null } };
    addedFilials.push(newFilial);
    setPageData({ ...pageData, filials: addedFilials });
  }

  function handleRemoveFilial(id = null) {
    setSuccessfullyUpdated(false);
    const index = pageData.filials.findIndex((el) => el.filial.id === id);
    const removedFilials = [...pageData.filials];
    removedFilials.splice(index, 1);
    const allData = generalForm.current.getData();
    generalForm.current.setData({ ...allData, filials: removedFilials });
    setPageData({ ...pageData, filials: removedFilials });
  }

  function handleResetPassword() {
    alertBox({
      title: "Attention!",
      descriptionHTML:
        "Are you sure you want to send this user a reset password email?",
      buttons: [
        {
          title: "No",
          class: "cancel",
        },
        {
          title: "Yes",
          onPress: async () => {
            setLoading(true);
            api
              .post(`/users/reset-password-mail`, {
                user_mail: pageData.email,
              })
              .then(({ data }) => {
                setLoading(false);
                toast(data.message, { autoClose: 1000 });
              })
              .catch((err) => {
                setLoading(false);
                toast(err.response.data.error, {
                  type: "error",
                  autoClose: 3000,
                });
              });
          },
        },
      ],
    });
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
              <p className="border-b mb-1 pb-1">User Information</p>
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
                      setSuccessfullyUpdated,
                      fullscreen,
                      setFullscreen,
                      successfullyUpdated,
                      handleCloseForm,
                      handleInactivate,
                      canceled: pageData.canceled_at,
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
                          <InputLine title="General Data">
                            <Input
                              type="text"
                              name="name"
                              required
                              title="Name"
                              defaultValue={pageData.name}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="email"
                              required
                              title="E-mail"
                              grow
                              defaultValue={pageData.email}
                              InputContext={InputContext}
                            />
                            {id !== "new" && (
                              <button
                                type="button"
                                onClick={() => handleResetPassword()}
                                className="cursor-pointer mt-6 bg-slate-300 text-slate-500 border border-slate-400 hover:bg-slate-400 hover:text-white rounded-md py-4 px-4 my-2 px-2 h-6 flex flex-row items-center justify-start text-xs gap-2"
                              >
                                {loading ? (
                                  <Loader2 className="animate-spin" size={14} />
                                ) : (
                                  <>
                                    <Mail size={14} />

                                    <strong>Send reset password mail</strong>
                                  </>
                                )}
                              </button>
                            )}
                          </InputLine>
                          <FindGeneric
                            route="groups"
                            title="Group"
                            scope="group"
                            required
                            InputContext={InputContext}
                            defaultValue={
                              pageData.groups.length > 0
                                ? {
                                    id: pageData.groups[0].group.id,
                                    name: pageData.groups[0].group.name,
                                  }
                                : {
                                    id: null,
                                    name: null,
                                  }
                            }
                            fields={[
                              {
                                title: "Name",
                                name: "name",
                              },
                            ]}
                            setReturnFindGeneric={setSelectedGroup}
                          />
                          {selectedGroup?.name.includes("Teacher") && (
                            <FindGeneric
                              route="staffs"
                              title="Teacher"
                              scope="staff"
                              type="Faculty"
                              required
                              InputContext={InputContext}
                              defaultValue={{
                                id: pageData.staff?.id,
                                name: pageData.staff?.name,
                                last_name: pageData.staff?.last_name,
                                email: pageData.staff?.email,
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
                                {
                                  title: "Email",
                                  name: "email",
                                },
                              ]}
                            />
                          )}
                          {pageData.filials.length &&
                            pageData.filials.map(({ filial }, index) => {
                              return (
                                <Scope key={index} path={`filials[${index}]`}>
                                  <FindGeneric
                                    route="filials"
                                    title={index === 0 ? "Filials" : ""}
                                    scope="filial"
                                    required
                                    InputContext={InputContext}
                                    handleRemove={
                                      index === pageData.filials.length - 1 &&
                                      index > 0
                                        ? handleRemoveFilial
                                        : null
                                    }
                                    defaultValue={
                                      id !== "new" && {
                                        id: filial.id,
                                        name: filial.name,
                                      }
                                    }
                                    fields={[
                                      {
                                        title: "Name",
                                        name: "name",
                                      },
                                    ]}
                                  />
                                </Scope>
                              );
                            })}
                          {/* {pageData.filials.map((filial, index) => {
                            if (filial.id !== 1) {
                              return (
                                <Scope key={index} path={`filials[${index}]`}>
                                  <InputLine>
                                    {id === "new" ||
                                    (filial && filial.filial) ? (
                                      <>
                                        {index ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveFilial(index)
                                            }
                                          >
                                            <Trash size={14} className="mt-4" />
                                          </button>
                                        ) : null}
                                        <SelectPopover
                                          name="filial_id"
                                          title="Filial"
                                          required
                                          isSearchable
                                          grow
                                          options={filialOptions}
                                          defaultValue={filialOptions.filter(
                                            (filOpt) =>
                                              filOpt.value === filial.filial_id
                                          )}
                                          InputContext={InputContext}
                                        />
                                      </>
                                    ) : null}
                                  </InputLine>
                                </Scope>
                              );
                            }
                          })} */}
                          <button
                            type="button"
                            onClick={() => handleAddFilial()}
                            className="bg-slate-100 border ml-6 py-1 px-2 text-xs flex flex-row justify-center items-center gap-2 rounded-md transition-all hover:border-primary hover:text-primary"
                          >
                            <PlusCircle size={16} /> Filial
                          </button>
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
