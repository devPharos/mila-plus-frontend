import { Form } from "@unform/web";
import {
  Building,
  Pencil,
  X,
  ListMinus,
  Undo,
  UndoDot,
  ReplaceAll,
  Send,
  Mail,
  List,
} from "lucide-react";
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
import {
  getRegistries,
  getTabsPermissions,
  handleUpdatedFields,
  tabAllowed,
} from "~/functions";
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
import { FullGridContext } from "../../..";
import { Scope } from "@unform/core";
import DatePicker from "~/components/RegisterForm/DatePicker";
import { AlertContext } from "~/App";
import FindGeneric from "~/components/Finds/FindGeneric";

export const InputContext = createContext({});

export default function PagePreview({
  access,
  id,
  defaultFormType = "preview",
}) {
  const { alertBox } = useContext(AlertContext);
  const {
    handleOpened,
    setOpened,
    successfullyUpdated,
    setSuccessfullyUpdated,
  } = useContext(FullGridContext);

  const tabsPermissions = getTabsPermissions(
    "financial-receivables",
    FullGridContext
  );
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
    textpaymenttransactions: [],
    status: "Pending",
    entry_date: null,
    due_date: null,
    amount: 0,
    discount: 0,
    fee: 0,
    total: 0,
    balance: 0,
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
    maillogs: [],
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

  useEffect(() => {
    document.getElementById("scrollPage-" + activeMenu).scrollTo(0, 0);
  }, [activeMenu]);

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

    if (activeMenu === "Reclassify") {
      try {
        const response = await api.put(`/receivables/classify/${id}`, data);
        setPageData({ ...pageData, ...response.data });
        setSuccessfullyUpdated(true);
        toast("Saved!", { autoClose: 1000 });
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
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
      paymentMethod,
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
          paymentMethod,
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

  async function getPageData(id) {
    try {
      let data = pageData;

      if (id !== "new") {
        const { data: receivableData } = await api.get(`/receivables/${id}`);
        data = receivableData;
      }

      setPageData({
        ...data,
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

  useEffect(() => {
    getPageData(id);
  }, [id]);

  async function verifyOpenReceivables() {
    const receivableBefore = await api.get(
      `/receivables/has-invoice-before/${id}`
    );
    if (receivableBefore?.data?.due_date) {
      const { due_date, invoice_number, status, balance } =
        receivableBefore.data;
      const formattedDate = format(parseISO(due_date), "MM/dd/yyyy");
      alertBox({
        title: "Attention!",
        descriptionHTML:
          "This student has other unpaid invoices:<br/><br/><hr /><br/><strong>Invoice number:</strong> " +
          invoice_number.toString() +
          "<br/><strong>Due date:</strong> " +
          formattedDate +
          "<br/><strong>Balance:</strong> " +
          balance.toFixed(2),
        buttons: [
          {
            title: "I understand",
            class: "cancel",
            onPress: () => {
              setTimeout(() => {
                handleSendInvoice();
              }, 100);
            },
          },
        ],
      });
    } else {
      setTimeout(() => {
        handleSendInvoice();
      }, 100);
    }
  }

  function handleSendInvoice() {
    alertBox({
      title: "Attention!",
      descriptionHTML:
        "Are you sure you want to send this invoice by email to the student?",
      buttons: [
        {
          title: "No",
          class: "cancel",
        },
        {
          title: "Yes",
          onPress: async () => {
            setPageData({ ...pageData, loaded: false });
            api
              .post(`/receivables/send-invoice/${id}`)
              .then(() => {
                toast("Invoice sent!", { autoClose: 1000 });
                getPageData(id);
              })
              .catch((err) => {
                console.log(err);
                toast(err.response.data.error, {
                  type: "error",
                  autoClose: 3000,
                });
              });
            // handleOpened(null);
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
          </div>
        ) : (
          <div className="flex h-full flex-row items-start justify-between gap-4">
            <div className="flex flex-col items-center justify-between text-xs w-40 gap-4">
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="general"
              >
                <Building size={16} /> General
              </RegisterFormMenu>
              {pageData.status.includes("Pending") &&
                tabAllowed(tabsPermissions, "resend-invoice-tab") && (
                  <button
                    type="button"
                    onClick={verifyOpenReceivables}
                    className="w-full bg-slate-300 text-slate-500 border border-slate-400 hover:bg-slate-400 hover:text-white rounded-md py-4 px-4 my-2 px-2 h-6 flex flex-row items-center justify-start text-xs gap-2"
                  >
                    <Send size={14} />
                    <strong>Resend Invoice</strong>
                  </button>
                )}
              {pageData.status.includes("Paid", "Partial Paid") &&
                tabAllowed(tabsPermissions, "settlements-tab") && (
                  <RegisterFormMenu
                    setActiveMenu={setActiveMenu}
                    activeMenu={activeMenu}
                    name="settlements"
                  >
                    <ReplaceAll size={16} /> Settlements
                  </RegisterFormMenu>
                )}
              {pageData.status.includes("Paid", "Partial Paid") &&
                tabAllowed(tabsPermissions, "refunds-tab") && (
                  <RegisterFormMenu
                    setActiveMenu={setActiveMenu}
                    activeMenu={activeMenu}
                    name="refund"
                  >
                    <UndoDot size={16} /> Refunds
                  </RegisterFormMenu>
                )}
              {tabAllowed(tabsPermissions, "receivable-reclassify-tab") && (
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  name="Reclassify"
                >
                  <List size={16} /> Reclassify
                </RegisterFormMenu>
              )}
              {tabAllowed(tabsPermissions, "mail-logs-tab") && (
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  name="Mail Logs"
                >
                  <Mail size={16} /> Email Logs
                </RegisterFormMenu>
              )}
            </div>
            <div className="border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start">
              <div className="flex flex-col items-start justify-start text-sm overflow-y-scroll">
                {activeMenu === "general" && (
                  <Form
                    id={`scrollPage-${activeMenu}`}
                    ref={generalForm}
                    onSubmit={handleGeneralFormSubmit}
                    className="w-full pb-32 overflow-y-scroll"
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
                            title={`Receivable - ${pageData.issuer.name}`}
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
                              readOnly={
                                pageData.is_recurrence ||
                                pageData.status !== "Pending"
                              }
                              InputContext={InputContext}
                              defaultValue={
                                id === "new"
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
                                onChange={(value) => {
                                  setPageData({
                                    ...pageData,
                                    total: parseFloat(value),
                                    balance: parseFloat(value),
                                  });
                                  setSuccessfullyUpdated(false);
                                }}
                                grow
                                defaultValue={pageData.amount.toFixed(2)}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="discount"
                                readOnly
                                placeholder="0.00"
                                title="Discount"
                                grow
                                defaultValue={pageData.discount.toFixed(2)}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="fee"
                                readOnly
                                placeholder="0.00"
                                title="Fee"
                                grow
                                defaultValue={pageData.fee.toFixed(2)}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="total"
                                placeholder="0.00"
                                title="Total"
                                readOnly
                                grow
                                defaultValue={pageData.total.toFixed(2)}
                                InputContext={InputContext}
                              />
                              {id !== "new" && (
                                <Input
                                  type="text"
                                  name="balance"
                                  placeholder="0.00"
                                  title="Total"
                                  readOnly
                                  grow
                                  defaultValue={pageData.balance.toFixed(2)}
                                  InputContext={InputContext}
                                />
                              )}
                            </InputLine>

                            {pageData.feeadjustments &&
                              pageData.feeadjustments.length > 0 &&
                              pageData.feeadjustments
                                .sort((a, b) => a.created_at < b.created_at)
                                .map((feeadjustment, index) => {
                                  return (
                                    <Scope
                                      key={index}
                                      path={`feeadjustments.${index}`}
                                    >
                                      <InputLine
                                        title={
                                          index === 0
                                            ? "Fee Adjustments: (" +
                                              pageData.feeadjustments.length +
                                              ")"
                                            : ""
                                        }
                                      >
                                        <div className="mt-2 text-xs text-gray-500">
                                          #
                                          {pageData.feeadjustments.length -
                                            index}
                                        </div>

                                        <Input
                                          type="text"
                                          name="created_at"
                                          readOnly
                                          placeholder="0.00"
                                          title="Date"
                                          shrink
                                          defaultValue={format(
                                            parseISO(feeadjustment.created_at),
                                            "MM/dd/yyyy"
                                          )}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="fee"
                                          readOnly
                                          placeholder="0.00"
                                          title="Previous Fee"
                                          shrink
                                          defaultValue={feeadjustment.old_fee.toFixed(
                                            2
                                          )}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="fee"
                                          readOnly
                                          placeholder="0.00"
                                          title="New Fee"
                                          shrink
                                          defaultValue={feeadjustment.new_fee.toFixed(
                                            2
                                          )}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="reason"
                                          readOnly
                                          placeholder=""
                                          title="Reason"
                                          grow
                                          defaultValue={feeadjustment.reason}
                                          InputContext={InputContext}
                                        />
                                      </InputLine>
                                    </Scope>
                                  );
                                })}

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

                            <FindGeneric
                              route="issuers"
                              title="Issuer"
                              scope="issuer"
                              required
                              readOnly={
                                pageData.is_recurrence ||
                                pageData.status !== "Pending"
                              }
                              InputContext={InputContext}
                              defaultValue={{
                                id: pageData.issuer?.id,
                                name: pageData.issuer?.name,
                                city: pageData.issuer?.city,
                                state: pageData.issuer?.state,
                              }}
                              fields={[
                                {
                                  title: "Name",
                                  name: "name",
                                },
                                {
                                  title: "City",
                                  name: "city",
                                },
                                {
                                  title: "State",
                                  name: "state",
                                },
                              ]}
                            />
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

                            <FindGeneric
                              route="paymentmethods"
                              title="Payment Method"
                              scope="paymentMethod"
                              required
                              type="Inbounds"
                              readOnly={
                                pageData.is_recurrence ||
                                pageData.status !== "Pending"
                              }
                              InputContext={InputContext}
                              defaultValue={{
                                id: pageData.paymentMethod?.id,
                                description:
                                  pageData.paymentMethod?.description,
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
                            <InputLine>
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

                            {pageData.textpaymenttransactions.length > 0 && (
                              <InputLine>
                                <Input
                                  title="Payment Link"
                                  type="text"
                                  name="payment_link"
                                  readOnly
                                  grow
                                  defaultValue={
                                    pageData.textpaymenttransactions[0]
                                      .payment_page_url
                                  }
                                  InputContext={InputContext}
                                />
                              </InputLine>
                            )}

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
                                readOnly={pageData.status !== "Pending"}
                                grow
                                defaultValue={pageData.contract_number}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="authorization_code"
                                title="Authorization Code"
                                readOnly={pageData.status !== "Pending"}
                                grow
                                defaultValue={pageData.authorization_code}
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <FindGeneric
                              route="chartofaccounts"
                              title="Chart of Account"
                              scope="chartOfAccount"
                              required
                              type="receipts"
                              readOnly={
                                pageData.is_recurrence ||
                                pageData.status !== "Pending"
                              }
                              InputContext={InputContext}
                              defaultValue={{
                                id: pageData.chartOfAccount?.id,
                                code: pageData.chartOfAccount?.code,
                                name: pageData.chartOfAccount?.name,
                                father: pageData.chartOfAccount?.Father?.name,
                                granFather:
                                  pageData.chartOfAccount?.Father?.Father?.name,
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

                            <FindGeneric
                              route="costcenters"
                              title="Cost Centers"
                              scope="costCenter"
                              required
                              readOnly={
                                pageData.is_recurrence ||
                                pageData.status !== "Pending"
                              }
                              InputContext={InputContext}
                              defaultValue={{
                                id: pageData.costcenter_id,
                                code: pageData.costcenter?.code,
                                name: pageData.costcenter?.name,
                                father: pageData.costcenter?.Father?.name,
                                granFather:
                                  pageData.costcenter?.Father?.Father?.name,
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
                    id={`scrollPage-${activeMenu}`}
                    ref={generalForm}
                    onSubmit={handleRefundFormSubmit}
                    className="w-full pb-32 overflow-y-scroll"
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
                            title={`Refunds - ${pageData.issuer.name}`}
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
                            </InputLine>
                            <FindGeneric
                              route="paymentmethods"
                              title="Payment Method"
                              scope="paymentMethod"
                              required
                              InputContext={InputContext}
                              defaultValue={{
                                id: pageData.paymentMethod?.id,
                                description:
                                  pageData.paymentMethod?.description,
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

                            {pageData.refunds &&
                              pageData.refunds.length > 0 &&
                              pageData.refunds.map((refund, index) => {
                                return (
                                  <Scope key={index} path={`refunds.${index}`}>
                                    <InputLine
                                      title={
                                        index === 0
                                          ? "Refunds (" +
                                            pageData.refunds.length +
                                            ")"
                                          : ""
                                      }
                                    >
                                      <div className="mt-2 text-xs text-gray-500">
                                        #{pageData.refunds.length - index}
                                      </div>

                                      <Input
                                        type="text"
                                        name="created_at"
                                        readOnly
                                        placeholder="0.00"
                                        title="Date"
                                        shrink
                                        defaultValue={format(
                                          parseISO(refund.created_at),
                                          "MM/dd/yyyy"
                                        )}
                                        InputContext={InputContext}
                                      />
                                      <Input
                                        type="text"
                                        name="amount"
                                        readOnly
                                        placeholder="0.00"
                                        title="Refund Amount"
                                        shrink
                                        defaultValue={refund.amount.toFixed(2)}
                                        InputContext={InputContext}
                                      />
                                      <Input
                                        type="text"
                                        name="refund_reason"
                                        readOnly
                                        placeholder=""
                                        title="Refund Reason"
                                        grow
                                        defaultValue={refund.refund_reason}
                                        InputContext={InputContext}
                                      />
                                    </InputLine>
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
                )}

                {activeMenu === "settlements" && (
                  <Form
                    id={`scrollPage-${activeMenu}`}
                    ref={generalForm}
                    onSubmit={handleRefundFormSubmit}
                    className="w-full pb-32 overflow-y-scroll"
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
                            title={`Settlements - ${pageData.issuer.name}`}
                            registry={registry}
                            InputContext={InputContext}
                          />

                          <InputLineGroup
                            title="settlements"
                            activeMenu={activeMenu === "settlements"}
                          >
                            {pageData.settlements &&
                              pageData.settlements.length > 0 &&
                              pageData.settlements.map((settlement, index) => {
                                return (
                                  <Scope
                                    key={index}
                                    path={`settlements.${index}`}
                                  >
                                    <InputLine
                                      title={
                                        index === 0
                                          ? "Settlements (" +
                                            pageData.settlements.length +
                                            ")"
                                          : ""
                                      }
                                    >
                                      <div className="mt-2 text-xs text-gray-500">
                                        #{pageData.settlements.length - index}
                                      </div>

                                      <Input
                                        type="text"
                                        name="settlement_date"
                                        readOnly
                                        title="Settlement Date"
                                        shrink
                                        defaultValue={
                                          settlement.settlement_date
                                            ? format(
                                                parseISO(
                                                  settlement.settlement_date
                                                ),
                                                "MM/dd/yyyy"
                                              )
                                            : format(
                                                parseISO(settlement.created_at),
                                                "MM/dd/yyyy"
                                              )
                                        }
                                        InputContext={InputContext}
                                      />
                                      <Input
                                        type="text"
                                        name="amount"
                                        readOnly
                                        placeholder="0.00"
                                        title="Amount"
                                        shrink
                                        defaultValue={settlement.amount.toFixed(
                                          2
                                        )}
                                        InputContext={InputContext}
                                      />
                                      <Textarea
                                        name="memo"
                                        InputContext={InputContext}
                                        grow
                                        rows={1}
                                        defaultValue={settlement.memo}
                                        readOnly
                                        title="Memo"
                                      />
                                    </InputLine>

                                    <FindGeneric
                                      route="paymentmethods"
                                      title="Payment Method"
                                      scope="paymentMethod"
                                      required
                                      readOnly
                                      InputContext={InputContext}
                                      defaultValue={{
                                        id: settlement.paymentmethod_id,
                                        description:
                                          settlement.paymentMethod.description,
                                        platform:
                                          settlement.paymentMethod.platform,
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
                )}

                {activeMenu === "Mail Logs" && (
                  <Form
                    id={`scrollPage-${activeMenu}`}
                    ref={generalForm}
                    onSubmit={handleRefundFormSubmit}
                    className="w-full pb-32 overflow-y-scroll"
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
                            title={`Email Logs - ${pageData.issuer.name}`}
                            registry={registry}
                            InputContext={InputContext}
                          />

                          <InputLineGroup
                            title="E-mail Logs"
                            activeMenu={activeMenu === "Mail Logs"}
                          >
                            {pageData.maillogs.length === 0 && (
                              <p className="text-sm p-4">No email sent yet.</p>
                            )}
                            {pageData.maillogs &&
                              pageData.maillogs.length > 0 &&
                              pageData.maillogs
                                .sort((a, b) => a.created_at < b.created_at)
                                .map((maillog, index) => {
                                  return (
                                    <Scope
                                      key={index}
                                      path={`maillogs.${index}`}
                                    >
                                      <InputLine
                                        title={
                                          index === 0
                                            ? "Mail Logs (" +
                                              pageData.maillogs.length +
                                              ")"
                                            : ""
                                        }
                                      >
                                        <div className="mt-2 text-xs text-gray-500">
                                          #{pageData.maillogs.length - index}
                                        </div>

                                        <Input
                                          type="text"
                                          name="log_date"
                                          readOnly
                                          title="Date"
                                          shrink
                                          defaultValue={format(
                                            parseISO(maillog.date),
                                            "MM/dd/yyyy"
                                          )}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="time"
                                          readOnly
                                          title="Time"
                                          shrink
                                          defaultValue={maillog.time}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="type"
                                          readOnly
                                          title="Type"
                                          grow
                                          defaultValue={maillog.type}
                                          InputContext={InputContext}
                                        />
                                      </InputLine>
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
                )}

                {activeMenu === "Reclassify" && (
                  <Form
                    id={`scrollPage-${activeMenu}`}
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
                      {id !== "new" && pageData.loaded ? (
                        <>
                          <FormHeader
                            access={access}
                            title={`Reclassify - ${pageData.issuer.name}`}
                            registry={registry}
                            InputContext={InputContext}
                          />

                          <InputLineGroup
                            title="Reclassify"
                            activeMenu={activeMenu === "Reclassify"}
                          >
                            <FindGeneric
                              route="chartofaccounts"
                              title="Chart of Accounts"
                              scope="chartOfAccount"
                              type="receipts"
                              InputContext={InputContext}
                              defaultValue={{
                                id: pageData.chartOfAccount?.id,
                                code: pageData.chartOfAccount?.code,
                                name: pageData.chartOfAccount?.name,
                                father: pageData.chartOfAccount?.Father?.name,
                                granFather:
                                  pageData.chartOfAccount?.Father?.Father?.name,
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
                            <FindGeneric
                              route="costcenters"
                              title="Cost Centers"
                              scope="costCenter"
                              InputContext={InputContext}
                              defaultValue={{
                                id: pageData.costcenter_id,
                                code: pageData.costcenter?.code,
                                name: pageData.costcenter?.name,
                                father: pageData.costcenter?.Father?.name,
                                granFather:
                                  pageData.costcenter?.Father?.Father?.name,
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
