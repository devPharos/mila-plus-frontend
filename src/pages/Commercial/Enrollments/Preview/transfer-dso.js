import { Form } from "@unform/web";
import { CheckCheck, CheckCircle, User } from "lucide-react";
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
  getRegistries,
  handleUpdatedFields,
} from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import DatePicker from "~/components/RegisterForm/DatePicker";
import { format } from "date-fns";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSearchParams } from "react-router-dom";
import { Scope } from "@unform/core";
import * as Yup from "yup";
import { organizeMultiAndSingleFiles } from "~/functions/uploadFile";
import { AlertContext } from "~/App";
import SignaturePad from "react-signature-pad-wrapper";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { app } from "~/services/firebase";
import { pdfjs } from "react-pdf";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Textarea from "~/components/RegisterForm/Textarea";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const InputContext = createContext({});

export default function TransferDSOOutside({
  access = null,
  handleOpened,
  setOpened,
  defaultFormType = "preview",
}) {
  const [searchparams, setSearchParams] = useSearchParams();
  const [pageData, setPageData] = useState({
    enrollmenttransfers: {
      is_last_school: null,
      attendance_date_from: null,
      attendance_date_to: null,
      has_student_maintained_full_time_studies: null,
      is_student_eligible_to_transfer: null,
      transfer_release_date: null,
      uppon_acceptance: null,
      comments: null,
    },
    activeMenu: null,
    loaded: false,
  });
  const [formType, setFormType] = useState("full");
  const [fullscreen, setFullscreen] = useState(true);
  const [successfullyUpdated, setSuccessfullyUpdated] = useState(true);
  const [registry, setRegistry] = useState({
    created_by: null,
    created_at: null,
    updated_by: null,
    updated_at: null,
    canceled_by: null,
    canceled_at: null,
  });
  const generalForm = useRef();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const id = searchparams.get("crypt");
  const { alertBox } = useContext(AlertContext);
  const signatureRef = useRef();
  const yesOrNoOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  const menus = [
    { order: 1, name: "transfer-dso" },
    { order: 2, name: "transfer-agent" },
    { order: 2, name: "finished" },
  ];

  useEffect(() => {
    async function getDocuments(type = "") {
      const { data } = await api.get(
        `/documentsByOrigin?origin=Enrollment&type=${type}&subtype=Student`
      );
      return data;
    }
    async function getPageData() {
      if (id !== "new") {
        try {
          let documents = [];
          const { data } = await api.get(`/outside/enrollments/${id}`);

          documents = await getDocuments(data.students.processsubstatuses.name);

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
          if (searchparams.has("activeMenu")) {
            setPageData({
              ...data,
              documents,
              loaded: true,
              activeMenu: searchparams.get("activeMenu"),
              lastActiveMenu: menus.find(
                (menu) => menu.name === searchparams.get("activeMenu")
              ),
            });
          } else {
            setPageData({
              ...data,
              documents,
              loaded: true,
              activeMenu: data.form_step,
              lastActiveMenu: menus.find(
                (menu) => menu.name === data.form_step
              ),
            });
          }
        } catch (err) {
          if (err.response && err.response.data && err.response.data.error) {
            toast(err.response.data.error, { type: "error", autoClose: 3000 });
          }
          console.log(err);
        }
      }
    }
    if (!pageData.loaded) {
      getPageData();
    }
  }, [pageData.loaded]);

  async function handleGeneralFormSubmit(data) {
    setLoading(true);
    try {
      if (successfullyUpdated) {
        toast("No need to be saved!", {
          autoClose: 1000,
          type: "info",
          transition: Zoom,
        });
        setLoading(false);
        return;
      }

      const signature = signatureRef.current.toDataURL();

      const fileUuid = uuidv4();
      const storage = getStorage(app);
      const local = "Enrollments/Signatures/" + fileUuid + ".png";
      const imageRef = ref(storage, local);
      await uploadString(imageRef, signature.substring(22), "base64").then(
        async (snapshot) => {
          await getDownloadURL(snapshot.ref).then(async (downloadURL) => {
            await api.post(`/enrollmentdsosignature`, {
              enrollment_id: id,
              files: {
                url: downloadURL,
                name: fileUuid + ".png",
                size: signature.length,
                key: fileUuid + ".png",
              },
            });
          });
        }
      );
      await api.put(`/outside/enrollments/${id}`, {
        activeMenu: pageData.activeMenu,
        lastActiveMenu: pageData.lastActiveMenu,
      });
      setPageData({ ...pageData, loaded: false });
      setSuccessfullyUpdated(true);
      toast("Saved!", { autoClose: 1000 });
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  function handleInactivate() {}

  function handleClearSignature() {
    const signaturePad = signatureRef.current;

    if (signaturePad) {
      signaturePad.instance.clear();
      setSuccessfullyUpdated(true);
    }
  }

  return (
    <Preview formType={formType} fullscreen={fullscreen}>
      {!sent && pageData.loaded ? (
        <div className="flex h-full flex-col items-start justify-between gap-4 md:flex-row">
          <div className="flex flex-row items-center justify-between text-xs w-32 gap-4 md:flex-col">
            <RegisterFormMenu
              disabled={false}
              setActiveMenu={() =>
                setPageData({ ...pageData, activeMenu: menus[0].name })
              }
              activeMenu={pageData.activeMenu}
              name="transfer-dso"
            >
              <User size={22} /> Transfer Information
            </RegisterFormMenu>
            <RegisterFormMenu
              disabled={
                pageData.lastActiveMenu.order < 8 &&
                !searchparams.has("activeMenu")
              }
              setActiveMenu={() =>
                setPageData({ ...pageData, activeMenu: menus[7].name })
              }
              activeMenu={pageData.activeMenu}
              name="transfer-agent"
            >
              <CheckCheck size={18} /> Finished
            </RegisterFormMenu>
          </div>
          <div className="border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start">
            <div className="flex flex-col items-start justify-start text-sm overflow-y-scroll h-full">
              <Form
                ref={generalForm}
                onSubmit={handleGeneralFormSubmit}
                className="w-full h-full"
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
                    handleOutsideMail: null,
                    canceled: pageData.canceled_at,
                  }}
                >
                  {pageData.loaded ? (
                    <>
                      <FormHeader
                        saveText="Save & Continue"
                        outside={!searchparams.has("activeMenu")}
                        loading={loading}
                        access={access}
                        title={
                          pageData.students.name +
                          " " +
                          pageData.students.last_name +
                          " - Enrollment Process - Transfer Eligibility"
                        }
                        registry={registry}
                        InputContext={InputContext}
                      />
                      {pageData.activeMenu === "transfer-dso" && (
                        <InputLineGroup
                          title="Student Information"
                          activeMenu={pageData.activeMenu === "transfer-dso"}
                        >
                          <InputLine>
                            <p className="text-lg">
                              To be completed by the{" "}
                              <strong>Designated School Official (DSO)</strong>
                            </p>
                          </InputLine>
                          <Scope path={`students`}>
                            <InputLine title="Student Information">
                              <Input
                                type="text"
                                readOnly
                                disabled
                                name="name"
                                required
                                grow
                                title="First Name"
                                defaultValue={pageData.students.name}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                readOnly
                                disabled
                                name="last_name"
                                required
                                grow
                                title="Last Name"
                                defaultValue={pageData.students.last_name}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                readOnly
                                disabled
                                name="nsevis"
                                required
                                grow
                                title="NSEVIS"
                                defaultValue={pageData.students.nsevis}
                                InputContext={InputContext}
                              />
                            </InputLine>
                          </Scope>
                          <InputLine title="Details">
                            <p>
                              This student wishes to be transfered to{" "}
                              <strong>
                                MILA International Language Academy –{" "}
                                {pageData.filial.name}
                              </strong>
                              .
                              <br />
                              <br />
                              Please provide the information requested to help
                              us determine eligibility for the transfer
                              notification process.
                              <br />
                              <br />
                              If you have any question, don't hesitate to
                              contact the Office of MILA's admission at{" "}
                              <strong>407 286-0404</strong>.
                              <br />
                              <br />
                              <span className="text-mila_orange">
                                Please do not transfer the I-20 until the
                                student provides you with an acceptance letter.
                              </span>
                            </p>
                          </InputLine>
                          <Scope path={`enrollmenttransfers`}>
                            <InputLine title="Eligibility">
                              <SelectPopover
                                name="is_last_school"
                                required
                                grow
                                title="Is your school the last school the student was authorized to attend?"
                                options={yesOrNoOptions}
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? yesOrNoOptions.find(
                                        (type) =>
                                          type.value ===
                                          pageData.enrollmenttransfers
                                            .is_last_school
                                      )
                                    : null
                                }
                                InputContext={InputContext}
                              />
                              <DatePicker
                                name="attendance_date_from"
                                required
                                title="Dates of attendance From"
                                placeholderText="MM/DD/YYYY"
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? pageData.enrollmenttransfers
                                        .attendance_date_from
                                    : null
                                }
                                InputContext={InputContext}
                              />
                              <DatePicker
                                name="attendance_date_to"
                                required
                                title="Dates of attendance To"
                                placeholderText="MM/DD/YYYY"
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? pageData.enrollmenttransfers
                                        .attendance_date_to
                                    : null
                                }
                                InputContext={InputContext}
                              />
                            </InputLine>
                            <InputLine>
                              <SelectPopover
                                name="has_student_maintained_full_time_studies"
                                required
                                grow
                                title="Has the student maintained full time studies as defined in the regulations since obtaining status?"
                                options={yesOrNoOptions}
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? yesOrNoOptions.find(
                                        (type) =>
                                          type.value ===
                                          pageData.enrollmenttransfers
                                            .has_student_maintained_full_time_studies
                                      )
                                    : null
                                }
                                InputContext={InputContext}
                              />
                              <SelectPopover
                                name="is_student_eligible_to_transfer"
                                required
                                grow
                                title="If accepted, is the student eligible to transfer to MILA International Language Academy - Orlando?"
                                options={yesOrNoOptions}
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? yesOrNoOptions.find(
                                        (type) =>
                                          type.value ===
                                          pageData.enrollmenttransfers
                                            .is_student_eligible_to_transfer
                                      )
                                    : null
                                }
                                InputContext={InputContext}
                              />
                            </InputLine>
                            <InputLine>
                              <DatePicker
                                name="transfer_release_date"
                                title="Intended transfer release date"
                                placeholderText="MM/DD/YYYY"
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? pageData.enrollmenttransfers
                                        .transfer_release_date
                                    : null
                                }
                                InputContext={InputContext}
                              />
                              {console.log(pageData.enrollmenttransfers)}
                              <SelectPopover
                                name="uppon_acceptance"
                                required
                                title="Upon acceptance"
                                options={yesOrNoOptions}
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? yesOrNoOptions.find(
                                        (type) =>
                                          type.value ===
                                          pageData.enrollmenttransfers
                                            .uppon_acceptance
                                      )
                                    : null
                                }
                                isSearchable
                                InputContext={InputContext}
                              />
                              <Textarea
                                type="text"
                                name="comments"
                                grow
                                title="Comments"
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? pageData.enrollmenttransfers.comments
                                    : null
                                }
                                rows={1}
                                InputContext={InputContext}
                              />
                            </InputLine>
                            <InputLine title="Previous School">
                              <Input
                                type="text"
                                name="previous_school_name"
                                required
                                grow
                                title="School Name"
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? pageData.enrollmenttransfers
                                        .previous_school_name
                                    : null
                                }
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="previous_school_dso_name"
                                required
                                grow
                                title="DSO Name"
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? pageData.enrollmenttransfers
                                        .previous_school_dso_name
                                    : null
                                }
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="previous_school_dso_email"
                                required
                                grow
                                title="DSO Email"
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? pageData.enrollmenttransfers
                                        .previous_school_dso_email
                                    : null
                                }
                                InputContext={InputContext}
                              />
                            </InputLine>
                            <InputLine>
                              <Input
                                type="text"
                                name="previous_school_phone"
                                required
                                grow
                                title="Phone Number"
                                isPhoneNumber
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? pageData.enrollmenttransfers
                                        .previous_school_phone
                                    : null
                                }
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="previous_school_address"
                                required
                                grow
                                title="Address"
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? pageData.enrollmenttransfers
                                        .previous_school_address
                                    : null
                                }
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="previous_school_zip"
                                required
                                grow
                                title="Zip Code"
                                isZipCode
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? pageData.enrollmenttransfers
                                        .previous_school_zip
                                    : null
                                }
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="previous_school_city"
                                required
                                grow
                                title="City"
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? pageData.enrollmenttransfers
                                        .previous_school_city
                                    : null
                                }
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="previous_school_state"
                                required
                                grow
                                title="State"
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? pageData.enrollmenttransfers
                                        .previous_school_state
                                    : null
                                }
                                InputContext={InputContext}
                              />
                            </InputLine>
                            {!searchparams.has("activeMenu") && (
                              <InputLine title={`DSO's Signature`}>
                                <div className="flex flex-1 flex-col items-start justify-start">
                                  <div
                                    onClick={() =>
                                      setSuccessfullyUpdated(false)
                                    }
                                    className="h-[19rem] w-[36rem] gap-2 border rounded"
                                  >
                                    <SignaturePad
                                      redrawOnResize
                                      ref={signatureRef}
                                      options={{
                                        backgroundColor: "#FFF",
                                        penColor: "#111",
                                      }}
                                    />
                                  </div>
                                  <div className="flex flex-1 flex-row items-center justify-start gap-2">
                                    <button
                                      type="button"
                                      onClick={handleClearSignature}
                                      className="bg-primary text-white rounded-md py-4 px-8 my-2 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1"
                                    >
                                      Clear Signature
                                    </button>
                                  </div>
                                </div>
                              </InputLine>
                            )}
                          </Scope>
                        </InputLineGroup>
                      )}
                      <InputLineGroup
                        title="Finish"
                        activeMenu={pageData.activeMenu === "transfer-agent"}
                      >
                        <div className="flex flex-1 w-full flex-col items-center justify-center text-center gap-4">
                          <div className="flex w-full flex-row items-center justify-center text-center gap-4">
                            <CheckCircle size={32} color="#00b361" />
                            <span className="text-lg font-bold">
                              Thank you!
                            </span>
                          </div>
                          <div className="flex w-full flex-row items-center justify-center text-center gap-4">
                            <span>
                              Your request has been sent successfully!
                            </span>
                          </div>
                        </div>
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
