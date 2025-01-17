import React, { useContext, useEffect, useState } from "react";
import { yesOrNoOptions } from "~/functions/selectPopoverOptions";
import Input from "../RegisterForm/Input";
import InputLine from "../RegisterForm/InputLine";
import SelectPopover from "../RegisterForm/SelectPopover";
import { Zoom, toast } from "react-toastify";
import { Trash2 } from "lucide-react";
import { Scope } from "@unform/core";
import { getPriceLists } from "~/functions";
import DatePicker from "../RegisterForm/DatePicker";
import { addDays, format, parseISO } from "date-fns";

function PricesSimulation({
  student = null,
  InputContext = null,
  generalForm = null,
  showAdmissionDiscounts = false,
  isAdmissionDiscountChangable = false,
  showFinancialDiscounts = false,
  isFinancialDiscountChangable = false,
  FullGridContext = null,
  recurrence = false,
}) {
  const { setSuccessfullyUpdated } = useContext(FullGridContext);
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const { filial_id, processtype_id, processsubstatus_id } = student;
  const [priceLists, setPriceLists] = useState(null);
  const [discountLists, setDiscountLists] = useState(null);
  const [discountOptions, setDiscountOptions] = useState([]);
  useEffect(() => {
    async function loadData() {
      const { priceLists: newPriceLists, discountLists: discountListData } =
        await getPriceLists({
          filial_id,
          processsubstatus_id,
        });

      let newDiscountLists = discountListData;

      if (!newDiscountLists) {
        return;
      }

      if (recurrence) {
        newDiscountLists = discountListData.filter(
          (discount) => discount.type === "Financial"
        );
      }

      setPriceLists(newPriceLists);
      setDiscountLists(newDiscountLists);

      setDiscountOptions(
        newDiscountLists.map((discount) => {
          return {
            value: discount.id,
            label:
              discount.name +
              " - " +
              discount.value +
              (discount.percent ? "%" : "$"),
            type: discount.type,
          };
        })
      );

      if (student.discounts) {
        const discounts = student.discounts
          .filter(
            (discount) =>
              (showFinancialDiscounts &&
                discount.discount.type === "Financial") ||
              (showAdmissionDiscounts && discount.discount.type === "Admission")
          )
          .map((discount) => {
            return {
              ...discount.discount,
              start_date: discount.start_date,
              end_date: discount.end_date,
            };
          });
        setAppliedDiscounts(discounts);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    function calculateDiscounts() {
      if (!appliedDiscounts.length) {
        setTotalDiscount(0);
        return;
      }
      const discountAmount = appliedDiscounts.reduce((acc, curr) => {
        if (curr.percent) {
          return acc + (priceLists.tuition * curr.value) / 100;
        } else {
          return acc + curr.value;
        }
      }, 0);

      setTotalDiscount(discountAmount);
    }
    if (priceLists && discountLists) {
      calculateDiscounts();
    }
  }, [appliedDiscounts, priceLists, discountLists]);

  function handleDiscount({
    id,
    start_date = null,
    end_date = null,
    el,
    priceLists = null,
    discountLists = null,
  }) {
    if (!id) {
      toast("not defined");
      return;
    }
    let newDiscounts = discountLists;

    const discount = discountLists.find((discount) => discount.id === id);
    if (el.value) {
      // if (appliedDiscounts.find((discount) => discount.id === id)) {
      //   toast("Discount already applied!", {
      //     autoClose: 1000,
      //     type: "error",
      //     transition: Zoom,
      //   });
      //   return;
      // }
      newDiscounts = [
        ...appliedDiscounts,
        {
          id: discount.id,
          start_date: start_date ? format(start_date, "yyyy-MM-dd") : null,
          end_date: end_date ? format(end_date, "yyyy-MM-dd") : null,
          name: discount.name,
          value: discount.value,
          percent: discount.percent,
          type: discount.type,
        },
      ];
      toast("Discount applied!", {
        autoClose: 1000,
        type: "success",
        transition: Zoom,
      });
    } else if (!el.value) {
      newDiscounts = appliedDiscounts.filter((discount) => discount.id !== id);
      toast("Discount removed!", {
        autoClose: 1000,
        type: "success",
        transition: Zoom,
      });
    }
    setSuccessfullyUpdated(false);
    setAppliedDiscounts(newDiscounts);
  }

  if (!priceLists || !discountLists) {
    return null;
  }

  return (
    <Scope path="prices">
      <InputLine title="Prices Simulation">
        <table className="table-auto w-full text-center">
          <thead className="bg-slate-200 rounded-lg overflow-hidden">
            <tr>
              {!recurrence && (
                <>
                  <th className="w-1/6">Registration Fee</th>
                  <th className="w-1/6">Books</th>
                  <th className="w-1/6">Tuition in Advanced</th>
                </>
              )}
              <th className="w-1/6">Tuition</th>
              <th className="w-1/6">Discount</th>
              <th className="w-1/6">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {!recurrence && (
                <>
                  <td>
                    <Input
                      type="text"
                      name="registration_fee"
                      value={priceLists.registration_fee.toFixed(2)}
                      centeredText={true}
                      placeholder="$ 0.00"
                      className="text-center"
                      readOnly={true}
                      InputContext={InputContext}
                    />
                  </td>
                  <td>
                    <Input
                      type="text"
                      name="books"
                      value={priceLists.book.toFixed(2)}
                      centeredText={true}
                      placeholder="$ 0.00"
                      className="text-center"
                      readOnly={true}
                      InputContext={InputContext}
                    />
                  </td>
                  <td>
                    <SelectPopover
                      name="tuition_in_advance"
                      defaultValue={yesOrNoOptions.find(
                        (option) =>
                          option.value === priceLists.tuition_in_advance
                      )}
                      centeredText={true}
                      readOnly={true}
                      options={yesOrNoOptions}
                      InputContext={InputContext}
                    />
                  </td>
                </>
              )}
              <td>
                <Input
                  type="text"
                  name="tuition_original_price"
                  value={priceLists.tuition.toFixed(2)}
                  centeredText={true}
                  placeholder="$ 0.00"
                  className="text-center"
                  readOnly={true}
                  InputContext={InputContext}
                />
              </td>
              <td>
                <Input
                  type="text"
                  name="total_discount"
                  value={totalDiscount.toFixed(2)}
                  centeredText={true}
                  placeholder="$ 0.00"
                  className="text-center"
                  readOnly={true}
                  InputContext={InputContext}
                />
              </td>
              <td>
                <Input
                  type="text"
                  name="total_tuition"
                  value={(!recurrence
                    ? priceLists.registration_fee +
                      priceLists.book +
                      priceLists.tuition -
                      totalDiscount
                    : priceLists.tuition - totalDiscount
                  ).toFixed(2)}
                  centeredText={true}
                  placeholder="$ 0.00"
                  className="text-center"
                  readOnly={true}
                  InputContext={InputContext}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </InputLine>
      {(showAdmissionDiscounts || showFinancialDiscounts) && (
        <>
          <InputLine>
            <table className="table-auto w-full text-center">
              <thead className="bg-slate-200 rounded-lg overflow-hidden">
                <tr>
                  <th>Discount name</th>
                  <th className="w-1/7">Value</th>
                  <th className="w-1/7">Start Date</th>
                  <th className="w-1/7">End Date</th>
                  <th className="w-1/7">Type</th>
                  {(isAdmissionDiscountChangable ||
                    isFinancialDiscountChangable) && (
                    <th className="w-1/7">Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {appliedDiscounts
                  .filter((discount) => {
                    if (
                      (showAdmissionDiscounts &&
                        discount.type === "Admission") ||
                      (showFinancialDiscounts && discount.type === "Financial")
                    ) {
                      return discount;
                    }
                  })
                  .sort((a, b) => (a.type < b.type ? -1 : 1))
                  .map((discount, index) => {
                    return (
                      <tr key={index} className="border-b even:bg-slate-50">
                        <Scope path={`discounts[${index}]`}>
                          <Input
                            type="hidden"
                            name="filial_discount_list_id"
                            value={discount.id}
                            InputContext={InputContext}
                          />
                          <Input
                            type="hidden"
                            name="start_date"
                            value={discount.start_date}
                            InputContext={InputContext}
                          />
                          <Input
                            type="hidden"
                            name="end_date"
                            value={discount.end_date}
                            InputContext={InputContext}
                          />
                        </Scope>
                        <td>{discount.name}</td>
                        <td>
                          {discount.value} {discount.percent ? "%" : "$"}
                        </td>
                        <td>
                          {discount.start_date
                            ? format(
                                parseISO(discount.start_date),
                                "dd/MM/yyyy"
                              )
                            : ""}
                        </td>
                        <td>
                          {discount.end_date
                            ? format(parseISO(discount.end_date), "dd/MM/yyyy")
                            : ""}
                        </td>
                        <td>{discount.type}</td>
                        <td>
                          {((isAdmissionDiscountChangable &&
                            discount.type === "Admission") ||
                            (isFinancialDiscountChangable &&
                              discount.type === "Financial")) && (
                            <button
                              type="button"
                              onClick={() => {
                                handleDiscount({
                                  id: discount.id,
                                  el: {
                                    value: false,
                                  },
                                  priceLists,
                                  discountLists,
                                });
                              }}
                              className="w-full text-xs px-2 py-1 rounded-md cursor-pointer flex flex-row items-center justify-center gap-2"
                            >
                              <Trash2 size={12} />
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </InputLine>
          <InputLine title="Avaiable Discounts">
            {isAdmissionDiscountChangable && (
              <>
                <SelectPopover
                  name="admissionDiscountChoose"
                  title="Admission Discounts"
                  isSearchable
                  grow
                  options={discountOptions.filter(
                    (discount) => discount.type === "Admission"
                  )}
                  InputContext={InputContext}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleDiscount({
                      id: generalForm.current.getFieldValue(
                        "prices.admissionDiscountChoose"
                      ),
                      el: { value: true },
                      priceLists,
                      discountLists,
                    });
                  }}
                  className="text-xs bg-gray-100 px-4 py-2 mt-4 rounded-md border cursor-pointer flex flex-row items-center justify-center gap-2 hover:bg-gray-200"
                >
                  Apply
                </button>
              </>
            )}
            {isFinancialDiscountChangable && (
              <>
                <SelectPopover
                  name="financialDiscountChoose"
                  title="Financial Discounts"
                  isSearchable
                  grow
                  options={discountOptions.filter(
                    (discount) => discount.type === "Financial"
                  )}
                  InputContext={InputContext}
                />
                <DatePicker
                  name="financialDiscountFromDate"
                  title="Start Date"
                  required
                  defaultValue={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                  InputContext={InputContext}
                />
                <DatePicker
                  name="financialDiscountUntilDate"
                  title="End Date"
                  InputContext={InputContext}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleDiscount({
                      id: generalForm.current.getFieldValue(
                        "prices.financialDiscountChoose"
                      ),
                      start_date: generalForm.current.getFieldValue(
                        "prices.financialDiscountFromDate"
                      ),
                      end_date: generalForm.current.getFieldValue(
                        "prices.financialDiscountUntilDate"
                      ),
                      el: { value: true },
                      priceLists,
                      discountLists,
                    });
                  }}
                  className="text-xs bg-gray-100 px-4 py-2 mt-4 rounded-md border cursor-pointer flex flex-row items-center justify-center gap-2 hover:bg-gray-200"
                >
                  Apply
                </button>
              </>
            )}
          </InputLine>
        </>
      )}
    </Scope>
  );
}

export default PricesSimulation;
