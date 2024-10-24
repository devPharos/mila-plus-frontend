import { Form } from "@unform/web";
import { CheckCheck, CheckCircle, Files, User, X } from "lucide-react";
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
import { format, parseISO } from "date-fns";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSearchParams } from "react-router-dom";
import { Scope } from "@unform/core";
import * as Yup from "yup";
import FileInputMultiple from "~/components/RegisterForm/FileInputMultiple";
import FileInput from "~/components/RegisterForm/FileInput";
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

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const InputContext = createContext({});

export default function TransferOutside({
  access = null,
  handleOpened,
  setOpened,
  defaultFormType = "preview",
}) {
  const [searchparams, setSearchParams] = useSearchParams();
  const [pageData, setPageData] = useState({
    enrollmentemergencies: [
      {
        name: "",
        relationship_type: "",
        email: "",
        phone: "",
      },
    ],
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

  const menus = [
    { order: 1, name: "transfer-request" },
    { order: 2, name: "transfer-dso" },
  ];

  useEffect(() => {
    async function getDocuments(type = "") {
      const { data } = await api.get(
        `/documentsByOrigin?origin=Transfer Eligibility&type=${type}&subtype=Student`
      );
      return data;
    }
    async function getPageData() {
      if (id !== "new") {
        try {
          let documents = [];
          const { data } = await api.get(`/outside/enrollments/${id}`);
          const { data: filialsData } = await api.get(`/filials`);
          documents = await getDocuments(data.students.processsubstatuses.name);
          const filialOptions = filialsData
            .filter((filial) => filial.id !== pageData.filial_id)
            .map((filial) => {
              return {
                value: filial.id,
                label: filial.id ? "MILA - " + filial.name : filial.name,
              };
            });
          filialOptions.push({ value: null, label: "Other School" });
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

          setPageData({
            ...data,
            documents,
            filials: filialOptions,
            loaded: true,
            activeMenu: searchparams.has("activeMenu")
              ? searchparams.get("activeMenu")
              : data.form_step,
            lastActiveMenu: menus.find((menu) =>
              menu.name === searchparams.has("activeMenu")
                ? searchparams.get("activeMenu")
                : data.form_step
            ),
          });
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

      if (pageData.activeMenu === "transfer-request") {
        const signature = signatureRef.current.toDataURL();

        const fileUuid = uuidv4();
        const storage = getStorage(app);
        const local = "Enrollments/Signatures/" + fileUuid + ".png";
        const imageRef = ref(storage, local);
        await uploadString(imageRef, signature.substring(22), "base64").then(
          async (snapshot) => {
            await getDownloadURL(snapshot.ref).then(async (downloadURL) => {
              await api.post(`/enrollmentstudentsignature`, {
                enrollment_id: id,
                files: {
                  url: downloadURL,
                  name: fileUuid + ".png",
                  size: signature.length,
                  key: fileUuid + ".png",
                },
              });
              // await api.put(`/outside/enrollments/${id}`, { activeMenu: pageData.activeMenu, lastActiveMenu: pageData.lastActiveMenu })
              // setPageData({ ...pageData, loaded: false })
              // setSuccessfullyUpdated(true)
              // toast("Saved!", { autoClose: 1000 })
              // setLoading(false)
            });
          }
        );
      }

      if (id !== "new") {
        const updated = handleUpdatedFields(data, pageData);

        if (updated.length > 0) {
          const objUpdated = Object.fromEntries(updated);
          const {
            date_of_birth,
            passport_expiration_date,
            i94_expiration_date,
          } = objUpdated;

          if (data.documents && data.documents.length > 0) {
            let toastId = null;
            if (
              data.documents.find(
                (document) =>
                  (typeof document.file_id === "undefined" &&
                    document.file_id) ||
                  (typeof document.file_id === "object" &&
                    Array.from(document.file_id).length > 0)
              )
            ) {
              toastId = toast.loading("Files are being uploaded...");
            }
            const allPromises = organizeMultiAndSingleFiles(
              data.documents,
              "Enrollments"
            );
            Promise.all(allPromises).then(async (files) => {
              try {
                files.map(async (file) => {
                  if (!file) {
                    return;
                  }
                  if (file.name) {
                    api.post(`/enrollmentdocuments`, {
                      enrollment_id: id,
                      files: file,
                    });
                    toastId &&
                      toast.update(toastId, {
                        render: "All files have been uploaded!",
                        type: "success",
                        autoClose: 3000,
                        isLoading: false,
                      });
                  } else {
                    file
                      .sort((a, b) => a.size > b.size)
                      .map(async (promise, index) => {
                        await Promise.all([promise]).then(
                          async (singleFile) => {
                            console.log(singleFile[0]);
                            if (index + 1 === file.length) {
                              toastId &&
                                toast.update(toastId, {
                                  render: "All files have been uploaded!",
                                  type: "success",
                                  autoClose: 3000,
                                  isLoading: false,
                                });
                            }
                            await api.post(`/enrollmentdocuments`, {
                              enrollment_id: id,
                              files: singleFile[0],
                            });
                          }
                        );
                      });
                  }
                });
              } catch (err) {
                console.log(err);
                // toast(err.response.data.error, { type: 'error', autoClose: 3000 })
              }
              // return
              delete objUpdated.documents;
              await api.put(`/outside/enrollments/${id}`, {
                ...objUpdated,
                activeMenu: pageData.activeMenu,
                lastActiveMenu: pageData.lastActiveMenu,
                date_of_birth: date_of_birth
                  ? format(date_of_birth, "yyyyMMdd")
                  : null,
                passport_expiration_date: passport_expiration_date
                  ? format(passport_expiration_date, "yyyyMMdd")
                  : null,
                i94_expiration_date: i94_expiration_date
                  ? format(i94_expiration_date, "yyyyMMdd")
                  : null,
              });
              setPageData({ ...pageData, loaded: false });
              setSuccessfullyUpdated(true);
              toast("Saved!", { autoClose: 1000 });
              setLoading(false);
            });
          } else {
            try {
              await api.put(`/outside/enrollments/${id}`, {
                ...objUpdated,
                activeMenu: pageData.activeMenu,
                lastActiveMenu: pageData.lastActiveMenu,
                date_of_birth: date_of_birth
                  ? format(date_of_birth, "yyyyMMdd")
                  : null,
                passport_expiration_date: passport_expiration_date
                  ? format(passport_expiration_date, "yyyyMMdd")
                  : null,
                i94_expiration_date: i94_expiration_date
                  ? format(i94_expiration_date, "yyyyMMdd")
                  : null,
              });
              setPageData({ ...pageData, loaded: false });
              setSuccessfullyUpdated(true);
              toast("Saved!", { autoClose: 1000 });
              setLoading(false);
            } catch (err) {
              console.log(err);
              toast(err.response.data.error, {
                type: "error",
                autoClose: 3000,
              });
              setLoading(false);
            }
          }
        } else {
          // console.log(updated)
        }
      }
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

  function handleDeleteDocument(id) {
    // const { file } = pageData.staffdocuments.find(staffdocument => staffdocument.id === id);
    alertBox({
      title: "Attention!",
      descriptionHTML: `<p>Are you sure you want to delete this file?</p>`,
      buttons: [
        {
          title: "No",
          class: "cancel",
        },
        {
          title: "Yes",
          onPress: async () => {
            try {
              await api.delete(`/enrollmentdocuments/${id}`);
              toast("File deleted!", { autoClose: 1000 });
              setPageData({
                ...pageData,
                enrollmentdocuments: pageData.enrollmentdocuments.filter(
                  (enrollmentdocument) => enrollmentdocument.id !== id
                ),
              });
            } catch (err) {
              toast(err.response.data.error, {
                type: "error",
                autoClose: 3000,
              });
            }
          },
        },
      ],
    });
  }

  function handleClearSignature() {
    const signaturePad = signatureRef.current;

    if (signaturePad) {
      signaturePad.instance.clear();
      setSuccessfullyUpdated(true);
    }
  }

  function handlePreviousSchoolFilial(el) {
    setPageData({
      ...pageData,
      enrollmenttransfers: {
        ...pageData.enrollmenttransfers,
        previous_school_id: el.value,
      },
    });
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
              name="transfer-request"
            >
              <User size={22} /> Transfer Information
            </RegisterFormMenu>
            <RegisterFormMenu
              disabled={
                pageData.lastActiveMenu.order < 8 &&
                !searchparams.has("activeMenu")
              }
              setActiveMenu={
                () => null
                // setPageData({ ...pageData, activeMenu: menus[1].name })
              }
              activeMenu={pageData.activeMenu}
              name="transfer-dso"
            >
              <CheckCheck size={18} /> Finished
            </RegisterFormMenu>
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
                handleOutsideMail: null,
                canceled: pageData.canceled_at,
              }}
            >
              <div className="flex flex-col items-start justify-start text-sm overflow-y-scroll h-full">
                <Form
                  ref={generalForm}
                  onSubmit={handleGeneralFormSubmit}
                  className="w-full"
                >
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
                  {pageData.loaded ? (
                    <>
                      {pageData.activeMenu === "transfer-request" && (
                        <InputLineGroup
                          title="Student Information"
                          activeMenu={
                            pageData.activeMenu === "transfer-request"
                          }
                        >
                          <Scope path={`students`}>
                            <InputLine title="Student Information">
                              <Input
                                type="text"
                                readOnly
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
                                name="middle_name"
                                grow
                                title="Middle Name"
                                defaultValue={pageData.students.middle_name}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                readOnly
                                name="last_name"
                                required
                                grow
                                title="Last Name"
                                defaultValue={pageData.students.last_name}
                                InputContext={InputContext}
                              />
                            </InputLine>
                            <InputLine>
                              <Input
                                type="text"
                                readOnly
                                name="email"
                                required
                                grow
                                title="E-mail"
                                defaultValue={pageData.students.email}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="nsevis"
                                maxLength={11}
                                minLength={11}
                                required
                                grow
                                title="NSEVIS"
                                defaultValue={pageData.students.nsevis}
                                InputContext={InputContext}
                              />
                            </InputLine>
                          </Scope>
                          <InputLine title="Previous School">
                            <Scope path={`enrollmenttransfers`}>
                              <SelectPopover
                                onChange={(el) =>
                                  handlePreviousSchoolFilial(el)
                                }
                                name="previous_school_id"
                                required
                                grow
                                title="Previous School"
                                options={pageData.filials}
                                defaultValue={
                                  pageData.enrollmenttransfers
                                    ? pageData.filials.find(
                                        (filial) =>
                                          filial.value ===
                                          pageData.enrollmenttransfers
                                            .previous_school_id
                                      )
                                    : null
                                }
                                InputContext={InputContext}
                              />
                              {!pageData.enrollmenttransfers ||
                                (!pageData.enrollmenttransfers
                                  .previous_school_id && (
                                  <>
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
                                  </>
                                ))}
                            </Scope>
                          </InputLine>
                          {pageData.documents &&
                            pageData.documents.length > 0 &&
                            pageData.documents.map((document, index) => {
                              return (
                                <Scope key={index} path={`documents[${index}]`}>
                                  <Input
                                    type="hidden"
                                    name="document_id"
                                    defaultValue={document.id}
                                    InputContext={InputContext}
                                  />
                                  <InputLine title={document.title}>
                                    {!document.multiple &&
                                      pageData.enrollmentdocuments &&
                                      pageData.enrollmentdocuments.filter(
                                        (enrollmentdocument) =>
                                          enrollmentdocument.document_id ===
                                          document.id
                                      ).length === 0 && (
                                        <FileInput
                                          type="file"
                                          name="file_id"
                                          title={"File"}
                                          required={document.required}
                                          grow
                                          InputContext={InputContext}
                                        />
                                      )}
                                    {document.multiple && (
                                      <FileInputMultiple
                                        type="file"
                                        name="file_id"
                                        required={document.required}
                                        title={"Multiple Files"}
                                        grow
                                        InputContext={InputContext}
                                      />
                                    )}
                                  </InputLine>
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
                                                      <div className="flex flex-row justify-center items-center gap-2">
                                                        <a
                                                          href={
                                                            enrollmentdocument
                                                              .file.url
                                                          }
                                                          target="_blank"
                                                          className="text-xs"
                                                        >
                                                          <div
                                                            className="flex flex-row items-center border px-4 py-2 gap-1 rounded-md bg-gray-100 hover:border-gray-300"
                                                            key={index}
                                                          >
                                                            <Files size={16} />
                                                            {
                                                              enrollmentdocument
                                                                .file.name
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
                                </Scope>
                              );
                            })}
                          {!pageData.signature ? (
                            <InputLine title="Student Signature">
                              <div className="flex flex-1 flex-col items-start justify-start">
                                <div
                                  onClick={() => setSuccessfullyUpdated(false)}
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
                          ) : (
                            <InputLine title="Student Signature">
                              <div className="flex flex-1 flex-col items-start justify-start">
                                <img
                                  src={pageData.signature.url}
                                  className="border w-96"
                                />
                                <p className="text-xs p-2 border border-t-0 rounded-b-md bg-slate-100 w-96">
                                  Signed:{" "}
                                  {format(
                                    parseISO(pageData.signature.created_at),
                                    "MMM do, yyyy"
                                  )}{" "}
                                  at{" "}
                                  {format(
                                    parseISO(pageData.signature.created_at),
                                    "HH:mm"
                                  )}
                                </p>
                              </div>
                            </InputLine>
                          )}
                        </InputLineGroup>
                      )}
                      <InputLineGroup
                        title="Finish"
                        activeMenu={pageData.activeMenu === "transfer-dso"}
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
                </Form>
              </div>
            </InputContext.Provider>
          </div>
        </div>
      ) : null}
    </Preview>
  );
}
