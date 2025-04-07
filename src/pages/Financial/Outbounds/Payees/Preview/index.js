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
import { Zoom, toast } from "react-toastify";
import api from "~/services/api";
import { getRegistries, handleUpdatedFields } from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import Textarea from "~/components/RegisterForm/Textarea";
import { FullGridContext } from "../../..";
import { receivableStatusesOptions } from "~/functions/selectPopoverOptions";
import { format, parseISO } from "date-fns";
import FindGeneric from "~/components/Finds/FindGeneric";

export const InputContext = createContext({});

export default function PagePreview({
  access,
  id,
  defaultFormType = "preview",
}) {
  const auth = useSelector((state) => state.auth);
  const {
    handleOpened,
    setOpened,
    successfullyUpdated,
    setSuccessfullyUpdated,
  } = useContext(FullGridContext);
  const [pageData, setPageData] = useState({
    loaded: false,
    filial: {
      id: auth.filial.id !== 1 ? auth.filial.id : null,
      name: auth.filial.id !== 1 ? auth.filial.name : null,
    },
    issuer_id: null,
    issuer: {
      name: "",
    },
    entry_date: null,
    first_due_date: null,
    due_date: null,
    amount: 0,
    fee: 0,
    discount: 0,
    total: 0,
    balance: 0,
    memo: "",
    is_recurrence: false,
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
    searchfields: {
      type: "Credit Note",
      type_detail: "Other",
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

  const generalForm = useRef();

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
        const response = await api.post(`/payee`, data);
        setPageData({
          ...pageData,
          ...response.data,
          searchfields: {
            type: response.data.type,
            type_detail: response.data.type_detail,
          },
        });
        setOpened(response.data.id);

        console.log(response.data);

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
          const response = await api.put(`/payee/${id}`, objUpdated);
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

  useEffect(() => {
    async function getPageData() {
      try {
        let data = pageData;

        if (id !== "new") {
          const { data: receivableData } = await api.get(`/payee/${id}`);
          data = receivableData;
        }

        const filialData = await api.get(`/filials`);
        const issuerData = await api.get(`/issuers`);
        const paymentMethodData = await api.get(`/paymentmethods`);
        // const chartOfAccountData = await api.get(
        //   `/chartofaccounts?issuer=${data.issuer_id}`
        // );

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

        const paymentMethodOptions = paymentMethodData.data.rows
          .filter((f) => f.type_of_payment !== "Inbounds")
          .map((f) => {
            return { value: f.id, label: f.description.slice(0, 20) };
          });

        // const chartOfAccountOptions = chartOfAccountData.data.rows
        //   .filter((f) => f.id !== id)
        //   .map((f) => {
        //     return {
        //       value: f.id,
        //       label: `${
        //         f.Father?.Father?.Father?.name
        //           ? `${f.Father?.Father?.Father?.name} > `
        //           : ""
        //       }${f.Father?.Father?.name ? `${f.Father?.Father?.name} > ` : ""}${
        //         f.Father?.name ? `${f.Father?.name} > ` : ""
        //       }${f.name}`,
        //     };
        //   });

        setPageData({
          ...data,
          filialOptions,
          issuerOptions,
          paymentMethodOptions,
          // chartOfAccountOptions,
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
        toast(err || err.response.data.error, {
          type: "error",
          autoClose: 3000,
        });
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
                            title={`Payee - ${pageData?.issuer?.name}`}
                            registry={registry}
                            InputContext={InputContext}
                            saveText={"Save changes"}
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

                            <InputLine title="Status">
                              <SelectPopover
                                name="status"
                                required
                                grow
                                disabled
                                title="Status"
                                options={receivableStatusesOptions}
                                defaultValue={
                                  receivableStatusesOptions.find(
                                    (status) => status.value === pageData.status
                                  ) || receivableStatusesOptions[0]
                                }
                                InputContext={InputContext}
                                isSearchable
                              />
                            </InputLine>

                            <InputLine title="Amount">
                              <Input
                                type="text"
                                name="amount"
                                required
                                placeholder="0.00"
                                onlyFloat
                                title="Amount"
                                grow
                                defaultValue={
                                  pageData.amount > 0
                                    ? pageData.amount.toFixed(2)
                                    : null
                                }
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="discount"
                                placeholder="0.00"
                                onlyFloat
                                title="Discount"
                                grow
                                defaultValue={
                                  pageData.discount
                                    ? pageData.discount.toFixed(2)
                                    : null
                                }
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="fee"
                                placeholder="0.00"
                                onlyFloat
                                title="Fee"
                                grow
                                defaultValue={
                                  pageData.fee ? pageData.fee.toFixed(2) : null
                                }
                                InputContext={InputContext}
                              />
                            </InputLine>
                            <FindGeneric
                              route="merchants"
                              title="Merchants"
                              scope="merchant"
                              required
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

                            <InputLine title="Invoice">
                              <Input
                                type="text"
                                name="type"
                                required
                                grow
                                title="Type"
                                defaultValue={pageData.type}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="type_detail"
                                required
                                grow
                                title="Type Detail"
                                defaultValue={pageData.type_detail}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="invoice_number"
                                required
                                title="Invoice Number"
                                grow
                                defaultValue={
                                  pageData.invoice_number
                                    ? pageData.invoice_number
                                    : ""
                                }
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

                            <FindGeneric
                              route="paymentmethods"
                              title="Payment Methods"
                              scope="paymentMethod"
                              required
                              InputContext={InputContext}
                              defaultValue={{
                                id: pageData.paymentMethod.id,
                                description: pageData.paymentMethod.description,
                                platform: pageData.paymentMethod.platform,
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

                            <FindGeneric
                              route="chartofaccounts"
                              title="Chart of Accounts"
                              scope="chartOfAccount"
                              required
                              InputContext={InputContext}
                              type="expenses"
                              defaultValue={{
                                id: pageData.chartOfAccount.id,
                                code: pageData.chartOfAccount.code,
                                name: pageData.chartOfAccount.name,
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
