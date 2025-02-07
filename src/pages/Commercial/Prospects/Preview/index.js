// prospect preview page
import { Form } from "@unform/web";
import {
  Building,
  CheckCircle,
  CircleCheckBig,
  CircleDashed,
  CircleEllipsis,
  CirclePlay,
  CircleX,
  Contact,
  Edit,
  Files,
  GitMerge,
  ListMinus,
  Loader2,
  LoaderCircle,
  Mail,
  Pencil,
  Play,
  Send,
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
  formatter,
  getPriceLists,
  getRegistries,
  handleUpdatedFields,
} from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import DatePicker from "~/components/RegisterForm/DatePicker";
import SelectCountry from "~/components/RegisterForm/SelectCountry";
import { format, parseISO } from "date-fns";
import CountryList from "country-list-with-dial-code-and-flag";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import TransferEligibility from "./TransferEligibility";
import EnrollmentProcess from "./EnrollmentProcess";
import PlacementTest from "./PlacementTest";
import { FullGridContext } from "../..";
import {
  genderOptions,
  optionsSubStatus,
  yesOrNoOptions,
} from "~/functions/selectPopoverOptions";
import { Scope } from "@unform/core";
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
  const [loading, setLoading] = useState(false);
  const [pageData, setPageData] = useState({
    name: "",
    last_name: "",
    email: "",
    visa_expiration: null,
    gender: null,
    processtype_id: null,
    processsubstatus_id: null,
    status: "Waiting",
    date_of_birth: null,
    loaded: false,
    discount_id: null,
    discount: null,
    total_tuition: 0,
    total_discount: 0,
    registration_fee: 0,
    books: 0,
    tuition_original_price: 0,
    tuition_in_advance: false,
    searchFields: {
      filial_id: null,
      processtype_id: null,
      processsubstatus_id: null,
    },
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
  const [countriesList, setCountriesList] = useState([]);
  const [filialOptions, setFilialOptions] = useState([]);
  const [agentOptions, setAgentOptions] = useState([]);
  const generalForm = useRef();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    document.getElementById("scrollPage").scrollTo(0, 0);
  }, [activeMenu]);

  const countriesOptions = countries_list.map((country) => {
    return { value: country, label: country };
  });

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
  async function getDefaultAgentOptions() {
    const { data } = await api.get("/agents");
    const retAgentOptions = data.map((agent) => {
      return { value: agent.id, label: agent.name };
    });
    setAgentOptions(retAgentOptions);
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

  async function getPageData(prospectId = null) {
    const filialOptions = await getDefaultFilialOptions();
    const agentOptions = await getDefaultAgentOptions();
    const ddiOptions = await getCountriesList();
    const typesOptions = await getTypesOptions();
    const subStatusOptions = await getSubStatusOptions();
    if (!prospectId) {
      prospectId = id;
    }
    if (prospectId !== "new") {
      try {
        const { data } = await api.get(`/prospects/${prospectId}`);
        setPageData({
          ...data,
          searchFields: {
            processtype_id: data.processtype_id,
            processsubstatus_id: data.processsubstatus_id,
            filial_id: data.filial_id,
          },
          find_processtype_id: data.processtype_id,
          loaded: true,
          ddiOptions,
          filialOptions,
          agentOptions,
          typesOptions,
          subStatusOptions,
          transferEligibility: data.enrollments.find(
            (enrollment) => enrollment.application === "Transfer Eligibility"
          ),
          enrollmentProcess: data.enrollments.find(
            (enrollment) => enrollment.application === "Enrollment Process"
          ),
          placementTest: data.enrollments.find(
            (enrollment) => enrollment.application === "Placement Test"
          ),
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
      setPageData({
        ...pageData,
        loaded: true,
        ddiOptions,
        filialOptions,
        typesOptions,
        subStatusOptions,
      });
      setFormType("full");
    }
  }

  useEffect(() => {
    getPageData();
  }, []);

  useEffect(() => {
    async function updatePriceLists() {
      const { priceLists, discountLists } = await getPriceLists(
        pageData.searchFields
      );
      setPageData({
        ...pageData,
        priceLists,
        discountLists,
      });
    }
    if (
      pageData.searchFields.filial_id &&
      pageData.searchFields.processtype_id &&
      pageData.searchFields.processsubstatus_id
    ) {
      updatePriceLists();
    }
  }, [
    pageData.searchFields.filial_id,
    pageData.searchFields.processtype_id,
    pageData.searchFields.processsubstatus_id,
  ]);

  async function handleGeneralFormSubmit(data) {
    // console.log(data.whatsapp);
    // return;
    if (
      data.processsubstatus_id &&
      optionsSubStatus.find(
        (subStatus) => subStatus.value === data.processsubstatus_id
      ).type_id !== data.processtype_id
    ) {
      toast("Sub Status is not valid for this Type!", {
        autoClose: 1000,
        type: "error",
        transition: Zoom,
      });
      return;
    }
    if (successfullyUpdated) {
      toast("No need to be saved!", {
        autoClose: 1000,
        type: "info",
        transition: Zoom,
      });
      return;
    }
    delete data.status;
    if (id === "new") {
      try {
        const { date_of_birth, visa_expiration } = data;
        const response = await api.post(`/prospects`, {
          ...data,
          date_of_birth: date_of_birth
            ? format(date_of_birth, "yyyy-MM-dd")
            : null,
          visa_expiration: visa_expiration
            ? format(visa_expiration, "yyyy-MM-dd")
            : null,
        });
        setOpened(response.data.id);
        // setPageData({ ...pageData, ...data });
        getPageData(response.data.id);
        setSuccessfullyUpdated(true);
        toast("Saved!", { autoClose: 1000 });
        // handleOpened(null);
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
        toast("No need to be saved!", {
          autoClose: 1000,
          type: "info",
          transition: Zoom,
        });
        setSuccessfullyUpdated(true);
        handleOpened(null);
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
      toast(err.response.data.error, { type: "error", autoClose: 3000 });
    }
  }

  async function handleStartProcess(processType = "") {
    if (!processType) {
      return;
    }
    setLoading(true);
    try {
      await api
        .post(`/enrollments/start-process/`, {
          student_id: id,
          processType,
        })
        .then(({ data }) => {
          setPageData({
            ...pageData,
            enrollments: pageData.enrollments.push(data),
          });
          getPageData();
          toast("Transfer Eligibility process has been started!", {
            autoClose: 1000,
          });
          setLoading(false);
        });
    } catch (err) {
      setLoading(false);
      toast("Error!", { autoClose: 1000 });
      console.log(err);
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
                name="general"
              >
                <Contact size={16} /> General
              </RegisterFormMenu>
              {id !== "new" && (
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  name="timeline"
                >
                  <Building size={16} /> Timeline
                </RegisterFormMenu>
              )}
              {id !== "new" && (
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  name="follow-up"
                >
                  <ListMinus size={16} /> Follow Up
                </RegisterFormMenu>
              )}
              {/* {id !== "new" && (
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  name="documents"
                >
                  <Files size={16} /> Documents
                </RegisterFormMenu>
              )} */}
              {id !== "new" && (
                <div className="border-b w-full border-slate-500 text-slate-700">
                  Process Flow
                </div>
              )}
              {id !== "new" && pageData.processsubstatus_id === 4 && (
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  name="transfer-eligibility"
                >
                  {pageData.transferEligibility ? (
                    <CirclePlay size={16} />
                  ) : pageData.transferEligibility &&
                    pageData.transferEligibility.form_step === "finished" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <CircleX size={16} />
                  )}{" "}
                  Transfer Eligibility
                </RegisterFormMenu>
              )}
              {id !== "new" && (
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  name="enrollment-process"
                >
                  {pageData.enrollmentProcess ? (
                    <CirclePlay size={16} />
                  ) : pageData.enrollmentProcess &&
                    pageData.enrollmentProcess.form_step === "finished" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <CircleX size={16} />
                  )}{" "}
                  Enrollment Process
                </RegisterFormMenu>
              )}
              {id !== "new" && (
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  name="placement-test"
                >
                  {pageData.placementTest ? (
                    <CirclePlay size={16} />
                  ) : pageData.placementTest &&
                    pageData.placementTest.form_step === "finished" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <CircleX size={16} />
                  )}{" "}
                  Placement Test
                </RegisterFormMenu>
              )}
            </div>
            <div className="border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start">
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
                  //   handleOutsideMail,
                  canceled: pageData.canceled_at,
                }}
              >
                <div
                  id="scrollPage"
                  className="flex flex-col items-start justify-start text-sm overflow-y-scroll"
                >
                  <Form
                    ref={generalForm}
                    onSubmit={handleGeneralFormSubmit}
                    className="w-full"
                  >
                    <FormHeader
                      access={access}
                      loading={loading}
                      title={pageData.name + " " + pageData.last_name}
                      registry={registry}
                      InputContext={InputContext}
                      disabled={!pageData.processtype_id}
                    />
                    {id === "new" || pageData.loaded ? (
                      <>
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
                          <InputLine title="Agent">
                            <SelectPopover
                              name="agent_id"
                              required
                              title="Responsible Agent"
                              isSearchable
                              defaultValue={agentOptions.filter(
                                (agent) => agent.value === pageData.agent_id
                              )}
                              options={agentOptions}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine title="General Data">
                            <Input
                              type="hidden"
                              name="category"
                              required
                              grow
                              title="Category"
                              defaultValue="Prospect"
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
                            {/* <Input
                              type="text"
                              name="middle_name"
                              grow
                              title="Middle Name"
                              defaultValue={pageData.middle_name}
                              InputContext={InputContext}
                            /> */}
                            <Input
                              type="text"
                              name="last_name"
                              required
                              grow
                              title="Last Name"
                              defaultValue={pageData.last_name}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine>
                            <SelectPopover
                              name="gender"
                              required
                              grow
                              title="Gender"
                              isSearchable
                              defaultValue={genderOptions.find(
                                (gender) => gender.value === pageData.gender
                              )}
                              options={genderOptions}
                              InputContext={InputContext}
                            />
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
                          </InputLine>
                          <InputLine>
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
                              name="processtype_id"
                              grow
                              required
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
                          </InputLine>

                          <PricesSimulation
                            student={pageData}
                            InputContext={InputContext}
                            FullGridContext={FullGridContext}
                            generalForm={generalForm}
                            showAdmissionDiscounts={true}
                            isAdmissionDiscountChangable={true}
                            showFinancialDiscounts={false}
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
                          title="TIMELINE"
                          activeMenu={activeMenu === "timeline"}
                        >
                          {pageData.enrollmentProcess &&
                            pageData.enrollmentProcess.enrollmenttimelines &&
                            pageData.enrollmentProcess.enrollmenttimelines
                              .length > 0 &&
                            pageData.enrollmentProcess.enrollmenttimelines
                              .sort((a, b) => a.created_at < b.created_at)
                              .map((timeline, index) => {
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
                                      {/* <Scope
                                        path={`students.processsubstatuses`}
                                      >
                                        <Input
                                          type="text"
                                          name="name"
                                          grow
                                          title="Sub Status"
                                          defaultValue={
                                            pageData.subStatusOptions.find(
                                              (subStatus) =>
                                                subStatus.value ===
                                                pageData.processsubstatus_id
                                            ).label
                                          }
                                          InputContext={InputContext}
                                        />
                                      </Scope> */}
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
                              })}
                        </InputLineGroup>

                        {/* <InputLineGroup
                          title="Documents"
                          activeMenu={activeMenu === "documents"}
                        >
                          {pageData.enrollmentdocuments &&
                            pageData.enrollmentdocuments.length > 0 && (
                              <InputLine subtitle="Attached Files">
                                <div className="flex flex-col justify-center items-start gap-4">
                                  {pageData.enrollmentdocuments &&
                                    pageData.enrollmentdocuments.map(
                                      (enrollmentdocument, index) => {
                                        if (
                                          enrollmentdocument.document_id ===
                                          document.id
                                        ) {
                                          return (
                                            <>
                                              <div
                                                key={index}
                                                className="flex flex-row justify-center items-center gap-2"
                                              >
                                                <a
                                                  href={
                                                    enrollmentdocument.file.url
                                                  }
                                                  target="_blank"
                                                  className="text-xs"
                                                >
                                                  <div className="flex flex-row items-center border px-4 py-2 gap-1 rounded-md bg-gray-100 hover:border-gray-300">
                                                    <Files size={16} />
                                                    {
                                                      enrollmentdocument.file
                                                        .name
                                                    }
                                                  </div>
                                                </a>
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleDeleteDocument(
                                                      enrollmentdocument.id
                                                    )
                                                  }
                                                  className="text-xs text-red-700 cursor-pointer flex flex-row items-center justify-start gap-1 mt-1 px-2 py-1 rounded hover:bg-red-100"
                                                >
                                                  <X size={12} /> Delete
                                                </button>
                                              </div>
                                            </>
                                          );
                                        }
                                      }
                                    )}
                                </div>
                              </InputLine>
                            )}
                        </InputLineGroup> */}

                        <InputLineGroup
                          title="Transfer Eligibility"
                          activeMenu={activeMenu === "transfer-eligibility"}
                        >
                          <TransferEligibility
                            enrollment={pageData.transferEligibility}
                            loading={loading}
                            handleStartProcess={handleStartProcess}
                          />
                        </InputLineGroup>
                        <InputLineGroup
                          title="Enrollment Process"
                          activeMenu={activeMenu === "enrollment-process"}
                        >
                          <EnrollmentProcess
                            enrollment={pageData.enrollmentProcess}
                            issuer={pageData.issuer ? pageData.issuer : null}
                            student_id={id}
                            loading={loading}
                            setLoading={setLoading}
                            handleStartProcess={handleStartProcess}
                          />
                        </InputLineGroup>
                        <InputLineGroup
                          title="Placement Text"
                          activeMenu={activeMenu === "placement-test"}
                        >
                          <PlacementTest
                            enrollment={pageData.placementTest}
                            loading={loading}
                            handleStartProcess={handleStartProcess}
                          />
                        </InputLineGroup>
                      </>
                    ) : (
                      <FormLoading />
                    )}
                  </Form>
                </div>
              </InputContext.Provider>
            </div>
          </div>
        )
      ) : null}
    </Preview>
  );
}
