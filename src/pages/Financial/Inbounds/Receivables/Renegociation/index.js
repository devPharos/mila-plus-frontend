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
import { AlertContext } from "~/App";
import FindGeneric from "~/components/Finds/FindGeneric";

export const InputContext = createContext({});

export default function Renegociation({
  access,
  id,
  defaultFormType = "preview",
  selected,
  handleOpened,
}) {
  const { alertBox } = useContext(AlertContext);
  const { successfullyUpdated, setSuccessfullyUpdated } =
    useContext(FullGridContext);
  const [pageData, setPageData] = useState({
    loaded: false,
    bank_name: "",
    bank_alias: "",
    loaded: true,
    installment_amount: 0,
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

  const generalForm = useRef();

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  async function handleGeneralFormSubmit(data) {
    // return;
    async function handleRenegociation(data) {
      await api
        .post(`/receivables/renegociation`, {
          ...data,
          number_of_installments: parseInt(data.number_of_installments),
          first_due_date: format(data.first_due_date, "yyyy-MM-dd"),
          total_amount: parseFloat(data.installment_amount),
        })
        .then(({ data }) => {
          toast(data.message, { autoClose: 1000 });
          handleOpened(null);
        })
        .catch((err) => {
          toast(err.response.data.error, { type: "error", autoClose: 3000 });
        });
    }
    alertBox({
      title: "Attention!",
      descriptionHTML:
        "Would you like to send the first invoice to the student?",
      buttons: [
        {
          title: "No",
          class: "cancel",
          onPress: async () => {
            await handleRenegociation({ ...data, send_invoice: false });
            handleOpened(null);
          },
        },
        {
          title: "Yes",
          onPress: async () => {
            await handleRenegociation({ ...data, send_invoice: true });
            handleOpened(null);
          },
        },
      ],
    });
    return;
  }

  useEffect(() => {
    async function loadData() {
      const promises = [];

      selected.map((receivable) => {
        promises.push(
          api
            .get(`/receivables/${receivable.id}`)
            .then(({ data }) => {
              return data;
            })
            .catch((err) => {
              console.log(err);
            })
        );
      });
      Promise.all(promises).then((data) => {
        if (data.length === 0) {
          return;
        }
        const { student } = data[0].issuer;
        setPageData({
          ...pageData,
          receivables: data,
          loaded: true,
          student: {
            ...student,
            searchFields: {
              processtype_id: student.processtype_id,
              processsubstatus_id: student.processsubstatus_id,
              filial_id: student.filial_id,
            },
          },
        });
      });
    }
    loadData();
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
                            "Renegotiation - " +
                            pageData.student?.name +
                            " " +
                            pageData.student?.last_name
                          }
                          registry={registry}
                          InputContext={InputContext}
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
                                  readOnly
                                  title="Balance Amount"
                                  defaultValue={pageData.receivables.reduce(
                                    (acc, curr) => {
                                      return acc + curr.balance;
                                    },
                                    0
                                  )}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="installment_amount"
                                  readOnly
                                  defaultValue={pageData.installment_amount}
                                  title="Installment Amount Preview"
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="number"
                                  name="number_of_installments"
                                  required
                                  title="Qty. of new Installments"
                                  onChange={(value) => {
                                    setPageData({
                                      ...pageData,
                                      installment_amount: (
                                        pageData.receivables.reduce(
                                          (acc, curr) => {
                                            return acc + curr.balance;
                                          },
                                          0
                                        ) / (value || 1)
                                      ).toFixed(2),
                                    });
                                  }}
                                  InputContext={InputContext}
                                />
                                <DatePicker
                                  name="first_due_date"
                                  grow
                                  required
                                  title="First Due Date"
                                  placeholderText="MM/DD/YYYY"
                                  InputContext={InputContext}
                                />
                              </InputLine>
                              <FindGeneric
                                route="paymentmethods"
                                title="Payment Methods"
                                scope="paymentMethod"
                                required
                                type="Inbounds"
                                InputContext={InputContext}
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
                              <FindGeneric
                                route="paymentcriterias"
                                title="Payment Criterias"
                                scope="paymentCriteria"
                                required
                                InputContext={InputContext}
                                defaultValue={{
                                  id: pageData.receivables[0].paymentCriteria
                                    ?.id,
                                  description:
                                    pageData.receivables[0].paymentCriteria
                                      ?.description,
                                }}
                                fields={[
                                  {
                                    title: "Description",
                                    name: "description",
                                  },
                                ]}
                              />
                              <InputLine>
                                <Textarea
                                  name="observations"
                                  title="Reasons for Renegotiation"
                                  grow
                                  required
                                  rows={3}
                                  InputContext={InputContext}
                                />
                              </InputLine>

                              {pageData.receivables
                                .sort((a, b) => a.due_date > b.due_date)
                                .map((receivable, index) => {
                                  console.log(receivable);
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
