import React, { useRef, useState, useEffect, createContext, useContext } from 'react';

import { Form } from "@unform/web";

import Preview from '~/components/Preview';
import RegisterFormMenu from "~/components/RegisterForm/Menu";
import { ClipboardPlus, TreePalm } from "lucide-react";
import FileInputMultiple from "~/components/RegisterForm/FileInputMultiple";
import InputLine from "~/components/RegisterForm/InputLine";
import DatePicker from "~/components/RegisterForm/DatePicker";
import Input from "~/components/RegisterForm/Input";
import FormHeader from "~/components/RegisterForm/FormHeader";
import { FullGridContext } from "../..";
import api from "~/services/api";
import { format } from 'date-fns';
import { toast } from "react-toastify";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import uploadFile from "~/functions/uploadFile";
import JSZip from 'jszip';
import { storage } from '~/services/firebase';

export const InputContext = createContext({});

export default function MedicalCertificateVacation({
  access,
  id,
  defaultFormType = "preview",
  selected,
  handleOpened
}) {
  const { successfullyUpdated, setSuccessfullyUpdated } =
      useContext(FullGridContext);
  const [formType, setFormType] = useState(defaultFormType);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Vacation");
  const [pageData, setPageData] = useState({
    loaded: false,
    name: "",
    last_name: "",
    loaded: true,
    installment_amount: 0,
    date_from: null,
    date_to: null,
    data: [],
  });
  const [registry, setRegistry] = useState({
    created_by: null,
    created_at: null,
    updated_by: null,
    updated_at: null,
    canceled_by: null,
    canceled_at: null,
  });

  const generalForm = useRef();

  useEffect(() => {
    async function loadData() {
      const { data } = await api.get(`/students/${selected[0].id}`);

      const { last_name, name } = data

      console.log(last_name, name)

      setPageData(state => ({ ...state, name, last_name, loaded: true }));
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadData() {
      setPageData(state => ({ ...state, data: [], loaded: false }));
      const { data } = await api.get(`/students/${activeMenu.replace(/\s+/g, "_")}/${selected[0].id}`);
      setPageData(state => ({ ...state, data, loaded: true }));
    }
    loadData();
  }, [activeMenu]);

  function handleCloseForm() {
    if (!successfullyUpdated) {
      toast("Changes discarted!", { autoClose: 1000 });
    }
    handleOpened(null);
  }

  async function handleGeneralFormSubmit(data) {
    const { date_from, date_to, note, files } = data;

    const allPromises = [];

    for (let i = 0; i < files.length; i++) {
      allPromises.push(uploadFile(
        files[i],
        `Students/${activeMenu.replace(/\s+/g, "_")}`
      ));
    }

    Promise.all(allPromises).then(async (files_res) => {
      try {
        const { data } = await api.post(`/students/${activeMenu.replace(/\s+/g, "_")}`, {
          student_id: selected[0].id,
          date_from,
          date_to,
          note,
          files: files_res,
        });

        toast(`${activeMenu.replace(/\s+/g, " ")} Added successfully`, { autoClose: 1000 });

        setPageData(state => ({ ...state, data, loaded: true }));

        setSuccessfullyUpdated(true);

        generalForm.current.reset();

        // handleOpened(null);
      } catch (err) {
        console.log(err);
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    })

  }

  async function handlerDownload(files) {
    const zip = new JSZip();

    for (const path of files) {
      const fileRef = ref(storage, path.url);
      const url = await getDownloadURL(fileRef);

      const response = await fetch(url);
      const blob = await response.blob();

      const filename = path.url.split('/').pop();
      zip.file(filename, blob);
    }

    // Gerar o zip
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Criar link para download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = 'files.zip';
    link.click();
  }

  return (
    <Preview formType={formType} fullscreen={fullscreen}>
        <div className="flex h-full flex-row items-start justify-between gap-4">
          <div className="flex flex-col items-center justify-between text-xs w-32 gap-4">
            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="Vacation"
            >
              <TreePalm size={16} /> Vacation
            </RegisterFormMenu>
            <RegisterFormMenu
              setActiveMenu={setActiveMenu}
              activeMenu={activeMenu}
              name="Medical Excuse"
            >
              <ClipboardPlus size={16} /> Medical Excuse
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
                  <>
                    <FormHeader
                      access={access}
                      title={
                        activeMenu+" - " +
                        pageData.name +
                        " " +
                        pageData.last_name
                      }
                      registry={registry}
                      InputContext={InputContext}
                    />
                    <InputLine title={"Add "+activeMenu}>
                      <DatePicker
                        name="date_from"
                        grow
                        required
                        title="Date From "
                        defaultValue={pageData.entry_date}
                        placeholderText="MM/DD/YYYY"
                        InputContext={InputContext}
                      />

                      <DatePicker
                        name="date_to"
                        grow
                        required
                        title={'Date To'}
                        defaultValue={pageData.date_to}
                        placeholderText="MM/DD/YYYY"
                        InputContext={InputContext}
                      />
                      <Input
                        name="note"
                        grow
                        required
                        title={'Note'}
                        defaultValue={pageData.note}
                        placeholder="Enter a note"
                        InputContext={InputContext}
                      />
                      <FileInputMultiple
                        type="file"
                        name="files"
                        required
                        title={"Multiple Files"}
                        grow
                        InputContext={InputContext}
                      />
                    </InputLine>
                  </>
                </InputContext.Provider>
              </Form>
              <div className='px-4 w-full flex-grow flex h-screen'>
                {pageData.data.length > 0 && (
                  <div className="relative flex flex-1 justify-start w-full overflow-y-scroll bg-secondary-50 rounded-xl" style={{ height: 'min-content' }}>
                    <table className="w-full table-auto text-xs text-left whitespace-nowrap">
                      <thead className="sticky top-0 bg-secondary-50 z-10">
                        <tr>
                          <th className="p-2">Date From</th>
                          <th className="p-2">Date To</th>
                          <th className="p-2">Note</th>
                          <th className="p-2 min-w-[260px] text-right" style={{ width: '260px' }}>File</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageData.data.map((res, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 bg-white">{format(new Date(res.date_from), "yyyy-MM-dd")}</td>
                            <td className="px-4 py-2 bg-white">{format(new Date(res.date_to), "yyyy-MM-dd")}</td>
                            <td className="px-4 py-2 bg-white">{res.note}</td>
                            <td className='px-4 py-2 bg-white text-center flex justify-end'>
                              {res.files.length > 0 && (
                                <button
                                  className='font-bold bg-primary text-white rounded-md px-2 py-1 h-6 flex items-center justify-center text-xs'
                                  onClick={() => handlerDownload(res.files)}
                                >
                                  Download {res.files.length} files
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </Preview>
  );
}
