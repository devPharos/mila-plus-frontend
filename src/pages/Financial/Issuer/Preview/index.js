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
import {
  getRegistries,
  handleUpdatedFields,
  countries_list,
} from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import { FullGridContext } from "../..";
import PhoneNumberInput from "~/components/RegisterForm/PhoneNumberInput";

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
    loaded: false,
    name: "",
    email: "",
    phone_number: "",
    bank_account: "",
    bank_routing_number: "",
    bank_name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    merchant_id: null,
    merchant: {
      name: "",
    },
    student_id: null,
    student: {
      name: "",
    },
    filial_id: null,
    filial: {
      name: "",
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
  const [filialOptions, setFilialOptions] = useState([]);
  const [merchantOptions, setMerchantOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);

  const auth = useSelector((state) => state.auth);

  const generalForm = useRef();

  const countriesOptions = countries_list.map((country) => {
    return { value: country, label: country };
  });

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
        const response = await api.post(`/issuers`, data);
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
          await api.put(`/issuers/${id}`, objUpdated);
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
        const { data } = await api.get(`/issuers/${id}`);
        setPageData({ ...data, loaded: true });

        console.log(data);
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
        console.log(err);
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }
    async function getDefaultOptions() {
      try {
        const filialData = await api.get(`/filials`);
        const merchantData = await api.get(`/merchants`);
        const studentData = await api.get(`/students`);

        const filialOptions = filialData.data
          .filter((f) => f.id !== id)
          .map((f) => {
            return { value: f.id, label: f.name };
          });

        const merchantOptions = merchantData.data.map((m) => {
          return { value: m.id, label: m.name };
        });

        const studentOptions = studentData.data.map((s) => {
          return {
            value: s.id,
            label: s.name + " " + s.last_name + " - " + s.registration_number,
          };
        });

        setMerchantOptions(merchantOptions);
        setStudentOptions(studentOptions);
        setFilialOptions(filialOptions);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }

    if (id === "new") {
      setFormType("full");
    } else if (id) {
      getPageData();
    }
    getDefaultOptions();
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
                  className="w-full pb-32"
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
                          title={pageData?.name}
                          registry={registry}
                          InputContext={InputContext}
                        />

                        <InputLineGroup
                          title="GENERAL"
                          activeMenu={activeMenu === "general"}
                        >
                          {auth.filial.id === 1 && (
                            <InputLine title="Filial">
                              <SelectPopover
                                name="filial_id"
                                required
                                title="Filial"
                                isSearchable
                                grow
                                defaultValue={
                                  pageData.filial_id
                                    ? {
                                        value: pageData.filial_id,
                                        label: pageData.filial.name,
                                      }
                                    : null
                                }
                                options={filialOptions}
                                InputContext={InputContext}
                              />
                            </InputLine>
                          )}
                          <InputLine title="Merchant / Student">
                            <SelectPopover
                              name="merchant_id"
                              title="Merchant"
                              isSearchable
                              isClearable
                              grow
                              value={merchantOptions.find(
                                (m) => m.value === pageData.merchant_id
                              )}
                              options={merchantOptions}
                              InputContext={InputContext}
                            />
                            <h4 className="text-xs text-zinc-500 mt-4">or</h4>
                            <SelectPopover
                              name="student_id"
                              title="Student"
                              isSearchable
                              isClearable
                              grow
                              value={studentOptions.find(
                                (s) => s.value === pageData.student_id
                              )}
                              options={studentOptions}
                              InputContext={InputContext}
                            />
                          </InputLine>

                          <InputLine title="General data">
                            <Input
                              type="text"
                              name="name"
                              required
                              title=" Name"
                              grow
                              defaultValue={pageData?.name}
                              InputContext={InputContext}
                            />
                          </InputLine>

                          <InputLine title="Address">
                            <Input
                              type="text"
                              name="address"
                              title="Address"
                              grow
                              defaultValue={pageData.address}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="city"
                              title="City"
                              grow
                              defaultValue={pageData.city}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="state"
                              title="State"
                              grow
                              defaultValue={pageData.state}
                              InputContext={InputContext}
                            />

                            <Input
                              type="text"
                              name="zip"
                              title="Zip"
                              grow
                              defaultValue={pageData.zip}
                              InputContext={InputContext}
                            />

                            <SelectPopover
                              name="country"
                              grow
                              title="Country"
                              options={countriesOptions}
                              isSearchable
                              defaultValue={
                                pageData.country
                                  ? {
                                      value: pageData.country,
                                      label: pageData.country,
                                    }
                                  : null
                              }
                              InputContext={InputContext}
                            />
                          </InputLine>

                          <InputLine title="Contact">
                            <Input
                              type="text"
                              name="email"
                              title="Email"
                              grow
                              defaultValue={pageData.email}
                              InputContext={InputContext}
                            />
                            <PhoneNumberInput
                              type="text"
                              name="phone_number"
                              title="Phone Number"
                              grow
                              value={pageData.phone_number}
                              InputContext={InputContext}
                            />
                          </InputLine>

                          <InputLine title="Bank Information">
                            <Input
                              type="text"
                              name="bank_name"
                              title="Bank Name"
                              grow
                              defaultValue={pageData.bank_name}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="bank_account"
                              title="Bank Account"
                              grow
                              defaultValue={pageData.bank_account}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="bank_routing_number"
                              title="Bank Routing Number"
                              grow
                              defaultValue={pageData.bank_routing_number}
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
