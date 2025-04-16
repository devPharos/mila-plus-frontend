import { Form } from "@unform/web";
import {
  Armchair,
  Contact,
  GraduationCap,
  NotebookPen,
  Pencil,
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
import { format, parseISO } from "date-fns";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import { FullGridContext } from "../..";
import FindGeneric from "~/components/Finds/FindGeneric";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import {
  classroomStatusOptions,
  optionsStatus,
} from "~/functions/selectPopoverOptions";
import { Scope } from "@unform/core";

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
    class_number: "",
    status: "",
    quantity_of_students: 0,
    studentgroups: [],
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
  const [filialOptions, setFilialOptions] = useState([]);
  const generalForm = useRef();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    async function getPageData() {
      if (id !== "new") {
        try {
          const { data } = await api.get(`/classrooms/${id}`);
          setPageData({
            ...data,
            loaded: true,
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
          // console.log(err);
          toast(err.response.data.error, { type: "error", autoClose: 3000 });
        }
      } else {
        setPageData({ ...pageData, loaded: true });
        setFormType("full");
      }
    }
    getPageData();
  }, []);

  async function handleGeneralFormSubmit(data) {
    // return;
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
        delete data.id;
        await api.post(`/classrooms`, {
          ...data,
        });
        setSuccessfullyUpdated(true);
        toast("Saved!", { autoClose: 1000 });
        handleOpened(null);
      } catch (err) {
        console.log(err);
        // toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    } else if (id !== "new") {
      try {
        await api.put(`/classrooms/${id}`, {
          ...data,
        });
        setSuccessfullyUpdated(true);
        toast("Saved!", { autoClose: 1000 });
        handleOpened(null);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }
  }

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  return (
    <Preview formType={formType} fullscreen={fullscreen}>
      {pageData ? (
        <div className="flex h-full flex-row items-start justify-between gap-4">
          <div className="flex flex-col items-center justify-between text-xs w-40 gap-4">
            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="general"
            >
              <Armchair size={16} /> Classroom
            </RegisterFormMenu>

            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="student-groups"
              disabled={id === "new"}
              messageOnDisabled="You need to save the classroom first"
            >
              <GraduationCap size={16} /> Student Groups
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
                    handleInactivate: () => null,
                    canceled: pageData.canceled_at,
                  }}
                >
                  {pageData.loaded ? (
                    <>
                      <FormHeader
                        access={access}
                        title={`Classroom: ${pageData.class_number || "new"}`}
                        registry={registry}
                        InputContext={InputContext}
                      />
                      <InputLineGroup
                        title="general"
                        activeMenu={activeMenu === "general"}
                      >
                        <FindGeneric
                          route="filials"
                          title="Filial"
                          scope="filial"
                          required
                          readOnly={pageData.studentgroups.length > 0}
                          InputContext={InputContext}
                          defaultValue={
                            id === "new"
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
                            name="class_number"
                            required
                            grow
                            title="Class Number"
                            readOnly={pageData.studentgroups.length > 0}
                            defaultValue={pageData.class_number}
                            InputContext={InputContext}
                          />
                          <SelectPopover
                            name="status"
                            required
                            grow
                            title="Status"
                            readOnly={pageData.studentgroups.length > 0}
                            isSearchable
                            defaultValue={classroomStatusOptions.find(
                              (opt) => opt.value === pageData.status
                            )}
                            options={classroomStatusOptions}
                            InputContext={InputContext}
                          />
                          <Input
                            type="number"
                            name="quantity_of_students"
                            required
                            grow
                            title="Quantity of Students"
                            defaultValue={pageData.quantity_of_students}
                            InputContext={InputContext}
                          />
                        </InputLine>
                      </InputLineGroup>
                      <InputLineGroup
                        title="student-groups"
                        activeMenu={activeMenu === "student-groups"}
                      >
                        <InputLine
                          title={`Groups in Classroom ${pageData.class_number}`}
                        >
                          <div className="flex flex-col justify-center items-start relative w-full">
                            {pageData.studentgroups &&
                              pageData.studentgroups.length > 0 &&
                              pageData.studentgroups.map(
                                (studentgroup, index) => {
                                  return (
                                    <div
                                      className="flex flex-row justify-center items-center relative w-full"
                                      key={index}
                                    >
                                      <div className="mt-2">{index + 1}</div>
                                      <Scope
                                        key={index}
                                        path={`studentgroups[${index}]`}
                                      >
                                        <InputLine>
                                          <Input
                                            type="hidden"
                                            name="id"
                                            defaultValue={studentgroup.id}
                                            InputContext={InputContext}
                                          />
                                          <Input
                                            type="text"
                                            name="name"
                                            grow
                                            readOnly
                                            title="Name"
                                            defaultValue={studentgroup.name}
                                            InputContext={InputContext}
                                          />
                                          <Input
                                            type="text"
                                            name="status"
                                            grow
                                            readOnly
                                            title="Status"
                                            defaultValue={studentgroup.status}
                                            InputContext={InputContext}
                                          />
                                        </InputLine>
                                      </Scope>
                                    </div>
                                  );
                                }
                              )}
                          </div>
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
      ) : null}
    </Preview>
  );
}
