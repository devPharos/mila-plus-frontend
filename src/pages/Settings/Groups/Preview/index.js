import { Form } from "@unform/web";
import { Building, Lock, Pencil, X } from "lucide-react";
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
    filialtype_id: null,
    FilialType: null,
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
  const [filialTypesOptions, setFilialTypesOptions] = useState([]);
  const generalForm = useRef();

  useEffect(() => {
    async function getPageData() {
      try {
        const { data } = await api.get(`groups/${id}`);
        const { data: groupAccess } = await api.get(
          `MenuHierarchy/group/${id}`
        );
        console.log(groupAccess);
        setPageData({ ...data, groupAccess, loaded: true });
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
    async function getDefaultOptions() {
      try {
        const { data } = await api.get(`filialtypes`);
        const filialTypes = data.map(({ id, name }) => {
          return { value: id, label: name };
        });
        setFilialTypesOptions(filialTypes);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }

    getDefaultOptions();
    if (id === "new") {
      setFormType("full");
    } else if (id) {
      getPageData();
    }
  }, []);

  async function handleGeneralFormSubmit(data) {
    // console.log(data)
    // return
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
        const response = await api.post(`/groups`, data);
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
          await api.put(`/groups/${id}`, objUpdated);
          setPageData({ ...pageData, ...objUpdated });
          setSuccessfullyUpdated(true);
          toast("Saved!", { autoClose: 1000 });
          handleOpened(null);
        } catch (err) {
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
      await api.delete(`groups/${id}`);
      toast("Group Inactivated!", { autoClose: 1000 });
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
              <p className="border-b mb-1 pb-1">Group Information</p>
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
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                messageOnDisabled="Feature under construction..."
                activeMenu={activeMenu}
                name="group-access"
              >
                <Lock size={16} /> Group Access
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
                              grow
                              defaultValue={pageData.name}
                              InputContext={InputContext}
                            />
                            <SelectPopover
                              name="filialtype_id"
                              title="Filial Type"
                              grow
                              options={filialTypesOptions}
                              defaultValue={{
                                value: pageData.filialtype_id,
                                label: pageData.Filialtype
                                  ? pageData.Filialtype.name
                                  : "",
                              }}
                              InputContext={InputContext}
                            />
                          </InputLine>
                        </InputLineGroup>

                        <InputLineGroup
                          title="Group Access"
                          activeMenu={activeMenu === "group-access"}
                        >
                          {pageData.groupAccess &&
                            pageData.groupAccess.map((access, index) => {
                              return (
                                <Scope
                                  key={index}
                                  path={`groupAccess[${index}]`}
                                >
                                  <h1 className="w-full border-b p-4 pb-0 pt-2 pb-2 font-bold flex flex-row items-center gap-2">
                                    {access.name}
                                  </h1>
                                  {access.children.map((menu, indexMenu) => {
                                    return (
                                      <Scope
                                        key={indexMenu}
                                        path={`menus[${indexMenu}]`}
                                      >
                                        <InputLine>
                                          <Input
                                            type="text"
                                            name="name"
                                            required
                                            title="Name"
                                            grow
                                            defaultValue={menu.name}
                                            InputContext={InputContext}
                                          />
                                          <Input
                                            type="hidden"
                                            name="id"
                                            required
                                            defaultValue={
                                              menu.MenuHierarchyXGroup
                                                ? menu.MenuHierarchyXGroup.id
                                                : null
                                            }
                                            InputContext={InputContext}
                                          />
                                          <Input
                                            type="hidden"
                                            name="menuId"
                                            required
                                            defaultValue={menu.id}
                                            InputContext={InputContext}
                                          />

                                          <SelectPopover
                                            name="view"
                                            shrink
                                            title="View"
                                            options={[
                                              {
                                                value: "Yes",
                                                label: "Allowed",
                                              },
                                              { value: "No", label: "Blocked" },
                                            ]}
                                            defaultValue={
                                              menu.MenuHierarchyXGroup &&
                                              menu.MenuHierarchyXGroup.view
                                                ? {
                                                    value: "Yes",
                                                    label: "Allowed",
                                                  }
                                                : {
                                                    value: "No",
                                                    label: "Blocked",
                                                  }
                                            }
                                            InputContext={InputContext}
                                          />
                                          <SelectPopover
                                            name="edit"
                                            shrink
                                            title="Edit"
                                            options={[
                                              {
                                                value: "Yes",
                                                label: "Allowed",
                                              },
                                              { value: "No", label: "Blocked" },
                                            ]}
                                            defaultValue={
                                              menu.MenuHierarchyXGroup &&
                                              menu.MenuHierarchyXGroup.edit
                                                ? {
                                                    value: "Yes",
                                                    label: "Allowed",
                                                  }
                                                : {
                                                    value: "No",
                                                    label: "Blocked",
                                                  }
                                            }
                                            InputContext={InputContext}
                                          />
                                          <SelectPopover
                                            name="create"
                                            shrink
                                            title="Create"
                                            options={[
                                              {
                                                value: "Yes",
                                                label: "Allowed",
                                              },
                                              { value: "No", label: "Blocked" },
                                            ]}
                                            defaultValue={
                                              menu.MenuHierarchyXGroup &&
                                              menu.MenuHierarchyXGroup.create
                                                ? {
                                                    value: "Yes",
                                                    label: "Allowed",
                                                  }
                                                : {
                                                    value: "No",
                                                    label: "Blocked",
                                                  }
                                            }
                                            InputContext={InputContext}
                                          />
                                          <SelectPopover
                                            name="inactivate"
                                            shrink
                                            title="Inactivate"
                                            options={[
                                              {
                                                value: "Yes",
                                                label: "Allowed",
                                              },
                                              { value: "No", label: "Blocked" },
                                            ]}
                                            defaultValue={
                                              menu.MenuHierarchyXGroup &&
                                              menu.MenuHierarchyXGroup
                                                .inactivate
                                                ? {
                                                    value: "Yes",
                                                    label: "Allowed",
                                                  }
                                                : {
                                                    value: "No",
                                                    label: "Blocked",
                                                  }
                                            }
                                            InputContext={InputContext}
                                          />
                                        </InputLine>
                                      </Scope>
                                    );
                                  })}
                                </Scope>
                              );
                            })}
                          {/* <Input type='text' name='name' required title='Name' grow defaultValue={pageData.name} InputContext={InputContext} />
                                            {id === 'new' || pageData.Filialtype ? <SelectPopover name='filialtype_id' title='Filial Type' options={filialTypesOptions} defaultValue={{ value: pageData.filialtype_id, label: pageData.Filialtype ? pageData.Filialtype.name : '' }} InputContext={InputContext} /> : null} */}
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
