import { Form } from "@unform/web";
import { Building, Pencil, X } from "lucide-react";
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
import { toast } from "react-toastify";
import api from "~/services/api";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { FullGridContext } from "../../..";
import { format, parseISO } from "date-fns";
import DatePicker from "~/components/RegisterForm/DatePicker";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import PricesSimulation from "~/components/PricesSimulation";
import { Scope } from "@unform/core";
import Textarea from "~/components/RegisterForm/Textarea";
import FindGeneric from "~/components/Finds/FindGeneric";

export const InputContext = createContext({});

export default function Settlement({
  access,
  id,
  defaultFormType = "preview",
  selected,
  handleOpened,
}) {
  const { successfullyUpdated, setSuccessfullyUpdated } =
    useContext(FullGridContext);
  const [pageData, setPageData] = useState({
    loaded: false,
    bank_name: "",
    bank_alias: "",
    loaded: true,
    receivables: [],
    student: {},
  });
  const [loading, setLoading] = useState(false);

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
  const [totalAmount, setTotalAmount] = useState(0);
  const [hasDiscount, setHasDiscount] = useState(false);

  const generalForm = useRef();

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  async function handleGeneralFormSubmit(data) {
    setLoading(true);
    async function handleSettlement(data, approvalData) {
      await api
        .post(`/receivables/settlement`, {
          ...data,
          approvalData,
          total_amount: totalAmount,
          settlement_date: format(data.settlement_date, "yyyyMMdd"),
        })
        .then(({ data }) => {
          toast(data.message, { autoClose: 1000 });
          handleOpened(null);
        })
        .catch((err) => {
          console.log(err);
          // toast(err.response.data.error, { type: "error", autoClose: 3000 });
        });
    }
    if (data.paymentMethod.platform.includes("Gravity - Online")) {
      const receivable = {
        id: data.receivables[0].id,
        total: parseFloat(data.prices.total_tuition),
        memo: "Settlement for " + data.receivables.length + " receivables",
      };
      await api
        .post(`/emergepay/simple-form`, {
          receivable_id: receivable.id,
          amount: receivable.total,
          pageDescription: receivable.memo,
        })
        .then(({ data: formData }) => {
          const { transactionToken } = formData;
          emergepay.open({
            // (required) Used to set up the modal
            transactionToken: transactionToken,
            // (optional) Callback function that gets called after a successful transaction
            onTransactionSuccess: async function (approvalData) {
              setLoading(false);
              await handleSettlement(data, approvalData);
              await api
                .post(`/emergepay/post-back-listener`, {
                  ...approvalData,
                  justTransaction: true,
                })
                .then(async () => {
                  emergepay.close();
                  return approvalData;
                })
                .catch((err) => {
                  console.log(err);
                });
            },
            // (optional) Callback function that gets called after a failure occurs during the transaction (such as a declined card)
            onTransactionFailure: function (failureData) {
              toast("Payment error!", {
                type: "error",
                autoClose: 3000,
              });
              setLoading(false);
            },
            // (optional) Callback function that gets called after a user clicks the close button on the modal
            onTransactionCancel: function () {
              toast("Transaction cancelled!", {
                type: "error",
                autoClose: 3000,
              });
              setLoading(false);
            },
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      await handleSettlement(data);
      setLoading(false);
    }
    handleOpened(null);
    return;
  }

  useEffect(() => {
    async function loadData() {
      const receivables = [];
      for (let receivable of selected) {
        const { data } = await api.get(`/receivables/${receivable.id}`);
        receivables.push(data);
      }
      if (receivables.length === 0) return;
      const { student } = receivables[0].issuer;
      setPageData({
        ...pageData,
        loaded: true,
        receivables,
        student: {
          ...student,
          searchFields: {
            processtype_id: student?.processtype_id,
            processsubstatus_id: student?.processsubstatus_id,
            filial_id: student?.filial_id,
          },
        },
      });
      setTotalAmount(
        receivables.reduce((acc, curr) => {
          return acc + curr.balance;
        }, 0)
      );
    }
    loadData();
  }, []);

  function handleValueChange(value) {
    // const originalValue = pageData.receivables.reduce((acc, curr) => {
    //   return acc + curr.balance;
    // }, 0);
    // if (value > originalValue) {
    //   toast("Total amount cannot be greater than the sum of receivables.");
    //   setTotalAmount(originalValue);
    //   generalForm.current.setFieldValue("total_amount", originalValue);
    //   return;
    // } else {
    //   setTotalAmount(parseFloat(value));
    // }
  }

  useEffect(() => {
    if (hasDiscount) {
      const originalValue = pageData.receivables.reduce((acc, curr) => {
        return acc + curr.balance;
      }, 0);
      generalForm.current.setFieldValue("total_amount", originalValue);
      setTotalAmount(originalValue);
    }
  }, [hasDiscount]);

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
                          access={access}
                          title={
                            pageData.receivables.length > 0
                              ? "Settlement - " +
                                pageData.receivables[0].issuer.name
                              : "Settlement"
                          }
                          registry={registry}
                          InputContext={InputContext}
                          loading={loading}
                        />

                        <InputLineGroup
                          title="GENERAL"
                          activeMenu={activeMenu === "general"}
                        >
                          {pageData.receivables.length > 0 && (
                            <>
                              <InputLine title="Settlement Data">
                                <Input
                                  type="text"
                                  name="qty_of_receivables"
                                  shrink
                                  readOnly
                                  title="Qty. of Receivables"
                                  defaultValue={pageData.receivables.length}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="total_amount"
                                  shrink
                                  required
                                  readOnly={selected.length > 1 || hasDiscount}
                                  onlyFloat
                                  title="Total Amount"
                                  defaultValue={totalAmount}
                                  InputContext={InputContext}
                                  onChange={(value) => handleValueChange(value)}
                                />

                                <DatePicker
                                  name="settlement_date"
                                  grow
                                  required
                                  title="Settlement Date"
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
                                type="Inbounds"
                                defaultValue={{
                                  id: pageData.receivables[0].paymentMethod?.id,
                                  description:
                                    pageData.receivables[0].paymentMethod
                                      ?.description,
                                  platform:
                                    pageData.receivables[0].paymentMethod
                                      ?.platform,
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
                                <Textarea
                                  name="settlement_memo"
                                  InputContext={InputContext}
                                  grow
                                  rows={3}
                                  required
                                  title="Memo"
                                />
                              </InputLine>

                              <PricesSimulation
                                student={pageData.student}
                                InputContext={InputContext}
                                FullGridContext={FullGridContext}
                                generalForm={generalForm}
                                showAdmissionDiscounts={false}
                                isAdmissionDiscountChangable={false}
                                showFinancialDiscounts={true}
                                isFinancialDiscountChangable={true}
                                settlement
                                totalAmount={totalAmount}
                                setHasDiscount={setHasDiscount}
                              />

                              {pageData.receivables
                                .sort((a, b) => a.due_date > b.due_date)
                                .map((receivable, index) => {
                                  return (
                                    <InputLine
                                      key={index}
                                      title={index === 0 ? "Receivables" : ""}
                                    >
                                      <p className="pt-3">#{index + 1}</p>
                                      <Scope path={`receivables[${index}]`}>
                                        <Input
                                          type="hidden"
                                          name="id"
                                          defaultValue={receivable.id}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="memo"
                                          grow
                                          readOnly
                                          title="Memo"
                                          defaultValue={receivable.memo}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="total"
                                          grow
                                          readOnly
                                          title="Total Amount"
                                          defaultValue={receivable.total}
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="balance"
                                          grow
                                          readOnly
                                          title="Balance Amount"
                                          defaultValue={receivable.balance.toFixed(
                                            2
                                          )}
                                          InputContext={InputContext}
                                        />
                                        <DatePicker
                                          name="due_date"
                                          grow
                                          disabled
                                          title="Due Date"
                                          defaultValue={format(
                                            parseISO(receivable.due_date),
                                            "yyyy-MM-dd"
                                          )}
                                          placeholderText="MM/DD/YYYY"
                                          InputContext={InputContext}
                                        />
                                        <Input
                                          type="text"
                                          name="status"
                                          grow
                                          readOnly
                                          title="Status"
                                          defaultValue={receivable.status}
                                          InputContext={InputContext}
                                        />
                                      </Scope>
                                    </InputLine>
                                  );
                                })}
                            </>
                          )}
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
