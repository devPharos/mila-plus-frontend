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
import {
  getRegistries,
  handleUpdatedFields,
  countries_list,
} from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import DatePicker from "~/components/RegisterForm/DatePicker";
import { Scope } from "@unform/core";
import { format, parseISO } from "date-fns";
import { yesOrNoOptions } from "~/functions/selectPopoverOptions";

export const InputContext = createContext({});

export default function PagePreview({
  access,
  id,
  defaultFormType = "preview",
  Context = null,
}) {
  const {
    handleOpened,
    setOpened,
    successfullyUpdated,
    setSuccessfullyUpdated,
  } = useContext(Context);
  const [pageData, setPageData] = useState({
    loaded: false,
    filial_id: null,
    filial: {
      name: "",
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
  const [filialOptions, setFilialOptions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentCriterias, setPaymentCriterias] = useState([]);
  const [chartOfAccountOptions, setChartOfAccountOptions] = useState([]);

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
      const { entry_date, in_class_date } = data;
      await api.post(`/recurrence/`, {
        ...data,
        entry_date: entry_date ? format(entry_date, "yyyy-MM-dd") : null,
        in_class_date: entry_date ? format(entry_date, "yyyy-MM-dd") : null,
      });
      toast("Saved!", { autoClose: 1000 });
      handleOpened(null);
      setSuccessfullyUpdated(true);
      setPageData({ ...pageData, ...data });
    } catch (err) {
      console.log(err);
    }
  }

  async function getDefaultFilialOptions() {
    const { data } = await api.get("/filials");
    const retGroupOptions = data.map((filial) => {
      return { value: filial.id, label: filial.name };
    });
    setFilialOptions(retGroupOptions);
  }

  async function getPaymentMethodsOptions() {
    const { data } = await api.get("/paymentmethods");
    const retOptions = data.map((paymentMethod) => {
      return { value: paymentMethod.id, label: paymentMethod.description };
    });
    setPaymentMethods(retOptions);
  }

  async function getPaymentCriteriasOptions() {
    const { data } = await api.get("/paymentcriterias");
    const retOptions = data.map((paymentCriteria) => {
      return { value: paymentCriteria.id, label: paymentCriteria.description };
    });
    setPaymentCriterias(retOptions);
  }

  async function getAllChartOfAccountsByIssuer() {
    const { data } = await api.get("/chartofaccounts/list?type=01");
    const retOptions = data.map((chartOfAccount) => {
      return {
        value: chartOfAccount.id,
        label: chartOfAccount.name,
        code: chartOfAccount.code,
      };
    });
    setChartOfAccountOptions(retOptions);
  }

  useEffect(() => {
    async function getPageData() {
      await getDefaultFilialOptions();
      await getPaymentMethodsOptions();
      await getPaymentCriteriasOptions();
      await getAllChartOfAccountsByIssuer();
      try {
        const { data } = await api.get(`/recurrence/${id}`);
        setPageData({ ...pageData, ...data, loaded: true });

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

    getPageData();
  }, []);

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
                        {auth.filial.id === 1 && (
                          <InputLine title="Filial">
                            <SelectPopover
                              name="filial_id"
                              required
                              title="Filial"
                              isSearchable
                              defaultValue={filialOptions.filter(
                                (filial) => filial.value === pageData.filial_id
                              )}
                              onChange={(el) => {
                                setSearchFields({
                                  ...searchFields,
                                  filial_id: el.value,
                                });
                              }}
                              options={filialOptions}
                              InputContext={InputContext}
                            />
                          </InputLine>
                        )}
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
                        <InputLine title="Recurrence Information">
                          <DatePicker
                            name="entry_date"
                            grow
                            required
                            title="Entry Date "
                            defaultValue={
                              pageData?.issuer?.issuer_x_recurrence?.entry_date
                                ? parseISO(
                                    pageData.issuer.issuer_x_recurrence
                                      .entry_date
                                  )
                                : null
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
                          <Input
                            type="text"
                            name="amount"
                            grow
                            required
                            placeholder="0.00"
                            title="Amount"
                            defaultValue={
                              pageData?.issuer?.issuer_x_recurrence?.amount
                            }
                            InputContext={InputContext}
                          />
                        </InputLine>
                        <InputLine>
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
                                  .paymentmethod_id
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
                                  .paymentcriteria_id
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
                        </InputLine>

                        <InputLine title="Autopay">
                          <SelectPopover
                            name="is_autopay"
                            title="Is Autopay?"
                            grow
                            defaultValue={
                              pageData?.issuer?.issuer_x_recurrence?.is_autopay
                                ? {
                                    value: true,
                                    label: "Yes",
                                  }
                                : {
                                    value: false,
                                    label: "No",
                                  }
                            }
                            options={yesOrNoOptions}
                            InputContext={InputContext}
                          />
                        </InputLine>
                        {pageData?.issuer?.issuer_x_recurrence?.is_autopay && (
                          <>
                            <InputLine>
                              <Input
                                type="text"
                                name="card_number"
                                title="Card Number"
                                grow
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
                                defaultValue={
                                  pageData?.issuer?.issuer_x_recurrence
                                    ?.card_holder_name
                                }
                                InputContext={InputContext}
                              />
                            </InputLine>

                            <InputLine>
                              <Input
                                type="text"
                                name="card_address"
                                title="Card Address"
                                grow
                                defaultValue={
                                  pageData?.issuer?.issuer_x_recurrence
                                    ?.card_address
                                }
                                InputContext={InputContext}
                              />
                              <Input
                                type="text"
                                name="card_zip"
                                title="Card Zip"
                                grow
                                defaultValue={
                                  pageData?.issuer?.issuer_x_recurrence
                                    ?.card_zip
                                }
                                InputContext={InputContext}
                              />
                            </InputLine>
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
      ) : null}
    </Preview>
  );
}
