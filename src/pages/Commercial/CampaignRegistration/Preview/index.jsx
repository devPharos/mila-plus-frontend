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
import api from "~/services/api";
import { Zoom, toast } from "react-toastify";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Preview from "~/components/Preview";
import { getRegistries, handleUpdatedFields, countries_list } from "~/functions";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import CountryList from "country-list-with-dial-code-and-flag";
import FormLoading from "~/components/RegisterForm/FormLoading";
import { useSelector } from "react-redux";
import { FullGridContext } from "../..";
import FindGeneric from "~/components/Finds/FindGeneric";
import PhoneNumberInput from "~/components/RegisterForm/PhoneNumberInput";
import DatePicker from "../../../../components/RegisterForm/DatePicker";

export const InputContext = createContext({});

export const campaign_type_options = [
  { label: "Promotional Campaign", value: "promotional_campaign" },
  { label: "Seasonal Campaign", value: "seasonal_campaign" },
  { label: "Retention Campaign", value: "retention_campaign" }
]

export const marketing_channel_options = [
  { label: "Email Marketing", value: "email_marketing" },
  { label: "Social Media", value: "social_media" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Search Engine Marketing (SEM)", value: "search_engine_marketing" },
  { label: "Influencer Marketing", value: "influencer_marketing" },
  { label: "Event Marketing", value: "event_marketing" },
  { label: "Partnership", value: "partnership" },
  { label: "Other", value: "other" }
];

export const status_options = [
  { label: "Active", value: true },
  { label: "Deactive", value: false },
];


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

  const countriesOptions = countries_list.map((country) => {
    return { value: country, label: country };
  });

  const [pageData, setPageData] = useState({
    campaign_name: "",
    campaign_objective: "",
    target_audience: "",
    start_date: "",
    end_date: "",
    budget: 0,
    marketing_channel: "",
    campaign_type: "",
    discount_related: "",
    status: true,
    user_id: null,
    loaded: false,
  });
  const [formType, setFormType] = useState(defaultFormType);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("general");
  const [registry, setRegistry] = useState({
    created_by: null,
    created_at: null,
    updated_by: null,
    updated_at: null,
    canceled_by: null,
    canceled_at: null,
  });
  const [discountRelatedOptions, setDiscountRelatedOptions] = useState([]);
  const generalForm = useRef();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    async function getPageData() {
      if (id !== "new") {
        try {
          const { data: datailialdiscounts } = await api.get('/campaign_filialdiscounts');

          setDiscountRelatedOptions(datailialdiscounts);

          const { data } = await api.get(`/campaign/${id}`);
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
      } else {
        const { data } = await api.get('/campaign_filialdiscounts');

        setDiscountRelatedOptions(data);

        setPageData({ ...pageData, loaded: true });
        setFormType("full");
      }
    }

    getPageData();
  }, []);

  async function handleGeneralFormSubmit(data) {
    if (successfullyUpdated) {
      toast("No need to be saved!", {
        autoClose: 1000,
        type: "info",
        transition: Zoom,
      });
      return;
    }
    if (!data.user_id) {
      delete data.user_id;
    }
    if (id === "new") {
      try {

        const response = await api.post(
        `/campaign`,
        {
          ...data,
          budget: parseInt(data.budget),
        });
        setOpened(response.data.id);
        setPageData({ ...pageData, ...data });
        setSuccessfullyUpdated(true);
        toast("Saved!", { autoClose: 1000 });
        handleOpened(null);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    } else if (id !== "new") {
      try {
        const response = await api.put(`/campaign/${id}`, { ...data });
        setOpened(response.data.id);
        setPageData({ ...pageData, ...data });
        setSuccessfullyUpdated(true);
        toast("Saved!", { autoClose: 1000 });
        handleOpened(null);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }
  }

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  async function handleInactivate() {
    try {
      await api.delete(`/agents/${id}`);
      toast("Agent Inactivated!", { autoClose: 1000 });
      handleOpened(null);
    } catch (err) {
      toast(err.response.data.error, { type: "error", autoClose: 3000 });
    }
  }

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
            <div className="flex flex-1 flex-col items-left px-4 py-2 gap-1">
              <p className="border-b mb-1 pb-1">Agent Information</p>
              <div className="flex flex-row items-center gap-1 text-xs">
                <strong>Name:</strong> {pageData.name}
              </div>
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
                      handleInactivate,
                      canceled: pageData.canceled_at,
                    }}
                  >
                    {pageData.loaded ? (
                      <>
                        <FormHeader
                          access={access}
                          title={pageData.name}
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
                              id === "new" && auth.filial.id !== 1
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
                          <InputLine title="Campaign Data">
                            <Input
                              type="text"
                              name="campaign_name"
                              required
                              grow
                              title="Campaign Name"
                              defaultValue={pageData.campaign_name}
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="campaign_objective"
                              grow
                              required
                              title="Campaign Objective"
                              defaultValue={pageData.campaign_objective}
                              InputContext={InputContext}
                            />
                          </InputLine>
                          <InputLine>
                            <Input
                              type="text"
                              name="target_audience"
                              grow
                              required
                              title="Target Audience"
                              defaultValue={pageData.target_audience}
                              InputContext={InputContext}
                            />
                            <DatePicker
                              name="start_date"
                              grow
                              required
                              title="Start Date"
                              defaultValue={pageData.start_date}
                              placeholderText="MM/DD/YYYY"
                              InputContext={InputContext}
                            />
                            <DatePicker
                              name="end_date"
                              grow
                              required
                              title={'End Date'}
                              defaultValue={pageData.end_date}
                              placeholderText="MM/DD/YYYY"
                              InputContext={InputContext}
                            />
                            <Input
                              type="text"
                              name="budget"
                              grow
                              required
                              title={`Budget`}
                              defaultValue={pageData.budget}
                              onlyFloat={true}
                              value={pageData.budget}
                              InputContext={InputContext}
                              onChange={(e) => {
                                const value = parseFloat(e); // Convertendo para número
                                const type = pageData.budget; // Pegando o tipo atual

                                if (type === 'percentage_per_enrollment') {
                                  // Aceita apenas valores entre 0 e 100
                                  if (value >= 0 && value <= 100) {
                                    setPageData(state => ({
                                      ...state,
                                      budget: value
                                    }));
                                  }
                                } else {
                                  // Aceita qualquer número (inteiro ou decimal positivo)
                                  if (!isNaN(value)) {
                                    setPageData(state => ({
                                      ...state,
                                      budget: value
                                    }));
                                  }
                                }
                              }}
                            />
                            <div style={{ width: 300 }}>
                              <SelectPopover
                                name="marketing_channel"
                                defaultValue={marketing_channel_options.find((option) => option.value === pageData.marketing_channel)}
                                centeredText={true}
                                readOnly={false}
                                shrink={false}
                                title={'Marketing Channel'}
                                options={marketing_channel_options}
                                InputContext={InputContext}
                              />
                            </div>
                          </InputLine>
                          <InputLine>
                            <div style={{ width: 'auto', flexGrow: 1 }}>
                              <SelectPopover
                                name="campaign_type"
                                defaultValue={campaign_type_options.find((option) => option.value === pageData.campaign_type)}
                                centeredText={true}
                                readOnly={false}
                                shrink={false}
                                title={'Campaign Type'}
                                options={campaign_type_options}
                                InputContext={InputContext}
                              />
                            </div>
                            <div style={{ width: 'auto', flexGrow: 1 }}>
                              <SelectPopover
                                name="discount_related"
                                defaultValue={discountRelatedOptions.find((option) => option.value === pageData.discount_related)}
                                centeredText={true}
                                readOnly={false}
                                shrink={false}
                                title={'Discount Related'}
                                options={discountRelatedOptions}
                                InputContext={InputContext}
                              />
                            </div>
                            <div style={{ width: 'auto', flexGrow: 1 }}>
                              <SelectPopover
                                name="status"
                                defaultValue={status_options.find((option) => option.value === pageData.status)}
                                centeredText={true}
                                readOnly={false}
                                shrink={false}
                                title={'Status'}
                                options={status_options}
                                InputContext={InputContext}
                              />
                            </div>
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
