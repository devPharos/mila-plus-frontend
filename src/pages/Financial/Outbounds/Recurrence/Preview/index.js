import { Form } from "@unform/web";
import {
  BadgeDollarSign,
  Building,
  DollarSign,
  HandCoins,
  Settings,
} from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Input from "~/components/RegisterForm/Input";
// import { emergepay } from "~/services/emergepay.js";

import RegisterFormMenu from "~/components/RegisterForm/Menu";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { Zoom, toast } from "react-toastify";
import api from "~/services/api";
import { formatter, getRegistries, today } from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import DatePicker from "~/components/RegisterForm/DatePicker";
import { addDays, format, parseISO } from "date-fns";
import { yesOrNoOptions } from "~/functions/selectPopoverOptions";
import { openPaymentModal } from "~/functions/emergepayfn";
import { AlertContext } from "~/App";
import PricesSimulation from "~/components/PricesSimulation";
import { FullGridContext } from "../../..";
import Textarea from "~/components/RegisterForm/Textarea";
import FindMerchant from "~/components/Finds/Merchant";
import FindGeneric from "~/components/Finds/FindGeneric";

export const InputContext = createContext({});

export default function PagePreview({
  access,
  id,
  defaultFormType = "preview",
}) {
  const auth = useSelector((state) => state.auth);
  const { alertBox } = useContext(AlertContext);
  const {
    handleOpened,
    setOpened,
    successfullyUpdated,
    setSuccessfullyUpdated,
  } = useContext(FullGridContext);
  const [pageData, setPageData] = useState({
    loaded: false,
    filial_id: auth.filial.id !== 1 ? auth.filial.id : null,
    filial: {
      id: auth.filial.id !== 1 ? auth.filial.id : null,
      name: auth.filial.id !== 1 ? auth.filial.name : null,
    },
    searchFields: {
      filial_id: null,
      processtype_id: null,
      processsubstatus_id: null,
    },
    payees: [],
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
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentCriterias, setPaymentCriterias] = useState([]);
  const [chartOfAccountOptions, setChartOfAccountOptions] = useState([]);
  const [paid, setPaid] = useState(false);

  const generalForm = useRef();

  function handleCloseForm() {
    // if (!successfullyUpdated) {
    //   toast("Changes discarted!", { autoClose: 1000 });
    // }
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
    setSuccessfullyUpdated(true);
    try {
      const { entry_date, first_due_date } = data;
      if (id === "new") {
        await api.post(`/payeerecurrences/`, {
          ...data,
          entry_date: entry_date ? format(entry_date, "yyyyMMdd") : null,
          first_due_date: first_due_date
            ? format(first_due_date, "yyyyMMdd")
            : null,
        });
      } else {
        await api.put(`/payeerecurrences/${id}`, {
          ...data,
          entry_date: entry_date ? format(entry_date, "yyyyMMdd") : null,
          first_due_date: first_due_date
            ? format(first_due_date, "yyyyMMdd")
            : null,
        });
      }
      toast("Saved!", { autoClose: 1000 });
      handleCloseForm();
    } catch (err) {
      console.log(err);
    }
  }

  async function getPaymentMethodsOptions() {
    const { data } = await api.get("/paymentmethods");
    if (data.rows) {
      const retOptions = data.rows
        .filter((paymentMethod) =>
          paymentMethod.type_of_payment.includes("Outbounds")
        )
        .map((paymentMethod) => {
          return { value: paymentMethod.id, label: paymentMethod.description };
        });
      setPaymentMethods(retOptions);
    }
  }

  async function getPaymentCriteriasOptions() {
    const { data } = await api.get("/paymentcriterias");
    if (data.rows) {
      const retOptions = data.rows.map((paymentCriteria) => {
        return {
          value: paymentCriteria.id,
          label: paymentCriteria.description,
        };
      });
      setPaymentCriterias(retOptions);
    }
  }

  useEffect(() => {
    async function getPageData() {
      await getPaymentMethodsOptions();
      await getPaymentCriteriasOptions();
      try {
        if (id !== "new") {
          const { data } = await api
            .get(`/payeerecurrences/${id}`)
            .then((response) => {
              const { data } = response;
              // console.log(data);
              setPageData({
                ...pageData,
                ...data,
                searchFields: {
                  processtype_id: data.processtype_id,
                  processsubstatus_id: data.processsubstatus_id,
                  filial_id: data.filial_id,
                },
                loaded: true,
              });
            })
            .catch((err) => {
              console.log(err);
            });
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
    }
    getPageData();
  }, []);

  useEffect(() => {
    if (paid) {
      setPageData({
        ...pageData,
        loaded: false,
      });
      try {
        setPaid(false);
        api
          .get(`/receivables?search=${pageData.issuer.id}`)
          .then(({ data: receivables }) => {
            setPageData({
              ...pageData,
              receivables,
              loaded: true,
            });
          });
      } catch (err) {
        console.log(err);
      }
    }
  }, [paid]);

  return (
    <Preview formType={formType} fullscreen={fullscreen}>
      {pageData ? (
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
                          readOnly={id !== "new"}
                          InputContext={InputContext}
                          defaultValue={{
                            id: pageData.filial.id,
                            name: pageData.filial.name,
                          }}
                          fields={[
                            {
                              title: "Name",
                              name: "name",
                            },
                          ]}
                        />
                        <FindGeneric
                          route="merchants"
                          title="Merchants"
                          scope="merchant"
                          required
                          readOnly={id !== "new"}
                          InputContext={InputContext}
                          defaultValue={{
                            id: pageData.issuer?.merchant?.id,
                            name: pageData.issuer?.merchant?.name,
                            ein: pageData.issuer?.merchant?.ein,
                            issuer: { id: pageData.issuer?.id },
                          }}
                          fields={[
                            {
                              title: "Name",
                              name: "name",
                            },
                            {
                              title: "EIN",
                              name: "ein",
                            },
                            {
                              title: "Issuer",
                              name: "issuer",
                              field: "id",
                              type: "hidden",
                            },
                          ]}
                        />

                        <InputLine title="Recurrence Information">
                          <Input
                            type="text"
                            name="amount"
                            required
                            title="Amount"
                            grow
                            onlyFloat
                            defaultValue={pageData.amount}
                            InputContext={InputContext}
                          />
                          <DatePicker
                            name="entry_date"
                            grow
                            required
                            disabled
                            title="Entry Date "
                            defaultValue={
                              pageData.entry_date
                                ? parseISO(pageData.entry_date, "yyyy-MM-dd")
                                : today()
                            }
                            placeholderText="MM/DD/YYYY"
                            InputContext={InputContext}
                          />
                          <DatePicker
                            name="first_due_date"
                            grow
                            required
                            disabled={pageData.receivables?.find(
                              (receivable) => receivable.status === "Paid"
                            )}
                            title="First Due Date"
                            defaultValue={
                              pageData.first_due_date
                                ? parseISO(
                                    pageData.first_due_date,
                                    "yyyy-MM-dd"
                                  )
                                : ""
                            }
                            placeholderText="MM/DD/YYYY"
                            InputContext={InputContext}
                          />
                        </InputLine>
                        <FindGeneric
                          route="paymentmethods"
                          title="Payment Methods"
                          scope="paymentMethod"
                          required
                          InputContext={InputContext}
                          defaultValue={{
                            id: pageData.paymentMethod?.id,
                            description: pageData.paymentMethod?.description,
                            platform: pageData.paymentMethod?.platform,
                          }}
                          fields={[
                            {
                              title: "Description",
                              name: "description",
                            },
                            {
                              title: "Platform",
                              name: "platform",
                            },
                          ]}
                        />
                        <FindGeneric
                          route="paymentcriterias"
                          title="Payment Criterias"
                          scope="paymentCriteria"
                          required
                          InputContext={InputContext}
                          defaultValue={{
                            id: pageData.paymentCriteria?.id,
                            description: pageData.paymentCriteria?.description,
                          }}
                          fields={[
                            {
                              title: "Description",
                              name: "description",
                            },
                          ]}
                        />
                        <FindGeneric
                          route="chartofaccounts"
                          title="Chart of Accounts"
                          scope="chartOfAccount"
                          required
                          type="expenses"
                          InputContext={InputContext}
                          searchDefault={pageData.issuer?.merchant?.id}
                          defaultValue={{
                            id: pageData.chartOfAccount?.id,
                            code: pageData.chartOfAccount?.code,
                            name: pageData.chartOfAccount?.name,
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
                          ]}
                        />
                        {/* <InputLine> */}
                        {/* <SelectPopover
                            name="chartofaccount_id"
                            required
                            title="Chart of Account"
                            isSearchable
                            grow
                            defaultValue={chartOfAccountOptions.find(
                              (chartOfAccount) =>
                                chartOfAccount.code ===
                                pageData.chartOfAccount.code
                            )}
                            options={chartOfAccountOptions}
                            InputContext={InputContext}
                          /> */}
                        {/* </InputLine> */}
                        <InputLine>
                          <Textarea
                            name="memo"
                            title="Memo"
                            grow
                            rows={5}
                            onChange={(el) => {
                              setSuccessfullyUpdated(false);
                            }}
                            InputContext={InputContext}
                            defaultValue={pageData.memo}
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
      ) : null}
    </Preview>
  );
}
