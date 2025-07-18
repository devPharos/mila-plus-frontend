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
  const [pageData, setPageData] = useState({
    loaded: false,
    filial_id: null,
    filial: {
      name: "",
    },
    searchFields: {
      filial_id: null,
      processtype_id: null,
      processsubstatus_id: null,
    },
    receivables: [],
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
  const [isAutoPay, setIsAutoPay] = useState(false);
  const [paid, setPaid] = useState(false);

  const auth = useSelector((state) => state.auth);

  const generalForm = useRef();

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
    try {
      const { entry_date, in_class_date, first_due_date } = data;
      const { data: postedData } = await api.post(`/recurrence/`, {
        ...data,
        entry_date: entry_date ? format(entry_date, "yyyyMMdd") : null,
        in_class_date: in_class_date ? format(in_class_date, "yyyyMMdd") : null,
        first_due_date: first_due_date
          ? format(first_due_date, "yyyyMMdd")
          : null,
      });
      setPageData({
        ...pageData,
        ...data,
        loaded: false,
      });
      toast("Saved!", { autoClose: 1000 });
      setSuccessfullyUpdated(true);

      setTimeout(async () => {
        const { data: recurrenceData } = await api.get(`/recurrence/${id}`);
        api
          .get(
            `/recurrence/receivables/${recurrenceData.issuer.issuer_x_recurrence.id}`
          )
          .then(async ({ data }) => {
            const receivables = data.rows;
            setPageData({
              ...pageData,
              ...recurrenceData,
              receivables,
              loaded: true,
            });
            setActiveMenu("receivables");
            if (data.is_autopay) {
              alertBox({
                title: "Attention!",
                descriptionHTML: `<p>Do you want to configure the payment method for this recurrence?</p>`,
                buttons: [
                  {
                    title: "No",
                    class: "cancel",
                  },
                  {
                    title: "Yes",
                    onPress: async () => {
                      const receivable = receivables
                        .filter((receivable) => receivable.status === "Pending")
                        .sort((a, b) => a.due_date - b.due_date)[0];
                      await openPaymentModal({
                        receivable,
                        recurrence_id: postedData.id,
                      });
                    },
                  },
                ],
              });
            }
          });
      }, 2000);
    } catch (err) {
      console.log(err);
    }
  }
  async function getPageData() {
    try {
      const { data } = await api.get(`/recurrence/${id}`);

      if (data.issuer) {
        api
          .get(`/recurrence/receivables/${data.issuer.issuer_x_recurrence.id}`)
          .then(({ data: dataRec }) => {
            const receivables = dataRec.rows;
            setPageData({
              ...pageData,
              ...data,
              searchFields: {
                processtype_id: data.processtype_id,
                processsubstatus_id: data.processsubstatus_id,
                filial_id: data.filial_id,
              },
              receivables,
              loaded: true,
            });
            setIsAutoPay(data.issuer?.issuer_x_recurrence?.is_autopay);
          });
      } else {
        setPageData({
          ...pageData,
          ...data,
          searchFields: {
            processtype_id: data.processtype_id,
            processsubstatus_id: data.processsubstatus_id,
            filial_id: data.filial_id,
          },
          receivables: [],
          loaded: true,
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
      toast(err.response.data.error, { type: "error", autoClose: 3000 });
    }
  }

  useEffect(() => {
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
        getPageData();
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

            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="receivables"
            >
              <HandCoins size={16} /> Receivables
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
                        <InputLine title="Student">
                          <Input
                            type="hidden"
                            name="student_id"
                            readOnly={true}
                            grow
                            defaultValue={pageData?.id}
                            InputContext={InputContext}
                          />
                          <Input
                            type="text"
                            name="student_name"
                            readOnly={true}
                            grow
                            title="Student Name"
                            defaultValue={
                              pageData?.name + " " + pageData?.last_name
                            }
                            InputContext={InputContext}
                          />
                        </InputLine>

                        <Input
                          type="hidden"
                          name="issuer_id"
                          readOnly={true}
                          grow
                          defaultValue={pageData?.issuer?.id}
                          InputContext={InputContext}
                        />

                        <PricesSimulation
                          student={pageData}
                          InputContext={InputContext}
                          FullGridContext={FullGridContext}
                          generalForm={generalForm}
                          showAdmissionDiscounts={false}
                          isAdmissionDiscountChangable={false}
                          showFinancialDiscounts={true}
                          isFinancialDiscountChangable={true}
                          recurrence={true}
                        />

                        <InputLine title="Recurrence Information">
                          <DatePicker
                            name="entry_date"
                            grow
                            required
                            disabled
                            title="Entry Date "
                            defaultValue={
                              pageData?.issuer?.issuer_x_recurrence?.entry_date
                                ? parseISO(
                                    pageData.issuer.issuer_x_recurrence
                                      .entry_date
                                  )
                                : today()
                            }
                            placeholderText="MM/DD/YYYY"
                            InputContext={InputContext}
                          />

                          <DatePicker
                            name="in_class_date"
                            grow
                            required
                            title="In Class Date "
                            defaultValue={
                              pageData?.issuer?.issuer_x_recurrence
                                ?.in_class_date
                                ? parseISO(
                                    pageData.issuer.issuer_x_recurrence
                                      .in_class_date
                                  )
                                : null
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
                              pageData?.issuer?.issuer_x_recurrence
                                ?.first_due_date
                                ? parseISO(
                                    pageData.issuer.issuer_x_recurrence
                                      .first_due_date
                                  )
                                : null
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
                            id: pageData.issuer?.issuer_x_recurrence
                              ?.paymentMethod?.id,
                            description:
                              pageData.issuer?.issuer_x_recurrence
                                ?.paymentMethod?.description,
                            platform:
                              pageData.issuer?.issuer_x_recurrence
                                ?.paymentMethod?.platform,
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
                            id: pageData.issuer?.issuer_x_recurrence
                              ?.paymentCriteria?.id,
                            description:
                              pageData.issuer?.issuer_x_recurrence
                                ?.paymentCriteria?.description,
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
                          title="Chart of Account"
                          scope="chartOfAccount"
                          required
                          type="receipts"
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
                        {/* <InputLine>
                          <SelectPopover
                            name="paymentmethod_id"
                            required
                            title="Payment Method"
                            isSearchable
                            grow
                            defaultValue={paymentMethods.filter(
                              (paymentMethod) =>
                                paymentMethod.value ===
                                pageData?.issuer?.issuer_x_recurrence
                                  ?.paymentmethod_id
                            )}
                            options={paymentMethods}
                            InputContext={InputContext}
                          />
                          <SelectPopover
                            name="paymentcriteria_id"
                            required
                            title="Payment Criteria"
                            isSearchable
                            grow
                            defaultValue={paymentCriterias.filter(
                              (paymentMethod) =>
                                paymentMethod.value ===
                                pageData?.issuer?.issuer_x_recurrence
                                  ?.paymentcriteria_id
                            )}
                            options={paymentCriterias}
                            InputContext={InputContext}
                          />
                        </InputLine>
                        <InputLine>
                          <SelectPopover
                            name="chartofaccount_id"
                            required
                            title="Chart of Account"
                            isSearchable
                            grow
                            defaultValue={chartOfAccountOptions.find(
                              (chartOfAccount) =>
                                chartOfAccount.code === "01.007"
                            )}
                            options={chartOfAccountOptions}
                            InputContext={InputContext}
                          />
                        </InputLine> */}
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
                        <InputLine title="Autopay">
                          <SelectPopover
                            name="is_autopay"
                            title="Is Autopay?"
                            required
                            grow
                            onChange={(el) => {
                              setIsAutoPay(el.value);
                              setSuccessfullyUpdated(false);
                            }}
                            defaultValue={yesOrNoOptions.find(
                              (option) =>
                                option.value ===
                                pageData?.issuer?.issuer_x_recurrence
                                  ?.is_autopay
                            )}
                            options={yesOrNoOptions}
                            InputContext={InputContext}
                          />
                          {pageData?.receivables.length > 0 &&
                            pageData?.issuer?.issuer_x_recurrence?.is_autopay &&
                            isAutoPay && (
                              <button
                                type="button"
                                onClick={() => {
                                  openPaymentModal({
                                    receivable: pageData?.receivables
                                      .filter(
                                        (receivable) =>
                                          receivable.status === "Pending"
                                      )
                                      .sort(
                                        (a, b) => a.due_date - b.due_date
                                      )[0],
                                    recurrence_id:
                                      pageData?.issuer?.issuer_x_recurrence?.id,
                                  });
                                }}
                                className="text-xs bg-gray-100 px-6 py-3 mt-3 rounded-md border cursor-pointer flex flex-row items-center justify-center gap-2 hover:bg-gray-200"
                              >
                                <Settings size={16} /> Payment Config.
                              </button>
                            )}
                        </InputLine>

                        <>
                          <InputLine>
                            <Input
                              type="text"
                              name="card_type"
                              title="Card Type"
                              grow
                              readOnly
                              defaultValue={
                                pageData?.issuer?.issuer_x_recurrence?.card_type
                              }
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="card_number"
                              title="Card Number"
                              grow
                              readOnly
                              defaultValue={
                                pageData?.issuer?.issuer_x_recurrence
                                  ?.card_number
                              }
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="card_expiration_date"
                              title="Card Expiration Date"
                              grow
                              readOnly
                              defaultValue={
                                pageData?.issuer?.issuer_x_recurrence
                                  ?.card_expiration_date
                              }
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="card_holder_name"
                              title="Card Holder Name"
                              grow
                              readOnly
                              defaultValue={
                                pageData?.issuer?.issuer_x_recurrence
                                  ?.card_holder_name
                              }
                              InputContext={InputContext}
                            />
                          </InputLine>
                        </>
                      </InputLineGroup>

                      <InputLineGroup
                        title="RECEIVABLES"
                        activeMenu={activeMenu === "receivables"}
                      >
                        {pageData.receivables
                          .sort((a, b) => a.invoice_number - b.invoice_number)
                          .map((receivable, index) => {
                            return (
                              <InputLine
                                key={index}
                                title={index === 0 ? "Receivables" : ""}
                              >
                                <Input
                                  type="hidden"
                                  name="grid_receivable_id"
                                  readOnly={true}
                                  grow
                                  defaultValue={receivable.id}
                                  InputContext={InputContext}
                                />
                                <DatePicker
                                  name="grid_entry_date"
                                  disabled
                                  title="Entry Date "
                                  defaultValue={format(
                                    addDays(parseISO(receivable.entry_date), 1),
                                    "yyyy-MM-dd"
                                  )}
                                  placeholderText="MM/DD/YYYY"
                                  InputContext={InputContext}
                                />
                                <DatePicker
                                  name="grid_due_date"
                                  disabled
                                  title="Due Date "
                                  defaultValue={format(
                                    addDays(parseISO(receivable.due_date), 1),
                                    "yyyy-MM-dd"
                                  )}
                                  placeholderText="MM/DD/YYYY"
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="grid_receivable_amount"
                                  readOnly={true}
                                  grow
                                  title="Amount"
                                  defaultValue={formatter.format(
                                    receivable.amount
                                  )}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="grid_discount"
                                  readOnly={true}
                                  grow
                                  title="Discount"
                                  defaultValue={formatter.format(
                                    receivable.discount
                                  )}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="grid_fee"
                                  readOnly={true}
                                  grow
                                  title="Fee"
                                  defaultValue={formatter.format(
                                    receivable.fee
                                  )}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="grid_receivable_total"
                                  readOnly={true}
                                  grow
                                  title="Total"
                                  defaultValue={formatter.format(
                                    receivable.total
                                  )}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="grid_invoice"
                                  readOnly={true}
                                  grow
                                  title="Invoice"
                                  defaultValue={`${receivable.invoice_number
                                    .toString()
                                    .padStart(6, "0")}`}
                                  InputContext={InputContext}
                                />
                                {receivable.status === "Pending" ? (
                                  receivable.paymentMethod.platform ===
                                  "Gravity - Online" ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openPaymentModal({
                                          receivable,
                                          recurrence_id:
                                            pageData?.issuer
                                              ?.issuer_x_recurrence?.id,
                                          setPaid,
                                        })
                                      }
                                      className="text-xs bg-gray-800 font-bold text-white px-3 py-2 mt-3 rounded-md border cursor-pointer flex flex-row items-center justify-center gap-2 hover:bg-gray-900"
                                    >
                                      <DollarSign size={14} /> Pay
                                    </button>
                                  ) : (
                                    <div className="text-xs bg-gray-500 font-bold text-white px-3 py-2 mt-3 rounded-md border cursor-pointer flex flex-row items-center justify-center gap-2">
                                      <BadgeDollarSign size={14} /> Pending
                                    </div>
                                  )
                                ) : (
                                  <div className="text-xs bg-green-800 font-bold text-white px-3 py-2 mt-3 rounded-md border cursor-pointer flex flex-row items-center justify-center gap-2">
                                    <BadgeDollarSign size={14} /> Paid
                                  </div>
                                )}
                              </InputLine>
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
      ) : null}
    </Preview>
  );
}
