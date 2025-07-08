import { Form } from "@unform/web";
import { Building, Printer } from "lucide-react";
import React, { createContext, useContext, useRef, useState } from "react";
import RegisterFormMenu from "~/components/RegisterForm/Menu";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { toast } from "react-toastify";
import api from "~/services/api";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { FullGridContext } from "../..";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import { AlertContext } from "~/App";
import { monthsOptions } from "~/functions/selectPopoverOptions";
import { format, lastDayOfMonth, parseISO } from "date-fns";
import Input from "~/components/RegisterForm/Input";

export const InputContext = createContext({});

export default function AttendanceReport({
  access,
  id,
  defaultFormType = "preview",
  selected,
  handleOpened,
}) {
  const { alertBox } = useContext(AlertContext);
  const [loading, setLoading] = useState(false);
  const { successfullyUpdated, setSuccessfullyUpdated } =
    useContext(FullGridContext);
  const [pageData, setPageData] = useState({
    loaded: false,
    bank_name: "",
    bank_alias: "",
    loaded: true,
    installment_amount: 0,
    studentxgroups: [],
  });

  const [registry, setRegistry] = useState({
    created_by: null,
    created_at: null,
    updated_by: null,
    updated_at: null,
    canceled_by: null,
    canceled_at: null,
  });
  const [formType, setFormType] = useState("preview");
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
    const { year, month } = data;
    const from_date = format(parseISO(`${year}-${month}-01`), "yyyy-MM-dd");
    const to_date = format(
      lastDayOfMonth(parseISO(`${year}-${month}-01`)),
      "yyyy-MM-dd"
    );
    if (from_date && to_date) {
      setLoading(true);
      api
        .get(
          `/studentgroups/attendanceReport/${selected[0].id}?from_date=${from_date}&to_date=${to_date}`,
          {
            responseType: "blob",
          }
        )
        .then(({ data }) => {
          const pdfBlob = new Blob([data], { type: "application/pdf" });
          console.log(data);
          saveAs(pdfBlob, `attendance_report_${selected[0].id}.pdf`);
          setLoading(false);
        });
    } else {
      setLoading(false);
      alertBox({
        title: "Attention!",
        descriptionHTML: "Please select a period to generate the report.",
        buttons: [
          {
            title: "Ok",
            class: "cancel",
          },
        ],
      });
    }
  }

  return (
    <Preview formType={formType} fullscreen={fullscreen}>
      {pageData ? (
        <div className="flex h-full flex-row items-start justify-between gap-4">
          <div className="border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start">
            <div className="flex flex-col items-start justify-start text-sm overflow-y-scroll">
              <Form
                ref={generalForm}
                onSubmit={handleGeneralFormSubmit}
                className="w-full"
              >
                <InputContext.Provider
                  value={{
                    id: "new",
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
                        title={"Report"}
                        registry={registry}
                        InputContext={InputContext}
                        enableFullScreen={false}
                        createText="Print"
                        createIcon={<Printer size={16} />}
                        loading={loading}
                      />

                      <InputLineGroup
                        title="GENERAL"
                        activeMenu={activeMenu === "general"}
                      >
                        <InputLine title="Period">
                          <Input
                            title="Year"
                            type="text"
                            name="year"
                            shrink
                            required
                            InputContext={InputContext}
                            defaultValue={format(new Date(), "yyyy")}
                          />
                          <SelectPopover
                            name="month"
                            grow
                            required
                            title="Month"
                            options={monthsOptions}
                            InputContext={InputContext}
                            defaultValue={monthsOptions.find(
                              (month) =>
                                month.value === format(new Date(), "MM")
                            )}
                          />
                        </InputLine>
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
