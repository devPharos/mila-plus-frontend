import { Form } from "@unform/web";
import { Building, Pencil, X } from "lucide-react";
import React, { createContext, useEffect, useRef, useState } from "react";
import Input from "~/components/RegisterForm/Input";
import RegisterFormMenu from "~/components/RegisterForm/Menu";
import api from "~/services/api";
import { Zoom, toast } from "react-toastify";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { getRegistries, handleUpdatedFields } from "~/functions";
import DatePicker from "~/components/RegisterForm/DatePicker";
import { format, parseISO } from "date-fns";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { Scope } from "@unform/core";
import { Link, NavLink } from "react-router-dom";

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
    loaded: false,
  });
  const [formType, setFormType] = useState(defaultFormType);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("timeline");
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
      if (id !== "new") {
        try {
          const { data } = await api.get(`/enrollments/${id}`);
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
      } else {
        setPageData({ ...pageData, loaded: true });
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
    if (id === "new") {
      try {
        const { date_of_birth, visa_expiration } = data;
        const response = await api.post(`/enrollments`, {
          ...data,
          date_of_birth: date_of_birth
            ? format(date_of_birth, "yyyy-MM-dd")
            : null,
          visa_expiration: visa_expiration
            ? format(visa_expiration, "yyyy-MM-dd")
            : null,
        });
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
        const { date_of_birth, visa_expiration } = objUpdated;
        try {
          await api.put(`/enrollments/${id}`, {
            ...objUpdated,
            date_of_birth: date_of_birth
              ? format(date_of_birth, "yyyy-MM-dd")
              : null,
            visa_expiration: visa_expiration
              ? format(visa_expiration, "yyyy-MM-dd")
              : null,
          });
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

  function handleInactivate() {}

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
              <p className="border-b mb-1 pb-1">Prospect Information</p>
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
                name="timeline"
              >
                <Building size={16} /> Timeline
              </RegisterFormMenu>
              <NavLink
                to={`/fill-form/Transfer?crypt=${id}`}
                target="_blank"
                className="w-full"
              >
                <RegisterFormMenu
                  setActiveMenu={() => null}
                  activeMenu={null}
                  name="form"
                >
                  <Building size={16} /> Transfer Form
                </RegisterFormMenu>
              </NavLink>
              <NavLink
                to={`/fill-form/Enrollment?crypt=${id}`}
                target="_blank"
                className="w-full"
              >
                <RegisterFormMenu
                  setActiveMenu={() => null}
                  activeMenu={null}
                  name="form"
                >
                  <Building size={16} /> Enrollment
                </RegisterFormMenu>
              </NavLink>
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
                    {id === "new" || pageData.loaded ? (
                      <>
                        <FormHeader
                          access={access}
                          title={pageData.id}
                          registry={registry}
                          InputContext={InputContext}
                        />
                        <InputLineGroup
                          title="TIMELINE"
                          activeMenu={activeMenu === "timeline"}
                        >
                          {pageData.enrollmenttimelines &&
                            pageData.enrollmenttimelines.length > 0 &&
                            pageData.enrollmenttimelines.map(
                              (timeline, index) => {
                                return (
                                  <Scope
                                    key={index}
                                    path={`enrollmenttimelines[${index}]`}
                                  >
                                    <InputLine
                                      title={format(
                                        timeline.created_at,
                                        "MM/dd/yyyy @ HH:mm"
                                      )}
                                    >
                                      <Scope
                                        path={`students.processsubstatuses`}
                                      >
                                        <Input
                                          type="text"
                                          name="name"
                                          grow
                                          title="Sub Status"
                                          defaultValue={
                                            pageData.students.processsubstatuses
                                              .name
                                          }
                                          InputContext={InputContext}
                                        />
                                      </Scope>
                                      <Input
                                        type="text"
                                        name="phase"
                                        grow
                                        title="Phase"
                                        defaultValue={timeline.phase}
                                        InputContext={InputContext}
                                      />
                                      <Input
                                        type="text"
                                        name="phase_step"
                                        grow
                                        title="Phase Step"
                                        defaultValue={timeline.phase_step}
                                        InputContext={InputContext}
                                      />
                                      <Input
                                        type="text"
                                        name="step_status"
                                        grow
                                        title="Step Status"
                                        defaultValue={timeline.step_status}
                                        InputContext={InputContext}
                                      />
                                      <DatePicker
                                        name="expected_date"
                                        grow
                                        title="Expected Date"
                                        defaultValue={
                                          timeline.expected_date
                                            ? parseISO(timeline.expected_date)
                                            : null
                                        }
                                        placeholderText="MM/DD/YYYY"
                                        InputContext={InputContext}
                                      />
                                    </InputLine>
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
  );
}
