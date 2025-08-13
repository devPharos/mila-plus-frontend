import { Form } from "@unform/web";
import { Building, History, Trash } from "lucide-react";
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
import { AlertContext } from "~/App";
import { format, parseISO } from "date-fns";
import FindGeneric from "~/components/Finds/FindGeneric";
import Input from "~/components/RegisterForm/Input";

export const InputContext = createContext({});

export default function Transfer({
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
    loaded: false,
    bank_name: "",
    bank_alias: "",
    loaded: true,
    installment_amount: 0,
    studentxgroups: [],
    studentgroup: {
      id: null,
      name: "",
      description: "",
      start_date: null,
      end_date: null,
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
    const { date, studentgroup } = data;
    try {
      await api.post(`/students/transfer/${selected[0].id}`, {
        studentgroup,
        date: format(date, "yyyy-MM-dd"),
      });
      toast("Student Transfered!", { autoClose: 1000 });
      handleOpened(null);
    } catch (err) {
      console.log(err);
      // toast(err.response.data.error, { type: "error", autoClose: 3000 });
    }
  }

  async function handleRemove(transfer_id) {
    alertBox({
      title: "Attention!",
      descriptionHTML:
        "Are you sure you want to delete this transfer? \n This operation cannot be undone.",
      buttons: [
        {
          title: "No",
          class: "cancel",
        },
        {
          title: "Yes",
          onPress: async () => {
            try {
              await api.delete(`/students/transfer/${transfer_id}`);
              toast("Transfer removed!", { autoClose: 1000 });
              setPageData({ ...pageData, studentxgroups: [], loaded: true });
            } catch (err) {
              console.log(err);
              toast(err.response.data.error, {
                type: "error",
                autoClose: 3000,
              });
            }
          },
        },
      ],
    });
  }

  useEffect(() => {
    async function loadData() {
      const { data } = await api.get(`/students/${selected[0].id}`);
      setPageData({ ...data, loaded: true });
    }
    loadData();
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
                          "Transfer - " +
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
                        {pageData.studentxgroups.length > 0 ? (
                          <InputLine title="Pending...">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemove(pageData.studentxgroups[0].id)
                              }
                            >
                              <Trash size={16} className="mt-3" />
                            </button>
                            <Input
                              type="text"
                              name="transfer_student"
                              required
                              grow
                              title="Status"
                              defaultValue={pageData.studentxgroups[0].status}
                              InputContext={InputContext}
                              readOnly
                            />
                            <Input
                              type="text"
                              name="transfer_group"
                              required
                              grow
                              title="To Group"
                              defaultValue={
                                pageData.studentxgroups[0].group.name
                              }
                              InputContext={InputContext}
                              readOnly
                            />
                            <Input
                              type="date"
                              name="transfer_date"
                              required
                              grow
                              title="Transfer Date"
                              defaultValue={
                                pageData.studentxgroups[0].start_date
                              }
                              placeholderText="MM/DD/YYYY"
                              InputContext={InputContext}
                              readOnly
                            />
                          </InputLine>
                        ) : (
                          <>
                            {pageData?.studentgroup?.id && (
                              <FindGeneric
                                route="studentgroups"
                                title="Student Group From"
                                scope="studentgroup_from"
                                readOnly
                                InputContext={InputContext}
                                defaultValue={{
                                  id: pageData.studentgroup?.id,
                                  name: pageData.studentgroup?.name,
                                  start_date: pageData.studentgroup?.start_date
                                    ? format(
                                        parseISO(
                                          pageData.studentgroup?.start_date
                                        ),
                                        "MM/dd/yyyy"
                                      )
                                    : null,
                                  end_date: pageData.studentgroup?.end_date
                                    ? format(
                                        parseISO(
                                          pageData.studentgroup?.end_date
                                        ),
                                        "MM/dd/yyyy"
                                      )
                                    : null,
                                }}
                                fields={[
                                  {
                                    title: "Name",
                                    name: "name",
                                  },
                                  {
                                    title: "Start Date",
                                    name: "start_date",
                                  },
                                  {
                                    title: "End Date",
                                    name: "end_date",
                                  },
                                ]}
                              />
                            )}
                            <FindGeneric
                              route="studentgroups"
                              title="Student Group To"
                              scope="studentgroup"
                              required
                              InputContext={InputContext}
                              defaultValue={{
                                id: null,
                                name: null,
                                start_date: null,
                                end_date: null,
                              }}
                              fields={[
                                {
                                  title: "Name",
                                  name: "name",
                                },
                                {
                                  title: "Start Date",
                                  name: "start_date",
                                },
                                {
                                  title: "End Date",
                                  name: "end_date",
                                },
                              ]}
                            />
                            <InputLine>
                              <DatePicker
                                name="date"
                                grow
                                required
                                title="Transfer Date"
                                defaultValue={pageData.date}
                                placeholderText="MM/DD/YYYY"
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
