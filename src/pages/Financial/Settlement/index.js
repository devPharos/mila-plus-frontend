import React, { createContext, useContext, useRef, useState } from "react";
import PageHeader from "~/components/PageHeader";
import Breadcrumbs from "~/components/Breadcrumbs";
import FiltersBar from "~/components/FiltersBar";
import { Filter } from "lucide-react";
import { getCurrentPage } from "~/functions";
import { Form } from "@unform/web";
import { FullGridContext } from "..";
import { toast } from "react-toastify";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import InputLine from "~/components/RegisterForm/InputLine";
import DatePicker from "~/components/RegisterForm/DatePicker";
import { format } from "date-fns";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import PageContainer from "~/components/PageContainer";
import PagePreview from "./Preview";
import Grid from "~/components/Grid";

export const InputContext = createContext({});

export default function FinancialSettlement() {
  const currentPage = getCurrentPage();
  const generalForm = useRef();
  const [formType, setFormType] = useState("full");
  const [fullscreen, setFullscreen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("general");
  const defaultGridHeader = [
    {
      title: "Issuer Name",
      name: "issuer_name",
      type: "text",
      filter: false,
    },
    {
      title: "Filial Name",
      name: "filial_name",
      type: "text",
      filter: true,
    },
    {
      title: "Entry Date",
      name: "entry_date",
      type: "date",
      filter: false,
    },
    {
      title: "Due Date",
      name: "due_date",
      type: "date",
      filter: false,
    },
    {
      title: "Amount",
      name: "amount",
      type: "currency",
      filter: false,
    },
    {
      title: "Discount",
      name: "discount",
      type: "currency",
      filter: false,
    },
    {
      title: "Fee",
      name: "fee",
      type: "currency",
      filter: false,
    },
    {
      title: "Total",
      name: "total",
      type: "currency",
      filter: false,
    },
    {
      title: "Payment Criteria",
      name: "paymentcriteria_id",
      type: "text",
      filter: true,
    },
    {
      title: "Status",
      name: "status",
      type: "text",
      filter: true,
    },
    {
      title: "Status Date",
      name: "status_date",
      type: "date",
      filter: false,
    },
  ];

  function handleGeneralFormSubmit(data) {
    console.log(data);
  }

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  const {
    handleOpened,
    setOpened,
    successfullyUpdated,
    setSuccessfullyUpdated,
  } = useContext(FullGridContext);

  return (
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4">
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
        <FiltersBar>
          <Filter size={14} /> Custom Filters
        </FiltersBar>
      </PageHeader>

      <div className="mt-4 w-full overflow-hidden flex flex-col justify-start">
        <div className="flex flex-col items-start justify-start text-sm overflow-y-scroll">
          <Form
            ref={generalForm}
            onSubmit={handleGeneralFormSubmit}
            className="w-full pb-32"
          >
            <InputContext.Provider
              value={{
                id: "New",
                generalForm,
                setSuccessfullyUpdated,
                fullscreen,
                setFullscreen,
                successfullyUpdated,
                handleCloseForm,
              }}
            >
              <InputLineGroup
                title="GENERAL"
                activeMenu={activeMenu === "general"}
              >
                <InputLine title="Filters">
                  <SelectPopover
                    name="student_id"
                    required
                    title="Student"
                    isSearchable
                    grow
                    defaultValue={null}
                    options={[]}
                    InputContext={InputContext}
                  />
                  <DatePicker
                    name="from_date"
                    title="From Date"
                    required
                    defaultValue={format(new Date(), "yyyy-MM-dd")}
                    placeholderText="MM/DD/YYYY"
                    InputContext={InputContext}
                  />
                  <DatePicker
                    name="to_date"
                    title="To Date"
                    defaultValue={format(new Date(), "yyyy-MM-dd")}
                    placeholderText="MM/DD/YYYY"
                    InputContext={InputContext}
                  />
                </InputLine>
              </InputLineGroup>
            </InputContext.Provider>
          </Form>
        </div>
      </div>
    </div>
  );
}
