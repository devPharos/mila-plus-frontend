import { Form } from "@unform/web";
import {
  Building,
  CornerDownRight,
  Lock,
  Pencil,
  Users,
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
import { useSelector } from "react-redux";
import { format, parseISO } from "date-fns";

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
  const auth = useSelector((state) => state.auth);
  const [pageData, setPageData] = useState({
    name: "",
    filialtype_id: null,
    FilialType: null,
    loaded: false,
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
  const generalForm = useRef();

  useEffect(() => {
    async function getPageData() {
      try {
        const { data } = await api.get(`groups/${id}`);
        const { data: groupAccess } = await api.get(
          `MenuHierarchy/group/${id}`
        );
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

    if (id === "new") {
      setFormType("full");
    } else if (id) {
      getPageData();
    }
  }, []);

  async function handleGeneralFormSubmit(data) {
    setLoading(true);
    if (successfullyUpdated) {
      toast("No need to be saved!", {
        autoClose: 1000,
        type: "info",
        transition: Zoom,
      });
      return;
    }
    if (id === "new") {
      api
        .post(`/groups`, data)
        .then(async (response) => {
          setOpened(response.data.id);
          api
            .get(`MenuHierarchy/group/${response.data.id}`)
            .then(({ data: groupAccess }) => {
              setPageData({ ...pageData, groupAccess, ...data });
              setSuccessfullyUpdated(true);
              toast("Saved!", { autoClose: 1000 });
              setActiveMenu("group-access");
              setLoading(false);
            });
        })
        .catch((err) => {
          toast(err.response.data.error, { type: "error", autoClose: 3000 });
          setLoading(false);
        });
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
          setLoading(false);
        }
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
                messageOnDisabled="First create the group to manage it's access"
                activeMenu={activeMenu}
                disabled={id === "new"}
                name="group-access"
              >
                <Lock size={16} /> Group Access
              </RegisterFormMenu>
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                messageOnDisabled="First create the group to see it's users"
                activeMenu={activeMenu}
                disabled={id === "new"}
                name="users"
              >
                <Users size={16} /> Users
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
                          loading={loading}
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
                              title="Name"
                              grow
                              defaultValue={pageData.name}
                              InputContext={InputContext}
                            />
                          </InputLine>
                        </InputLineGroup>

                        <InputLineGroup
                          title="Group Access"
                          activeMenu={activeMenu === "group-access"}
                          gap="0"
                        >
                          {pageData.groupAccess &&
                            pageData.groupAccess.map((access, index) => {
                              return (
                                <Scope
                                  key={index}
                                  path={`groupAccess[${index}]`}
                                >
                                  <h1 className="w-full p-4 pb-0 pt-2 pb-2 font-bold flex flex-row items-center gap-2">
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
                                          <Input
                                            type="hidden"
                                            name="fatherId"
                                            required
                                            defaultValue={menu.father_id}
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
                                        {menu.children &&
                                          menu.children.length > 0 &&
                                          menu.children
                                            .sort((a, b) =>
                                              a.name > b.name ? 1 : -1
                                            )
                                            .map((child, index) => {
                                              return (
                                                <InputLine key={index}>
                                                  <div className="flex flex-row items-center justify-center gap-2 w-16">
                                                    <CornerDownRight
                                                      size={16}
                                                      strokeWidth={1}
                                                    />
                                                  </div>
                                                  <Input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    title="Name"
                                                    grow
                                                    defaultValue={child.name}
                                                    InputContext={InputContext}
                                                  />
                                                  <Input
                                                    type="hidden"
                                                    name="id"
                                                    required
                                                    defaultValue={
                                                      child.MenuHierarchyXGroup
                                                        ? child
                                                            .MenuHierarchyXGroup
                                                            .id
                                                        : null
                                                    }
                                                    InputContext={InputContext}
                                                  />
                                                  <Input
                                                    type="hidden"
                                                    name="menuId"
                                                    required
                                                    defaultValue={child.id}
                                                    InputContext={InputContext}
                                                  />
                                                  <Input
                                                    type="hidden"
                                                    name="fatherId"
                                                    required
                                                    defaultValue={
                                                      child.father_id
                                                    }
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
                                                      {
                                                        value: "No",
                                                        label: "Blocked",
                                                      },
                                                    ]}
                                                    defaultValue={
                                                      child.MenuHierarchyXGroup &&
                                                      child.MenuHierarchyXGroup
                                                        .view
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
                                                      {
                                                        value: "No",
                                                        label: "Blocked",
                                                      },
                                                    ]}
                                                    defaultValue={
                                                      child.MenuHierarchyXGroup &&
                                                      child.MenuHierarchyXGroup
                                                        .edit
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
                                                      {
                                                        value: "No",
                                                        label: "Blocked",
                                                      },
                                                    ]}
                                                    defaultValue={
                                                      child.MenuHierarchyXGroup &&
                                                      child.MenuHierarchyXGroup
                                                        .create
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
                                                      {
                                                        value: "No",
                                                        label: "Blocked",
                                                      },
                                                    ]}
                                                    defaultValue={
                                                      child.MenuHierarchyXGroup &&
                                                      child.MenuHierarchyXGroup
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
                                              );
                                            })}
                                        <div className="h-[1px] w-full border-b border-gray-200 border-dashed"></div>
                                      </Scope>
                                    );
                                  })}
                                </Scope>
                              );
                            })}
                          {/* <Input type='text' name='name' required title='Name' grow defaultValue={pageData.name} InputContext={InputContext} />
                                            {id === 'new' || pageData.Filialtype ? <SelectPopover name='filialtype_id' title='Filial Type' options={filialTypesOptions} defaultValue={{ value: pageData.filialtype_id, label: pageData.Filialtype ? pageData.Filialtype.name : '' }} InputContext={InputContext} /> : null} */}
                        </InputLineGroup>

                        <InputLineGroup
                          title="Users"
                          activeMenu={activeMenu === "users"}
                        >
                          {pageData.groupxuser &&
                            pageData.groupxuser
                              .sort((a, b) =>
                                b.created_at > a.created_at ? 1 : -1
                              )
                              .map((userXGroup, index) => {
                                return (
                                  <Scope
                                    key={index}
                                    path={`groupxuser[${index}]`}
                                  >
                                    <InputLine
                                      title={
                                        index === 0 ? "Users in Group" : ""
                                      }
                                    >
                                      <Input
                                        type="text"
                                        name="user_name"
                                        readOnly
                                        title="Name"
                                        grow
                                        defaultValue={userXGroup.user.name}
                                        InputContext={InputContext}
                                      />
                                      <Input
                                        type="text"
                                        name="user_email"
                                        readOnly
                                        title="E-mail"
                                        grow
                                        defaultValue={userXGroup.user.email}
                                        InputContext={InputContext}
                                      />
                                      <Input
                                        type="text"
                                        name="user_date"
                                        readOnly
                                        title="In group since"
                                        shrink
                                        defaultValue={format(
                                          parseISO(userXGroup.created_at),
                                          "MM/dd/yyyy"
                                        )}
                                        InputContext={InputContext}
                                      />
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
        )
      ) : null}
    </Preview>
  );
}
