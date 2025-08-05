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
import { AlertContext } from "~/App";

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
  const { alertBox } = useContext(AlertContext);
  const [pageData, setPageData] = useState({
    loaded: false,
    bank_name: "",
    bank_alias: "",
    loaded: true,
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
  async function handleSettlement(data, approvalData) {
    delete data.total_amount;
    await api
      .post(`/receivables/settlement`, {
        ...data,
        total_amount: parseFloat(data.settlement_amount),
        approvalData,
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

  async function fullSettlement(data) {
    try {
      const { receivables } = data;
      for (let receivable of receivables) {
        await api.post(`/receivables/full-settlement`, {
          ...data,
          receivable_id: receivable.id,
          settlement_date: format(data.settlement_date, "yyyy-MM-dd"),
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
  async function partialSettlement(data) {
    try {
      await api.post(`/receivables/partial-settlement`, {
        ...data,
        settlement_amount: data.settlement_amount,
        receivable_id: data.receivables[0].id,
        settlement_date: format(data.settlement_date, "yyyy-MM-dd"),
      });
    } catch (err) {
      console.log(err);
    }
  }
  async function applyDiscounts(data) {
    let hasDiscount = false;
    try {
      const { receivables, prices } = data;

      if (prices?.discounts?.length > 0) {
        for (let receivable of receivables) {
          for (let discount of prices.discounts) {
            hasDiscount = true;
            const { filial_discount_list_id, start_date, end_date } = discount;
            await api.post(`/receivables/apply-discounts`, {
              receivable_id: receivable.id,
              discount_id: filial_discount_list_id,
            });
          }
        }
      }

      return hasDiscount;
    } catch (err) {
      alertBox({
        title: "Attention!",
        descriptionHTML:
          "There was an error applying discounts, please try again.",
        buttons: [
          {
            title: "Ok",
            class: "cancel",
          },
        ],
      });
    }
  }
  async function handleGravityPayment(data) {
    if (data.paymentMethod.platform.includes("Gravity - Online")) {
      const receivable = {
        receivable_id: data.receivables[0].id,
        amount: parseFloat(data.settlement_amount),
        pageDescription:
          "Settlement for " + data.receivables.length + " receivables",
      };
      const { data: formData } = await api.post(
        `/emergepay/simple-form`,
        receivable
      );
      const { transactionToken } = formData;
      return new Promise((resolve, reject) => {
        emergepay.open({
          transactionToken: transactionToken,
          onTransactionSuccess: async function (approvalData) {
            // await api.post(`/emergepay/post-back-listener`, {
            //   ...approvalData,
            //   justTransaction: true,
            // });
            emergepay.close();
            resolve("paid");
            setLoading(false);
          },
          onTransactionFailure: function (failureData) {
            toast("Payment error!", {
              type: "error",
              autoClose: 3000,
            });
            reject("canceled");
            setLoading(false);
          },
          onTransactionCancel: function () {
            toast("Transaction cancelled!", {
              type: "error",
              autoClose: 3000,
            });
            setLoading(false);
            reject("canceled");
          },
        });
      });
    } else {
      return "continue";
    }
  }
  async function handleGeneralFormSubmit(data) {
    try {
      setLoading(true);
      const hasDiscount = await applyDiscounts(data);
      const isPartial =
        !hasDiscount &&
        parseFloat(data.settlement_amount) !== parseFloat(data.total_amount);

      if (isPartial) {
        alertBox({
          title: "Attention!",
          descriptionHTML:
            "Are you sure you want to settle this invoice by partial payment?",
          buttons: [
            {
              title: "Yes",
              onPress: async () => {
                const status = await handleGravityPayment(data);
                if (status === "continue") {
                  await partialSettlement(data);
                }
                if (status !== "canceled") {
                  handleOpened(null);
                }
                setLoading(false);
              },
            },
            {
              title: "No",
              class: "cancel",
            },
          ],
        });
      } else {
        const status = await handleGravityPayment(data);
        if (status === "continue") {
          await fullSettlement(data);
        }
        if (status !== "canceled") {
          handleOpened(null);
        }
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  }
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
      receivables: receivables,
      loaded: true,
      issuer: receivables[0].issuer,
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
  useEffect(() => {
    loadData();
  }, []);
  function handleValueChange(value) {
    const originalValue = pageData.receivables.reduce((acc, curr) => {
      return acc + curr.balance;
    }, 0);
    if (value > originalValue) {
      toast("Total amount cannot be greater than the sum of receivables.");
      setTotalAmount(originalValue);
      generalForm.current.setFieldValue("total_amount", originalValue);
      return;
    } else {
      setTotalAmount(parseFloat(value));
    }
  }
  useEffect(() => {
    if (hasDiscount) {
      const originalValue = pageData.receivables.reduce((acc, curr) => {
        return acc + curr.balance;
      }, 0);
      // console.log(hasDiscount, originalValue);
      generalForm.current.setFieldValue(
        "total_amount",
        originalValue.toFixed(2)
      );
      // setTotalAmount(originalValue);
      generalForm.current.setFieldValue(
        "total_discount",
        parseFloat(
          generalForm.current.getFieldValue("prices.total_discount")
        ).toFixed(2)
      );
      generalForm.current.setFieldValue(
        "settlement_amount",
        (
          parseFloat(generalForm.current.getFieldValue("total_amount")) -
          parseFloat(generalForm.current.getFieldValue("total_discount"))
        ).toFixed(2)
      );
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
                          title={"Settlement - " + pageData.issuer?.name}
                          registry={registry}
                          InputContext={InputContext}
                          loading={loading}
                        />

                        <InputLineGroup
                          title="GENERAL"
                          activeMenu={activeMenu === "general"}
                        >
                          {pageData.receivables && (
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
                                  readOnly={true}
                                  onlyFloat
                                  title="Total Amount"
                                  defaultValue={totalAmount.toFixed(2)}
                                  InputContext={InputContext}
                                  onChange={(value) => handleValueChange(value)}
                                />

                                <Input
                                  type="text"
                                  name="total_discount"
                                  shrink
                                  required
                                  readOnly={true}
                                  onlyFloat
                                  title="Discount"
                                  defaultValue={0}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="settlement_amount"
                                  shrink
                                  required
                                  readOnly={selected.length > 1 || hasDiscount}
                                  onlyFloat
                                  title="Settlement"
                                  defaultValue={totalAmount.toFixed(2)}
                                  InputContext={InputContext}
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
