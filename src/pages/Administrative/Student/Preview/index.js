import { Form } from "@unform/web";
import { Building, Loader2, Pencil, X } from "lucide-react";
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
  yesOrNoOptions,
} from "~/functions/selectPopoverOptions";

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
    searchFields: {
      filial_id: null,
      processtype_id: null,
      processsubstatus_id: null,
    },
  });
  const [countriesList, setCountriesList] = useState([]);
  const [formType, setFormType] = useState(defaultFormType);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("general");
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [activeDiscounts, setActiveDiscounts] = useState([]);
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
    async function getPageData() {
      const filialOptions = await getDefaultFilialOptions();
      const ddiOptions = await getCountriesList();
      if (id !== "new") {
        try {
          const { data } = await api.get(`/students/${id}`);
          const { priceLists, discountLists } = await getPriceLists({
            filial_id: data.filial_id,
            processtype_id: data.processtype_id,
            processsubstatus_id: data.processsubstatus_id,
          });
          setPageData({
            ...data,
            loaded: true,
            ddiOptions,
            filialOptions,
            priceLists,
            discountLists,
          });
          if (data.discount_id) {
            handleDiscount(
              data.discount_id,
              { value: true },
              true,
              priceLists,
              discountLists
            );
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
    // console.log(data);
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
        const { date_of_birth, visa_expiration, discount_id } = data;
        const response = await api.post(`/students`, {
          ...data,
          date_of_birth: date_of_birth
            ? format(date_of_birth, "yyyy-MM-dd")
            : null,
          visa_expiration: visa_expiration
            ? format(visa_expiration, "yyyy-MM-dd")
            : null,
          discount_id: activeDiscounts.length > 0 ? activeDiscounts[0] : null,
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
        const { date_of_birth, visa_expiration, discount_id } = objUpdated;
        try {
          await api.put(`/students/${id}`, {
            ...objUpdated,
            date_of_birth: date_of_birth
              ? format(date_of_birth, "yyyy-MM-dd")
              : null,
            visa_expiration: visa_expiration
              ? format(visa_expiration, "yyyy-MM-dd")
              : null,
            discount_id: activeDiscounts.length > 0 ? activeDiscounts[0] : null,
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

  function handleDiscount(
    id,
    el,
    force = false,
    priceLists = null,
    discountLists = null
  ) {
    if (!force) {
      priceLists = pageData.priceLists;
      discountLists = pageData.discountLists;
      setSuccessfullyUpdated(false);
    }

    const discount = discountLists.find((discount) => discount.id === id);
    if (
      // !activeDiscounts.find((active) => active === discount.id) &&
      el.value
    ) {
      setActiveDiscounts([discount.id]);

      let discountAmount = 0;

      const total =
        priceLists.registration_fee + priceLists.book + priceLists.tuition;

      if (discount.percent) {
        discountAmount = total * (discount.value / 100);
      } else {
        discountAmount = discount.value;
      }
      setTotalDiscount(discountAmount);
    } else if (
      // activeDiscounts.find((active) => active === discount.id) &&
      !el.value
    ) {
      // setActiveDiscounts(
      //   activeDiscounts.filter((active) => active !== discount.id)
      // );
      setActiveDiscounts([]);

      let discountAmount = 0;

      const total =
        priceLists.registration_fee + priceLists.book + priceLists.tuition;

      if (discount.percent) {
        discountAmount = total * (discount.value / 100);
      } else {
        discountAmount = discount.value;
      }
      discountAmount = discountAmount * -1;
      setTotalDiscount(0);
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
                                  setSearchFields({
                                    ...searchFields,
                                    filial_id: el.value,
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
                              name="name"
                              required
                              grow
                              title="Name"
                              defaultValue={pageData.name}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="middle_name"
                              grow
                              title="Middle Name"
                              defaultValue={pageData.middle_name}
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

                          {pageData.priceLists && (
                            <InputLine title="Prices Simulation">
                              <table className="table-auto w-full text-center">
                                <thead className="bg-slate-100 rounded-lg overflow-hidden">
                                  <tr>
                                    <th className="w-1/6">Registration Fee</th>
                                    <th className="w-1/6">Books</th>
                                    <th className="w-1/6">Tuition</th>
                                    <th className="w-1/6">
                                      Tuition in Advanced
                                    </th>
                                    <th className="w-1/6">Discount</th>
                                    <th className="w-1/6">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>
                                      <Input
                                        type="text"
                                        name="registration_fee"
                                        value={pageData.priceLists.registration_fee.toFixed(
                                          2
                                        )}
                                        centeredText={true}
                                        placeholder="$ 0.00"
                                        className="text-center"
                                        readOnly={true}
                                        InputContext={InputContext}
                                      />
                                    </td>
                                    <td>
                                      <Input
                                        type="text"
                                        name="books"
                                        value={pageData.priceLists.book.toFixed(
                                          2
                                        )}
                                        centeredText={true}
                                        placeholder="$ 0.00"
                                        className="text-center"
                                        readOnly={true}
                                        InputContext={InputContext}
                                      />
                                    </td>
                                    <td>
                                      <Input
                                        type="text"
                                        name="tuition_original_price"
                                        value={pageData.priceLists.tuition.toFixed(
                                          2
                                        )}
                                        centeredText={true}
                                        placeholder="$ 0.00"
                                        className="text-center"
                                        readOnly={true}
                                        InputContext={InputContext}
                                      />
                                    </td>
                                    <td>
                                      <SelectPopover
                                        name="tuition_in_advance"
                                        defaultValue={yesOrNoOptions.find(
                                          (option) =>
                                            option.value ===
                                            pageData.priceLists
                                              .tuition_in_advance
                                        )}
                                        centeredText={true}
                                        readOnly={true}
                                        options={yesOrNoOptions}
                                        InputContext={InputContext}
                                      />
                                    </td>
                                    <td>
                                      <Input
                                        type="text"
                                        name="total_discount"
                                        value={totalDiscount.toFixed(2)}
                                        centeredText={true}
                                        placeholder="$ 0.00"
                                        className="text-center"
                                        readOnly={true}
                                        InputContext={InputContext}
                                      />
                                    </td>
                                    <td>
                                      <Input
                                        type="text"
                                        name="total_tuition"
                                        value={(
                                          pageData.priceLists.registration_fee +
                                          pageData.priceLists.book +
                                          pageData.priceLists.tuition -
                                          totalDiscount
                                        ).toFixed(2)}
                                        centeredText={true}
                                        placeholder="$ 0.00"
                                        className="text-center"
                                        readOnly={true}
                                        InputContext={InputContext}
                                      />
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </InputLine>
                          )}
                          <Input
                            type="hidden"
                            name="discount_id"
                            value={
                              activeDiscounts.length > 0
                                ? activeDiscounts[0]
                                : null
                            }
                            InputContext={InputContext}
                          />
                          {pageData.discountLists &&
                            pageData.discountLists.map((discount, index) => {
                              return (
                                <>
                                  <InputLine
                                    key={index}
                                    title={
                                      index === 0
                                        ? "Avaiable Admission Discounts"
                                        : ""
                                    }
                                  >
                                    <Input
                                      readOnly={true}
                                      type="text"
                                      name="discount"
                                      grow
                                      title="Description"
                                      defaultValue={discount.name}
                                      InputContext={InputContext}
                                    />
                                    <Input
                                      readOnly={true}
                                      type="text"
                                      name="value"
                                      grow
                                      title="Discount"
                                      defaultValue={
                                        (discount.percent ? "%" : "$") +
                                        " " +
                                        discount.value
                                      }
                                      InputContext={InputContext}
                                    />
                                    <SelectPopover
                                      readOnly={true}
                                      name="all_installments"
                                      title="All Installments?"
                                      options={yesOrNoOptions}
                                      defaultValue={yesOrNoOptions.find(
                                        (option) =>
                                          option.value ===
                                          discount.all_installments
                                      )}
                                      InputContext={InputContext}
                                    />
                                    <SelectPopover
                                      readOnly={true}
                                      name="free_vacation"
                                      title="Free Vacation?"
                                      options={yesOrNoOptions}
                                      defaultValue={yesOrNoOptions.find(
                                        (option) =>
                                          option.value ===
                                          discount.free_vacation
                                      )}
                                      InputContext={InputContext}
                                    />
                                    <SelectPopover
                                      name="apply"
                                      title="Apply?"
                                      options={yesOrNoOptions}
                                      InputContext={InputContext}
                                      value={yesOrNoOptions.find(
                                        (option) =>
                                          option.value ===
                                          (activeDiscounts.length > 0 &&
                                          activeDiscounts[0] === discount.id
                                            ? true
                                            : false)
                                      )}
                                      onChange={(el) =>
                                        handleDiscount(discount.id, el)
                                      }
                                    />
                                  </InputLine>
                                </>
                              );
                            })}
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
                            <SelectCountry
                              name="whatsapp_ddi"
                              title="DDI"
                              options={countriesList}
                              defaultValue={countriesList.find(
                                (ddi) => ddi.value === pageData.whatsapp_ddi
                              )}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              grow
                              name="whatsapp"
                              title="Whatsapp"
                              isPhoneNumber
                              defaultValue={pageData.whatsapp}
                              defaultValueDDI={pageData.whatsapp_ddi}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              grow
                              name="home_country_phone"
                              title="Home Country Phone"
                              isPhoneNumber
                              defaultValue={pageData.home_country_phone}
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
