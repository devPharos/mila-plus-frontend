import { Form } from "@unform/web";
import { Building, Pencil, X, ListMinus, Undo, UndoDot } from "lucide-react";
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
import Textarea from "~/components/RegisterForm/Textarea";
import { format, parseISO } from "date-fns";
import {
  invoiceTypeDetailsOptions,
  invoiceTypesOptions,
  receivableStatusesOptions,
  yesOrNoOptions,
} from "~/functions/selectPopoverOptions";
import { FullGridContext } from "../..";
import { Scope } from "@unform/core";
import DatePicker from "~/components/RegisterForm/DatePicker";

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
    filial_id: null,
    filial: {
      name: "",
    },
    filialOptions: [],
    issuerOptions: [],
    paymentMethodOptions: [],
    // paymentCriteriaOptions: [],
    chartOfAccountOptions: [],
    issuer_id: null,
    issuer: {
      name: "",
    },
    status: "Pending",
    entry_date: null,
    due_date: null,
    amount: null,
    total: null,
    balance: null,
    memo: "",
    is_recurrence: false,
    contract_number: "",
    paymentmethod_id: null,
    paymentMethod: {
      description: "",
    },
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
    type: "Credit Note",
    type_detail: "Other",
    searchfields: {
      type: "Credit Note",
      type_detail: "Other",
    },
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

  const auth = useSelector((state) => state.auth);

  const generalForm = useRef();
  const refundForm = useRef();

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
        setOpened(response.data.id);

        if (response.data.created_by) {
          const registries = await getRegistries({
            created_by: response.data.created_by,
            created_at: response.data.created_at,
          });
          setRegistry(registries);
        }

        handleOpened(null);

        setSuccessfullyUpdated(true);
        toast("Created!", { autoClose: 1000 });
      } catch (err) {
        console.log(err);
        // toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    } else if (id !== "new") {
      const updated = handleUpdatedFields(data, pageData);

      if (updated.length > 0) {
        const objUpdated = Object.fromEntries(updated);

        try {
          await api.put(`/receivables/${id}`, objUpdated);
          setPageData({ ...pageData, ...objUpdated });
          setSuccessfullyUpdated(true);

          handleOpened(null);

          toast("Saved!", { autoClose: 1000 });
        } catch (err) {
          console.log(err);
          toast(err, { type: "error", autoClose: 3000 });
        }
      } else {
        toast("No changes to be saved!", {
          autoClose: 1000,
          type: "info",
          transition: Zoom,
        });
      }
    }
  }

  async function handleRefundFormSubmit(data) {
    const {
      receivable_id,
      refund_amount,
      total,
      refund_reason,
      paymentmethod_id,
    } = data;

    if (!total || !receivable_id || !refund_amount || !refund_reason) {
      return;
    }
    if (parseFloat(refund_amount) > parseFloat(total)) {
      toast("Refund amount cannot be greater than total paid!", {
        type: "error",
        autoClose: 3000,
      });
      return;
    }

    try {
      api
        .post(`/receivables/refund/${receivable_id}`, {
          receivable_id,
          refund_amount,
          refund_reason,
          paymentmethod_id,
        })
        .then(({ data }) => {
          toast(data.message, { autoClose: 1000 });
          setPageData({ ...pageData, ...data });
          setOpened(data.id);
          handleCloseForm();
        })
        .catch((err) => {
          toast(err.response.data.error, { type: "error", autoClose: 3000 });
        });
    } catch (err) {
      console.log({ err });
      // toast(err.response.data.error, { type: "error", autoClose: 3000 });
    }
  }

  useEffect(() => {
    async function getPageData(id) {
      try {
        let data = pageData;

        if (id !== "new") {
          const { data: receivableData } = await api.get(`/receivables/${id}`);
          data = receivableData;
        }

        const filialData = await api.get(`/filials`);
        const issuerData = await api.get(`/issuers`);
        const paymentMethodData = await api.get(`/paymentmethods`);
        // const paymentCriteriaData = await api.get(`/paymentcriterias`);
        const chartOfAccountData = await api.get(
          `/chartofaccounts?issuer=${data.issuer_id}`
        );

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

        // const paymentCriteriaOptions = paymentCriteriaData.data
        //   .filter((f) => f.id !== id)
        //   .map((f) => {
        //     return {
        //       value: f.id,
        //       label:
        //         f.description.slice(0, 20) +
        //         (f.recurring_metric ? " - " + f.recurring_metric : ""),
        //     };
        //   });

        const chartOfAccountOptions = chartOfAccountData.data
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

        setPageData({
          ...data,
          filialOptions,
          issuerOptions,
          paymentMethodOptions,
          // paymentCriteriaOptions,
          chartOfAccountOptions,
          loaded: true,
          searchfields: {
            type: data.type,
            type_detail: data.type_detail,
          },
        });

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
        // toast(err || err.response.data.error, {
        //   type: "error",
        //   autoClose: 3000,
        // });
      }
    }

    getPageData(id);
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
              {pageData.status !== "Pending" && (
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  name="refund"
                >
                  <UndoDot size={16} /> Refund
                </RegisterFormMenu>
              )}
            </div>
            <div className="border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start">
              <div className="flex flex-col items-start justify-start text-sm overflow-y-scroll">
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
                            title={
                              pageData.issuer_id
                                ? pageData.issuerOptions.find(
                                    (issuer) =>
                                      issuer.value === pageData.issuer_id
                                  ).label
                                : null
                            }
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
                                  readOnly={
                                    pageData.is_recurrence ||
                                    pageData.type === "Invoice"
                                  }
                                  isSearchable
                                  grow
                                  defaultValue={
                                    pageData.filial_id
                                      ? pageData.filialOptions.find(
                                          (filial) =>
                                            filial.value === pageData.filial_id
                                        )
                                      : null
                                  }
                                  options={pageData.filialOptions}
                                  InputContext={InputContext}
                                />
                              </InputLine>
                            )}

                            <InputLine title="Status">
                              <SelectPopover
                                name="status"
                                required
                                grow
                                disabled
                                title="Status"
                                options={receivableStatusesOptions}
                                defaultValue={receivableStatusesOptions.find(
                                  (status) => status.value === pageData.status
                                )}
                                InputContext={InputContext}
                                isSearchable
                              />
                            </InputLine>

                            {pageData.settlements &&
                              pageData.settlements.length > 0 && (
                                <>
                                  {pageData.settlements.map(
                                    (settlement, index) => {
                                      return (
                                        <Scope
                                          key={index}
                                          path={`settlements[${index}]`}
                                        >
                                          <InputLine
                                            title={`Settlement #${index + 1}`}
                                          >
                                            <Input
                                              type="hidden"
                                              name="id"
                                              defaultValue={settlement.id}
                                              InputContext={InputContext}
                                            />
                                            <Input
                                              type="text"
                                              name="amount"
                                              shrink
                                              readOnly
                                              title="Amount"
                                              defaultValue={settlement.amount}
                                              InputContext={InputContext}
                                            />
                                            <SelectPopover
                                              name="paymentmethod_id"
                                              grow
                                              title="Payment Method"
                                              isSearchable
                                              options={
                                                pageData.paymentMethodOptions
                                              }
                                              disabled
                                              defaultValue={pageData.paymentMethodOptions.find(
                                                (paymentMethod) =>
                                                  paymentMethod.value ===
                                                  settlement.paymentmethod_id
                                              )}
                                              InputContext={InputContext}
                                            />
                                            <DatePicker
                                              name="created_at"
                                              grow
                                              disabled
                                              title="Settled At"
                                              defaultValue={format(
                                                parseISO(settlement.created_at),
                                                "yyyy-MM-dd"
                                              )}
                                              placeholderText="MM/DD/YYYY"
                                              InputContext={InputContext}
                                            />
                                          </InputLine>
                                        </Scope>
                                      );
                                    }
                                  )}
                                </>
                              )}
                            <InputLine title="Amount">
                              <Input
                                type="text"
                                name="amount"
                                required
                                readOnly={
                                  pageData.is_recurrence ||
                                  pageData.balance !== pageData.total
                                }
                                placeholder="0.00"
                                title="Amount"
                                onChange={(el) => {
                                  setPageData({
                                    ...pageData,
                                    total: el.target.value,
                                    balance: el.target.value,
                                  });
                                  setSuccessfullyUpdated(false);
                                }}
                                grow
                                defaultValue={pageData.amount}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="discount"
                                readOnly
                                placeholder="0.00"
                                title="Discount"
                                grow
                                defaultValue={pageData.discount}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="fee"
                                readOnly
                                placeholder="0.00"
                                title="Fee"
                                grow
                                defaultValue={pageData.fee}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="total"
                                readOnly
                                placeholder="0.00"
                                title="Total"
                                grow
                                value={pageData.total}
                                InputContext={InputContext}
                              />
                              {id !== "new" && (
                                <Input
                                  type="text"
                                  name="balance"
                                  readOnly
                                  placeholder="0.00"
                                  title="Balance"
                                  grow
                                  value={pageData.balance.toFixed(2)}
                                  InputContext={InputContext}
                                />
                              )}
                            </InputLine>

                            {pageData.discounts &&
                              pageData.discounts.length > 0 &&
                              pageData.discounts.map((discount, index) => {
                                return (
                                  <Scope
                                    key={index}
                                    path={`discounts.${index}`}
                                  >
                                    <InputLine
                                      title={
                                        index === 0 ? "Applied Discounts" : ""
                                      }
                                    >
                                      <Input
                                        type="text"
                                        name="name"
                                        grow
                                        readOnly
                                        value={discount.name}
                                        InputContext={InputContext}
                                      />
                                      <Input
                                        type="text"
                                        name="value"
                                        readOnly
                                        value={
                                          (discount.percent ? "" : "$ ") +
                                          discount.value +
                                          (discount.percent ? " %" : "")
                                        }
                                        InputContext={InputContext}
                                      />
                                    </InputLine>
                                  </Scope>
                                );
                              })}

                            <InputLine title="Invoice">
                              <SelectPopover
                                name="type"
                                required
                                grow
                                title="Type"
                                readOnly={
                                  pageData.is_recurrence ||
                                  pageData.balance !== pageData.total
                                }
                                options={invoiceTypesOptions}
                                defaultValue={invoiceTypesOptions.find(
                                  (invoiceType) =>
                                    invoiceType.value === pageData.type
                                )}
                                onChange={(el) => {
                                  setPageData({
                                    ...pageData,
                                    searchfields: {
                                      type: el.value,
                                      type_detail:
                                        invoiceTypeDetailsOptions.find(
                                          (typeDetail) =>
                                            typeDetail.type === el.value
                                        ).value,
                                    },
                                  });
                                  setSuccessfullyUpdated(false);
                                }}
                                InputContext={InputContext}
                              />
                              <SelectPopover
                                name="type_detail"
                                required
                                grow
                                title="Type Detail"
                                readOnly={
                                  pageData.is_recurrence ||
                                  pageData.balance !== pageData.total
                                }
                                options={invoiceTypeDetailsOptions.filter(
                                  (typeDetail) =>
                                    typeDetail.type ===
                                    pageData.searchfields.type
                                )}
                                value={invoiceTypeDetailsOptions.find(
                                  (typedetail) =>
                                    typedetail.value ===
                                    pageData.searchfields.type_detail
                                )}
                                onChange={(el) => {
                                  setPageData({
                                    ...pageData,
                                    searchfields: {
                                      ...pageData.searchfields,
                                      type_detail: el.value,
                                    },
                                  });
                                  setSuccessfullyUpdated(false);
                                }}
                                InputContext={InputContext}
                              />
                              {pageData.invoice_number && (
                                <Input
                                  type="text"
                                  name="invoice_number"
                                  required
                                  readOnly
                                  title="Invoice Number"
                                  grow
                                  defaultValue={
                                    pageData.invoice_number
                                      ? pageData.invoice_number
                                      : ""
                                  }
                                  InputContext={InputContext}
                                />
                              )}
                            </InputLine>

                            <InputLine>
                              <SelectPopover
                                name="issuer_id"
                                required
                                title="Issuer"
                                readOnly={
                                  pageData.is_recurrence ||
                                  pageData.balance !== pageData.total
                                }
                                isSearchable
                                grow
                                defaultValue={
                                  pageData.issuer_id
                                    ? pageData.issuerOptions.find(
                                        (issuer) =>
                                          issuer.value === pageData.issuer_id
                                      )
                                    : null
                                }
                                options={pageData.issuerOptions}
                                InputContext={InputContext}
                              />
                            </InputLine>
                            <InputLine>
                              <Input
                                type="date"
                                name="entry_date"
                                required
                                title="Entry Date"
                                readOnly={
                                  pageData.is_recurrence ||
                                  pageData.balance !== pageData.total
                                }
                                grow
                                defaultValue={
                                  pageData.entry_date
                                    ? format(
                                        parseISO(pageData.entry_date),
                                        "yyyy-MM-dd"
                                      )
                                    : ""
                                }
                                InputContext={InputContext}
                              />

                              <Input
                                type="date"
                                name="due_date"
                                required
                                title="Due Date"
                                readOnly={
                                  pageData.is_recurrence ||
                                  pageData.balance !== pageData.total
                                }
                                grow
                                defaultValue={
                                  pageData?.due_date
                                    ? format(
                                        parseISO(pageData.due_date),
                                        "yyyy-MM-dd"
                                      )
                                    : ""
                                }
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine>
                              <SelectPopover
                                name="paymentmethod_id"
                                title="Payment Method"
                                isSearchable
                                grow
                                required
                                readOnly={
                                  pageData.is_recurrence ||
                                  pageData.balance !== pageData.total
                                }
                                defaultValue={
                                  pageData.paymentmethod_id
                                    ? pageData.paymentMethodOptions.find(
                                        (paymentMethod) =>
                                          paymentMethod.value ===
                                          pageData.paymentmethod_id
                                      )
                                    : null
                                }
                                options={pageData.paymentMethodOptions}
                                InputContext={InputContext}
                              />
                              <SelectPopover
                                name="is_recurrence"
                                title="Is Recurrence?"
                                readOnly
                                grow
                                defaultValue={yesOrNoOptions.find(
                                  (type) =>
                                    type.value === pageData.is_recurrence
                                )}
                                options={yesOrNoOptions}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine title="Details">
                              <Textarea
                                name="memo"
                                title="Observations"
                                readOnly={
                                  pageData.is_recurrence ||
                                  pageData.balance !== pageData.total
                                }
                                rows={3}
                                grow
                                defaultValue={pageData.memo}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine>
                              <Input
                                type="text"
                                name="contract_number"
                                title="Contract Number"
                                grow
                                defaultValue={pageData.contract_number}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="authorization_code"
                                title="Authorization Code"
                                grow
                                defaultValue={pageData.authorization_code}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine>
                              <SelectPopover
                                name="chartofaccount_id"
                                title="Chart of Account"
                                isSearchable
                                required
                                readOnly={
                                  pageData.is_recurrence ||
                                  pageData.balance !== pageData.total
                                }
                                grow
                                defaultValue={
                                  pageData.chartofaccount_id
                                    ? pageData.chartOfAccountOptions.find(
                                        (chartOfAccount) =>
                                          chartOfAccount.value ===
                                          pageData.chartofaccount_id
                                      )
                                    : null
                                }
                                options={pageData.chartOfAccountOptions}
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
                {activeMenu === "refund" && (
                  <Form
                    ref={generalForm}
                    onSubmit={handleRefundFormSubmit}
                    className="w-full pb-32"
                  >
                    <InputContext.Provider
                      value={{
                        id,
                        generalForm: refundForm,
                        setSuccessfullyUpdated,
                        fullscreen,
                        setFullscreen,
                        successfullyUpdated,
                        handleCloseForm,
                      }}
                    >
                      {id !== "new" && pageData.loaded ? (
                        <>
                          <FormHeader
                            access={access}
                            title={
                              pageData.issuer_id
                                ? pageData.issuerOptions.find(
                                    (issuer) =>
                                      issuer.value === pageData.issuer_id
                                  ).label
                                : null
                            }
                            registry={registry}
                            InputContext={InputContext}
                          />

                          <InputLineGroup
                            title="REFUND"
                            activeMenu={activeMenu === "refund"}
                          >
                            <Input
                              type="hidden"
                              name="receivable_id"
                              defaultValue={id}
                              InputContext={InputContext}
                            ></Input>
                            <InputLine title="Status">
                              <SelectPopover
                                name="status"
                                grow
                                disabled
                                title="Status"
                                options={receivableStatusesOptions}
                                defaultValue={receivableStatusesOptions.find(
                                  (status) => status.value === pageData.status
                                )}
                                InputContext={InputContext}
                                isSearchable
                              />
                            </InputLine>
                            <InputLine title="Amount">
                              <Input
                                type="text"
                                name="total"
                                readOnly
                                title="Total Paid"
                                grow
                                defaultValue={pageData.total - pageData.balance}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="refund_amount"
                                title="Refund Amount"
                                required
                                placeholder={pageData.total - pageData.balance}
                                grow
                                InputContext={InputContext}
                              />
                              <SelectPopover
                                name="paymentmethod_id"
                                title="Payment Method"
                                isSearchable
                                grow
                                required
                                defaultValue={pageData.paymentMethodOptions.find(
                                  (paymentMethod) =>
                                    paymentMethod.value ===
                                    "dcbe2b5b-c088-4107-ae32-efb4e7c4b161"
                                )}
                                options={pageData.paymentMethodOptions.filter(
                                  (paymentMethod) =>
                                    paymentMethod.value ===
                                    "dcbe2b5b-c088-4107-ae32-efb4e7c4b161"
                                )}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine title="Details">
                              <Textarea
                                name="refund_reason"
                                required
                                title="Refund reason"
                                rows={3}
                                grow
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
