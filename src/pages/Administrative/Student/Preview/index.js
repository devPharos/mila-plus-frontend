import { Form } from "@unform/web";
import {
  Building,
  Contact,
  GraduationCap,
  Loader2,
  NotebookPen,
  NotebookTabs,
  Pencil,
  Trash,
  Trash2,
  User,
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
import {
  countries_list,
  getPriceLists,
  getRegistries,
  handleUpdatedFields,
} from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import Textarea from "~/components/RegisterForm/Textarea";
import DatePicker from "~/components/RegisterForm/DatePicker";
import SelectCountry from "~/components/RegisterForm/SelectCountry";
import { format, parseISO } from "date-fns";
import CountryList from "country-list-with-dial-code-and-flag";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import { FullGridContext } from "../..";
import {
  genderOptions,
  inactiveReasonsOptions,
  optionsCategory,
  optionsStatus,
  optionsSubStatus,
  yesOrNoOptions,
} from "~/functions/selectPopoverOptions";
import { app } from "~/services/firebase";
import PricesSimulation from "~/components/PricesSimulation";
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
    name: "",
    last_name: "",
    email: "",
    preferred_contact_form: "",
    visa_expiration: null,
    birth_country: "",
    birth_state: "",
    birth_city: "",
    gender: null,
    date_of_birth: null,
    passport_number: "",
    visa_number: "",
    nsevis: "",
    whatsapp: "",
    whatsapp_ddi: "",
    home_country_phone_ddi: "",
    home_country_phone: "",
    address: "",
    loaded: false,
    discount_id: null,
    discount: null,
    total_tuition: 0,
    total_discount: 0,
    registration_fee: 0,
    books: 0,
    tuition_original_price: 0,
    tuition_in_advance: false,
    inactive_reason: "",
    searchFields: {
      filial_id: null,
      processtype_id: null,
      processsubstatus_id: null,
    },
  });
  const [countriesList, setCountriesList] = useState([]);
  const [formType, setFormType] = useState(defaultFormType);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("student-information");
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

  const countriesOptions = countries_list.map((country) => {
    return { value: country, label: country };
  });

  useEffect(() => {
    async function getCountriesList() {
      const getList = CountryList.getAll().map((country) => {
        return {
          value: country.dial_code,
          label: country.flag + " " + country.dial_code + " " + country.name,
          code: country.dial_code,
          name: country.name,
        };
      });
      setCountriesList(getList);
    }
    async function getDefaultFilialOptions() {
      const { data } = await api.get("/filials");
      const retGroupOptions = data.map((filial) => {
        return { value: filial.id, label: filial.name };
      });
      setFilialOptions(retGroupOptions);
    }
    async function getTypesOptions() {
      const { data } = await api.get("/processtypes");
      const retTypesOptions = data.map((type) => {
        return { value: type.id, label: type.name };
      });
      return retTypesOptions;
    }
    async function getSubStatusOptions() {
      const { data } = await api.get("/processsubstatuses");
      const retSubStatusOptions = data.map((subStatus) => {
        return {
          value: subStatus.id,
          label: subStatus.name,
          father_id: subStatus.processtype_id,
        };
      });
      retSubStatusOptions.push({ value: 0, label: "Select..." });
      return retSubStatusOptions;
    }
    async function getPageData() {
      const filialOptions = await getDefaultFilialOptions();
      const ddiOptions = await getCountriesList();
      const typesOptions = await getTypesOptions();
      const subStatusOptions = await getSubStatusOptions();
      if (id !== "new") {
        try {
          const { data } = await api.get(`/students/${id}`);
          setPageData({
            ...data,
            searchFields: {
              processtype_id: data.processtype_id,
              processsubstatus_id: data.processsubstatus_id,
              filial_id: data.filial_id,
            },
            typesOptions,
            subStatusOptions,
            loaded: true,
            ddiOptions,
            filialOptions,
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
          console.log(err);
          // toast(err.response.data.error, { type: "error", autoClose: 3000 });
        }
      } else {
        setPageData({ ...pageData, loaded: true, ddiOptions, filialOptions });
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
        const { date_of_birth, visa_expiration } = data;
        delete data.id;
        const response = await api.post(`/students`, {
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
        console.log(err);
        // toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    } else if (id !== "new") {
      const updated = handleUpdatedFields(data, pageData);

      if (updated.length > 0) {
        const objUpdated = Object.fromEntries(updated);
        const { date_of_birth, visa_expiration } = objUpdated;
        try {
          await api.put(`/students/${id}`, {
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
          // toast(err.response.data.error, { type: "error", autoClose: 3000 });
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
      await api.delete(`students/${id}`);
      toast("Group Inactivated!", { autoClose: 1000 });
      handleOpened(null);
    } catch (err) {
      console.log(err);
      // toast(err.response.data.error, { type: "error", autoClose: 3000 });
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
              <p className="border-b mb-1 pb-1">Prospect Information</p>
              <div className="flex flex-row items-center gap-1 text-xs">
                <strong>Name:</strong> {pageData.name}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-row items-start justify-between gap-4">
            <div className="flex flex-col items-center justify-between text-xs w-40 gap-4">
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="student-information"
              >
                <GraduationCap size={16} /> Student Information
              </RegisterFormMenu>

              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="student-admission"
                disabled={id === "new"}
                messageOnDisabled="Create the student to be able to access this menu"
              >
                <NotebookPen size={16} /> Admission
              </RegisterFormMenu>

              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="student-academic"
                disabled={id === "new"}
                messageOnDisabled="Create the student to be able to access this menu"
              >
                <Contact size={16} /> Academic
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
                          title="student-information"
                          activeMenu={activeMenu === "student-information"}
                        >
                          {auth.filial.id === 1 && (
                            <InputLine title="Filial">
                              <SelectPopover
                                name="filial_id"
                                required
                                title="Filial"
                                isSearchable
                                defaultValue={filialOptions.filter(
                                  (filial) =>
                                    filial.value === pageData.filial_id
                                )}
                                onChange={(el) => {
                                  setPageData({
                                    ...pageData,
                                    searchFields: {
                                      ...pageData.searchFields,
                                      filial_id: el.value,
                                    },
                                  });
                                }}
                                options={filialOptions}
                                InputContext={InputContext}
                              />
                            </InputLine>
                          )}
                          <InputLine title="General Data">
                            <Input
                              type="hidden"
                              name="category"
                              required
                              grow
                              title="Category"
                              defaultValue="Student"
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="registration_number"
                              required
                              readOnly={id !== "new"}
                              title="Registration Number"
                              defaultValue={pageData.registration_number}
                              InputContext={InputContext}
                            />
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
                              name="last_name"
                              required
                              grow
                              title="Last Name"
                              defaultValue={pageData.last_name}
                              InputContext={InputContext}
                            />
                            <SelectPopover
                              name="gender"
                              required
                              title="Gender"
                              isSearchable
                              defaultValue={genderOptions.find(
                                (gender) => gender.value === pageData.gender
                              )}
                              options={genderOptions}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine>
                            <DatePicker
                              name="date_of_birth"
                              grow
                              title="Birthday "
                              defaultValue={
                                pageData.date_of_birth
                                  ? parseISO(pageData.date_of_birth)
                                  : null
                              }
                              placeholderText="MM/DD/YYYY"
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="passport_number"
                              grow
                              title="Passport Number"
                              placeholder="-----"
                              defaultValue={pageData.passport_number}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="visa_number"
                              grow
                              title="Visa Number"
                              placeholder="-----"
                              defaultValue={pageData.visa_number}
                              InputContext={InputContext}
                            />
                            <DatePicker
                              name="visa_expiration"
                              title="Visa Expiration"
                              defaultValue={
                                pageData.visa_expiration
                                  ? parseISO(pageData.visa_expiration)
                                  : null
                              }
                              placeholderText="MM/DD/YYYY"
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="nsevis"
                              title="NSEVIS"
                              grow
                              defaultValue={pageData.nsevis}
                              placeholder="-----"
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine title="Enrollment">
                            <SelectPopover
                              name="status"
                              required
                              title="Status"
                              readOnly={id !== "new"}
                              isSearchable
                              defaultValue={optionsStatus.find(
                                (opt) => opt.value === pageData.status
                              )}
                              options={optionsStatus}
                              InputContext={InputContext}
                            />
                            {pageData.status === "Inactive" && (
                              <SelectPopover
                                name="inactive_reason"
                                grow
                                readOnly={id !== "new"}
                                title="Inactive Reason"
                                defaultValue={inactiveReasonsOptions.find(
                                  (opt) =>
                                    opt.value === pageData.inactive_reason
                                )}
                                options={inactiveReasonsOptions}
                                InputContext={InputContext}
                              />
                            )}
                            <SelectPopover
                              name="processtype_id"
                              grow
                              required
                              readOnly={id !== "new"}
                              title="Type"
                              disabled={pageData.enrollmentProcess}
                              onChange={(el) => {
                                setPageData({
                                  ...pageData,
                                  searchFields: {
                                    ...pageData.searchFields,
                                    processsubstatus_id: null,
                                    processtype_id: el.value,
                                  },
                                });
                                setSuccessfullyUpdated(false);
                              }}
                              defaultValue={
                                pageData.processtype_id
                                  ? pageData.typesOptions.find(
                                      (type) =>
                                        type.value === pageData.processtype_id
                                    )
                                  : null
                              }
                              options={pageData.typesOptions}
                              InputContext={InputContext}
                            />
                            <SelectPopover
                              name="processsubstatus_id"
                              grow
                              required
                              readOnly={id !== "new"}
                              disabled={pageData.enrollmentProcess}
                              title="Sub Status"
                              onChange={(el) => {
                                setSuccessfullyUpdated(false);
                                setPageData({
                                  ...pageData,
                                  searchFields: {
                                    ...pageData.searchFields,
                                    processsubstatus_id: el.value,
                                  },
                                });
                              }}
                              isSearchable
                              defaultValue={optionsSubStatus.find(
                                (substatus) =>
                                  substatus.value ===
                                  pageData.processsubstatus_id
                              )}
                              options={optionsSubStatus.filter(
                                (type) =>
                                  type.type_id ===
                                  pageData.searchFields.processtype_id
                              )}
                              InputContext={InputContext}
                            />
                            <SelectPopover
                              name="category"
                              required
                              title="Category"
                              readOnly={id !== "new"}
                              isSearchable
                              defaultValue={optionsCategory.find(
                                (opt) => opt.value === pageData.category
                              )}
                              options={optionsCategory}
                              InputContext={InputContext}
                            />
                          </InputLine>

                          <PricesSimulation
                            student={pageData}
                            InputContext={InputContext}
                            FullGridContext={FullGridContext}
                            generalForm={generalForm}
                            showAdmissionDiscounts={true}
                            isAdmissionDiscountChangable={true}
                            showFinancialDiscounts={true}
                            isFinancialDiscountChangable={false}
                          />

                          <InputLine title="Location">
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
                              name="zip"
                              grow
                              title="Zip Code"
                              defaultValue={pageData.zip}
                              InputContext={InputContext}
                            />
                            <SelectPopover
                              name="birth_country"
                              grow
                              title="Country"
                              options={countriesOptions}
                              isSearchable
                              defaultValue={countriesOptions.find(
                                (country) =>
                                  country.value === pageData.birth_country
                              )}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="state"
                              grow
                              title="State"
                              defaultValue={pageData.state}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="city"
                              grow
                              title="City"
                              defaultValue={pageData.city}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine title="Contact">
                            <Input
                              type="text"
                              name="email"
                              required
                              title="E-mail"
                              grow
                              defaultValue={pageData.email}
                              InputContext={InputContext}
                            />
                            <PhoneNumberInput
                              type="text"
                              grow
                              name="whatsapp"
                              title="Whatsapp"
                              isPhoneNumber
                              value={pageData.whatsapp}
                              InputContext={InputContext}
                            />
                            <PhoneNumberInput
                              type="text"
                              grow
                              name="home_country_phone"
                              title="Home Country Phone"
                              value={pageData.home_country_phone}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine>
                            <Input
                              type="text"
                              name="preferred_contact_form"
                              grow
                              title="Preferred Contact Form"
                              defaultValue={pageData.preferred_contact_form}
                              InputContext={InputContext}
                            />
                          </InputLine>
                        </InputLineGroup>
                        <InputLineGroup
                          title="student-admission"
                          activeMenu={activeMenu === "student-admission"}
                        >
                          <InputLine title="Admission">
                            <DatePicker
                              name="enrollment_date"
                              grow
                              title="Enrollment Date "
                              defaultValue={null}
                              placeholderText="MM/DD/YYYY"
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="agent"
                              grow
                              title="Agent"
                              defaultValue={pageData.Agent}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine>
                            <DatePicker
                              name="original_start_date"
                              grow
                              title="Original Start Date "
                              defaultValue={null}
                              placeholderText="MM/DD/YYYY"
                              InputContext={InputContext}
                            />
                            <DatePicker
                              name="updated_start_date"
                              grow
                              title="Updated Start Date "
                              defaultValue={null}
                              placeholderText="MM/DD/YYYY"
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine>
                            <Input
                              name="how_did_you_hear_about_mila"
                              grow
                              title="How did you hear about MILA?"
                              defaultValue={
                                pageData.how_did_you_hear_about_mila
                              }
                              InputContext={InputContext}
                            />
                          </InputLine>
                        </InputLineGroup>
                        <InputLineGroup
                          title="student-academic"
                          activeMenu={activeMenu === "student-academic"}
                        >
                          <InputLine title="Academic">
                            <DatePicker
                              name="program_start_date"
                              grow
                              title="Program Start Date "
                              defaultValue={null}
                              placeholderText="MM/DD/YYYY"
                              InputContext={InputContext}
                            />
                            <DatePicker
                              name="program_end_date"
                              grow
                              title="Program End Date "
                              defaultValue={null}
                              placeholderText="MM/DD/YYYY"
                              InputContext={InputContext}
                            />
                            <DatePicker
                              name="start_date"
                              grow
                              title="Start Date "
                              defaultValue={null}
                              placeholderText="MM/DD/YYYY"
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine title="Placement Test">
                            <Input
                              type="text"
                              name="placement_test_location"
                              grow
                              title="Placement Test Location"
                              defaultValue={pageData.placement_test_location}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="placement_test_score"
                              grow
                              title="Placement Test Score"
                              defaultValue={pageData.placement_test_score}
                              InputContext={InputContext}
                            />
                            <Input
                              name="level"
                              grow
                              title="Level"
                              defaultValue={pageData.level}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine title="Group">
                            <Input
                              name="group"
                              grow
                              title="Group Name"
                              defaultValue={pageData.group}
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
