import { Form } from "@unform/web";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import RegisterFormMenu from "~/components/RegisterForm/Menu";
import api from "~/services/api";
import { toast } from "react-toastify";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { countries_list, getRegistries } from "~/functions";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import { FullGridContext } from "../..";
import { AlertContext } from "~/App";
import {
  Ambulance,
  BadgeDollarSign,
  BookText,
  Contact,
  FileInputIcon,
  MessageSquareShare,
  Send,
  User,
} from "lucide-react";
import Input from "~/components/RegisterForm/Input";
import PDFViewer from "~/components/PDFViewer";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import {
  addressOptions,
  dependentRelationshipTypeOptions,
  genderOptions,
  maritalStatusOptions,
  relationshipTypeOptions,
  scheduleOptions,
  sponsorRelationshipTypeOptions,
  yesOrNoOptions,
} from "~/functions/selectPopoverOptions";
import DatePicker from "~/components/RegisterForm/DatePicker";
import { parseISO } from "date-fns";
import PhoneNumberInput from "~/components/RegisterForm/PhoneNumberInput";
import { Scope } from "@unform/core";
import FileInput from "~/components/RegisterForm/FileInput";
import { organizeMultiAndSingleFiles } from "~/functions/uploadFile";

export const InputContext = createContext({});

