import { Form } from "@unform/web";
import {
  Ambulance,
  BadgeDollarSign,
  BookText,
  CheckCheck,
  CheckCircle,
  Contact,
  Files,
  FileSignature,
  PlusCircle,
  Trash,
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
import { saveAs } from "file-saver";
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
  getRegistries,
  handleUpdatedFields,
} from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import DatePicker from "~/components/RegisterForm/DatePicker";
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
import PDFViewer from "~/components/PDFViewer";
import CheckboxInput from "~/components/RegisterForm/CheckboxInput";
import {
  addressOptions,
  dept1TypeOptions,
  genderOptions,
  maritalStatusOptions,
  relationshipTypeOptions,
  scheduleOptions,
  sponsorRelationshipTypeOptions,
  yesOrNoOptions,
} from "~/functions/selectPopoverOptions";
import PhoneNumberInput from "~/components/RegisterForm/PhoneNumberInput";
import { useSelector } from "react-redux";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const InputContext = createContext({});

export default function EnrollmentOutside({
  access = null,
  handleOpened,
  setOpened,
  defaultFormType = "preview",
}) {
  const { profile } = useSelector((state) => state.user);
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
    agreement: false,
    lastActiveMenu: {},
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
  const [sponsorOtherRelationshipType, setSponsorOtherRelationshipType] =
    useState([]);

  const id = searchparams.get("crypt");
  const { alertBox } = useContext(AlertContext);
  const signatureRef = useRef();
  const sponsorshipOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No (Self Financial Resource)" },
  ];

  const menus = [
    { order: 0, name: "transfer-request" },
    { order: 0, name: "transfer-agent" },
    { order: 1, name: "student-information" },
    { order: 2, name: "emergency-contact" },
    { order: 3, name: "enrollment-information" },
    { order: 4, name: "dependent-information" },
    { order: 5, name: "affidavit-of-support" },
    { order: 6, name: "documents-upload" },
    { order: 7, name: "student-signature" },
    { order: 8, name: "sponsor-signature" },
    { order: 8, name: "finished" },
  ];

  const countriesOptions = countries_list.map((country) => {
    return { value: country, label: country };
  });

  const studentInfoSchema = Yup.object().shape({
    // birth_country: Yup.string().required('Required field.'),
    // birth_state: Yup.string().required('Required field.'),
    // birth_city: Yup.string().required('Required field.'),
    // state: Yup.string().required('Required field.'),
    // city: Yup.string().required('Required field.'),
    // zip: Yup.string().required('Required field.'),
    // address: Yup.string().required('Required field.'),
    // foreign_address: Yup.string().required('Required field.'),
    // phone: Yup.string().required('Required field.'),
    // home_country_phone: Yup.string().required('Required field.'),
    // whatsapp: Yup.string().required('Required field.'),
    // date_of_birth: Yup.string().required('Required field.'),
    // preferred_contact_form: Yup.string().required('Required field.'),
    // passport_number: Yup.string().required('Required field.'),
    // visa_number: Yup.string().required('Required field.'),
    // visa_expiration: Yup.string().required('Required field.'),
    // nsevis: Yup.string().required('Required field.'),
    // how_did_you_hear_about_us: Yup.string().required('Required field.'),
    // native_language: Yup.string().required('Required field.'),
    // citizen_country: Yup.string().required('Required field.'),
  });

  const emergencySchema = Yup.object().shape({
    enrollmentemergencies: Yup.array().of(
      Yup.object().shape({
        name: Yup.string()
          .matches(
            /^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/gi,
            "Name can only contain Latin letters."
          )
          .matches(
            /^\s*[\S]+(\s[\S]+)+\s*$/gms,
            "Please enter your full name."
          ),
        relationship_type: Yup.string().required(
          "Relationship Type is required."
        ),
        email: Yup.string().email("Email is invalid."),
        // phone: Yup.string().matches(/^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/, 'Phone number is invalid.')
      })
    ),
  });

  const dependentInfoSchema = Yup.object().shape({
    has_dependents: Yup.string().required("Required field."),
    enrollmentdependents: Yup.array().of(
      Yup.object().shape({
        name: Yup.string()
          .matches(
            /^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/gi,
            "Name can only contain Latin letters."
          )
          .matches(
            /^\s*[\S]+(\s[\S]+)+\s*$/gms,
            "Please enter your full name."
          ),
        relationship_type: Yup.string().required(
          "Relationship Type is required."
        ),
        gender: Yup.string().required("Required field."),
        email: Yup.string().email("Email is invalid."),
        // phone: Yup.string().matches(/^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/, 'Phone number is invalid.')
      })
    ),
  });

  const affidavitOfSupportSchema = Yup.object().shape({
    need_sponsorship: Yup.string().required("Required field."),
    enrollmentsponsors: Yup.array().of(
      Yup.object().shape({
        name: Yup.string()
          .matches(
            /^([A-Za-z\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff\s]*)$/gi,
            "Name can only contain Latin letters."
          )
          .matches(
            /^\s*[\S]+(\s[\S]+)+\s*$/gms,
            "Please enter your full name."
          ),
        relationship_type: Yup.string().required(
          "Relationship Type is required."
        ),
        email: Yup.string().email("Email is invalid."),
        // phone: Yup.string().matches(/^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/, 'Phone number is invalid.')
      })
    ),
  });

  useEffect(() => {
    async function getDocuments(type = "") {
      const { data } = await api.get(
        `/documentsByOrigin?origin=Enrollment&type=${type}&subtype=Student`
      );
      return data;
    }
    async function getDependentDocuments(type = "") {
      const { data } = await api.get(
        `/documentsByOrigin?origin=Enrollment&type=${type}&subtype=Dependent`
      );
      return data;
    }
    async function getPageData() {
      if (id !== "new") {
        try {
          let documents = [];
          let dependentDocuments = [];
          const { data } = await api.get(`/outside/enrollments/${id}`);
          const { data: filialData } = await api.get(
            `/filials/${data.filial_id}`
          );
          documents = await getDocuments(data.students.processsubstatuses.name);
          dependentDocuments = await getDependentDocuments(
            data.students.processsubstatuses.name
          );

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
            dependentDocuments,
            contracts: filialData.filialdocuments,
            loaded: true,
            activeMenu: searchparams.has("activeMenu")
              ? searchparams.get("activeMenu")
              : data.form_step === "transfer-agent"
              ? "student-information"
              : data.form_step,
            lastActiveMenu: searchparams.has("activeMenu")
              ? searchparams.get("activeMenu")
              : menus.find((menu) => menu.name === data.form_step),
            has_sponsor_signed: data.enrollmentsponsors.find(
              (sponsor) => sponsor.signature !== null
            )
              ? true
              : false,
          });
          const getRelationshipTypeOptions = data.enrollmentsponsors.map(
            (sponsor) => {
              return {
                id: sponsor.id,
                value: sponsor.relationship_type,
              };
            }
          );
          setSponsorOtherRelationshipType(getRelationshipTypeOptions);
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
      generalForm.current.setErrors({});
      if (pageData.activeMenu === "student-information") {
        const result = await studentInfoSchema.validate(data, {
          abortEarly: false,
        });
      } else if (pageData.activeMenu === "emergency-contact") {
        const result = await emergencySchema.validate(data, {
          abortEarly: false,
        });
      } else if (pageData.activeMenu === "dependent-information") {
        const result = await dependentInfoSchema.validate(data, {
          abortEarly: false,
        });
      } else if (pageData.activeMenu === "affidavit-of-support") {
        const result = await affidavitOfSupportSchema.validate(data, {
          abortEarly: false,
        });
      }
    } catch (err) {
      const validationErrors = {};

      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        generalForm.current.setErrors(validationErrors);
      }
      setLoading(false);
      return;
    }
    delete data.agreement;
    if (successfullyUpdated) {
      toast("No need to be saved!", {
        autoClose: 1000,
        type: "info",
        transition: Zoom,
      });
      setLoading(false);
      return;
    }

    if (id !== "new") {
      if (pageData.activeMenu === "student-signature") {
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
              await api.put(`/outside/enrollments/${id}`, {
                activeMenu: pageData.activeMenu,
                lastActiveMenu: pageData.lastActiveMenu,
              });
              setPageData({ ...pageData, loaded: false });
              setSuccessfullyUpdated(true);
              toast("Saved!", { autoClose: 1000 });
              setLoading(false);
            });
          }
        );
        return;
      }

      const updated = handleUpdatedFields(data, pageData);

      const promises = [];

      if (updated.length > 0) {
        const objUpdated = Object.fromEntries(updated);
        const { date_of_birth, passport_expiration_date, i94_expiration_date } =
          objUpdated;

        Promise.all(promises)
          .then((result) => {
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
                  toast(err.response.data.error, {
                    type: "error",
                    autoClose: 3000,
                  });
                }
                // return
                delete objUpdated.documents;
              });
            }
          })
          .finally(async () => {
            await api
              .put(`/outside/enrollments/${id}`, {
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
              })
              .then(async () => {
                verifyDependentDocuments(data);
                setPageData({ ...pageData, loaded: false });
                setLoading(false);
                setSuccessfullyUpdated(true);
                toast("Saved!", { autoClose: 1000 });
              });
          });
      }
    }
  }

  function verifyDependentDocuments(data = null) {
    if (data.enrollmentdependents && data.enrollmentdependents.length > 0) {
      let toastId = null;
      data.enrollmentdependents.map((dependent, index) => {
        if (
          dependent.dependentDocuments.find(
            (document) =>
              (typeof document.file_id === "undefined" && document.file_id) ||
              (typeof document.file_id === "object" &&
                Array.from(document.file_id).length > 0)
          )
        ) {
          toastId = toast.loading("Dependents files are being uploaded...");
        }
        const allPromises = organizeMultiAndSingleFiles(
          dependent.dependentDocuments,
          "Dependents"
        );
        data.enrollmentdependents[index].storedFiles = [];
        Promise.all(allPromises)
          .then(async (files) => {
            try {
              files.map(async (file) => {
                if (!file) {
                  return;
                }
                if (file.name) {
                  data.enrollmentdependents[index].storedFiles.push(file);
                  await api.post(`/dependentsdocuments`, {
                    enrollment_id: id,
                    files: file,
                    dependent_id: dependent.id,
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
                        data.enrollmentdependents[index].storedFiles.push(
                          singleFile[0]
                        );
                        await api.post(`/dependentsdocuments`, {
                          enrollment_id: id,
                          files: singleFile[0],
                          dependent_id: dependent.id,
                        });
                      });
                    });
                }
              });
            } catch (err) {
              toast(err.response.data.error, {
                type: "error",
                autoClose: 3000,
              });
            }
          })
          .finally(() => {
            return data;
          });
      });
    }
  }

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  function handleInactivate() {}

  async function handleHasDependents(el) {
    if (pageData.has_dependents === el.value) {
      return;
    }
    const promisesReset = [];
    promisesReset.push(
      pageData.enrollmentdependents.map((dependent, index) => {
        if (dependent) {
          return handleRemoveDependent(index, dependent.id);
        }
      })
    );
    Promise.all(promisesReset).then(async () => {
      const promises = [];
      if (el.value === false) {
        setSuccessfullyUpdated(false);
        setPageData({
          ...pageData,
          has_dependents: el.value,
          enrollmentdependents: [],
        });
      } else {
        setSuccessfullyUpdated(true);
        await handleCreateDependent().then((newDependent) => {
          setPageData({
            ...pageData,
            has_dependents: el.value,
            enrollmentdependents: [newDependent],
          });
        });
      }
    });
  }

  async function handleHasSponsors(el) {
    if (pageData.need_sponsorship === el.value) {
      return;
    }
    let newSponsor = null;
    const promises = [];
    function resetSponsors() {
      const promises = [];
      promises.push(
        pageData.enrollmentsponsors.map((sponsor, index) => {
          return handleRemoveSponsor(index, sponsor.id);
        })
      );
      Promise.all(promises).then(() => {
        return;
      });
    }
    if (el.value === false) {
      setSuccessfullyUpdated(false);
      promises.push(resetSponsors());
    } else {
      setSuccessfullyUpdated(true);
      if (pageData.enrollmentsponsors.length > 0) {
        promises.push(resetSponsors());
      }
      setSuccessfullyUpdated(true);
      promises.push((newSponsor = await handleCreateSponsor()));
    }
    Promise.all(promises).then(() => {
      setPageData({
        ...pageData,
        need_sponsorship: el.value,
        enrollmentsponsors: el.value ? [newSponsor] : [],
      });
    });
  }

  async function handleCreateDependent() {
    try {
      const { data } = await api.post(`/enrollmentdependent`, {
        enrollment_id: id,
      });
      return data;
    } catch (err) {
      console.log({ err });
      // toast(err.response.data.error, { type: "error", autoClose: 3000 });
      return null;
    }
  }

  async function handleCreateSponsor() {
    try {
      const { data } = await api.post(`/enrollmentsponsor`, {
        enrollment_id: id,
      });
      return data;
    } catch (err) {
      console.log({ err });
      toast(err.response.data.error, { type: "error", autoClose: 3000 });
      return null;
    }
  }

  async function handleAddDependent() {
    setSuccessfullyUpdated(false);
    const addedDependents = [...pageData.enrollmentdependents];
    addedDependents.push(await handleCreateDependent());
    setPageData({ ...pageData, enrollmentdependents: addedDependents });
  }

  async function handleAddSponsor() {
    setSuccessfullyUpdated(false);
    const addedSponsors = [...pageData.enrollmentsponsors];
    addedSponsors.push(await handleCreateSponsor());
    // addedSponsors.push({
    //   name: null,
    //   relationship_type: null,
    //   email: null,
    //   phone: null,
    // });
    setPageData({ ...pageData, enrollmentsponsors: addedSponsors });
  }

  function handleRemoveDependent(index, id) {
    setSuccessfullyUpdated(false);

    try {
      api.delete(`/enrollmentdependent/${id}`).then(() => {
        const newData = generalForm.current.getData();

        if (newData.enrollmentdependents) {
          newData.enrollmentdependents.splice(index, 1);
          generalForm.current.setData(newData);

          setPageData({
            ...pageData,
            enrollmentdependents: newData.enrollmentdependents,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  function handleRemoveSponsor(index, id) {
    setSuccessfullyUpdated(false);

    try {
      api.delete(`/enrollmentsponsor/${id}`).then(() => {
        const newData = generalForm.current.getData();

        if (newData.enrollmentsponsors) {
          newData.enrollmentsponsors.splice(index, 1);
          generalForm.current.setData(newData);
          setPageData({
            ...pageData,
            enrollmentsponsors: newData.enrollmentsponsors,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  function handleDeleteDependentDocument(dependent_id, id) {
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
              await api.delete(`/dependentsdocuments/${id}`);
              toast("File deleted!", { autoClose: 1000 });
              const newDependents = pageData.enrollmentdependents.map(
                (dependent) => {
                  if (dependent.id === dependent_id) {
                    const newDocuments = dependent.documents.filter(
                      (document) => document.id !== id
                    );
                    return { ...dependent, documents: newDocuments };
                  } else {
                    return dependent;
                  }
                }
              );
              setPageData({
                ...pageData,
                enrollmentdependents: newDependents,
              });
            } catch (err) {
              console.log(err);
              // toast(err.response.data.error, {
              //   type: "error",
              //   autoClose: 3000,
              // });
            }
          },
        },
      ],
    });
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

  function handleGetAffidavitSupport(sponsorId = null) {
    if (!sponsorId) {
      return;
    }
    api
      .get(`/pdf/affidavit-support/${sponsorId}`, {
        responseType: "blob",
      })
      .then((res) => {
        const pdfBlob = new Blob([res.data], { type: "application/pdf" });
        saveAs(
          pdfBlob,
          `affidavit_of_support_${"bc59904a-686e-4b05-b69f-64960af78565"}.pdf`
        );
      })
      .catch((err) => {
        toast("Affidavit not available yet.", {
          type: "error",
          autoClose: 3000,
        });
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
                setPageData({ ...pageData, activeMenu: menus[2].name })
              }
              activeMenu={pageData.activeMenu}
              name="student-information"
            >
              <User size={22} /> Student Information
            </RegisterFormMenu>
            <RegisterFormMenu
              disabled={
                pageData.lastActiveMenu &&
                pageData.lastActiveMenu.order < 2 &&
                !searchparams.has("activeMenu")
              }
              setActiveMenu={() =>
                setPageData({ ...pageData, activeMenu: menus[3].name })
              }
              activeMenu={pageData.activeMenu}
              name="emergency-contact"
            >
              <Ambulance size={22} /> Emergency Contact
            </RegisterFormMenu>
            <RegisterFormMenu
              disabled={
                pageData.lastActiveMenu &&
                pageData.lastActiveMenu.order < 3 &&
                !searchparams.has("activeMenu")
              }
              setActiveMenu={() =>
                setPageData({ ...pageData, activeMenu: menus[4].name })
              }
              activeMenu={pageData.activeMenu}
              name="enrollment-information"
            >
              <BookText size={22} /> Enrollment Information
            </RegisterFormMenu>
            <RegisterFormMenu
              disabled={
                pageData.lastActiveMenu &&
                pageData.lastActiveMenu.order < 4 &&
                !searchparams.has("activeMenu")
              }
              setActiveMenu={() =>
                setPageData({ ...pageData, activeMenu: menus[5].name })
              }
              activeMenu={pageData.activeMenu}
              name="dependent-information"
            >
              <Contact size={22} /> Dependent Information
            </RegisterFormMenu>
            <RegisterFormMenu
              disabled={
                pageData.lastActiveMenu &&
                pageData.lastActiveMenu.order < 5 &&
                !searchparams.has("activeMenu")
              }
              setActiveMenu={() =>
                setPageData({ ...pageData, activeMenu: menus[6].name })
              }
              activeMenu={pageData.activeMenu}
              name="affidavit-of-support"
            >
              <BadgeDollarSign size={22} /> Affidavit of Support
            </RegisterFormMenu>
            <RegisterFormMenu
              disabled={
                pageData.lastActiveMenu &&
                pageData.lastActiveMenu.order < 6 &&
                !searchparams.has("activeMenu")
              }
              setActiveMenu={() =>
                setPageData({ ...pageData, activeMenu: menus[7].name })
              }
              activeMenu={pageData.activeMenu}
              name="documents-upload"
            >
              <Files size={22} /> Documents Upload
            </RegisterFormMenu>
            <RegisterFormMenu
              disabled={
                pageData.lastActiveMenu &&
                pageData.lastActiveMenu.order < 7 &&
                !searchparams.has("activeMenu")
              }
              setActiveMenu={() =>
                setPageData({ ...pageData, activeMenu: menus[8].name })
              }
              activeMenu={pageData.activeMenu}
              name="student-signature"
            >
              <FileSignature size={22} /> Student's Signature
            </RegisterFormMenu>
            <RegisterFormMenu
              disabled={
                pageData.lastActiveMenu &&
                pageData.lastActiveMenu.order < 8 &&
                !searchparams.has("activeMenu")
              }
              setActiveMenu={
                () => null
                // setPageData({ ...pageData, activeMenu: menus[9].name })
              }
              activeMenu={pageData.activeMenu}
              name="sponsor-signature"
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
                    outside={true}
                    loading={loading}
                    access={{
                      view: true,
                      edit: true,
                      create: true,
                      inactivate: true,
                    }}
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
                      {pageData.activeMenu === "student-information" && (
                        <InputLineGroup
                          title="Student Information"
                          activeMenu={
                            pageData.activeMenu === "student-information"
                          }
                        >
                          <Scope path={`students`}>
                            <InputLine title="General Data">
                              <DatePicker
                                name="date_of_birth"
                                required
                                grow
                                title="Birth Date"
                                defaultValue={
                                  pageData.students.date_of_birth
                                    ? parseISO(pageData.students.date_of_birth)
                                    : null
                                }
                                placeholderText="MM/DD/YYYY"
                                InputContext={InputContext}
                              />
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
                          </Scope>
                          <Scope path={`students`}>
                            <InputLine title="Birth Details">
                              <Input
                                type="text"
                                name="birth_city"
                                required
                                grow
                                title="Birth City"
                                defaultValue={pageData.students.birth_city}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="birth_state"
                                required
                                grow
                                title="Birth State"
                                defaultValue={pageData.students.birth_state}
                                InputContext={InputContext}
                              />
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
                              <Input
                                type="text"
                                name="native_language"
                                required
                                grow
                                title="Native Language"
                                defaultValue={pageData.students.native_language}
                                InputContext={InputContext}
                              />
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
                                defaultValue={pageData.students.passport_number}
                                InputContext={InputContext}
                              />
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
                                          pageData.students.i94_expiration_date
                                        )
                                      : null
                                  }
                                  placeholderText="MM/DD/YYYY"
                                  InputContext={InputContext}
                                />
                              )}
                            </InputLine>
                          </Scope>

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
                          <Scope path={`students`}>
                            {pageData.students.sub_status !== "Transfer In" && (
                              <InputLine title="Address in Home Country">
                                <PhoneNumberInput
                                  type="text"
                                  name="home_country_phone"
                                  grow
                                  title="Phone Number"
                                  value={pageData.students.home_country_phone}
                                  InputContext={InputContext}
                                />
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
                            )}
                            {pageData.students.sub_status !== "Transfer In" && (
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
                            )}
                            {pageData.students.sub_status !== "Initial" && (
                              <InputLine title="Address in United States">
                                <PhoneNumberInput
                                  type="text"
                                  name="phone"
                                  grow
                                  title="USA Phone Number"
                                  value={pageData.students.phone}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="address"
                                  grow
                                  title="USA Address"
                                  defaultValue={pageData.students.address}
                                  InputContext={InputContext}
                                />
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
                            )}
                            {pageData.students.sub_status !== "Initial" && (
                              <InputLine>
                                <Input
                                  type="text"
                                  name="city"
                                  grow
                                  title="USA City"
                                  defaultValue={pageData.students.city}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="state"
                                  grow
                                  title="USA State"
                                  defaultValue={pageData.students.state}
                                  InputContext={InputContext}
                                />
                              </InputLine>
                            )}
                          </Scope>
                        </InputLineGroup>
                      )}
                      {pageData.activeMenu === "emergency-contact" && (
                        <InputLineGroup
                          title="Emergency Contact"
                          activeMenu={
                            pageData.activeMenu === "emergency-contact"
                          }
                        >
                          <Scope path={`enrollmentemergencies[0]`}>
                            <InputLine title="Emergency Contact">
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
                                    ? pageData.enrollmentemergencies[0].phone
                                    : ""
                                }
                                InputContext={InputContext}
                              />
                            </InputLine>
                          </Scope>
                        </InputLineGroup>
                      )}
                      {pageData.activeMenu === "enrollment-information" && (
                        <InputLineGroup
                          title="Enrollment Information"
                          activeMenu={
                            pageData.activeMenu === "enrollment-information"
                          }
                        >
                          <InputLine title="Enrollment Information">
                            <Input
                              type="text"
                              name="plan_months"
                              required
                              onlyInt
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
                        </InputLineGroup>
                      )}
                      {pageData.activeMenu === "dependent-information" && (
                        <InputLineGroup
                          title="Dependent Information"
                          activeMenu={
                            pageData.activeMenu === "dependent-information"
                          }
                        >
                          <InputLine title="Dependent Information">
                            <SelectPopover
                              name="has_dependents"
                              required
                              onChange={(el) => handleHasDependents(el)}
                              grow
                              disabled={
                                !profile &&
                                pageData.lastActiveMenu &&
                                pageData.lastActiveMenu.order > 7
                              }
                              title="Do you have dependents?"
                              options={yesOrNoOptions}
                              defaultValue={yesOrNoOptions.find(
                                (type) => type.value === pageData.has_dependents
                              )}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          {pageData.has_dependents && (
                            <>
                              {pageData.enrollmentdependents.map(
                                (dependent, index) => {
                                  if (dependent && dependent.id !== 1) {
                                    return (
                                      <Scope
                                        key={index}
                                        path={`enrollmentdependents[${index}]`}
                                      >
                                        <InputLine
                                          title={`Dependent ${index + 1}`}
                                        >
                                          <Input
                                            type="hidden"
                                            name="id"
                                            defaultValue={dependent.id}
                                            InputContext={InputContext}
                                          />
                                          {(profile ||
                                            pageData.lastActiveMenu.order <
                                              7) &&
                                          index > 0 &&
                                          index ===
                                            pageData.enrollmentdependents
                                              .length -
                                              1 ? (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleRemoveDependent(
                                                  index,
                                                  dependent.id
                                                )
                                              }
                                            >
                                              <Trash
                                                size={14}
                                                className="mt-4"
                                              />
                                            </button>
                                          ) : null}
                                          <Input
                                            type="text"
                                            name="name"
                                            required
                                            grow
                                            title="Full Name"
                                            readOnly={
                                              !profile &&
                                              pageData.lastActiveMenu.order >= 7
                                            }
                                            defaultValue={dependent.name}
                                            InputContext={InputContext}
                                          />
                                          <SelectPopover
                                            name="gender"
                                            required
                                            grow
                                            title="Gender"
                                            readOnly={
                                              !profile &&
                                              pageData.lastActiveMenu.order >= 7
                                            }
                                            options={genderOptions}
                                            isSearchable
                                            defaultValue={genderOptions.find(
                                              (gender) =>
                                                gender.value ===
                                                dependent.gender
                                            )}
                                            InputContext={InputContext}
                                          />
                                          {/* <SelectPopover
                                            name="dept1_type"
                                            required
                                            grow
                                            title="Dept1 Type"
                                            readOnly={
                                              pageData.lastActiveMenu.order >= 7
                                            }
                                            options={dept1TypeOptions}
                                            isSearchable
                                            defaultValue={dept1TypeOptions.find(
                                              (dept1Type) =>
                                                dept1Type.value ===
                                                dependent.dept1_type
                                            )}
                                            InputContext={InputContext}
                                          /> */}
                                          <SelectPopover
                                            name="relationship_type"
                                            required
                                            grow
                                            title="Relationship Type"
                                            readOnly={
                                              !profile &&
                                              pageData.lastActiveMenu.order >= 7
                                            }
                                            options={relationshipTypeOptions}
                                            isSearchable
                                            defaultValue={relationshipTypeOptions.find(
                                              (relationshipType) =>
                                                relationshipType.value ===
                                                dependent.relationship_type
                                            )}
                                            InputContext={InputContext}
                                          />
                                          <Input
                                            type="text"
                                            name="email"
                                            required
                                            grow
                                            title="E-mail"
                                            readOnly={
                                              !profile &&
                                              pageData.lastActiveMenu.order >= 7
                                            }
                                            defaultValue={dependent.email}
                                            InputContext={InputContext}
                                          />
                                          <PhoneNumberInput
                                            type="text"
                                            name="phone"
                                            required
                                            grow
                                            title="Phone Number"
                                            readOnly={
                                              !profile &&
                                              pageData.lastActiveMenu.order >= 7
                                            }
                                            value={dependent.phone}
                                            InputContext={InputContext}
                                          />
                                        </InputLine>

                                        {pageData.dependentDocuments &&
                                          pageData.dependentDocuments.length >
                                            0 &&
                                          pageData.dependentDocuments.map(
                                            (dependentDocument, docIndex) => {
                                              return (
                                                <Scope
                                                  key={docIndex}
                                                  path={`dependentDocuments[${docIndex}]`}
                                                >
                                                  <Input
                                                    type="hidden"
                                                    name="document_id"
                                                    defaultValue={
                                                      dependentDocument.id
                                                    }
                                                    InputContext={InputContext}
                                                  />
                                                  {(profile ||
                                                    pageData.lastActiveMenu
                                                      .order < 7) && (
                                                    <InputLine
                                                      subtitle={
                                                        dependentDocument.title
                                                      }
                                                    >
                                                      {!dependentDocument.multiple &&
                                                        pageData.dependentDocuments &&
                                                        pageData.dependentDocuments.filter(
                                                          (doc) =>
                                                            doc.document_id ===
                                                            dependentDocument.id
                                                        ).length === 0 && (
                                                          <FileInput
                                                            type="file"
                                                            name="file_id"
                                                            title={"File"}
                                                            required={
                                                              dependentDocument.required &&
                                                              dependent
                                                                .documents
                                                                .length === 0
                                                            }
                                                            grow
                                                            InputContext={
                                                              InputContext
                                                            }
                                                          />
                                                        )}
                                                      {dependentDocument.multiple && (
                                                        <FileInputMultiple
                                                          type="file"
                                                          name="file_id"
                                                          required={
                                                            dependentDocument.required &&
                                                            dependent.documents
                                                              .length === 0
                                                          }
                                                          title={
                                                            "Multiple Files"
                                                          }
                                                          grow
                                                          InputContext={
                                                            InputContext
                                                          }
                                                        />
                                                      )}
                                                    </InputLine>
                                                  )}
                                                  {dependent.documents &&
                                                    dependent.documents.length >
                                                      0 && (
                                                      <InputLine subtitle="Attached Files">
                                                        <div className="flex flex-col justify-center items-start gap-4">
                                                          {dependent.documents.map(
                                                            (doc, index) => {
                                                              if (
                                                                doc.document_id ===
                                                                dependentDocument.id
                                                              ) {
                                                                return (
                                                                  <>
                                                                    <div
                                                                      key={
                                                                        index
                                                                      }
                                                                      className="flex flex-row justify-center items-center gap-2"
                                                                    >
                                                                      <a
                                                                        href={
                                                                          doc
                                                                            .file
                                                                            .url
                                                                        }
                                                                        target="_blank"
                                                                        className="text-xs"
                                                                      >
                                                                        <div
                                                                          className="flex flex-row items-center border px-4 py-2 gap-1 rounded-md bg-gray-100 hover:border-gray-300"
                                                                          key={
                                                                            index
                                                                          }
                                                                        >
                                                                          <Files
                                                                            size={
                                                                              16
                                                                            }
                                                                          />
                                                                          {
                                                                            doc
                                                                              .file
                                                                              .name
                                                                          }
                                                                        </div>
                                                                      </a>
                                                                      {(profile ||
                                                                        pageData
                                                                          .lastActiveMenu
                                                                          .order <
                                                                          7) && (
                                                                        <button
                                                                          type="button"
                                                                          onClick={() =>
                                                                            handleDeleteDependentDocument(
                                                                              dependent.id,
                                                                              doc.id
                                                                            )
                                                                          }
                                                                          className="text-xs text-red-700 cursor-pointer flex flex-row items-center justify-start gap-1 mt-1 px-2 py-1 rounded hover:bg-red-100"
                                                                        >
                                                                          <X
                                                                            size={
                                                                              12
                                                                            }
                                                                          />{" "}
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
                                            }
                                          )}
                                      </Scope>
                                    );
                                  }
                                }
                              )}
                              {(profile ||
                                (pageData.lastActiveMenu &&
                                  pageData.lastActiveMenu.order < 7)) && (
                                <button
                                  type="button"
                                  onClick={() => handleAddDependent()}
                                  className="bg-slate-100 border ml-6 py-2 px-2 text-xs flex flex-row justify-center items-center gap-2 rounded-md transition-all hover:border-primary hover:text-primary"
                                >
                                  <PlusCircle size={16} /> Add Dependent
                                </button>
                              )}
                            </>
                          )}
                        </InputLineGroup>
                      )}
                      {pageData.activeMenu === "affidavit-of-support" && (
                        <InputLineGroup
                          title="Affidavit of Support"
                          activeMenu={
                            pageData.activeMenu === "affidavit-of-support"
                          }
                        >
                          <InputLine title="Proof of financial support">
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
                            <SelectPopover
                              name="need_sponsorship"
                              onChange={(el) => handleHasSponsors(el)}
                              required
                              disabled={
                                !pageData.has_sponsor_signed &&
                                !profile &&
                                pageData.lastActiveMenu &&
                                pageData.lastActiveMenu.order > 7
                              }
                              grow
                              title="Do you need sponsorship?"
                              options={sponsorshipOptions}
                              defaultValue={sponsorshipOptions.find(
                                (type) =>
                                  type.value === pageData.need_sponsorship
                              )}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          {pageData.need_sponsorship && (
                            <>
                              {pageData.enrollmentsponsors &&
                                pageData.enrollmentsponsors.map(
                                  (sponsor, index) => {
                                    if (sponsor) {
                                      return (
                                        <Scope
                                          key={index}
                                          path={`enrollmentsponsors[${index}]`}
                                        >
                                          <InputLine
                                            title={`Sponsor ${index + 1}`}
                                          >
                                            {sponsor.signature && (
                                              <button
                                                type="button"
                                                className="bg-mila_orange text-white p-2 rounded relative top-2"
                                                onClick={() =>
                                                  handleGetAffidavitSupport(
                                                    sponsor.id
                                                  )
                                                }
                                              >
                                                Affidavit of Support
                                              </button>
                                            )}
                                            <Input
                                              type="hidden"
                                              name="id"
                                              defaultValue={sponsor.id}
                                              InputContext={InputContext}
                                            />
                                            {!sponsor.signature &&
                                            (profile ||
                                              (pageData.lastActiveMenu.order <
                                                7 &&
                                                index > 0)) &&
                                            index ===
                                              pageData.enrollmentsponsors
                                                .length -
                                                1 ? (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleRemoveSponsor(
                                                    index,
                                                    sponsor.id
                                                  )
                                                }
                                              >
                                                <Trash
                                                  size={14}
                                                  className="mt-4"
                                                />
                                              </button>
                                            ) : null}
                                            <Input
                                              type="text"
                                              name="name"
                                              required
                                              grow
                                              title="Full Name"
                                              readOnly={
                                                sponsor.signature ||
                                                (!profile &&
                                                  pageData.lastActiveMenu
                                                    .order >= 7)
                                              }
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
                                              readOnly={
                                                sponsor.signature ||
                                                (!profile &&
                                                  pageData.lastActiveMenu
                                                    .order >= 7)
                                              }
                                              onChange={(e) => {
                                                setSuccessfullyUpdated(false);
                                                setSponsorOtherRelationshipType(
                                                  [
                                                    ...sponsorOtherRelationshipType.filter(
                                                      (sp) =>
                                                        sp.id !== sponsor.id
                                                    ),
                                                    {
                                                      id: sponsor.id,
                                                      value: e.value,
                                                    },
                                                  ]
                                                );
                                              }}
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
                                            {!sponsorRelationshipTypeOptions.find(
                                              (relationshipType) =>
                                                relationshipType.value ===
                                                sponsorOtherRelationshipType.find(
                                                  (sp) => sp.id === sponsor.id
                                                ).value
                                            ) ||
                                            sponsorOtherRelationshipType.find(
                                              (sp) => sp.id === sponsor.id
                                            ).value === "Other" ? (
                                              <Input
                                                type="text"
                                                name="relationship_type"
                                                required
                                                readOnly={
                                                  sponsor.signature ||
                                                  (!profile &&
                                                    pageData.lastActiveMenu
                                                      .order >= 7)
                                                }
                                                grow
                                                title="Please specify"
                                                defaultValue={
                                                  sponsor.relationship_type
                                                }
                                                InputContext={InputContext}
                                              />
                                            ) : (
                                              <Input
                                                type="hidden"
                                                name="relationship_type"
                                                required
                                                grow
                                                title="Please specify"
                                                defaultValue={
                                                  sponsorOtherRelationshipType.find(
                                                    (sp) => sp.id === sponsor.id
                                                  ).value
                                                }
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
                                              readOnly={
                                                sponsor.signature ||
                                                (!profile &&
                                                  pageData.lastActiveMenu
                                                    .order >= 7)
                                              }
                                              defaultValue={sponsor.email}
                                              InputContext={InputContext}
                                            />
                                            <PhoneNumberInput
                                              type="text"
                                              name="phone"
                                              required
                                              grow
                                              title="Phone Number"
                                              readOnly={
                                                sponsor.signature ||
                                                (!profile &&
                                                  pageData.lastActiveMenu
                                                    .order >= 7)
                                              }
                                              value={sponsor.phone}
                                              InputContext={InputContext}
                                            />
                                          </InputLine>
                                        </Scope>
                                      );
                                    }
                                  }
                                )}
                              {(profile ||
                                pageData.lastActiveMenu.order < 7) && (
                                <button
                                  type="button"
                                  onClick={() => handleAddSponsor()}
                                  className="bg-slate-100 border ml-6 py-1 px-2 text-xs flex flex-row justify-center items-center gap-2 rounded-md transition-all hover:border-primary hover:text-primary"
                                >
                                  <PlusCircle size={16} /> Sponsor
                                </button>
                              )}
                            </>
                          )}
                        </InputLineGroup>
                      )}
                      {pageData.activeMenu === "documents-upload" && (
                        <InputLineGroup
                          title="Documents Upload"
                          activeMenu={
                            pageData.activeMenu === "documents-upload"
                          }
                        >
                          {pageData.documents &&
                            pageData.documents.length > 0 &&
                            pageData.documents.map((document, index) => {
                              console.log(document);
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
                                                        {(profile ||
                                                          pageData
                                                            .lastActiveMenu
                                                            .order < 7) && (
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
                        </InputLineGroup>
                      )}
                      {pageData.activeMenu === "student-signature" && (
                        <InputLineGroup
                          title="Student Signature"
                          activeMenu={
                            pageData.activeMenu === "student-signature"
                          }
                        >
                          {!profile && !pageData.signature ? (
                            <InputLine title="Student Signature">
                              {pageData.contracts &&
                                pageData.contracts.length > 0 && (
                                  <div className="flex flex-col gap-2">
                                    <PDFViewer
                                      download={true}
                                      file={{
                                        url: pageData.contracts.find(
                                          (contract) =>
                                            contract.file.document.subtype ===
                                            "F1 Contract"
                                        ).file.url,
                                      }}
                                      height={450}
                                    />
                                    <CheckboxInput
                                      name="agreement"
                                      required={true}
                                      title="I agree to the terms and conditions above"
                                      InputContext={InputContext}
                                      grow
                                    />
                                  </div>
                                )}
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
                      {(pageData.activeMenu === "sponsor-signature" ||
                        pageData.activeMenu === "finished") && (
                        <InputLineGroup
                          title="Finish"
                          activeMenu={
                            pageData.activeMenu === "sponsor-signature" ||
                            pageData.activeMenu === "finished"
                          }
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
