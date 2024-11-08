import { Form } from "@unform/web";
import { Building, ChartGantt, Pencil, X } from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Input from "~/components/RegisterForm/Input";

import RegisterFormMenu from "~/components/RegisterForm/Menu";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { Zoom, toast } from "react-toastify";
import api from "~/services/api";
import { getRegistries, handleUpdatedFields } from "~/functions";
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
  const [chartOfAccountIsTemp, setChartOfAccountIsTemp] = useState(false);

  const [orderBy, setOrderBy] = useState({ column: "Code", asc: true });

  const [chartOfAccountOptions, setChartOfAccountOptions] = useState([]);
  const [chartOfAccountData, setChartOfAccountData] = useState([]);

  const [gridData, setGridData] = useState();
  const [gridHeader, setGridHeader] = useState([
    {
      title: "Installment",
      type: "currency",
      filter: false,
    },
    {
      title: "Amount",
      type: "currency",
      filter: false,
    },
    {
      title: "Total",
      type: "currency",
      filter: false,
    },
    {
      title: "Status",
      type: "text",
      filter: false,
    },
    {
      title: "Due Date",
      type: "date",
      filter: false,
    },
  ]);

  const auth = useSelector((state) => state.auth);

  const generalForm = useRef();
  const filtersForm = useRef();

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

        setChartOfAccountIsTemp(true);

        setActiveMenu("Chart of Accounts");
        toast("Saved!", { autoClose: 1000 });
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    } else if (id !== "new") {
      const updated = handleUpdatedFields(data, pageData);

      if (updated.length > 0) {
        const objUpdated = Object.fromEntries(updated);
        try {
          const response = await api.put(`/merchants/${id}`, objUpdated);
          setPageData({ ...pageData, ...objUpdated });
          setSuccessfullyUpdated(true);

          if (
            response.data?.merchantxchartofaccounts &&
            response.data?.merchantxchartofaccounts.length > 0
          ) {
            setChartOfAccountIsTemp(true);

            const gridDataValue = response.data?.merchantxchartofaccounts.map(
              ({
                canceled_at,
                installment,
                amount,
                total,
                status,
                status_date,
              }) => ({
                show: true,
                id: installment,
                fields: [installment, amount, total, status, status_date],
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

            setChartOfAccountData(response.data?.merchantxchartofaccounts);
          } else {
            handleOpened(null);
          }

          toast("Saved!", { autoClose: 1000 });
        } catch (err) {
          toast(err.response.data.error, { type: "error", autoClose: 3000 });
        }
      } else {
        toast(err, { type: "error", autoClose: 3000 });
      }
    }
  }

  useEffect(() => {
    async function getPageData() {
      try {
        const { data } = await api.get(`/merchants/${id}`);
        setPageData({ ...data, loaded: true });

        console.log(data);
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
          ({
            canceled_at,
            installment,
            amount,
            total,
            status,
            status_date,
          }) => ({
            show: true,
            id: installment,
            fields: [installment, amount, total, status, status_date],
            canceled: canceled_at,
          })
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
  }, []);

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
                          <SelectPopover
                            name="chartofaccount_id"
                            required
                            title="Chart of Account"
                            isSearchable
                            grow
                            options={chartOfAccountOptions}
                            InputContext={InputContext}
                          />
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

                              <Input
                                type="text"
                                name="country"
                                title="Country"
                                grow
                                defaultValue={pageData.country}
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
