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
import { getRegistries } from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import Textarea from "~/components/RegisterForm/Textarea";
import { format, parseISO } from "date-fns";
import { receivableStatusesOptions } from "~/functions/selectPopoverOptions";
import { FullGridContext } from "../../..";
import { Scope } from "@unform/core";
import FindGeneric from "~/components/Finds/FindGeneric";

export const InputContext = createContext({});

export default function FeeAdjustment({
  access,
  id,
  defaultFormType = "preview",
  selected = [{ id: null }],
  handleOpened,
}) {
  const { successfullyUpdated, setSuccessfullyUpdated } =
    useContext(FullGridContext);
  if (!selected || selected.length === 0) {
    return;
  }
  id = selected[0].id;
  const [pageData, setPageData] = useState({
    loaded: false,
    filial_id: null,
    filial: {
      name: "",
    },
    filialOptions: [],
    issuerOptions: [],
    paymentMethodOptions: [],
    feeadjustments: [],
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

  const generalForm = useRef();

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  async function handleGeneralFormSubmit(data) {
    let { fee, reason } = data.adjustment;
    if (successfullyUpdated) {
      toast("No need to be saved!", {
        autoClose: 1000,
        type: "info",
        transition: Zoom,
      });
      return;
    }
    if (reason === "") {
      toast("Reason cannot be empty!", {
        autoClose: 1000,
        type: "error",
        transition: Zoom,
      });
      return;
    }
    if (fee === "") {
      fee = 0;
    } else {
      fee = parseFloat(fee);
    }
    const old_fee = parseFloat(pageData.fee);
    if (fee === old_fee) {
      toast("Fee has not changed!", {
        autoClose: 1000,
        type: "error",
        transition: Zoom,
      });
      return;
    }
    api
      .post(`/receivables/feeadjustment`, {
        receivable_id: id,
        fee,
        reason,
      })
      .then(({ data }) => {
        toast(data.message, { autoClose: 1000 });
        handleCloseForm();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
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
                    {pageData.loaded ? (
                      <>
                        <FormHeader
                          access={access}
                          title="Fee adjustments"
                          registry={registry}
                          InputContext={InputContext}
                        />

                        <InputLineGroup
                          title="GENERAL"
                          activeMenu={activeMenu === "general"}
                        >
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
                              onChange={(el) => {
                                setPageData({
                                  ...pageData,
                                  total: el.target.value,
                                  balance: el.target.value,
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
                              placeholder="0.00"
                              title="Fee"
                              readOnly
                              grow
                              defaultValue={pageData.fee.toFixed(2)}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="total"
                              readOnly
                              placeholder="0.00"
                              title="Total"
                              grow
                              value={pageData.total.toFixed(2)}
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
                          <InputLine title="Fee Adjustment">
                            <Scope path={`adjustment`}>
                              <Input
                                type="text"
                                name="fee"
                                required
                                placeholder={pageData.fee.toFixed(2)}
                                title="Fee"
                                shrink
                                InputContext={InputContext}
                              />
                              <Textarea
                                name="reason"
                                required
                                placeholder=""
                                title="Reason"
                                grow
                                InputContext={InputContext}
                              />
                            </Scope>
                          </InputLine>
                          {pageData.feeadjustments &&
                            pageData.feeadjustments.length > 0 &&
                            pageData.feeadjustments
                              .sort((a, b) => a.created_at < b.created_at)
                              .map((feeadjustment, index) => {
                                return (
                                  <InputLine
                                    title={
                                      index === 0
                                        ? "Previous Fee Adjustment"
                                        : ""
                                    }
                                  >
                                    <Scope path={`feeadjustments[${index}]`}>
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
                                        title="Fee"
                                        shrink
                                        defaultValue={feeadjustment.old_fee}
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
                                    </Scope>
                                  </InputLine>
                                );
                              })}

                          <InputLine title="Invoice">
                            <Input
                              type="text"
                              name="type"
                              defaultValue={pageData.type}
                              readOnly
                              grow
                              title="Type"
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="type_detail"
                              defaultValue={pageData.type_detail}
                              readOnly
                              grow
                              title="Type Detail"
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

                          <FindGeneric
                            route="issuers"
                            title="Issuer"
                            scope="issuer"
                            required
                            readOnly
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
      ) : null}
    </Preview>
  );
}
