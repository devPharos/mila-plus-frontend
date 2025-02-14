import { Form } from "@unform/web";
import { CheckCircle, Files, FileSignature, X } from "lucide-react";
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
import { countries_list, formatter, getRegistries } from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import DatePicker from "~/components/RegisterForm/DatePicker";
import { format, parseISO } from "date-fns";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSearchParams } from "react-router-dom";
import { Scope } from "@unform/core";
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
import PDFViewer from "~/components/PDFViewer";
import CheckboxInput from "~/components/RegisterForm/CheckboxInput";
import PhoneNumberInput from "~/components/RegisterForm/PhoneNumberInput";
import { useSelector } from "react-redux";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const InputContext = createContext({});

export default function SponsorOutside({
  access = null,
  handleOpened,
  setOpened,
  defaultFormType = "preview",
}) {
  const { profile } = useSelector((state) => state.user);
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
  const [searchparams, setSearchParams] = useSearchParams();
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
    { order: 8, name: "sponsor-signature" },
    { order: 9, name: "transfer-agent" },
    { order: 10, name: "finished" },
  ];

  const countriesOptions = countries_list.map((country) => {
    return { value: country, label: country };
  });

  useEffect(() => {
    async function getDocuments(type = "") {
      const { data } = await api.get(
        `/documentsByOrigin?origin=Enrollment&type=${type}&subtype=Sponsor`
      );
      return data;
    }
    async function getPageData() {
      if (id !== "new") {
        try {
          let documents = [];
          const { data } = await api.get(`/outside/sponsors/${id}`);
          const { data: filialData } = await api.get(
            `/filials/${data.filial_id}`
          );

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
          setPageData({
            ...data,
            documents,
            contracts: filialData.filialdocuments,
            loaded: true,
            activeMenu: searchparams.has("activeMenu")
              ? searchparams.get("activeMenu")
              : data.form_step === "transfer-agent"
              ? "sponsor-signature"
              : data.form_step,
            lastActiveMenu: menus.find((menu) => menu.name === data.form_step),
            sponsor_signature: data.enrollmentsponsors.find(
              (sponsor) => sponsor.id === id
            ).signature
              ? true
              : false,
            sponsor: data.enrollmentsponsors.find(
              (sponsor) => sponsor.id === id
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
    if (successfullyUpdated) {
      toast("No need to be saved!", {
        autoClose: 1000,
        type: "info",
        transition: Zoom,
      });
      setLoading(false);
      return;
    }

    // console.log(data)
    // return

    if (
      pageData.activeMenu === "sponsor-signature" &&
      !pageData.sponsor_signature
    ) {
      const signature = signatureRef.current.toDataURL();

      const fileUuid = uuidv4();
      const storage = getStorage(app);
      const local = "Enrollments/Signatures/" + fileUuid + ".png";
      const imageRef = ref(storage, local);
      await uploadString(imageRef, signature.substring(22), "base64").then(
        async (snapshot) => {
          await getDownloadURL(snapshot.ref).then(async (downloadURL) => {
            await api.post(`/enrollmentsponsorsignature`, {
              sponsor_id: id,
              files: {
                url: downloadURL,
                name: fileUuid + ".png",
                size: signature.length,
                key: fileUuid + ".png",
              },
            });
            await api.put(`/outside/sponsors/${id}`, {
              activeMenu: pageData.activeMenu,
              lastActiveMenu: menus.find(
                (menu) => menu.name === pageData.activeMenu
              ),
            });
            setPageData({ ...pageData, loaded: false });
            setSuccessfullyUpdated(true);
            toast("Saved!", { autoClose: 1000 });
            setLoading(false);
          });
        }
      );
    }

    if (id !== "new") {
      // const updated = handleUpdatedFields(data, pageData.sponsor)

      // if (updated.length > 0) {
      // const objUpdated = Object.fromEntries(updated);
      const { birthday } = data;

      if (data.documents && data.documents.length > 0) {
        let toastId = null;
        if (
          data.documents.find(
            (document) =>
              (typeof document.file_id === "undefined" && document.file_id) ||
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
                  enrollment_id: pageData.id,
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
                    await Promise.all([promise]).then(async (singleFile) => {
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
                        enrollment_id: pageData.id,
                        files: singleFile[0],
                      });
                    });
                  });
              }
            });
          } catch (err) {
            console.log(err);
            // toast(err.response.data.error, { type: 'error', autoClose: 3000 })
          }
          // return
          delete data.documents;
          api
            .put(`/outside/sponsors/${id}`, {
              ...data,
              activeMenu: pageData.activeMenu,
              lastActiveMenu: pageData.lastActiveMenu,
              birthday: birthday ? format(birthday, "yyyyMMdd") : null,
            })
            .then(async (response) => {
              const sponsor = pageData.enrollmentsponsors.findIndex(
                (sponsor) => sponsor.id === id
              );
              setPageData({
                ...pageData,
                activeMenu: "finished",
              });
              setSuccessfullyUpdated(true);
              toast("Saved!", { autoClose: 1000 });
              // setSent(true);
              setLoading(false);
            })
            .catch((err) => {
              toast(err.response.data.error, {
                type: "error",
                autoClose: 3000,
              });
              setLoading(false);
            });
        });
      } else {
        api
          .put(`/outside/sponsors/${id}`, {
            ...data,
            activeMenu: pageData.activeMenu,
            lastActiveMenu: pageData.lastActiveMenu,
            birthday: birthday ? format(birthday, "yyyyMMdd") : null,
          })
          .then(async (response) => {
            setPageData({ ...pageData, activeMenu: "finished" });
            setSuccessfullyUpdated(true);
            toast("Saved!", { autoClose: 1000 });
            // setSent(true);
            setLoading(false);
          })
          .catch((err) => {
            toast(err.response.data.error, { type: "error", autoClose: 3000 });
            setLoading(false);
          });
      }
    }
  }

  function handleSignature() {
    setSuccessfullyUpdated(false);
  }

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

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

  function handleInactivate() {}

  function handleOutsideMail() {}

  return (
    <Preview formType={formType} fullscreen={fullscreen}>
      {!sent && pageData.loaded ? (
        <div className="flex h-full flex-col items-start justify-between gap-4 md:flex-row">
          <div className="flex flex-row items-center justify-between text-xs w-32 gap-4 md:flex-col">
            <RegisterFormMenu
              setActiveMenu={() =>
                setPageData({ ...pageData, activeMenu: "sponsor-signature" })
              }
              activeMenu={pageData.activeMenu}
              name="sponsor-signature"
            >
              <FileSignature size={22} /> Sponsor's Signature
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
                handleOutsideMail,
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
                    outside
                    loading={loading}
                    access={access}
                    title={
                      pageData.students.name +
                      " " +
                      pageData.students.last_name +
                      " - Enrollment Process"
                    }
                    registry={registry}
                    InputContext={InputContext}
                  />
                  {pageData.loaded ? (
                    <>
                      {pageData.activeMenu === "sponsor-signature" ? (
                        <InputLineGroup
                          title="Sponsor Signature"
                          activeMenu={
                            pageData.activeMenu === "sponsor-signature"
                          }
                        >
                          <InputLine title="Sponsor Information">
                            <Input
                              type="text"
                              name="name"
                              required
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="Full Name"
                              defaultValue={pageData.sponsor.name}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="email"
                              required
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="E-mail"
                              defaultValue={pageData.sponsor.email}
                              InputContext={InputContext}
                            />
                            <PhoneNumberInput
                              type="text"
                              name="phone"
                              required
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="Phone Number"
                              value={pageData.sponsor.phone}
                              InputContext={InputContext}
                            />
                            <DatePicker
                              name="birthday"
                              required
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="Birth Date"
                              defaultValue={
                                pageData.sponsor.birthday
                                  ? parseISO(pageData.sponsor.birthday)
                                  : null
                              }
                              placeholderText="MM/DD/YYYY"
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine title="Legal Entity (If a bank statement is in the name of a company)">
                            <Input
                              type="text"
                              name="legal_entity_name"
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="Name of the company"
                              defaultValue={pageData.sponsor.legal_entity_name}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="legal_entity_email"
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="E-mail"
                              defaultValue={pageData.sponsor.legal_entity_email}
                              InputContext={InputContext}
                            />
                            <PhoneNumberInput
                              type="text"
                              name="legal_entity_phone"
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="Phone Number"
                              value={pageData.sponsor.legal_entity_phone}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="legal_entity_address"
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="Address"
                              defaultValue={
                                pageData.sponsor.legal_entity_address
                              }
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="legal_entity_position"
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="Position of the person who is signing this affidavit."
                              defaultValue={
                                pageData.sponsor.legal_entity_position
                              }
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine title="Address Information">
                            <Input
                              type="text"
                              name="address"
                              required
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="Address"
                              defaultValue={pageData.sponsor.address}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="zip_code"
                              required
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="Zip Code"
                              defaultValue={pageData.sponsor.zip_code}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine>
                            <Input
                              type="text"
                              name="city"
                              required
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="City"
                              defaultValue={pageData.sponsor.city}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="state"
                              required
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="State"
                              defaultValue={pageData.sponsor.state}
                              InputContext={InputContext}
                            />
                            <SelectPopover
                              name="country"
                              required
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="Country"
                              isSearchable
                              defaultValue={countriesOptions.find(
                                (country) =>
                                  country.value === pageData.sponsor.country
                              )}
                              options={countriesOptions}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine title="Birth Place Information">
                            <Input
                              type="text"
                              name="birth_city"
                              required
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="City"
                              defaultValue={pageData.sponsor.birth_city}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="birth_state"
                              required
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="State"
                              defaultValue={pageData.sponsor.birth_state}
                              InputContext={InputContext}
                            />
                            <SelectPopover
                              name="birth_country"
                              required
                              grow
                              readOnly={!profile && pageData.sponsor_signature}
                              title="Country"
                              isSearchable
                              defaultValue={countriesOptions.find(
                                (country) =>
                                  country.value ===
                                  pageData.sponsor.birth_country
                              )}
                              options={countriesOptions}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine title="Proof of financial support">
                            <div className="text-md">
                              <strong>Name of the student:</strong>{" "}
                              {pageData.students.name}
                            </div>
                          </InputLine>
                          <InputLine>
                            <div className="text-md">
                              <strong>Country of citizen:</strong>{" "}
                              {pageData.students.citizen_country}
                            </div>
                          </InputLine>
                          <InputLine>
                            <div>
                              Immigration requires that students submit
                              documented proof of financial support.{" "}
                              <em>MILA School</em> requires the amount indicated
                              below:
                            </div>
                          </InputLine>
                          <InputLine>
                            {pageData.has_dependents ? (
                              <div className="text-lg">
                                {formatter.format(
                                  (parseFloat(
                                    pageData.filial
                                      .financial_support_student_amount
                                  ) +
                                    parseFloat(
                                      pageData.filial
                                        .financial_support_dependent_amount
                                    ) *
                                      pageData.enrollmentdependents.length) *
                                    pageData.plan_months
                                )}{" "}
                                (Estimate)
                              </div>
                            ) : (
                              <div className="text-lg">
                                {formatter.format(
                                  parseFloat(
                                    pageData.filial
                                      .financial_support_student_amount
                                  ) * pageData.plan_months
                                )}{" "}
                                (Estimate)
                              </div>
                            )}
                          </InputLine>
                          <InputLine>
                            {pageData.sponsor.responsible_checkbox ? (
                              <CheckboxInput
                                grow
                                name="responsible_checkbox"
                                defaultValue={true}
                                required
                                readOnly={
                                  !profile && pageData.sponsor_signature
                                }
                                title={`I will be responsible for student's financial and personal support for the durantion of hir/her studies at MILA.`}
                                InputContext={InputContext}
                              />
                            ) : (
                              <CheckboxInput
                                grow
                                name="responsible_checkbox"
                                required
                                title={`I will be responsible for student's financial and personal support for the durantion of hir/her studies at MILA.`}
                                InputContext={InputContext}
                              />
                            )}
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
                                  {/* {!profile && !pageData.sponsor_signature && ( */}
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
                                        required={
                                          document.required &&
                                          pageData.enrollmentdocuments &&
                                          pageData.enrollmentdocuments.filter(
                                            (enrollmentdocument) =>
                                              enrollmentdocument.document_id ===
                                              document.id
                                          ).length === 0
                                        }
                                        title={"Multiple Files"}
                                        grow
                                        InputContext={InputContext}
                                      />
                                    )}
                                  </InputLine>
                                  {/* )} */}
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
                                                        {!pageData.sponsor_signature && (
                                                          <button
                                                            type="button"
                                                            onClick={() =>
                                                              handleDeleteDocument(
                                                                enrollmentdocument.id
                                                              )
                                                            }
                                                            className="text-xs text-red-700 cursor-pointer flex flex-row items-center justify-start gap-1 mt-1 px-2 py-1 rounded hover:bg-red-100"
                                                          >
                                                            <X size={12} />{" "}
                                                            Delete
                                                          </button>
                                                        )}
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
                          {pageData.sponsor_signature ? (
                            <InputLine title="Sponsor Signature">
                              <div className="flex flex-1 flex-col items-start justify-start">
                                <img
                                  src={pageData.sponsor.sponsorsignature.url}
                                  className="border w-96"
                                />
                                <p className="text-xs p-2 border border-t-0 rounded-b-md bg-slate-100 w-96">
                                  Signed:{" "}
                                  {format(
                                    parseISO(
                                      pageData.sponsor.sponsorsignature
                                        .created_at
                                    ),
                                    "MMM do, yyyy"
                                  )}{" "}
                                  at{" "}
                                  {format(
                                    parseISO(
                                      pageData.sponsor.sponsorsignature
                                        .created_at
                                    ),
                                    "HH:mm"
                                  )}
                                </p>
                              </div>
                            </InputLine>
                          ) : (
                            <InputLine title="Sponsor Signature">
                              <PDFViewer
                                download={true}
                                pageNumber={5}
                                onlyOnePage={true}
                                file={{
                                  url:
                                    pageData.contracts.find(
                                      (contract) =>
                                        contract.file.document.subtype ===
                                        "F1 Contract"
                                    ).file.url + "#page=5",
                                }}
                                height={450}
                              />
                              <div className="flex flex-1 flex-col items-start justify-start">
                                <div
                                  onClick={handleSignature}
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
                        </InputLineGroup>
                      ) : (
                        <div className="flex h-full flex-row items-center justify-center text-center gap-4">
                          <CheckCircle size={32} color="#00b361" />
                          Thank you!
                        </div>
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
