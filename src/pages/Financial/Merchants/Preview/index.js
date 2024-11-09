import { Form } from "@unform/web";
import { Building, ChartGantt, Pencil, Plus, X, Asterisk } from "lucide-react";
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

export const InputContext = createContext({});

export default function PagePreview({
  access,
  id,
  handleOpened,
  setOpened,
  defaultFormType = "preview",
  successfullyUpdated,
  setSuccessfullyUpdated,
}) {
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
    async function getPageData() {
      try {
        const { data } = await api.get(`/merchants/${id}`);
        setPageData({ ...data, loaded: true });

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

        const gridDataValue = data?.merchantxchartofaccounts.map(
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

        setNewMerchantxchartofaccounts(
          data?.merchantxchartofaccounts.map(({ chartOfAccount }) => ({
            chartofaccount_id: chartOfAccount.id,
          }))
        );
        setGridData(gridDataValue);
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

        const chartOfAccountData = await api.get(`/chartofaccounts`);
        const chartOfAccountOptions = chartOfAccountData.data
          .filter((f) => f.id !== id)
          .map((f) => {
            return { value: f.id, label: f.name };
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

      console.log(newChartOfAccountOptions);

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

      console.log(newChartOfAccountOptions);

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
                        <InputLine title="Chart of Accounts">
                          <div className=" flex flex-col justify-center items-start relative w-full">
                            <div className="px-1 text-xs flex flex-row justify-between items-center">
                              Chart of Account
                            </div>
                            <div
                              className={`text-sm focus:outline-none flex-1 w-full bg-transparent`}
                            >
                              <AsyncSelect
                                type="hidden"
                                id="chartofaccount_id"
                                name="chartofaccount_id"
                                cacheOptions
                                isClearable={false}
                                loadOptions={loadOptions}
                                defaultOptions={chartOfAccountOptions}
                                isSearchable
                                ref={generalForm}
                                value={chartOfAccountSelected}
                                onChange={handleChanged}
                                classNamePrefix="react-select"
                                className={`rounded-lg text-sm focus:outline-none flex-1 w-full bg-transparent text-left relative`}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (chartOfAccountSelected) {
                                const chartOfAccountDataValue =
                                  chartOfAccountData.find(
                                    (el) =>
                                      el.id === chartOfAccountSelected.value
                                  );

                                const chartOfAccountDataValueExists =
                                  newMerchantxchartofaccounts.find(
                                    (el) =>
                                      el.chartofaccount_id ===
                                      chartOfAccountDataValue.id
                                  );

                                if (chartOfAccountDataValueExists) {
                                  toast("Chart of Account already added!", {
                                    autoClose: 1000,
                                    type: "info",
                                    transition: Zoom,
                                  });

                                  const newChartOfAccountOptions =
                                    chartOfAccountOptions.filter(
                                      (el) =>
                                        !newMerchantxchartofaccounts.find(
                                          (el2) =>
                                            el2.chartofaccount_id === el.value
                                        )
                                    );

                                  console.log(newChartOfAccountOptions);

                                  setChartOfAccountOptions(
                                    newChartOfAccountOptions
                                  );

                                  setChartOfAccountSelected(null);
                                } else if (chartOfAccountDataValue) {
                                  toast("Chart of Account already added!", {
                                    autoClose: 1000,
                                    type: "info",
                                    transition: Zoom,
                                  });

                                  // validar se o valor ja esta no grid e se estiver nao adicionar
                                  const gridDataValue = gridData?.find(
                                    (el) =>
                                      el.id === chartOfAccountSelected.value
                                  );

                                  if (!gridDataValue) {
                                    setGridData([
                                      ...gridData,
                                      {
                                        show: true,
                                        id: chartOfAccountDataValue.id,
                                        fields: [
                                          chartOfAccountDataValue.code,
                                          chartOfAccountDataValue.name,
                                          chartOfAccountDataValue.code.substring(
                                            0,
                                            2
                                          ) === "01"
                                            ? "Receipts"
                                            : "Expenses",
                                          chartOfAccountDataValue.visibility,
                                        ],
                                      },
                                    ]);

                                    setChartOfAccountOptions(
                                      chartOfAccountOptions.filter(
                                        (el) =>
                                          el.value !==
                                          chartOfAccountDataValue.id
                                      )
                                    );

                                    setNewMerchantxchartofaccounts([
                                      ...newMerchantxchartofaccounts,
                                      {
                                        chartofaccount_id:
                                          chartOfAccountDataValue.id,
                                      },
                                    ]);

                                    setSuccessfullyUpdated(false);

                                    setPageData({
                                      ...pageData,
                                      merchantxchartofaccounts:
                                        newMerchantxchartofaccounts,
                                    });

                                    setChartOfAccountSelected(null);
                                  }
                                }
                              }
                            }}
                            type="button"
                            className="bg-mila_orange text-white rounded-md p-1  h-10 flex flex-row items-center justify-center text-xs gap-1"
                          >
                            Add <Plus size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (gridData.length > 0) {
                                setGridData([]);

                                setChartOfAccountOptions([
                                  ...gridData.map((el) => ({
                                    value: el.id,
                                    label: el.fields[1],
                                  })),
                                  ...chartOfAccountOptions,
                                ]);

                                setNewMerchantxchartofaccounts([]);

                                setPageData({
                                  ...pageData,
                                  merchantxchartofaccounts: [],
                                });

                                setChartOfAccountSelected(null);

                                setSuccessfullyUpdated(false);

                                toast("Chart of Accounts cleared!", {
                                  autoClose: 1000,
                                  type: "info",
                                  transition: Zoom,
                                });
                              }
                            }}
                            type="button"
                            className="bg-secondary text-white rounded-md p-1  h-10 flex flex-row items-center justify-center text-xs gap-1"
                          >
                            Clear <Asterisk size={16} />
                          </button>
                        </InputLine>

                        <InputLine title="Merchant x Chart of Accounts">
                          <Grid
                            gridData={gridData}
                            gridHeader={gridHeader}
                            orderBy={orderBy}
                            setOrderBy={setOrderBy}
                            handleOpened={handleOpened}
                          />
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
                            {auth.filial.id === 1 && (
                              <InputLine title="Filial">
                                <SelectPopover
                                  name="filial_id"
                                  required
                                  title="Filial"
                                  isSearchable
                                  grow
                                  defaultValue={
                                    pageData.filial_id
                                      ? {
                                          value: pageData.filial_id,
                                          label: pageData.filial.name,
                                        }
                                      : null
                                  }
                                  options={filialOptions}
                                  InputContext={InputContext}
                                />
                              </InputLine>
                            )}
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
                              <Input
                                type="text"
                                name="phone_number"
                                title="Phone Number"
                                grow
                                defaultValue={pageData.phone_number}
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

                            <InputLine title="Payees">
                              <Input
                                type="number"
                                name="late_payees"
                                title="Late Payees"
                                grow
                                defaultValue={pageData.late_payees}
                                InputContext={InputContext}
                              />
                              <Input
                                type="number"
                                name="balance_payees"
                                title="Balance Payees"
                                grow
                                defaultValue={pageData.balance_payees}
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
                ) : null}
              </div>
            </div>
          </div>
        )
      ) : null}
    </Preview>
  );
}
