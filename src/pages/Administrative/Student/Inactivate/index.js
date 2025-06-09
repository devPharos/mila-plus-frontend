import { Form } from "@unform/web";
import { Building } from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import RegisterFormMenu from "~/components/RegisterForm/Menu";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { toast } from "react-toastify";
import api from "~/services/api";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { FullGridContext } from "../..";
import DatePicker from "~/components/RegisterForm/DatePicker";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import { AlertContext } from "~/App";
import { inactiveReasonsOptions } from "~/functions/selectPopoverOptions";
import { format, parseISO } from "date-fns";

export const InputContext = createContext({});

export default function Inactivate({
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
    bank_name: "",
    bank_alias: "",
    loaded: false,
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
    const { date, reason } = data;
    try {
      await api.post(`/students/inactivate`, {
        student_id: selected[0].id,
        date: format(date, "yyyyMMdd"),
        reason,
      });
      toast("Student inactivated!", { autoClose: 1000 });
      handleOpened(null);
    } catch (err) {
      console.log(err);
      // toast(err.response.data.error, { type: "error", autoClose: 3000 });
    }
  }

  useEffect(() => {
    async function loadData() {
      const { data } = await api.get(`/students/${selected[0].id}`);
      setPageData({ ...data, loaded: true });
    }
    loadData();
  }, []);

  console.log(pageData)

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
                          "Inactivation - " +
                          pageData.name +
                          " " +
                          pageData.last_name
                        }
                        registry={registry}
                        InputContext={InputContext}
                      />

                      <InputLineGroup
                        title="GENERAL"
                        activeMenu={activeMenu === "general"}
                      >
                        <InputLine title="Details">
                          <DatePicker
                            name="date"
                            grow
                            required
                            title="Date"
                            defaultValue={pageData.date}
                            placeholderText="MM/DD/YYYY"
                            InputContext={InputContext}
                          />
                          <SelectPopover
                            name="reason"
                            grow
                            required
                            title="Reason"
                            isSearchable
                            defaultValue={inactiveReasonsOptions.find(
                              (reason) => reason.value === pageData.reason
                            )}
                            options={inactiveReasonsOptions}
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
            </div>
          </div>
        </div>
      ) : null}
    </Preview>
  );
}
