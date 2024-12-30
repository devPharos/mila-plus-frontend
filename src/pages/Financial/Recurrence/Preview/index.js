import { Form } from "@unform/web";
import { Building, HandCoins, Pencil, X } from "lucide-react";
import React, {
  createContext,
  useCallback,
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
import { formatter, getRegistries } from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import DatePicker from "~/components/RegisterForm/DatePicker";
import { format, parseISO } from "date-fns";
import { yesOrNoOptions } from "~/functions/selectPopoverOptions";
import { openPaymentModal } from "~/functions/emergepayfn";

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
    receivables: [],
  });
  const buttonRef = useRef(null);

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
  const [isAutoPay, setIsAutoPay] = useState(false);
  const [priceLists, setPriceLists] = useState(null);
  const [discountLists, setDiscountLists] = useState(null);
  const [totalDiscount, setTotalDiscount] = useState(0);

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
      const { data: postedData } = await api.post(`/recurrence/`, {
        ...data,
        entry_date: entry_date ? format(entry_date, "yyyy-MM-dd") : null,
        in_class_date: entry_date ? format(entry_date, "yyyy-MM-dd") : null,
      });
      setPageData({ ...pageData, ...data, loaded: false });
      toast("Saved!", { autoClose: 1000 });
      setSuccessfullyUpdated(true);

      setTimeout(async () => {
        const { data: recurrenceData } = await api.get(`/recurrence/${id}`);
        api
          .get(`/receivables?search=${recurrenceData.name}`)
          .then(async ({ data: receivables }) => {
            setPageData({
              ...pageData,
              ...recurrenceData,
              receivables,
              loaded: true,
            });
            setActiveMenu("receivables");
            if (data.is_autopay) {
              await openPaymentModal(
                receivables
                  .filter((receivable) => receivable.status === "Open")
                  .sort((a, b) => a.due_date - b.due_date)[0],
                postedData.id
              );
            }
          });
      }, 2000);
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

        api
          .get(`/receivables?search=${data.name}`)
          .then(({ data: receivables }) => {
            setPageData({ ...pageData, ...data, receivables, loaded: true });
          });

        api.get(`filials/${data.filial_id}`).then(({ data: filialData }) => {
          setPriceLists(
            filialData.pricelists.find(
              (price) => price.processsubstatus_id === data.processsubstatus_id
            )
          );
          setDiscountLists(
            filialData.discountlists.filter((discount) => discount.active)
          );
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

                        {priceLists && (
                          <InputLine title="Prices Simulation">
                            <table className="table-auto w-full text-center">
                              <thead className="bg-slate-100 rounded-lg overflow-hidden">
                                <tr>
                                  <th className="w-1/6">Registration Fee</th>
                                  <th className="w-1/6">Books</th>
                                  <th className="w-1/6">Tuition</th>
                                  <th className="w-1/6">Tuition in Advanced</th>
                                  <th className="w-1/6">Discount</th>
                                  <th className="w-1/6">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>
                                    {formatter.format(
                                      priceLists.registration_fee
                                    )}
                                  </td>
                                  <td>{formatter.format(priceLists.book)}</td>
                                  <td>
                                    {formatter.format(priceLists.tuition)}
                                  </td>
                                  <td>
                                    {priceLists.tuition_in_advance
                                      ? "Yes"
                                      : "No"}
                                  </td>
                                  <td>{formatter.format(totalDiscount)}</td>
                                  <td>
                                    {formatter.format(
                                      priceLists.registration_fee +
                                        priceLists.book +
                                        priceLists.tuition -
                                        totalDiscount
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </InputLine>
                        )}
                        {discountLists &&
                          discountLists
                            .filter((discount) => discount.type === "Admission")
                            .map((discount) => {
                              return (
                                <InputLine>
                                  <Input
                                    readOnly={true}
                                    type="text"
                                    name="discount_id"
                                    grow
                                    title="Description"
                                    defaultValue={discount.name}
                                    InputContext={InputContext}
                                  />
                                  <Input
                                    readOnly={true}
                                    type="text"
                                    name="value"
                                    grow
                                    title="Discount"
                                    defaultValue={
                                      (discount.percent ? "%" : "$") +
                                      " " +
                                      discount.value
                                    }
                                    InputContext={InputContext}
                                  />
                                  <SelectPopover
                                    readOnly={true}
                                    name="all_installments"
                                    title="All Installments?"
                                    options={yesOrNoOptions}
                                    defaultValue={yesOrNoOptions.find(
                                      (option) =>
                                        option.value ===
                                        discount.all_installments
                                    )}
                                    InputContext={InputContext}
                                  />
                                  <SelectPopover
                                    readOnly={true}
                                    name="free_vacation"
                                    title="Free Vacation?"
                                    options={yesOrNoOptions}
                                    defaultValue={yesOrNoOptions.find(
                                      (option) =>
                                        option.value === discount.free_vacation
                                    )}
                                    InputContext={InputContext}
                                  />
                                  <SelectPopover
                                    name="apply"
                                    title="Apply?"
                                    options={yesOrNoOptions}
                                    InputContext={InputContext}
                                    defaultValue={yesOrNoOptions.find(
                                      (option) => option.value === false
                                    )}
                                    onChange={(el) =>
                                      handleDiscount(discount.id, el)
                                    }
                                  />
                                </InputLine>
                              );
                            })}

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
                        </InputLine>
                        <InputLine title="Autopay">
                          <SelectPopover
                            name="is_autopay"
                            title="Is Autopay?"
                            grow
                            onChange={(el) => {
                              setIsAutoPay(el.value);
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
                        </InputLine>

                        {isAutoPay ||
                          (pageData?.issuer?.issuer_x_recurrence
                            ?.is_autopay && (
                            <>
                              <InputLine>
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
                          ))}
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
                                title={index === 0 ? "Receivables" : ""}
                              >
                                <Input
                                  type="hidden"
                                  name="receivable_id"
                                  readOnly={true}
                                  grow
                                  defaultValue={receivable.id}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="entry_date"
                                  readOnly={true}
                                  grow
                                  title="Entry Date"
                                  defaultValue={format(
                                    parseISO(receivable.entry_date),
                                    "yyyy-MM-dd"
                                  )}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="due_date"
                                  readOnly={true}
                                  grow
                                  title="Due Date"
                                  defaultValue={format(
                                    parseISO(receivable.due_date),
                                    "yyyy-MM-dd"
                                  )}
                                  InputContext={InputContext}
                                />
                                <Input
                                  type="text"
                                  name="receivable_amount"
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
                                  name="fee"
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
                                  name="receivable_total"
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
                                  name="status"
                                  readOnly={true}
                                  grow
                                  title="Status"
                                  defaultValue={receivable.status}
                                  InputContext={InputContext}
                                />
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
