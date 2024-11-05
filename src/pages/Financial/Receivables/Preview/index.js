// receivables preview page
import { Form } from "@unform/web";
import { Building, Pencil, X, ListMinus, Filter } from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { applyFilters, getCurrentPage, hasAccessTo } from "~/functions";

import Filters from "~/components/Filters";
import FiltersBar from "~/components/FiltersBar";
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
import Textarea from "~/components/RegisterForm/Textarea";
import Grid from "~/components/Grid";

export const InputContext = createContext({});

const yesOrNoOptions = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

export const subStatusOptions = [
  {
    value: "open",
    label: "Open",
  },
  {
    value: "parcial_paid",
    label: "Parcial Paid",
  },
  {
    value: "paid",
    label: "Paid",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
  {
    value: "late",
    label: "Late",
  },
];

export default function PagePreview({
  access,
  id,
  handleOpened,
  setOpened,
  defaultFormType = "preview",
  successfullyUpdated,
  setSuccessfullyUpdated,
}) {
  const { accesses } = useSelector((state) => state.auth);

  const [pageData, setPageData] = useState({
    loaded: false,
    filial_id: null,
    filial: {
      name: "",
    },
    issuer_id: null,
    issuer: {
      name: "",
    },
    entry_date: null,
    due_date: null,
    amount: 0,
    fee: 0,
    total: 0,
    memo: "",
    is_recurrency: false,
    contract_number: "",
    paymentmethod_id: null,
    paymentMethod: {
      description: "",
    },
    status: "open",
    status_date: null,
    authorization_code: "",
    chartofaccount_id: null,
    chartOfAccount: {
      name: "",
    },
    paymentcriteria_id: null,
    paymentCriteria: {
      description: "",
    },
    installment: [],
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
  const [activeFilters, setActiveFilters] = useState([]);

  const [stepCount, setStepCount] = useState(1);

  const [filialOptions, setFilialOptions] = useState([]);
  const [issuerOptions, setIssuerOptions] = useState([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);
  const [paymentCriteriaOptions, setPaymentCriteriaOptions] = useState([]);
  const [chartOfAccountOptions, setChartOfAccountOptions] = useState([]);

  const [orderBy, setOrderBy] = useState({ column: "Code", asc: true });

  const [gridData, setGridData] = useState();
  const [gridHeader, setGridHeader] = useState([
    {
      title: "Installment",
      type: "text",
      filter: false,
    },
    {
      title: "Amount",
      type: "currency",
      filter: false,
    },
    {
      title: "Fee",
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
      title: "Status Date",
      type: "date",
      filter: false,
    },
  ]);

  const auth = useSelector((state) => state.auth);

  const generalForm = useRef();

  function handleFilters({ title = "", value = "" }) {
    if (value || (title === "Active" && value !== "")) {
      setActiveFilters([
        ...activeFilters.filter((el) => el.title != title),
        { title, value },
      ]);
    } else {
      setActiveFilters([...activeFilters.filter((el) => el.title != title)]);
    }
  }

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });

      if (id === "new") {
        handleOpened(null);
        return;
      }
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
        const response = await api.post(`/receivables`, data);
        setPageData({ ...pageData, ...response.data });

        console.log("response", response.data);
        setOpened(response.data.id);

        // Navega para a aba de 'Installments'
        setActiveMenu("installments");

        id = response.data.id;

        toast("Created!", { autoClose: 1000 });

        // Atualiza os dados do grid com os 'receivableInstallmentsItems' retornados

        if (response?.data?.installments) {
          const gridDataValues = response.data.installments.map(
            ({
              id,
              canceled_at,
              installment,
              amount,
              fee,
              total,
              status,
              status_date,
            }) => ({
              show: true,
              id,
              fields: [installment, amount, fee, total, status, status_date],
              canceled: canceled_at,
            })
          );

          setGridData(gridDataValues);
        }

        setStepCount(2);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    } else if (id !== "new") {
      const updated = handleUpdatedFields(data, pageData);

      if (updated.length > 0) {
        const objUpdated = Object.fromEntries(updated);
        try {
          await api.put(`/receivables/${id}`, objUpdated);
          setPageData({ ...pageData, ...objUpdated });
          setSuccessfullyUpdated(true);

          // Atualiza os dados do grid com os 'receivableInstallmentsItems' retornados
          const gridDataValues = response.data.installment.map(
            ({
              id,
              canceled_at,
              installment,
              amount,
              fee,
              total,
              status,
              status_date,
            }) => ({
              show: true,
              id,
              fields: [installment, amount, fee, total, status, status_date],
              canceled: canceled_at,
            })
          );

          setGridData(gridDataValues);
          toast("Saved!", { autoClose: 1000 });
          handleOpened(null);
        } catch (err) {
          toast(err.response.data.error, { type: "error", autoClose: 3000 });
        }
      } else {
        console.log("No changes to be saved!");
        console.log(updated);
      }
    }
  }

  useEffect(() => {
    async function getPageData() {
      try {
        const { data } = await api.get(`/receivables/${id}`);

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

        // Atualiza os dados do grid com os 'receivableInstallmentsItems'
        const gridDataValues = data.installments.map(
          ({
            id,
            canceled_at,
            installment,
            amount,
            fee,
            total,
            status,
            status_date,
          }) => ({
            show: true,
            id,
            fields: [installment, amount, fee, total, status, status_date],
            canceled: canceled_at,
          })
        );

        setGridData(gridDataValues);
      } catch (err) {
        console.log(err);
        toast(err || err.response.data.error, {
          type: "error",
          autoClose: 3000,
        });
      }
    }
    async function getDefaultOptions() {
      try {
        const filialData = await api.get(`/filials`);
        const issuerData = await api.get(`/issuers`);
        const paymentMethodData = await api.get(`/paymentmethods`);
        const paymentCriteriaData = await api.get(`/paymentcriterias`);
        const chartOfAccountData = await api.get(`/chartofaccounts`);

        const filialOptions = filialData.data
          .filter((f) => f.id !== id)
          .map((f) => {
            return { value: f.id, label: f.name };
          });

        const issuerOptions = issuerData.data
          .filter((f) => f.id !== id)
          .map((f) => {
            return { value: f.id, label: f.name };
          });

        const paymentMethodOptions = paymentMethodData.data
          .filter((f) => f.id !== id)
          .map((f) => {
            return { value: f.id, label: f.description.slice(0, 20) };
          });

        const paymentCriteriaOptions = paymentCriteriaData.data
          .filter((f) => f.id !== id)
          .map((f) => {
            return { value: f.id, label: f.description.slice(0, 20) };
          });

        const chartOfAccountOptions = chartOfAccountData.data
          .filter((f) => f.id !== id)
          .map((f) => {
            return { value: f.id, label: f.name };
          });

        setFilialOptions(filialOptions);
        setIssuerOptions(issuerOptions);
        setPaymentMethodOptions(paymentMethodOptions);
        setPaymentCriteriaOptions(paymentCriteriaOptions);
        setChartOfAccountOptions(chartOfAccountOptions);
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
  }, [id]);

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
                disabled={id === "new"}
                name="installments"
              >
                <ListMinus size={16} /> Installments
              </RegisterFormMenu>
            </div>
            <div className="border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start">
              <div className="flex flex-col items-start justify-start text-sm overflow-y-scroll">
                {activeMenu === "installments" && (
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
                            title={(pageData?.name || "") + " Installments"}
                            registry={registry}
                            InputContext={InputContext}
                          />

                          <Grid
                            gridData={gridData}
                            gridHeader={gridHeader}
                            orderBy={orderBy}
                            setOrderBy={setOrderBy}
                            handleOpened={handleOpened}
                          />
                        </>
                      ) : (
                        <FormLoading />
                      )}
                    </InputContext.Provider>
                  </Form>
                )}
                {activeMenu === "general" && (
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

                            <InputLine title=" ">
                              <Input
                                type="date"
                                name="entry_date"
                                required
                                title="Entry Date"
                                grow
                                defaultValue={pageData.entry_date}
                                InputContext={InputContext}
                              />

                              <Input
                                type="date"
                                name="due_date"
                                required
                                title="Due Date"
                                grow
                                defaultValue={pageData.due_date}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine title=" Memo">
                              <Textarea
                                name="memo"
                                title="Memo"
                                grow
                                defaultValue={pageData.memo}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine title="Amount">
                              <Input
                                type="number"
                                name="amount"
                                required
                                title="Amount"
                                grow
                                defaultValue={pageData.amount}
                                InputContext={InputContext}
                              />
                              <Input
                                type="number"
                                name="fee"
                                required
                                title="Fee"
                                grow
                                defaultValue={pageData.fee}
                                InputContext={InputContext}
                              />
                              <Input
                                type="number"
                                name="total"
                                required
                                title="Total"
                                grow
                                defaultValue={pageData.total}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine title="Recurrency Information">
                              <SelectPopover
                                name="is_recurrency"
                                title="Is Recurrency?"
                                grow
                                defaultValue={
                                  pageData.is_recurrency
                                    ? {
                                        value: pageData.is_recurrency,
                                        label: "Yes",
                                      }
                                    : {
                                        value: pageData.is_recurrency,
                                        label: "No",
                                      }
                                }
                                options={yesOrNoOptions}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="contract_number"
                                title="Contract Number"
                                grow
                                defaultValue={pageData.contract_number}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine title="Issuer">
                              <SelectPopover
                                name="issuer_id"
                                required
                                title="Issuer"
                                isSearchable
                                grow
                                defaultValue={
                                  pageData.issuer_id
                                    ? {
                                        value: pageData.issuer_id,
                                        label: pageData.issuer.name,
                                      }
                                    : null
                                }
                                options={issuerOptions}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine title="Payment Method">
                              <SelectPopover
                                name="paymentmethod_id"
                                title="Payment Method"
                                isSearchable
                                grow
                                defaultValue={
                                  pageData.paymentmethod_id
                                    ? {
                                        value: pageData.paymentmethod_id,
                                        label:
                                          pageData.paymentMethod.description,
                                      }
                                    : null
                                }
                                options={paymentMethodOptions}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine title="Authorization Code">
                              <Input
                                type="text"
                                name="authorization_code"
                                title="Authorization Code"
                                grow
                                defaultValue={pageData.authorization_code}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine title="Chart of Account">
                              <SelectPopover
                                name="chartofaccount_id"
                                title="Chart of Account"
                                isSearchable
                                grow
                                defaultValue={
                                  pageData.chartofaccount_id
                                    ? {
                                        value: pageData.chartofaccount_id,
                                        label: pageData.chartOfAccount.name,
                                      }
                                    : null
                                }
                                options={chartOfAccountOptions}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine title="Payment Criteria">
                              <SelectPopover
                                name="paymentcriteria_id"
                                title="Payment Criteria"
                                isSearchable
                                grow
                                defaultValue={
                                  pageData.paymentcriteria_id
                                    ? {
                                        value: pageData.paymentcriteria_id,
                                        label: pageData.paymentCriteria.name,
                                      }
                                    : null
                                }
                                options={paymentCriteriaOptions}
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
                )}
              </div>
            </div>
          </div>
        )
      ) : null}
    </Preview>
  );
}
