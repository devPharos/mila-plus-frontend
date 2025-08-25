import { Form } from "@unform/web";
import { Filter } from "lucide-react";
import React, { createContext, useRef, useState } from "react";
import { toast } from "react-toastify";
import Breadcrumbs from "~/components/Breadcrumbs";
import FiltersBar from "~/components/FiltersBar";
import PageHeader from "~/components/PageHeader";
import FileInput from "~/components/RegisterForm/FileInput";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import Select from "~/components/RegisterForm/Select";
import { getCurrentPage } from "~/functions";
import api from "~/services/api";
import FormData from "form-data";

export const InputContext = createContext({});

export default function DataSync() {
  const currentPage = getCurrentPage();
  const generalForm = useRef();
  const [successfullyUpdated, setSuccessfullyUpdated] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [pageData, setPageData] = useState({});
  const [activeMenu, setActiveMenu] = useState("general");
  const [loading, setLoading] = useState(false);

  function handleGeneralFormSubmit(data) {
    setLoading(true);
    const formData = new FormData();
    formData.append("importType", data.import);
    formData.append("file", data.import_file);
    api
      .post("/data-sync/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.status === 200) {
          toast("Data imported!", { autoClose: 1000 });
          setSuccessfullyUpdated(true);
        } else {
          toast("Data not imported!", { autoClose: 1000 });
          setSuccessfullyUpdated(false);
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  }

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    setOpened(null);
  }

  async function handleInactivate() {}
  return (
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4">
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
        <FiltersBar>
          <Filter size={14} /> Custom Filters
        </FiltersBar>
      </PageHeader>
      <div className="flex flex-1 w-full flex-col items-start justify-start text-center gap-4 px-4">
        <h2 className="text-xl font-bold mt-4">Import Data (Only CSV files)</h2>
        <Form
          ref={generalForm}
          onSubmit={handleGeneralFormSubmit}
          encType="multipart/form-data"
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
              handleInactivate,
              canceled: pageData.canceled_at,
            }}
          >
            <InputLineGroup title="Import" activeMenu={true}>
              <InputLine>
                <Select
                  name="import"
                  options={[
                    { label: "Students", value: "Students" },
                    {
                      label: "Medical Excuses & Vacations",
                      value: "Medical Excuses & Vacations",
                    },
                    {
                      label: "Gravity Transactions",
                      value: "EmergepayTransactions",
                    },
                  ]}
                  InputContext={InputContext}
                />
                <FileInput
                  grow
                  accept=".csv"
                  name="import_file"
                  InputContext={InputContext}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="text-md font-bold bg-secondary border hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
                >
                  {loading ? "Loading..." : "Import file"}
                </button>
              </InputLine>
              {/* <h2 className="text-xl font-bold mt-4">Export Data</h2>
              <InputLine>
                <Select
                  name="export"
                  options={[{ label: "Students", value: "Students" }]}
                  InputContext={InputContext}
                />
                <FileInput
                  grow
                  accept=".csv"
                  name="export_file"
                  InputContext={InputContext}
                />
                <button
                  type="submit"
                  className="text-md font-bold bg-secondary border hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
                >
                  Export file
                </button>
              </InputLine> */}
            </InputLineGroup>
          </InputContext.Provider>
        </Form>
      </div>
    </div>
  );
}
