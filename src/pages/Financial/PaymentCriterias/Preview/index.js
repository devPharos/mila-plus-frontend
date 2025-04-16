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
import { FullGridContext } from "../..";
import FindGeneric from "~/components/Finds/FindGeneric";

export const InputContext = createContext({});

export default function PagePreview({
  access,
  id,
  defaultFormType = "preview",
}) {
  const {
    handleOpened,
    setOpened,
    successfullyUpdated,
    setSuccessfullyUpdated,
  } = useContext(FullGridContext);
  const [pageData, setPageData] = useState({
    name: "",
    loaded: false,
    description: "",
    recurring_qt: null,
    recurring_metric: "",
    fee_qt: null,
    fee_metric: "",
    fee_type: "",
    fee_value: null,
    company: { name: "" },
    filial_id: null,
    filial: { name: "" },
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

  //Percentage / Flat Fee
  const [feeTypeOptions] = useState([
    { value: "Percentage", label: "Percentage" },
    { value: "Flat Fee", label: "Flat Fee" },
  ]);

  const [metricsOptions] = useState([
    { value: "Day", label: "Day" },
    { value: "Week", label: "Week" },
    { value: "Month", label: "Month" },
  ]);

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
    if (id === "new") {
      try {
        const response = await api.post(`/paymentcriterias`, data);
        setOpened(response.data.id);
        setPageData({ ...pageData, ...data });
        setSuccessfullyUpdated(true);
        toast("Saved!", { autoClose: 1000 });
        handleOpened(null);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    } else if (id !== "new") {
      const updated = handleUpdatedFields(data, pageData);

      if (updated.length > 0) {
        const objUpdated = Object.fromEntries(updated);
        try {
          console.log(objUpdated);
          await api.put(`/paymentcriterias/${id}`, objUpdated);
          setPageData({ ...pageData, ...objUpdated });
          setSuccessfullyUpdated(true);
          toast("Saved!", { autoClose: 1000 });
          handleOpened(null);
        } catch (err) {
          toast(err.response.data.error, { type: "error", autoClose: 3000 });
        }
      } else {
        console.log(updated);
      }
    }
  }

  useEffect(() => {
    async function getPageData() {
      try {
        const { data } = await api.get(`/paymentcriterias/${id}`);
        setPageData({ ...data, loaded: true });
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
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }
    async function getDefaultOptions() {
      try {
        const { data } = await api.get(`/filials`);
        const filialOptions = data
          .filter((f) => f.id !== id)
          .map((f) => {
            return { value: f.id, label: f.name };
          });

        setFilialOptions(filialOptions);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }
    getDefaultOptions();
    if (id === "new") {
      setFormType("full");
    } else if (id) {
      getPageData();
    }
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
                          title={pageData.description.slice(0, 30)}
                          registry={registry}
                          InputContext={InputContext}
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
                          <InputLine title="Description">
                            <Textarea
                              name="description"
                              required
                              title="Description"
                              grow
                              rows={3}
                              defaultValue={pageData.description}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine title="Recurring">
                            <Input
                              type="number"
                              name="recurring_qt"
                              required
                              min="0"
                              title="Recurring Quantity"
                              grow
                              defaultValue={pageData.recurring_qt}
                              InputContext={InputContext}
                            />
                            <SelectPopover
                              type="text"
                              name="recurring_metric"
                              required
                              title="Recurring Metric"
                              grow
                              defaultValue={metricsOptions.filter(
                                (metric) =>
                                  metric.value === pageData.recurring_metric
                              )}
                              options={metricsOptions}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine title="Fee">
                            <Input
                              type="number"
                              name="fee_qt"
                              required
                              min="0"
                              title="Fee Quantity"
                              grow
                              defaultValue={pageData.fee_qt}
                              InputContext={InputContext}
                            />

                            <SelectPopover
                              type="text"
                              name="fee_metric"
                              required
                              title="Fee Metric"
                              grow
                              defaultValue={metricsOptions.filter(
                                (metric) => metric.value === pageData.fee_metric
                              )}
                              options={metricsOptions}
                              InputContext={InputContext}
                            />

                            <SelectPopover
                              name="fee_type"
                              required
                              title="Fee Type"
                              isSearchable
                              grow
                              defaultValue={feeTypeOptions.filter(
                                (feeType) => feeType.value === pageData.fee_type
                              )}
                              options={feeTypeOptions}
                              InputContext={InputContext}
                            />

                            <Input
                              type="number"
                              name="fee_value"
                              required
                              title="Fee Value"
                              min="0"
                              grow
                              defaultValue={pageData.fee_value}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine>
                            <Textarea
                              name="late_fee_description"
                              title="Late Fee Description"
                              grow
                              rows={3}
                              defaultValue={pageData.late_fee_description}
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
        )
      ) : null}
    </Preview>
  );
}
