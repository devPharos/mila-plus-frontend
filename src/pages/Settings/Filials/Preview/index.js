import { Form } from "@unform/web";
import {
  Building,
  CircleDollarSign,
  Files,
  FileSignature,
  Pencil,
  Trash,
  X,
} from "lucide-react";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import Input from "~/components/RegisterForm/Input";
import RegisterFormMenu from "~/components/RegisterForm/Menu";
import Select from "~/components/RegisterForm/Select";
import Textarea from "~/components/RegisterForm/Textarea";
import api from "~/services/api";
import {
  countries_list,
  getRegistries,
  handleUpdatedFields,
} from "~/functions";
import { Zoom, toast } from "react-toastify";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import { Scope } from "@unform/core";
import CheckboxInput from "~/components/RegisterForm/CheckboxInput";
import Preview from "~/components/Preview";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import FormLoading from "~/components/RegisterForm/FormLoading";
import FileInput from "~/components/RegisterForm/FileInput";
import { organizeMultiAndSingleFiles } from "~/functions/uploadFile";
import { AlertContext } from "~/App";
import {
  discountOptions,
  discountTypesOptions,
  yesOrNoOptions,
} from "~/functions/selectPopoverOptions";
import { FullGridContext } from "../..";

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
    active: false,
    alias: "",
    name: "",
    Filialtype: { id: null, label: "" },
    administrator: null,
    ein: "",
    address: "",
    zipcode: "",
    city: "",
    state: "",
    country: "",
    observations: "",
    pricelists: [],
    discountlists: [],
    loaded: false,
    parking_spot_image: null,
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
  const [filialTypesOptions, setFilialTypesOptions] = useState([]);
  const generalForm = useRef();
  const { alertBox } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);

  const countriesOptions = countries_list.map((country) => {
    return { value: country, label: country };
  });

  useEffect(() => {
    async function getPageData() {
      try {
        api.get(`filials/${id}`).then(async ({ data }) => {
          api
            .get(`processsubstatuses`)
            .then(async ({ data: processsubstatuses }) => {
              const { data: documents } = await api.get(
                `/documentsByOrigin?origin=Branches&type=Contracts`
              );
              const mappedProcessSubstatuses = processsubstatuses.map(
                (processsubstatus) => {
                  return {
                    id: null,
                    name: processsubstatus.name,
                    processsubstatus_id: processsubstatus.id,
                    registration_fee: 0,
                    book: 0,
                    tuition: 0,
                    active: false,
                  };
                }
              );
              const {
                created_by,
                created_at,
                updated_by,
                updated_at,
                canceled_by,
                canceled_at,
                pricelists,
              } = data;
              // console.log(pricelists, mappedProcessSubstatuses)
              setPageData({
                ...data,
                documents,
                loaded: true,
                pricelists: pricelists.concat(
                  mappedProcessSubstatuses.filter(
                    (processsubstatus) =>
                      !pricelists.find(
                        (price) =>
                          price.processsubstatus_id ===
                          processsubstatus.processsubstatus_id
                      )
                  )
                ),
              });
              const registries = await getRegistries({
                created_by,
                created_at,
                updated_by,
                updated_at,
                canceled_by,
                canceled_at,
              });
              setRegistry(registries);
            });
        });
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }
    async function getDefaultOptions() {
      try {
        const { data } = await api.get(`filialtypes`);
        const filialTypes = data.map(({ id, name }) => {
          return { value: id, label: name };
        });
        setFilialTypesOptions(filialTypes);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }

    getDefaultOptions();
    if (id === "new") {
      setFormType("full");
    } else if (id) {
      getPageData();
    }
  }, []);

  async function handleGeneralFormSubmit(data) {
    setLoading(true);
    if (successfullyUpdated) {
      toast("No need to be saved!", {
        autoClose: 1000,
        type: "info",
        transition: Zoom,
      });
      setLoading(false);
      return;
    }
    if (data.parking_spot_image) {
      // console.log(data.parking_spot_image);
      const allPromises = organizeMultiAndSingleFiles(
        [{ file_id: data.parking_spot_image, document_id: null }],
        "Branches/Parking Spot"
      );
      Promise.all(allPromises).then(async (files) => {
        console.log(files);
        const response = await api.put(`/filials/${id}`, {
          parking_spot_image: files[0],
        });
      });
      delete data.parking_spot_image;
    }
    if (id === "new") {
      try {
        const response = await api.post(`/filials`, data);
        setOpened(response.data.id);
        setPageData({ ...pageData, ...data });
        setSuccessfullyUpdated(true);
        toast("Saved!", { autoClose: 1000 });
        handleOpened(null);
        setLoading(false);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
        setLoading(false);
        return;
      }
    } else if (id !== "new") {
      const updated = handleUpdatedFields(data, pageData);

      if (updated.length > 0) {
        const objUpdated = Object.fromEntries(updated);
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
            "Branches"
          );
          Promise.all(allPromises).then(async (files) => {
            try {
              files.map(async (file) => {
                if (!file) {
                  return;
                }
                if (file.name) {
                  api.post(`/filialdocuments`, { filial_id: id, files: file });
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
                        // console.log(singleFile[0])
                        if (index + 1 === file.length) {
                          toastId &&
                            toast.update(toastId, {
                              render: "All files have been uploaded!",
                              type: "success",
                              autoClose: 3000,
                              isLoading: false,
                            });
                        }
                        await api.post(`/filialdocuments`, {
                          filial_id: id,
                          files: singleFile[0],
                        });
                      });
                    });
                }
              });
            } catch (err) {
              console.log(err);
              setLoading(false);
              return;
              // toast(err.response.data.error, { type: 'error', autoClose: 3000 })
            }
            delete objUpdated.documents;

            await api.put(`/filials/${id}`, objUpdated);
            setPageData({ ...pageData, ...objUpdated });
            setSuccessfullyUpdated(true);
            toast("Saved!", { autoClose: 1000 });
            handleOpened(null);
            setLoading(false);
          });
        } else {
          try {
            delete objUpdated.documents;
            await api.put(`/filials/${id}`, objUpdated);
            setPageData({ ...pageData, ...objUpdated });
            setSuccessfullyUpdated(true);
            toast("Saved!", { autoClose: 1000 });
            handleOpened(null);
            setLoading(false);
          } catch (err) {
            console.log(err);
            toast(err.response.data.error, { type: "error", autoClose: 3000 });
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    }
  }

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  function handleAddDiscount() {
    const newDiscounts = [
      ...pageData.discountlists,
      {
        id: null,
        name: null,
        type: null,
        value: 0,
        percent: 0,
        ponctuality_discount: false,
        all_installments: false,
        free_vacation: false,
        special_discount: false,
        active: true,
      },
    ];
    setPageData({ ...pageData, discountlists: newDiscounts });
    setSuccessfullyUpdated(false);
  }

  function handleRemoveDiscount(index) {
    const newDiscounts = generalForm.current.getData();
    const removed = newDiscounts.discountlists.splice(index, 1);
    generalForm.current.setData(newDiscounts);
    setPageData({
      ...pageData,
      discountlists: [...newDiscounts.discountlists],
    });
    setSuccessfullyUpdated(false);
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
              await api.delete(`/filialdocuments/${id}`);
              toast("File deleted!", { autoClose: 1000 });
              setPageData({
                ...pageData,
                filialdocuments: pageData.filialdocuments.filter(
                  (filialdocument) => filialdocument.id !== id
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
              <p className="border-b mb-1 pb-1">Branch Information</p>
              <div className="flex flex-row items-center gap-1 text-xs">
                <strong>Initials:</strong> {pageData.alias}
              </div>
              <div className="flex flex-row items-center gap-1 text-xs">
                <strong>Type:</strong>{" "}
                {pageData.Filialtype && pageData.Filialtype.name}
              </div>
              <div className="flex flex-row items-center gap-1 text-xs">
                <strong>Ein:</strong> {pageData.ein}
              </div>
            </div>
            <div className="flex flex-1 flex-col items-left px-4 py-2 gap-1">
              <p className="border-b mb-1 pb-1">Address Information</p>
              <div className="flex flex-row items-center gap-1 text-xs">
                <strong>Country:</strong> {pageData.country}
              </div>
              <div className="flex flex-row items-center gap-1 text-xs">
                <strong>State:</strong> {pageData.state}
              </div>
              <div className="flex flex-row items-center gap-1 text-xs">
                <strong>City:</strong> {pageData.city}
              </div>
              <div className="flex flex-row items-center gap-1 text-xs">
                <strong>Zip Code:</strong> {pageData.zipcode}
              </div>
              <div className="flex flex-row items-start gap-1 text-xs">
                <strong>Address:</strong> {pageData.address}
              </div>
            </div>
            <div className="flex flex-1 flex-col items-left px-4 py-2 gap-1">
              <p className="border-b mb-1 pb-1">Observations</p>
              <div
                readOnly
                className="flex flex-row items-start gap-1 text-xs h-24"
              >
                {pageData.observations}
              </div>
            </div>
            <div className="flex flex-1 flex-col items-left px-4 py-2 gap-1">
              {/* <button type="button" className='bg-transparent border border-primary p-2 rounded-lg hover:bg-gray-100 text-primary flex flex-row items-center justify-center gap-2 font-bold text-sm'><Pencil size={14} color="#0B2870" /> Edit Filial</button> */}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-row items-start justify-between gap-4">
            <div className="flex flex-col items-center justify-between text-xs w-36 gap-4">
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="general"
              >
                <Building size={16} /> General
              </RegisterFormMenu>
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="price-list"
                messageOnDisabled="Create the branch to have access to Price List."
                disabled={id === "new"}
              >
                <CircleDollarSign size={16} /> Price List
              </RegisterFormMenu>
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="discount-list"
                disabled={id === "new"}
                messageOnDisabled="Create the branch to have access to Discount List."
              >
                <CircleDollarSign size={16} /> Discount List
              </RegisterFormMenu>
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="financial-support"
                disabled={id === "new"}
                messageOnDisabled="Create the branch to have access to Financial Support."
              >
                <CircleDollarSign size={16} /> Financial Support
              </RegisterFormMenu>
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="contracts"
                disabled={id === "new"}
                messageOnDisabled="Create the branch to have access to Contracts."
              >
                <FileSignature size={16} /> Contracts
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
                    }}
                  >
                    {id === "new" || pageData.loaded ? (
                      <>
                        <FormHeader
                          loading={loading}
                          access={access}
                          title={pageData.name}
                          registry={registry}
                          InputContext={InputContext}
                        />

                        <InputLineGroup
                          title="GENERAL"
                          activeMenu={activeMenu === "general"}
                        >
                          <Scope path={`administrator`}>
                            <InputLine title="Branch Administrator">
                              <Input
                                type="hidden"
                                name="id"
                                title="ID"
                                defaultValue={
                                  pageData.administrator
                                    ? pageData.administrator.id
                                    : null
                                }
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="name"
                                title="Name"
                                defaultValue={
                                  pageData.administrator
                                    ? pageData.administrator.name
                                    : ""
                                }
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="email"
                                title="E-mail"
                                grow
                                defaultValue={
                                  pageData.administrator
                                    ? pageData.administrator.email
                                    : ""
                                }
                                InputContext={InputContext}
                              />
                            </InputLine>
                          </Scope>

                          <InputLine title="General Data">
                            <Input
                              type="text"
                              name="ein"
                              required
                              title="EIN"
                              defaultValue={pageData.ein}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="name"
                              required
                              title="Name"
                              grow
                              defaultValue={pageData.name}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="alias"
                              onlyUpperCase
                              required
                              title="Alias"
                              shrink
                              defaultValue={pageData.alias}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="sevis_school"
                              required
                              title="SEVIS School"
                              defaultValue={pageData.sevis_school}
                              InputContext={InputContext}
                            />
                            <SelectPopover
                              name="filialtype_id"
                              title="Filial Type"
                              options={filialTypesOptions}
                              grow
                              defaultValue={{
                                value: pageData.filialtype_id,
                                label: pageData.Filialtype.name,
                              }}
                              InputContext={InputContext}
                            />
                            {/* <SelectPopover
                              name="active"
                              title="Active"
                              grow
                              options={[
                                { value: "Yes", label: "Yes" },
                                { value: "No", label: "No" },
                              ]}
                              defaultValue={{
                                value: pageData.active,
                                label: pageData.active ? "Yes" : "No",
                              }}
                              InputContext={InputContext}
                            /> */}
                          </InputLine>

                          <InputLine title="Localization">
                            <SelectPopover
                              name="country"
                              title="Country"
                              required
                              grow
                              options={countriesOptions}
                              isSearchable
                              defaultValue={{
                                value: pageData.country,
                                label: pageData.country,
                              }}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="state"
                              required
                              title="State"
                              grow
                              defaultValue={pageData.state}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="city"
                              required
                              title="City"
                              grow
                              defaultValue={pageData.city}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="zipcode"
                              isZipCode
                              grow
                              required
                              title="Zip Code"
                              defaultValue={pageData.zipcode}
                              placeholder="-----"
                              InputContext={InputContext}
                            />
                          </InputLine>

                          <InputLine>
                            <Textarea
                              type="text"
                              required
                              grow
                              name="address"
                              title="Address"
                              rows={5}
                              defaultValue={pageData.address}
                              InputContext={InputContext}
                            />
                          </InputLine>

                          <InputLine>
                            <FileInput
                              type="file"
                              name="parking_spot_image"
                              title="Parking Spot Image"
                              InputContext={InputContext}
                              grow
                            />
                            {pageData.parking_spot_image_file && (
                              <a
                                href={pageData.parking_spot_image_file.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={pageData.parking_spot_image_file.url}
                                  alt="Parking Spot Image"
                                  style={{
                                    maxHeight: "150px",
                                  }}
                                />
                              </a>
                            )}
                          </InputLine>

                          <InputLine title="Contact / On the web">
                            <Input
                              type="text"
                              name="phone"
                              isPhoneNumber
                              title="Phone"
                              defaultValue={pageData.phone}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="phone2"
                              isPhoneNumber
                              title="Phone 2"
                              defaultValue={pageData.phone2}
                              placeholder="(---) -------"
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="email"
                              onlyLowerCase
                              grow
                              title="Email"
                              defaultValue={pageData.email}
                              placeholder="email@mila.usa"
                              InputContext={InputContext}
                            />
                          </InputLine>

                          <InputLine>
                            <Input
                              type="text"
                              name="whatsapp"
                              isPhoneNumber
                              title="Whatsapp"
                              defaultValue={pageData.whatsapp}
                              placeholder="(---) -------"
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="facebook"
                              onlyLowerCase
                              title="Facebook"
                              defaultValue={pageData.facebook}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="instagram"
                              onlyLowerCase
                              title="Instagram"
                              defaultValue={pageData.instagram}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="website"
                              onlyLowerCase
                              grow
                              title="Website"
                              defaultValue={pageData.website}
                              InputContext={InputContext}
                            />
                          </InputLine>

                          <InputLine title="Observations">
                            <Textarea
                              type="text"
                              name="observations"
                              rows={3}
                              grow
                              defaultValue={pageData.observations}
                              InputContext={InputContext}
                            />
                          </InputLine>
                        </InputLineGroup>

                        <InputLineGroup
                          title="PRICE LIST"
                          activeMenu={activeMenu === "price-list"}
                        >
                          <h1 className="w-full border-b p-4 pb-0 pt-2 pb-2 font-bold">
                            Price List
                          </h1>
                          {pageData.pricelists
                            .sort((a, b) =>
                              a.processsubstatuses
                                ? a.processsubstatuses.name
                                : a.name > b.processsubstatuses
                                ? b.processsubstatuses.name
                                : b.name
                            )
                            .map((price, index) => (
                              <Scope key={index} path={`pricelists[${index}]`}>
                                <InputLine>
                                  {/* {!price.id && <button type='button' className='mt-3 bg-none border-none' onClick={() => handleRemovePrice(index)}><Trash size={14} /></button>} */}
                                  <Input
                                    type="hidden"
                                    name={`id`}
                                    defaultValue={price.id}
                                    InputContext={InputContext}
                                  />
                                  <Input
                                    type="hidden"
                                    name={`processsubstatus_id`}
                                    defaultValue={
                                      price.processsubstatus_id || price.id
                                    }
                                    InputContext={InputContext}
                                  />
                                  <Input
                                    type="text"
                                    readOnly
                                    grow
                                    name={`name`}
                                    title="Process"
                                    defaultValue={
                                      price.processsubstatuses
                                        ? price.processsubstatuses.name
                                        : price.name
                                    }
                                    InputContext={InputContext}
                                  />
                                  <Input
                                    type="text"
                                    shrink
                                    name={`registration_fee`}
                                    title="Registration Fee"
                                    defaultValue={price.registration_fee || 0}
                                    InputContext={InputContext}
                                  />
                                  <Input
                                    type="text"
                                    shrink
                                    name={`book`}
                                    title="Book"
                                    defaultValue={price.book || 0}
                                    InputContext={InputContext}
                                  />
                                  <Input
                                    type="text"
                                    shrink
                                    name={`tuition`}
                                    title="Tuition"
                                    defaultValue={price.tuition || 0}
                                    InputContext={InputContext}
                                  />
                                  <SelectPopover
                                    name="tuition_in_advance"
                                    title="In Advance?"
                                    options={yesOrNoOptions}
                                    defaultValue={{
                                      value: price.tuition_in_advance
                                        ? "Yes"
                                        : "No",
                                      label: price.tuition_in_advance
                                        ? "Yes"
                                        : "No",
                                    }}
                                    InputContext={InputContext}
                                  />
                                  <SelectPopover
                                    name="active"
                                    title="Active"
                                    options={yesOrNoOptions}
                                    defaultValue={{
                                      value: price.active ? "Yes" : "No",
                                      label: price.active ? "Yes" : "No",
                                    }}
                                    InputContext={InputContext}
                                  />
                                </InputLine>
                                <div className="w-full border-b"></div>
                              </Scope>
                            ))}
                          {/* <button type="button" onClick={handleAddPrice} className={`m-2 mt-4 text-md font-bold border border-mila_orange text-mila_orange rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1`}>
                                                    + Add Price
                                                </button> */}
                        </InputLineGroup>

                        <InputLineGroup
                          title="DISCOUNT LIST"
                          activeMenu={activeMenu === "discount-list"}
                        >
                          <h1 className="w-full border-b p-4 pb-0 pt-2 pb-2 font-bold">
                            Discount List
                          </h1>
                          {pageData.discountlists &&
                            pageData.discountlists
                              .sort((a, b) => a.name > b.name)
                              .map((discount, index) => (
                                <Scope
                                  key={index}
                                  path={`discountlists[${index}]`}
                                >
                                  <InputLine>
                                    {!discount.id && (
                                      <button
                                        type="button"
                                        className="mt-3 bg-none border-none"
                                        onClick={() =>
                                          handleRemoveDiscount(index)
                                        }
                                      >
                                        <Trash size={14} />
                                      </button>
                                    )}
                                    <Input
                                      type="hidden"
                                      name={`id`}
                                      defaultValue={discount.id}
                                      InputContext={InputContext}
                                    />
                                    <SelectPopover
                                      name="type"
                                      grow
                                      required
                                      title="Type"
                                      options={discountTypesOptions}
                                      defaultValue={discountTypesOptions.find(
                                        (type) => type.value === discount.type
                                      )}
                                      InputContext={InputContext}
                                    />
                                    <Input
                                      type="text"
                                      grow
                                      name={`name`}
                                      required
                                      title="Name"
                                      defaultValue={discount.name}
                                      InputContext={InputContext}
                                    />
                                    <SelectPopover
                                      name="percent"
                                      grow
                                      required
                                      title="Discount"
                                      options={discountOptions}
                                      defaultValue={discountOptions.find(
                                        (type) =>
                                          type.value === discount.percent
                                      )}
                                      InputContext={InputContext}
                                    />
                                    <Input
                                      type="text"
                                      shrink
                                      name={`value`}
                                      required
                                      title="Amount"
                                      defaultValue={discount.value}
                                      InputContext={InputContext}
                                    />
                                    <SelectPopover
                                      name="all_installments"
                                      required
                                      title="All Installments"
                                      options={yesOrNoOptions}
                                      defaultValue={yesOrNoOptions.find(
                                        (type) =>
                                          type.value ===
                                          discount.all_installments
                                      )}
                                      InputContext={InputContext}
                                    />
                                    <SelectPopover
                                      name="free_vacation"
                                      required
                                      title="Free Vacation"
                                      options={yesOrNoOptions}
                                      defaultValue={yesOrNoOptions.find(
                                        (type) =>
                                          type.value === discount.free_vacation
                                      )}
                                      InputContext={InputContext}
                                    />
                                    <SelectPopover
                                      name="active"
                                      required
                                      title="Active"
                                      options={yesOrNoOptions}
                                      defaultValue={yesOrNoOptions.find(
                                        (type) => type.value === discount.active
                                      )}
                                      InputContext={InputContext}
                                    />
                                  </InputLine>
                                  <div className="w-full border-b p-4 pt-2"></div>
                                </Scope>
                              ))}
                          <button
                            type="button"
                            onClick={handleAddDiscount}
                            className={`m-2 mt-4 text-md font-bold border border-mila_orange text-mila_orange rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1`}
                          >
                            + Add Discount
                          </button>
                        </InputLineGroup>

                        <InputLineGroup
                          title="FINANCIAL SUPPORT"
                          activeMenu={activeMenu === "financial-support"}
                        >
                          <h1 className="w-full border-b p-4 pb-0 pt-2 pb-2 font-bold">
                            Financial Support
                          </h1>
                          <InputLine>
                            <Input
                              type="text"
                              onlyFloat
                              grow
                              name={`financial_support_student_amount`}
                              title="Amount ($) per month required for students"
                              defaultValue={
                                pageData.financial_support_student_amount
                              }
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              onlyFloat
                              grow
                              name={`financial_support_dependent_amount`}
                              title="Amount ($) per month required for dependents"
                              defaultValue={
                                pageData.financial_support_dependent_amount
                              }
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              onlyFloat
                              grow
                              name={`financial_support_year_amount`}
                              title="Amount ($) per year required by MILA"
                              defaultValue={
                                pageData.financial_support_year_amount
                              }
                              InputContext={InputContext}
                            />
                          </InputLine>
                        </InputLineGroup>

                        <InputLineGroup
                          title="CONTRACTS"
                          activeMenu={activeMenu === "contracts"}
                        >
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
                                      pageData.filialdocuments &&
                                      pageData.filialdocuments.filter(
                                        (filialdocument) =>
                                          filialdocument.document_id ===
                                          document.id
                                      ).length === 0 && (
                                        <FileInput
                                          type="file"
                                          name="file_id"
                                          title={"File"}
                                          grow
                                          InputContext={InputContext}
                                        />
                                      )}
                                    {document.multiple && (
                                      <FileInputMultiple
                                        type="file"
                                        name="file_id"
                                        title={"Multiple Files"}
                                        grow
                                        InputContext={InputContext}
                                      />
                                    )}
                                  </InputLine>
                                  {pageData.filialdocuments &&
                                    pageData.filialdocuments.length > 0 && (
                                      <InputLine subtitle="Attached Files">
                                        <div className="flex flex-col justify-center items-start gap-4">
                                          {pageData.filialdocuments &&
                                            pageData.filialdocuments.map(
                                              (filialdocument, index) => {
                                                if (
                                                  filialdocument.document_id ===
                                                    document.id &&
                                                  filialdocument.file
                                                ) {
                                                  return (
                                                    <>
                                                      <div className="flex flex-row justify-center items-center gap-2">
                                                        <a
                                                          href={
                                                            filialdocument.file
                                                              .url
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
                                                              filialdocument
                                                                .file.name
                                                            }
                                                          </div>
                                                        </a>
                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            handleDeleteDocument(
                                                              filialdocument.id
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