export default function PagePreview({
  access,
  id,
  defaultFormType = "preview",
}) {
  const { alertBox } = useContext(AlertContext);
  const { handleOpened, successfullyUpdated, setSuccessfullyUpdated } =
    useContext(FullGridContext);
  const [pageData, setPageData] = useState({
    class_number: "",
    status: "Active",
    quantity_of_students: 0,
    students: [],
    levels: [],
    groups: [],
  });
  const [formType, setFormType] = useState(defaultFormType);
  const [fullscreen, setFullscreen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("student");
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
  const [openedDocumentIndex, setOpenedDocumentIndex] = useState(0);

  const countriesOptions = countries_list.map((country) => {
    return { value: country, label: country };
  });

  useEffect(() => {
    document.getElementById("scrollPage").scrollTo(0, 0);
  }, [activeMenu]);

  async function getPageData() {
    try {
      const { data } = await api.get(`/i20pendings/${id}`);
      setPageData({
        ...data,
        loaded: true,
      });
      if (data.i20form.status === "Confirmed") {
        setActiveMenu("i-20");
      }
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
  }

  function handleOpenPDF() {
    api
      .get(`/pdf/new-enrollment/${pageData.i20form.enrollment_id}`, {
        responseType: "blob",
      })
      .then((res) => {
        const pdfBlob = new Blob([res.data], { type: "application/pdf" });
        saveAs(pdfBlob, `enrollment_${pageData.i20form.enrollment_id}_new.pdf`);
      });
  }

  useEffect(() => {
    getPageData();
    setSuccessfullyUpdated(false);
  }, []);

  async function handleGeneralFormSubmit(data) {
    function send(file = null) {
      api
        .put(`/enrollments/${id}`, {
          ...data,
          new_program: data.new_program
            ? { ...data.new_program, file_id: file }
            : null,
        })
        .then((response) => {
          if (activeMenu === "i-20") {
            toast("I-20 Submitted successfully!", { autoClose: 1000 });
            setSuccessfullyUpdated(true);
            handleOpened(null);
            return;
          }
          toast("Saved!", { autoClose: 1000 });
          setSuccessfullyUpdated(true);
          setPageData({
            ...pageData,
            i20form: { ...pageData.i20form, status: "Confirmed" },
          });
          setActiveMenu("i-20");
        })
        .catch((err) => {
          console.log(err);
          toast(err, { type: "error", autoClose: 3000 });
        });
    }
    if (activeMenu === "i-20") {
      if (data.new_program.file_id) {
        const allPromises = organizeMultiAndSingleFiles(
          [data.new_program],
          "StudentPrograms"
        );

        Promise.all(allPromises).then(async (files) => {
          files.map(async (file) => {
            if (!file) {
              return;
            }
            send(file);
          });
        });
      }
    } else {
      send();
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
              name="student"
            >
              <User size={16} /> Student Information
            </RegisterFormMenu>
            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="emergency-contact"
            >
              <Ambulance size={16} /> Emergency Contact
            </RegisterFormMenu>
            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="enrollment"
            >
              <BookText size={16} /> Enrollment
            </RegisterFormMenu>
            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="dependents"
            >
              <Contact size={16} /> Dependents
            </RegisterFormMenu>
            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="affidavit-of-support"
            >
              <BadgeDollarSign size={16} /> Affidavit of Support
            </RegisterFormMenu>
            <RegisterFormMenu
              setActiveMenu={() => handleOpenPDF()}
              activeMenu={activeMenu}
              name="i-20"
            >
              <FileInputIcon size={16} /> Enrollment PDF
            </RegisterFormMenu>

            {pageData?.i20form?.status === "Confirmed" && (
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="i-20"
              >
                <FileInputIcon size={16} /> I-20
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
                handleInactivate: () => null,
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
                  {pageData.loaded ? (
                    <>
                      <FormHeader
                        access={{ ...access, edit: false }}
                        title={`${
                          pageData.subject
                            ? pageData.subject
                            : "Enrollment Process"
                        }`}
                        registry={registry}
                        InputContext={InputContext}
                        saveText={`${
                          activeMenu !== "i-20"
                            ? "Save & Confirm"
                            : "Submit I-20"
                        }`}
                        saveIcon="Send"
                        // otherButtons={[
                        //   {
                        //     icon: "Plus",
                        //     text: "Add Dependent",
                        //     onClick: () => console.log("oi"),
                        //   },
                        // ]}
                        enableFullScreen={false}
                      />
                      <InputLineGroup
                        title="student"
                        activeMenu={activeMenu === "student"}
                      >
                        <div className="w-full flex flex-row justify-between items-start gap-4">
                          <div className="flex-1 flex flex-col justify-start items-start overflow-y-scroll h-[1040px]">
                            <Scope path={`studentData`}>
                              <InputLine title={`General Data`}>
                                <Input
                                  type="hidden"
                                  name="id"
                                  defaultValue={pageData.students.id}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="name"
                                  required
                                  grow
                                  title="Name"
                                  defaultValue={pageData.students.name}
                                  InputContext={InputContext}
                                />
                              </InputLine>
                              <InputLine>
                                <Input
                                  type="text"
                                  name="last_name"
                                  required
                                  grow
                                  title="Last Name"
                                  defaultValue={pageData.students.last_name}
                                  InputContext={InputContext}
                                />
                              </InputLine>
                              <InputLine>
                                <DatePicker
                                  name="date_of_birth"
                                  required
                                  grow
                                  title="Birth Date"
                                  defaultValue={
                                    pageData.students.date_of_birth
                                      ? parseISO(
                                          pageData.students.date_of_birth
                                        )
                                      : null
                                  }
                                  placeholderText="MM/DD/YYYY"
                                  InputContext={InputContext}
                                />
                              </InputLine>
                              <InputLine>
                                <SelectPopover
                                  name="marital_status"
                                  required
                                  grow
                                  title="Marital Status"
                                  isSearchable
                                  defaultValue={maritalStatusOptions.find(
                                    (maritalStatus) =>
                                      maritalStatus.value ===
                                      pageData.students.marital_status
                                  )}
                                  options={maritalStatusOptions}
                                  InputContext={InputContext}
                                />
                              </InputLine>
                              <InputLine title="Birth Location">
                                <Input
                                  type="text"
                                  name="birth_city"
                                  required
                                  grow
                                  title="Birth City"
                                  defaultValue={pageData.students.birth_city}
                                  InputContext={InputContext}
                                />
                              </InputLine>
                              <InputLine>
                                <Input
                                  type="text"
                                  name="birth_state"
                                  required
                                  grow
                                  title="Birth State"
                                  defaultValue={pageData.students.birth_state}
                                  InputContext={InputContext}
                                />
                              </InputLine>
                              <InputLine>
                                <SelectPopover
                                  name="birth_country"
                                  required
                                  grow
                                  title="Birth Country"
                                  isSearchable
                                  defaultValue={countriesOptions.find(
                                    (country) =>
                                      country.value ===
                                      pageData.students.birth_country
                                  )}
                                  options={countriesOptions}
                                  InputContext={InputContext}
                                />
                              </InputLine>
                              <InputLine>
                                <Input
                                  type="text"
                                  name="native_language"
                                  required
                                  grow
                                  title="Native Language"
                                  defaultValue={
                                    pageData.students.native_language
                                  }
                                  InputContext={InputContext}
                                />
                              </InputLine>
                              <InputLine>
                                <SelectPopover
                                  name="citizen_country"
                                  required
                                  grow
                                  title="Citizen Country"
                                  isSearchable
                                  defaultValue={countriesOptions.find(
                                    (country) =>
                                      country.value ===
                                      pageData.students.citizen_country
                                  )}
                                  options={countriesOptions}
                                  InputContext={InputContext}
                                />
                              </InputLine>
                              <InputLine title="Documentation">
                                <Input
                                  type="text"
                                  name="passport_number"
                                  required
                                  grow
                                  title="Passport Number"
                                  placeholder="-----"
                                  defaultValue={
                                    pageData.students.passport_number
                                  }
                                  InputContext={InputContext}
                                />
                              </InputLine>
                              <InputLine>
                                <DatePicker
                                  name="passport_expiration_date"
                                  required
                                  grow
                                  title="Passport Expiration Date"
                                  defaultValue={
                                    pageData.students.passport_expiration_date
                                      ? parseISO(
                                          pageData.students
                                            .passport_expiration_date
                                        )
                                      : null
                                  }
                                  placeholderText="MM/DD/YYYY"
                                  InputContext={InputContext}
                                />
                              </InputLine>
                              <InputLine>
                                {pageData.students.sub_status ===
                                  "Change of Visa Status" && (
                                  <DatePicker
                                    name="i94_expiration_date"
                                    required
                                    grow
                                    title="I94 Expiration Date"
                                    defaultValue={
                                      pageData.students.i94_expiration_date
                                        ? parseISO(
                                            pageData.students
                                              .i94_expiration_date
                                          )
                                        : null
                                    }
                                    placeholderText="MM/DD/YYYY"
                                    InputContext={InputContext}
                                  />
                                )}
                              </InputLine>
                              {pageData.students.sub_status !== "Initial" && (
                                <InputLine title="Admission Correspondence">
                                  <SelectPopover
                                    name="admission_correspondence_address"
                                    required
                                    grow
                                    title="Please check the box where you wish your admission correspondence to be mailed"
                                    options={addressOptions}
                                    defaultValue={addressOptions.find(
                                      (address) =>
                                        address.value ===
                                        pageData.admission_correspondence_address
                                    )}
                                    InputContext={InputContext}
                                  />
                                </InputLine>
                              )}
                              {pageData.students.sub_status !==
                                "Transfer In" && (
                                <>
                                  <InputLine title="Address in Home Country">
                                    <PhoneNumberInput
                                      type="text"
                                      name="home_country_phone"
                                      grow
                                      title="Phone Number"
                                      value={pageData.students.home_country_phone.replaceAll(
                                        " ",
                                        ""
                                      )}
                                      InputContext={InputContext}
                                    />
                                  </InputLine>
                                  <InputLine>
                                    <Input
                                      type="text"
                                      name="home_country_address"
                                      grow
                                      title="Address"
                                      defaultValue={
                                        pageData.students.home_country_address
                                      }
                                      InputContext={InputContext}
                                    />
                                  </InputLine>
                                  <InputLine>
                                    <Input
                                      type="text"
                                      name="home_country_zip"
                                      grow
                                      title="Zip Code"
                                      defaultValue={
                                        pageData.students.home_country_zip
                                      }
                                      InputContext={InputContext}
                                    />
                                  </InputLine>
                                  <InputLine>
                                    <Input
                                      type="text"
                                      name="home_country_city"
                                      grow
                                      title="City"
                                      defaultValue={
                                        pageData.students.home_country_city
                                      }
                                      InputContext={InputContext}
                                    />
                                  </InputLine>
                                  <InputLine>
                                    <Input
                                      type="text"
                                      name="home_country_state"
                                      grow
                                      title="State"
                                      defaultValue={
                                        pageData.students.home_country_state
                                      }
                                      InputContext={InputContext}
                                    />
                                  </InputLine>
                                  <InputLine>
                                    <SelectPopover
                                      name="home_country_country"
                                      grow
                                      title="Country"
                                      isSearchable
                                      defaultValue={countriesOptions.find(
                                        (country) =>
                                          country.value ===
                                          pageData.students.home_country_country
                                      )}
                                      options={countriesOptions}
                                      InputContext={InputContext}
                                    />
                                  </InputLine>
                                </>
                              )}
                              {pageData.students.sub_status !== "Initial" && (
                                <>
                                  <InputLine title="Address in United States">
                                    <PhoneNumberInput
                                      type="text"
                                      name="phone"
                                      grow
                                      title="USA Phone Number"
                                      value={pageData.students.phone.replaceAll(
                                        " ",
                                        ""
                                      )}
                                      InputContext={InputContext}
                                    />
                                  </InputLine>
                                  <InputLine>
                                    <Input
                                      type="text"
                                      name="address"
                                      grow
                                      title="USA Address"
                                      defaultValue={pageData.students.address}
                                      InputContext={InputContext}
                                    />
                                  </InputLine>
                                  <InputLine>
                                    <Input
                                      type="text"
                                      name="zip"
                                      grow
                                      title="USA Zip Code"
                                      isZipCode
                                      defaultValue={pageData.students.zip}
                                      InputContext={InputContext}
                                    />
                                  </InputLine>
                                </>
                              )}
                              {pageData.students.sub_status !== "Initial" && (
                                <>
                                  <InputLine>
                                    <Input
                                      type="text"
                                      name="city"
                                      grow
                                      title="USA City"
                                      defaultValue={pageData.students.city}
                                      InputContext={InputContext}
                                    />
                                  </InputLine>
                                  <InputLine>
                                    <Input
                                      type="text"
                                      name="state"
                                      grow
                                      title="USA State"
                                      defaultValue={pageData.students.state}
                                      InputContext={InputContext}
                                    />
                                  </InputLine>
                                </>
                              )}
                            </Scope>
                          </div>

                          <div className="flex-1 max-w-4xl h-[1040px]">
                            <div className="flex flex-row items-center justify-center gap-2">
                              <InputLine title={`Documents`}>
                                {pageData.enrollmentdocuments &&
                                  pageData.enrollmentdocuments.length > 0 &&
                                  pageData.enrollmentdocuments
                                    .filter(
                                      (doc) =>
                                        doc.documents?.subtype === "Student"
                                    )
                                    .map((enrollmentdocument, index) => (
                                      <button
                                        key={index}
                                        type="button"
                                        onClick={() =>
                                          setOpenedDocumentIndex(index)
                                        }
                                        className={`${
                                          openedDocumentIndex === index
                                            ? "bg-primary text-white"
                                            : "bg-secondary text-primary"
                                        } rounded-md py-4 px-8 my-2 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1`}
                                      >
                                        {
                                          enrollmentdocument?.documents
                                            ?.short_name
                                        }
                                      </button>
                                    ))}
                              </InputLine>
                            </div>

                            {pageData.enrollmentdocuments &&
                              pageData.enrollmentdocuments.length > 0 &&
                              pageData.enrollmentdocuments
                                .filter(
                                  (doc) => doc.documents?.subtype === "Student"
                                )
                                .map((enrollmentdocument, index) => {
                                  if (openedDocumentIndex === index) {
                                    return (
                                      <div className="overflow-y-scroll h-[420px]">
                                        <PDFViewer
                                          key={index}
                                          download={true}
                                          file={{
                                            url: enrollmentdocument.file?.url,
                                          }}
                                          height={900}
                                        />
                                      </div>
                                    );
                                  }
                                })}
                          </div>
                        </div>
                      </InputLineGroup>
                      <InputLineGroup
                        title="Emergency Contact"
                        activeMenu={activeMenu === "emergency-contact"}
                      >
                        <Scope path={`emergencyData`}>
                          <InputLine title="Emergency Contact">
                            <Input
                              type="hidden"
                              name="id"
                              defaultValue={
                                pageData.enrollmentemergencies[0].id
                              }
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="name"
                              required
                              grow
                              title="Full Name"
                              defaultValue={
                                pageData.enrollmentemergencies.length > 0
                                  ? pageData.enrollmentemergencies[0].name
                                  : ""
                              }
                              InputContext={InputContext}
                            />
                            {pageData.enrollmentemergencies.length > 0 ? (
                              <SelectPopover
                                name="relationship_type"
                                required
                                grow
                                title="Relationship Type"
                                options={relationshipTypeOptions}
                                isSearchable
                                defaultValue={relationshipTypeOptions.find(
                                  (relationshipType) =>
                                    relationshipType.value ===
                                    pageData.enrollmentemergencies[0]
                                      .relationship_type
                                )}
                                InputContext={InputContext}
                              />
                            ) : (
                              <SelectPopover
                                name="relationship_type"
                                required
                                grow
                                title="Relationship Type"
                                options={relationshipTypeOptions}
                                isSearchable
                                InputContext={InputContext}
                              />
                            )}
                          </InputLine>
                          <InputLine>
                            <Input
                              type="text"
                              name="email"
                              required
                              grow
                              title="E-mail"
                              defaultValue={
                                pageData.enrollmentemergencies.length > 0
                                  ? pageData.enrollmentemergencies[0].email
                                  : ""
                              }
                              InputContext={InputContext}
                            />
                            <PhoneNumberInput
                              type="text"
                              name="phone"
                              required
                              grow
                              title="Phone Number"
                              value={
                                pageData.enrollmentemergencies.length > 0
                                  ? pageData.enrollmentemergencies[0].phone.replaceAll(
                                      " ",
                                      ""
                                    )
                                  : ""
                              }
                              InputContext={InputContext}
                            />
                          </InputLine>
                        </Scope>
                      </InputLineGroup>
                      <InputLineGroup
                        title="enrollment"
                        activeMenu={activeMenu === "enrollment"}
                      >
                        <Scope path={`enrollmentData`}>
                          <InputLine title="Enrollment Information">
                            <Input
                              type="text"
                              name="plan_months"
                              required
                              title="How many months do you plan to study?"
                              defaultValue={pageData.plan_months}
                              InputContext={InputContext}
                            />
                            <SelectPopover
                              name="plan_schedule"
                              required
                              grow
                              title="What is your plan schedule?"
                              options={scheduleOptions}
                              isSearchable
                              defaultValue={scheduleOptions.find(
                                (schedule) =>
                                  schedule.value === pageData.plan_schedule
                              )}
                              InputContext={InputContext}
                            />
                            <DatePicker
                              name="plan_date"
                              required
                              grow
                              title="What date do you wish to begin classes (M)?"
                              defaultValue={
                                pageData.plan_date
                                  ? parseISO(pageData.plan_date)
                                  : null
                              }
                              placeholderText="MM/DD/YYYY"
                              InputContext={InputContext}
                            />
                          </InputLine>
                        </Scope>
                      </InputLineGroup>
                      <InputLineGroup
                        title="Dependent Information"
                        activeMenu={activeMenu === "dependents"}
                      >
                        {pageData.enrollmentdependents.length === 0 && (
                          <InputLine title="Dependent Information">
                            <p>No dependents.</p>
                          </InputLine>
                        )}
                        {pageData.enrollmentdependents.map(
                          (dependent, index) => {
                            return (
                              <div
                                key={index}
                                className="w-full flex flex-row justify-between items-start gap-4 pb-8"
                              >
                                <Scope path={`dependentsData[${index}]`}>
                                  <div className="flex-1 flex flex-col justify-start items-start">
                                    <InputLine title={`Dependent ${index + 1}`}>
                                      <Input
                                        type="hidden"
                                        name="id"
                                        defaultValue={dependent.id}
                                        InputContext={InputContext}
                                      />
                                    </InputLine>
                                    <InputLine>
                                      <Input
                                        type="text"
                                        name="name"
                                        required
                                        grow
                                        title="Full Name"
                                        defaultValue={dependent.name}
                                        InputContext={InputContext}
                                      />
                                    </InputLine>
                                    <InputLine>
                                      <SelectPopover
                                        name="gender"
                                        required
                                        grow
                                        title="Gender"
                                        options={genderOptions}
                                        isSearchable
                                        defaultValue={genderOptions.find(
                                          (gender) =>
                                            gender.value === dependent.gender
                                        )}
                                        InputContext={InputContext}
                                      />
                                    </InputLine>
                                    <InputLine>
                                      <SelectPopover
                                        name="relationship_type"
                                        required
                                        grow
                                        title="Relationship Type"
                                        options={
                                          dependentRelationshipTypeOptions
                                        }
                                        isSearchable
                                        defaultValue={dependentRelationshipTypeOptions.find(
                                          (relationshipType) =>
                                            relationshipType.value ===
                                            dependent.relationship_type
                                        )}
                                        InputContext={InputContext}
                                      />
                                    </InputLine>
                                    <InputLine>
                                      <Input
                                        type="text"
                                        name="email"
                                        required
                                        grow
                                        title="E-mail"
                                        defaultValue={dependent.email}
                                        InputContext={InputContext}
                                      />
                                    </InputLine>
                                    <InputLine>
                                      <PhoneNumberInput
                                        type="text"
                                        name="phone"
                                        required
                                        grow
                                        title="Phone Number"
                                        value={dependent.phone.replaceAll(
                                          " ",
                                          ""
                                        )}
                                        InputContext={InputContext}
                                      />
                                    </InputLine>
                                  </div>
                                </Scope>
                                <div className="flex-1 max-w-4xl h-[1040px]">
                                  <div className="flex flex-row items-center justify-center gap-2">
                                    <InputLine title={`Documents`}>
                                      {dependent.documents &&
                                        dependent.documents.length > 0 &&
                                        dependent.documents.map(
                                          (depDoc, index) => (
                                            <button
                                              key={index}
                                              type="button"
                                              onClick={() =>
                                                setOpenedDocumentIndex(index)
                                              }
                                              className={`bg-primary text-white
                                               rounded-md py-4 px-8 my-2 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1`}
                                            >
                                              {depDoc.documents?.short_name}
                                            </button>
                                          )
                                        )}
                                    </InputLine>
                                  </div>

                                  {pageData.enrollmentdocuments &&
                                    pageData.enrollmentdocuments.length > 0 &&
                                    pageData.enrollmentdocuments.map(
                                      (enrollmentdocument, index) => {
                                        if (openedDocumentIndex === index) {
                                          return (
                                            <div className="overflow-y-scroll h-[420px]">
                                              <PDFViewer
                                                key={index}
                                                download={true}
                                                file={{
                                                  url: enrollmentdocument.file
                                                    ?.url,
                                                }}
                                                height={900}
                                              />
                                            </div>
                                          );
                                        }
                                      }
                                    )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </InputLineGroup>
                      <InputLineGroup
                        title="Affidavit of Support"
                        activeMenu={activeMenu === "affidavit-of-support"}
                      >
                        {pageData.enrollmentsponsors &&
                          pageData.enrollmentsponsors.map((sponsor, index) => {
                            if (sponsor) {
                              return (
                                <div className="w-full flex flex-row justify-between items-start gap-4">
                                  <div className="flex-1 flex flex-col justify-start items-start overflow-y-scroll h-[1040px]">
                                    <Scope
                                      key={index}
                                      path={`sponsorsData[${index}]`}
                                    >
                                      <InputLine title={`Sponsor ${index + 1}`}>
                                        <Input
                                          type="hidden"
                                          name="id"
                                          defaultValue={sponsor.id}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="name"
                                          required
                                          grow
                                          title="Full Name"
                                          defaultValue={sponsor.name}
                                          InputContext={InputContext}
                                        />
                                        <SelectPopover
                                          name="relationship_type"
                                          required
                                          grow
                                          title="Relationship Type"
                                          options={
                                            sponsorRelationshipTypeOptions
                                          }
                                          isSearchable
                                          defaultValue={
                                            sponsorRelationshipTypeOptions.find(
                                              (relationshipType) =>
                                                relationshipType.value ===
                                                sponsor.relationship_type
                                            ) ||
                                            sponsorRelationshipTypeOptions[
                                              sponsorRelationshipTypeOptions.length -
                                                1
                                            ]
                                          }
                                          InputContext={InputContext}
                                        />
                                      </InputLine>
                                      <InputLine>
                                        <Input
                                          type="text"
                                          name="email"
                                          required
                                          grow
                                          title="E-mail"
                                          defaultValue={sponsor.email}
                                          InputContext={InputContext}
                                        />
                                        <PhoneNumberInput
                                          type="text"
                                          name="phone"
                                          required
                                          grow
                                          title="Phone Number"
                                          value={sponsor.phone.replaceAll(
                                            " ",
                                            ""
                                          )}
                                          InputContext={InputContext}
                                        />
                                      </InputLine>
                                    </Scope>
                                  </div>

                                  <div className="flex-1 max-w-4xl h-[1040px]">
                                    <div className="flex flex-row items-center justify-center gap-2">
                                      <InputLine title={`Documents`}>
                                        {pageData.enrollmentdocuments &&
                                          pageData.enrollmentdocuments.length >
                                            0 &&
                                          pageData.enrollmentdocuments
                                            .filter(
                                              (doc) =>
                                                doc.documents?.subtype ===
                                                "Sponsor"
                                            )
                                            .map(
                                              (enrollmentdocument, index) => (
                                                <button
                                                  key={index}
                                                  type="button"
                                                  onClick={() =>
                                                    setOpenedDocumentIndex(
                                                      index
                                                    )
                                                  }
                                                  className={`${
                                                    openedDocumentIndex ===
                                                    index
                                                      ? "bg-primary text-white"
                                                      : "bg-secondary text-primary"
                                                  } rounded-md py-4 px-8 my-2 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1`}
                                                >
                                                  {
                                                    enrollmentdocument
                                                      ?.documents?.short_name
                                                  }
                                                </button>
                                              )
                                            )}
                                      </InputLine>
                                    </div>

                                    {pageData.enrollmentdocuments &&
                                      pageData.enrollmentdocuments.length > 0 &&
                                      pageData.enrollmentdocuments
                                        .filter(
                                          (doc) =>
                                            doc.documents?.subtype === "Sponsor"
                                        )
                                        .map((enrollmentdocument, index) => {
                                          if (openedDocumentIndex === index) {
                                            return (
                                              <div className="overflow-y-scroll h-[420px]">
                                                <PDFViewer
                                                  key={index}
                                                  download={true}
                                                  file={{
                                                    url: enrollmentdocument.file
                                                      ?.url,
                                                  }}
                                                  height={900}
                                                />
                                              </div>
                                            );
                                          }
                                        })}
                                  </div>
                                </div>
                              );
                            }
                          })}
                      </InputLineGroup>
                      {pageData.i20form.status === "Confirmed" && (
                        <InputLineGroup
                          title="I-20"
                          activeMenu={activeMenu === "i-20"}
                        >
                          <Scope path="new_program">
                            <InputLine title="Submit I-20">
                              <Input
                                type="text"
                                name="registration_number"
                                required
                                grow
                                title="Registration Number"
                                defaultValue={
                                  pageData.students.registration_number
                                }
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="nsevis"
                                required
                                grow
                                title="SEVIS Number"
                                defaultValue={pageData.students.nsevis}
                                InputContext={InputContext}
                              />
                              <FileInput
                                name="file_id"
                                title="I-20"
                                required
                                grow
                                InputContext={InputContext}
                              />
                              <Input
                                type="date"
                                name="start_date"
                                required
                                grow
                                title="Program Start Date"
                                InputContext={InputContext}
                              />
                              <Input
                                type="date"
                                name="end_date"
                                required
                                grow
                                title="Program End Date"
                                InputContext={InputContext}
                              />
                            </InputLine>
                          </Scope>
                        </InputLineGroup>
                      )}
                    </>
                  ) : (
                    <FormLoading />
                  )}
                </Form>
              </div>
            </InputContext.Provider>
          </div>
        </div>
      ) : null}
    </Preview>
  );
}
