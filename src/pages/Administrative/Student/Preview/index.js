import { Form } from "@unform/web";
import { deleteObject, getStorage, ref } from "firebase/storage";
import {
  BookMarked,
  Building,
  Contact,
  ExternalLink,
  GraduationCap,
  Loader2,
  NotebookPen,
  NotebookTabs,
  Pencil,
  Plus,
  Save,
  SaveAll,
  Send,
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
  getTabsPermissions,
  handleUpdatedFields,
  tabAllowed,
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
  optionsTypes,
  yesOrNoOptions,
} from "~/functions/selectPopoverOptions";
import { app } from "~/services/firebase";
import PricesSimulation from "~/components/PricesSimulation";
import PhoneNumberInput from "~/components/RegisterForm/PhoneNumberInput";
import FindGeneric from "~/components/Finds/FindGeneric";
import { Scope } from "@unform/core";
import FileInput from "~/components/RegisterForm/FileInput";
import { organizeMultiAndSingleFiles } from "~/functions/uploadFile";

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

  const tabsPermissions = getTabsPermissions("students", FullGridContext);

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
    classroom: null,
    studentgroup: null,
    programs: [],
  });
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
  const generalForm = useRef();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    document.getElementById("scrollPage").scrollTo(0, 0);
  }, [activeMenu]);

  const countriesOptions = countries_list.map((country) => {
    return { value: country, label: country };
  });

  useEffect(() => {
    async function getPageData() {
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
          console.log(err);
          // toast(err.response.data.error, { type: "error", autoClose: 3000 });
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
    if (data.new_program.file_id) {
      const allPromises = organizeMultiAndSingleFiles(
        [data.new_program],
        "StudentPrograms"
      );
      let toastId = toast.loading("Files are being uploaded...");
      Promise.all(allPromises).then(async (files) => {
        files.map(async (file) => {
          if (!file) {
            return;
          }
          try {
            const { data: newprogram } = await api.post(`/studentprogram`, {
              student_id: id,
              file_id: file,
              start_date: data.new_program.start_date,
              end_date: data.new_program.end_date,
            });
            if (toastId) {
              toast.update(toastId, {
                render: "All files have been uploaded!",
                type: "success",
                autoClose: 3000,
                isLoading: false,
              });
            }
            setPageData({
              ...pageData,
              programs: [...pageData.programs, newprogram],
              start_date: pageData.start_date
                ? pageData.start_date
                : newprogram.start_date,
            });
            generalForm.current.setFieldValue("new_program.file_id", null);
            generalForm.current.setFieldValue("new_program.start_date", null);
            generalForm.current.setFieldValue("new_program.end_date", null);
          } catch (err) {
            toast.update(toastId, {
              render: err.response.data.error,
              type: "error",
              autoClose: 3000,
              isLoading: false,
            });
            const storage = getStorage(app);
            const local = "StudentPrograms/" + file.key;
            const imageRef = ref(storage, local);
            deleteObject(imageRef);
          }
        });
      });
    } else {
      delete data.new_program;
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

              {id !== "new" && (
                <>
                  <RegisterFormMenu
                    setActiveMenu={setActiveMenu}
                    activeMenu={activeMenu}
                    name="student-admission"
                    disabled={!tabAllowed(tabsPermissions, "admission-tab")}
                    messageOnDisabled="You don't have permission to access this tab"
                  >
                    <NotebookPen size={16} /> Admission
                  </RegisterFormMenu>

                  <RegisterFormMenu
                    setActiveMenu={setActiveMenu}
                    activeMenu={activeMenu}
                    name="student-academic"
                    disabled={!tabAllowed(tabsPermissions, "academic-tab")}
                    messageOnDisabled="You don't have permission to access this tab"
                  >
                    <Contact size={16} /> Academic
                  </RegisterFormMenu>

                  <RegisterFormMenu
                    setActiveMenu={setActiveMenu}
                    activeMenu={activeMenu}
                    name="student-dso"
                    disabled={!tabAllowed(tabsPermissions, "dso-tab")}
                    messageOnDisabled="You don't have permission to access this tab"
                  >
                    <BookMarked size={16} /> DSO
                  </RegisterFormMenu>
                </>
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
                          access={access}
                          title={pageData.name}
                          registry={registry}
                          InputContext={InputContext}
                        />
                        <InputLineGroup
                          title="student-information"
                          activeMenu={activeMenu === "student-information"}
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
                          <FindGeneric
                            route="processtypes"
                            title="Process Type"
                            scope="processtypes"
                            required
                            readOnly={id !== "new"}
                            InputContext={InputContext}
                            defaultValue={{
                              id: pageData.processtypes?.id,
                              name: pageData.processtypes?.name,
                            }}
                            fields={[
                              {
                                title: "Name",
                                name: "name",
                              },
                            ]}
                          />
                          <FindGeneric
                            route="processsubstatuses"
                            title="Process Sub Status"
                            scope="processsubstatuses"
                            required
                            readOnly={id !== "new"}
                            InputContext={InputContext}
                            defaultValue={{
                              id: pageData.processsubstatuses?.id,
                              name: pageData.processsubstatuses?.name,
                            }}
                            fields={[
                              {
                                title: "Name",
                                name: "name",
                              },
                            ]}
                          />

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
                              defaultValue={pageData.how_did_you_hear_about_us}
                              InputContext={InputContext}
                            />
                          </InputLine>
                        </InputLineGroup>
                        <InputLineGroup
                          title="student-academic"
                          activeMenu={activeMenu === "student-academic"}
                        >
                          <InputLine title="Placement Test">
                            <Input
                              type="text"
                              name="placement_test_location"
                              grow
                              title="Placement Test Location"
                              readOnly={true}
                              defaultValue={pageData.placement_test_location}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="placement_test_score"
                              grow
                              title="Placement Test Score"
                              readOnly={true}
                              defaultValue={pageData.placement_test_score}
                              InputContext={InputContext}
                            />
                            <Input
                              name="level"
                              grow
                              title="Level"
                              readOnly={true}
                              defaultValue={pageData.level}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          {pageData.studentgroup && (
                            <Scope path="studentgroup">
                              <InputLine title="Group">
                                <Input
                                  name="name"
                                  grow
                                  readOnly
                                  title="Group Name"
                                  defaultValue={pageData.studentgroup.name}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="date"
                                  name="start_date"
                                  grow
                                  readOnly
                                  title="Group Start Date"
                                  defaultValue={format(
                                    parseISO(pageData.studentgroup.start_date),
                                    "yyyy-MM-dd"
                                  )}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="date"
                                  name="end_date"
                                  grow
                                  readOnly
                                  title="Group End Date"
                                  defaultValue={format(
                                    parseISO(pageData.studentgroup.end_date),
                                    "yyyy-MM-dd"
                                  )}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="status"
                                  grow
                                  readOnly
                                  title="Status"
                                  defaultValue={pageData.studentgroup.status}
                                  InputContext={InputContext}
                                />
                              </InputLine>
                              <InputLine>
                                <Input
                                  type="date"
                                  name="start_date"
                                  grow
                                  readOnly
                                  title="Student Start Date in Group"
                                  defaultValue={format(
                                    parseISO(
                                      pageData.studentgroup?.studentxgroups
                                        ?.length > 0 &&
                                        pageData.studentgroup?.studentxgroups[0]
                                          ?.start_date
                                    ),
                                    "yyyy-MM-dd"
                                  )}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="date"
                                  name="end_date"
                                  grow
                                  readOnly
                                  title="Student End Date in Group"
                                  defaultValue={format(
                                    parseISO(
                                      pageData.studentgroup?.studentxgroups
                                        ?.length > 0 &&
                                        pageData.studentgroup?.studentxgroups[0]
                                          ?.end_date
                                    ),
                                    "yyyy-MM-dd"
                                  )}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="teacher"
                                  grow
                                  readOnly
                                  title="Teacher"
                                  defaultValue={pageData.teacher.name}
                                  InputContext={InputContext}
                                />
                              </InputLine>
                            </Scope>
                          )}
                        </InputLineGroup>
                        <InputLineGroup
                          title="student-dso"
                          activeMenu={activeMenu === "student-dso"}
                        >
                          <InputLine title="DSO Information">
                            <Input
                              type="date"
                              name="start_date"
                              grow
                              readOnly
                              title="Student Start Date"
                              defaultValue={
                                pageData.start_date
                                  ? format(
                                      parseISO(pageData.start_date),
                                      "yyyy-MM-dd"
                                    )
                                  : null
                              }
                              InputContext={InputContext}
                            />

                            <Input
                              type="date"
                              name="program_start_date"
                              grow
                              readOnly
                              title="Program Start Date"
                              defaultValue={
                                pageData?.programs &&
                                pageData?.programs?.length > 0
                                  ? pageData?.programs[0].start_date
                                  : null
                              }
                              InputContext={InputContext}
                            />

                            <Input
                              type="date"
                              name="program_end_date"
                              grow
                              readOnly
                              title="Program End Date"
                              defaultValue={
                                pageData?.programs?.length > 0
                                  ? pageData?.programs[0].end_date
                                  : null
                              }
                              InputContext={InputContext}
                            />
                          </InputLine>
                          {console.log(
                            tabAllowed(tabsPermissions, "dso-tab")
                              ?.MenuHierarchyXGroup?.create
                          )}
                          {(tabAllowed(tabsPermissions, "dso-tab")
                            ?.MenuHierarchyXGroup?.create ||
                            tabAllowed(tabsPermissions, "dso-tab")
                              ?.MenuHierarchyXGroup?.edit) && (
                            <Scope path="new_program">
                              <InputLine title="New I20">
                                <FileInput
                                  name="file_id"
                                  title="I20"
                                  grow
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="date"
                                  name="start_date"
                                  grow
                                  title="Program Start Date"
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="date"
                                  name="end_date"
                                  grow
                                  title="Program End Date"
                                  InputContext={InputContext}
                                />
                                <button className="bg-mila_orange text-white rounded-md p-1 px-2 h-8 mt-3 flex flex-row items-center justify-center text-xs gap-1">
                                  <Send size={16} /> Add I20
                                </button>
                              </InputLine>
                            </Scope>
                          )}
                          {pageData?.programs?.length > 0 &&
                            pageData?.programs
                              .sort((a, b) =>
                                b.created_at > a.created_at ? 1 : -1
                              )
                              .map((program, index) => (
                                <InputLine
                                  key={index}
                                  title={index === 0 ? "Last I20 Files" : ""}
                                >
                                  <a
                                    type="button"
                                    href={program.i20.url}
                                    target="_blank"
                                    className="bg-primary text-white rounded-md p-1 px-2 h-8 mt-3 flex flex-row items-center justify-center text-xs gap-1"
                                  >
                                    <ExternalLink size={16} />
                                    Open File
                                  </a>
                                  <Input
                                    type="text"
                                    name="file_id"
                                    grow
                                    readOnly
                                    title="I20"
                                    defaultValue={program.i20.name}
                                    InputContext={InputContext}
                                  />
                                  <Input
                                    type="date"
                                    name="start_date"
                                    grow
                                    readOnly
                                    title="Program Start Date"
                                    defaultValue={program.start_date}
                                    InputContext={InputContext}
                                  />
                                  <Input
                                    type="date"
                                    name="end_date"
                                    grow
                                    readOnly
                                    title="Program End Date"
                                    defaultValue={program.end_date}
                                    InputContext={InputContext}
                                  />
                                </InputLine>
                              ))}
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
