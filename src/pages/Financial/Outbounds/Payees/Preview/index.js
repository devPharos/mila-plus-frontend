import { Form } from "@unform/web";
import { Building, List, Pencil, X } from "lucide-react";
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
} from "~/functions";
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

  const tabsPermissions = getTabsPermissions(
    "financial-payees",
    FullGridContext
  );

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
  const [merchantId, setMerchantId] = useState(null);

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

    if (activeMenu === "Reclassify") {
      try {
        const response = await api.put(`/payee/classify/${id}`, data);
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

        setMerchantId(data.issuer?.merchant?.id);

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
              {tabAllowed(tabsPermissions, "payee-reclassify-tab") && (
                <RegisterFormMenu
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  name="Reclassify"
                >
                  <List size={16} /> Reclassify
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
                              readOnly={
                                id !== "new" &&
                                (pageData.is_recurrence ||
                                  pageData.balance !== pageData.total ||
                                  pageData.status !== "Pending")
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
                                readOnly={
                                  id !== "new" &&
                                  (pageData.is_recurrence ||
                                    pageData.balance !== pageData.total ||
                                    pageData.status !== "Pending")
                                }
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
                                readOnly={
                                  id !== "new" &&
                                  (pageData.is_recurrence ||
                                    pageData.balance !== pageData.total ||
                                    pageData.status !== "Pending")
                                }
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
                                readOnly={
                                  id !== "new" &&
                                  (pageData.is_recurrence ||
                                    pageData.balance !== pageData.total ||
                                    pageData.status !== "Pending")
                                }
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
                              readOnly={
                                id !== "new" &&
                                (pageData.is_recurrence ||
                                  pageData.balance !== pageData.total ||
                                  pageData.status !== "Pending")
                              }
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
                              setReturnFindGeneric={(merchant) => {
                                setMerchantId(merchant.id);
                              }}
                            />

                            <InputLine title="Invoice">
                              <Input
                                type="date"
                                name="entry_date"
                                required
                                title="Entry Date"
                                readOnly={
                                  id !== "new" &&
                                  (pageData.is_recurrence ||
                                    pageData.balance !== pageData.total ||
                                    pageData.status !== "Pending")
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
                                  id !== "new" &&
                                  (pageData.is_recurrence ||
                                    pageData.balance !== pageData.total ||
                                    pageData.status !== "Pending")
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
                              <Input
                                type="text"
                                name="invoice_number"
                                readOnly={
                                  id !== "new" && pageData.status !== "Pending"
                                }
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

                            <FindGeneric
                              route="paymentmethods"
                              title="Payment Methods"
                              scope="paymentMethod"
                              required
                              InputContext={InputContext}
                              readOnly={
                                id !== "new" && pageData.status !== "Pending"
                              }
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
                                  id !== "new" &&
                                  (pageData.is_recurrence ||
                                    pageData.balance !== pageData.total ||
                                    pageData.status !== "Pending")
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
                                readOnly={
                                  id !== "new" && pageData.status !== "Pending"
                                }
                                grow
                                defaultValue={pageData.contract_number}
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="authorization_code"
                                title="Authorization Code"
                                readOnly={
                                  id !== "new" && pageData.status !== "Pending"
                                }
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
                              type="expenses"
                              searchDefault={merchantId}
                              readOnly={
                                id !== "new" && pageData.status !== "Pending"
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
                              type="expenses"
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
