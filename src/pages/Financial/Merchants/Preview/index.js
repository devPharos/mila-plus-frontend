import { Form } from "@unform/web";
import {
  Building,
  ChartGantt,
  Pencil,
  Plus,
  X,
  Asterisk,
  Trash,
} from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Input from "~/components/RegisterForm/Input";
import AsyncSelect from "react-select/async";

import RegisterFormMenu from "~/components/RegisterForm/Menu";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { Zoom, toast } from "react-toastify";
import api from "~/services/api";
import {
  getRegistries,
  handleUpdatedFields,
  countries_list,
} from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import Grid from "~/components/Grid";
import { FullGridContext } from "../..";
import PhoneNumberInput from "~/components/RegisterForm/PhoneNumberInput";
import FindGeneric from "~/components/Finds/FindGeneric";
import { Scope } from "@unform/core";

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
    loaded: false,
    name: "",
    alias: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    ein: "",
    email: "",
    phone_number: "",
    bank_account: "",
    bank_routing_number: "",
    bank_name: "",
    filial_id: null,
    filial: {
      name: "",
    },
    merchantxchartofaccounts: [],
  });

  const [registry, setRegistry] = useState({
    created_by: null,
    created_at: null,
    updated_by: null,
    updated_at: null,
    canceled_by: null,
    canceled_at: null,
  });
  const [formType, setFormType] = useState(defaultFormType);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("general");
  const [filialOptions, setFilialOptions] = useState([]);

  const [orderBy, setOrderBy] = useState({ column: "Code", asc: true });

  const [chartOfAccountOptions, setChartOfAccountOptions] = useState([]);
  const [chartOfAccountData, setChartOfAccountData] = useState([]);

  const [chartOfAccountSelected, setChartOfAccountSelected] = useState();

  const [newMerchantxchartofaccounts, setNewMerchantxchartofaccounts] =
    useState([]);

  const [gridData, setGridData] = useState([]);
  const [gridHeader] = useState([
    {
      title: "Code",
      type: "text",
      filter: false,
    },
    {
      title: "Name",
      type: "text",
      filter: false,
    },
    {
      title: "Type",
      type: "text",
      filter: true,
    },
    {
      title: "Visibility",
      type: "text",
      filter: true,
    },
  ]);
  const [returnFindGeneric, setReturnFindGeneric] = useState(null);

  const loadOptions = (inputValue, callback) => {
    callback(
      chartOfAccountOptions.filter((i) =>
        i.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    );
  };

  const handleChanged = (value) => {
    setChartOfAccountSelected(value);
  };

  const auth = useSelector((state) => state.auth);

  const generalForm = useRef();

  const countriesOptions = countries_list.map((country) => {
    return { value: country, label: country };
  });

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  async function handleGeneralFormSubmit(data) {
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
        const response = await api.post(`/merchants`, data);
        setOpened(response.data.id);
        setPageData({ ...pageData, ...data });

        if (response.data.created_at) {
          const registries = await getRegistries({
            created_by: response.data.created_by,
            created_at: response.data.created_at,
          });
          setRegistry(registries);
        }

        setActiveMenu("Chart of Accounts");
        toast("Saved!", { autoClose: 1000 });
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    } else if (id !== "new") {
      const updated = handleUpdatedFields(data, pageData);

      if (
        updated.length > 0 ||
        newMerchantxchartofaccounts.length > 0 ||
        (pageData?.merchantxchartofaccounts &&
          pageData?.merchantxchartofaccounts.length <= 0)
      ) {
        const objUpdated = Object.fromEntries(updated);
        if (
          newMerchantxchartofaccounts &&
          newMerchantxchartofaccounts.length > 0
        ) {
          objUpdated.merchantxchartofaccounts = newMerchantxchartofaccounts;
        }
        try {
          const response = await api.put(`/merchants/${id}`, objUpdated);
          setPageData({ ...pageData, ...objUpdated });
          setSuccessfullyUpdated(true);

          if (
            response.data?.merchantxchartofaccounts &&
            response.data?.merchantxchartofaccounts.length > 0
          ) {
            const gridDataValue = response.data?.merchantxchartofaccounts.map(
              ({ canceled_at, id, chartOfAccount }) => ({
                show: true,
                id,
                fields: [
                  chartOfAccount.code,
                  chartOfAccount.name,
                  chartOfAccount.code.substring(0, 2) === "01"
                    ? "Receipts"
                    : "Expenses",
                  chartOfAccount.visibility,
                ],
                canceled: canceled_at,
              })
            );

            setGridData(gridDataValue);

            if (gridDataValue !== gridData) {
              toast("Saved Chart of Accounts!", { autoClose: 1000 });
              setActiveMenu("Chart of Accounts");

              handleOpened(null);
            }

            setGridData(gridDataValue);
          }

          handleOpened(null);
          toast("Saved!", { autoClose: 1000 });
        } catch (err) {
          toast(err, { type: "error", autoClose: 3000 });
        }
      } else {
        toast("No changes to save!", { autoClose: 1000 });
      }
    }
  }

  useEffect(() => {
    if (returnFindGeneric) {
      if (
        pageData.merchantxchartofaccounts.find(
          (el) => el.id === returnFindGeneric.id
        )
      ) {
        toast("Chart of Account already added!", {
          autoClose: 1000,
          type: "info",
          transition: Zoom,
        });
        setReturnFindGeneric(null);
        return;
      } else {
        setPageData({
          ...pageData,
          merchantxchartofaccounts: [
            ...pageData.merchantxchartofaccounts,
            returnFindGeneric,
          ],
        });
      }
    }
  }, [returnFindGeneric]);

  function removeChartOfAccount(id) {
    setPageData({
      ...pageData,
      merchantxchartofaccounts: pageData.merchantxchartofaccounts.filter(
        (el) => el.id !== id
      ),
    });
  }

  useEffect(() => {
    async function getPageData() {
      try {
        const { data } = await api.get(`/merchants/${id}`);
        let { merchantxchartofaccounts } = data;
        merchantxchartofaccounts = data.merchantxchartofaccounts.map((el) => {
          console.log(el.chartOfAccount);
          return {
            id: el.chartOfAccount.id,
            code: el.chartOfAccount.code,
            name: el.chartOfAccount.name,
          };
        });
        setPageData({ ...data, loaded: true, merchantxchartofaccounts });

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
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }

    async function getDefaultOptions() {
      try {
        const filialData = await api.get(`/filials`);
        const filialOptions = filialData.data
          .filter((f) => f.id !== id)
          .map((f) => {
            return { value: f.id, label: f.name };
          });

        const chartOfAccountData = await api.get(
          `/chartofaccounts?type=expenses`
        );

        const chartOfAccountOptions = chartOfAccountData.data.rows
          .filter((f) => f.id !== id)
          .map((f) => {
            return {
              value: f.id,
              label: `${
                f.Father?.Father?.Father?.name
                  ? `${f.Father?.Father?.Father?.name} > `
                  : ""
              }${f.Father?.Father?.name ? `${f.Father?.Father?.name} > ` : ""}${
                f.Father?.name ? `${f.Father?.name} > ` : ""
              }${f.name}`,
            };
          });

        setChartOfAccountOptions(chartOfAccountOptions);
        setChartOfAccountData(chartOfAccountData?.data);

        setFilialOptions(filialOptions);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }

    if (id === "new") {
      setFormType("full");
    } else if (id) {
      getPageData();
    }
    getDefaultOptions();

    if (newMerchantxchartofaccounts.length > 0) {
      const newChartOfAccountOptions = chartOfAccountOptions.filter(
        (el) =>
          !newMerchantxchartofaccounts.find(
            (el2) => el2.chartofaccount_id === el.value
          )
      );

      setChartOfAccountOptions(newChartOfAccountOptions);
    }
  }, []);

  useEffect(() => {
    if (newMerchantxchartofaccounts.length > 0) {
      const newChartOfAccountOptions = chartOfAccountOptions.filter(
        (el) =>
          !newMerchantxchartofaccounts.find(
            (el2) => el2.chartofaccount_id === el.value
          )
      );

      setChartOfAccountOptions(newChartOfAccountOptions);
    }
  }, [newMerchantxchartofaccounts]);

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
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="Chart of Accounts"
                messageOnDisabled="You need to save the merchant first"
                disabled={id === "new"}
              >
                <ChartGantt size={16} /> Chart of Accounts
              </RegisterFormMenu>
            </div>
            <div className="border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start">
              <div className="flex flex-col items-start justify-start text-sm overflow-y-scroll">
                {activeMenu === "Chart of Accounts" ? (
                  <Form
                    ref={generalForm}
                    onSubmit={handleGeneralFormSubmit}
                    className="w-full pb-32"
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
                      <FormHeader
                        access={access}
                        title={pageData?.name}
                        registry={registry}
                        InputContext={InputContext}
                      />

                      <InputLineGroup
                        title="Chart of Accounts"
                        activeMenu={activeMenu === "Chart of Accounts"}
                      >
                        <FindGeneric
                          route="chartofaccounts"
                          title="Chart of Account"
                          scope="chartOfAccount"
                          type="expenses"
                          setReturnFindGeneric={setReturnFindGeneric}
                          InputContext={InputContext}
                          defaultValue={{
                            id: pageData.issuer?.issuer_x_recurrence
                              ?.chartOfAccount?.id,
                            code: pageData.issuer?.issuer_x_recurrence
                              ?.chartOfAccount?.code,
                            name: pageData.issuer?.issuer_x_recurrence
                              ?.chartOfAccount?.name,
                            father:
                              pageData.issuer?.issuer_x_recurrence
                                ?.chartOfAccount?.Father?.name,
                            granFather:
                              pageData.issuer?.issuer_x_recurrence
                                ?.chartOfAccount?.Father?.Father?.name,
                          }}
                          fields={[
                            {
                              title: "Code",
                              name: "code",
                            },
                            {
                              title: "Name",
                              name: "name",
                            },
                            {
                              title: "Father",
                              model: "Father",
                              name: "name",
                            },
                            {
                              title: "Father",
                              model: "Father",
                              model2: "Father",
                              name: "name",
                            },
                          ]}
                        />

                        <InputLine title="Merchant x Chart of Accounts">
                          <div className="flex flex-col justify-center items-start relative w-full">
                            {pageData.merchantxchartofaccounts
                              .sort((a, b) => a.code - b.code)
                              .map((chartofaccount, index) => {
                                return (
                                  <div
                                    className="flex flex-row justify-center items-center relative w-full"
                                    key={index}
                                  >
                                    <button
                                      className="mt-2"
                                      type="button"
                                      onClick={() => {
                                        removeChartOfAccount(chartofaccount.id);
                                        setSuccessfullyUpdated(false);
                                      }}
                                    >
                                      <Trash size={18} />
                                    </button>
                                    <Scope
                                      key={index}
                                      path={`merchantxchartofaccounts[${index}]`}
                                    >
                                      <InputLine>
                                        <Input
                                          type="hidden"
                                          name="id"
                                          defaultValue={chartofaccount.id}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="code"
                                          grow
                                          readOnly
                                          title="Code"
                                          defaultValue={chartofaccount.code}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="name"
                                          grow
                                          readOnly
                                          title="Name"
                                          defaultValue={chartofaccount.name}
                                          InputContext={InputContext}
                                        />
                                      </InputLine>
                                    </Scope>
                                  </div>
                                );
                              })}
                          </div>
                        </InputLine>
                      </InputLineGroup>
                    </InputContext.Provider>
                  </Form>
                ) : null}

                {activeMenu === "general" ? (
                  <Form
                    ref={generalForm}
                    onSubmit={handleGeneralFormSubmit}
                    className="w-full pb-32"
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
                            access={access}
                            title={pageData?.name}
                            registry={registry}
                            InputContext={InputContext}
                          />

                          <InputLineGroup
                            title="GENERAL"
                            activeMenu={activeMenu === "general"}
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
                            <InputLine title="General data">
                              <Input
                                type="text"
                                name="name"
                                required
                                title="Merchant Name"
                                grow
                                defaultValue={pageData?.name}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="alias"
                                title="Alias"
                                grow
                                defaultValue={pageData.alias}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine title="Address">
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
                                name="city"
                                title="City"
                                grow
                                defaultValue={pageData.city}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="state"
                                title="State"
                                grow
                                defaultValue={pageData.state}
                                InputContext={InputContext}
                              />

                              <Input
                                type="text"
                                name="zip"
                                title="Zip"
                                grow
                                defaultValue={pageData.zip}
                                InputContext={InputContext}
                              />

                              <SelectPopover
                                name="country"
                                grow
                                title="Country"
                                options={countriesOptions}
                                isSearchable
                                defaultValue={
                                  pageData.country
                                    ? {
                                        value: pageData.country,
                                        label: pageData.country,
                                      }
                                    : null
                                }
                                InputContext={InputContext}
                              />

                              <Input
                                type="Number"
                                name="ein"
                                title="EIN"
                                grow
                                defaultValue={pageData.ein}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine title="Contact">
                              <Input
                                type="text"
                                name="email"
                                title="Email"
                                grow
                                defaultValue={pageData.email}
                                InputContext={InputContext}
                              />
                              <PhoneNumberInput
                                type="text"
                                name="phone_number"
                                title="Phone Number"
                                grow
                                value={pageData.phone_number}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine title="Bank Information">
                              <Input
                                type="text"
                                name="bank_name"
                                title="Bank Name"
                                grow
                                defaultValue={pageData.bank_name}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="bank_account"
                                title="Bank Account"
                                grow
                                defaultValue={pageData.bank_account}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="bank_routing_number"
                                title="Bank Routing Number"
                                grow
                                defaultValue={pageData.bank_routing_number}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            {/* <InputLine title="Payees">
                              <Input
                                type="number"
                                name="late_payees"
                                title="Late Payees"
                                readOnly
                                grow
                                defaultValue={pageData.late_payees}
                                InputContext={InputContext}
                              />
                              <Input
                                type="number"
                                name="balance_payees"
                                title="Balance Payees"
                                readOnly
                                grow
                                defaultValue={pageData.balance_payees}
                                InputContext={InputContext}
                              />
                            </InputLine> */}
                          </InputLineGroup>
                        </>
                      ) : (
                        <FormLoading />
                      )}
                    </InputContext.Provider>
                  </Form>
                ) : null}
              </div>
            </div>
          </div>
        )
      ) : null}
    </Preview>
  );
}
