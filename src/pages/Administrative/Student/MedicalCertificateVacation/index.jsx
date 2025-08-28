import React, { useRef, useState, useEffect, createContext, useContext } from 'react';
import { Form } from "@unform/web";
import { ClipboardPlus, TreePalm, Trash, Edit, File } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { toast } from "react-toastify";
import { getDownloadURL, ref } from "firebase/storage";
import JSZip from 'jszip';

import api from "~/services/api";
import { storage } from '~/services/firebase';

import RegisterFormMenu from "~/components/RegisterForm/Menu";
import FileInputMultiple from "~/components/RegisterForm/FileInputMultiple";
import InputLine from "~/components/RegisterForm/InputLine";
import DatePicker from "~/components/RegisterForm/DatePicker";
import Input from "~/components/RegisterForm/Input";
import FormHeader from "~/components/RegisterForm/FormHeader";

import Preview from '~/components/Preview';
import uploadFile from "~/functions/uploadFile";

import { FullGridContext } from "../..";
import { AlertContext } from "~/App";

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
  const { alertBox } = useContext(AlertContext);
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
  const [loading, setLoading] = useState(false);
  // const [idForEdit, setIdForEdit] = useState(null);

  const generalForm = useRef();

  useEffect(() => {
    async function loadData() {
      const { data } = await api.get(`/students/${selected[0].id}`);

      const { last_name, name, registration_number } = data

      setPageData(state => ({ ...state, name, last_name, registration_number, loaded: true }));
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
    setLoading(true);

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
          date_from: format(date_from, "yyyy-MM-dd"),
          date_to: format(date_to, "yyyy-MM-dd"),
          note,
          files: files_res.map((res, i) => ({
            ...res,
            key: i + 1
          })),
        });

        toast(`${activeMenu.replace(/\s+/g, " ")} Added successfully`, { autoClose: 1000 });

        setPageData(state => ({ ...state, data, loaded: true }));

        setSuccessfullyUpdated(true);

        generalForm.current.reset();

        setLoading(false);
        // handleOpened(null);
      } catch (err) {
        // console.log(err);
        setLoading(false);
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    })
  }

  async function handleRemove(valueForDelete) {
    alertBox({
      title: "Attention!",
      descriptionHTML:
        `Are you sure you want to delete this ${activeMenu.replace(/\s+/g, " ")}? \n This operation cannot be undone.`,
      buttons: [
        {
          title: "No",
          class: "cancel",
        },
        {
          title: "Yes",
          onPress: async () => {
            try {
              await api.delete(`/students/${activeMenu.replace(/\s+/g, "_")}/${valueForDelete}`);

              toast(`${activeMenu.replace(/\s+/g, " ")} deleted successfully`, { autoClose: 1000 });

              setPageData((state) => ({
                ...state,
                data: state.data.filter(res => res.id !== valueForDelete)
              }))
            } catch(err) {
              toast(err.response.data.error, { type: "error", autoClose: 3000 });
            }
          },
        },
      ],
    });
  }

  return (
    <Preview formType={formType} fullscreen={fullscreen}>
      <div className="flex h-full flex-row items-start justify-between gap-4">
        <div className="flex flex-col items-center justify-between text-xs w-32 gap-4">
          <RegisterFormMenu
            setActiveMenu={setActiveMenu}
            activeMenu={activeMenu}
            name="Medical Excuse"
          >
            <ClipboardPlus size={16} /> Medical Excuse
          </RegisterFormMenu>
          <RegisterFormMenu
            setActiveMenu={setActiveMenu}
            activeMenu={activeMenu}
            name="Vacation"
          >
            <TreePalm size={16} /> Vacation
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
                <FormHeader
                  access={access}
                  title={
                    activeMenu+" - " +
                    pageData.registration_number + " - " +
                    pageData.name +
                    " " +
                    pageData.last_name
                  }
                  loading={loading}
                  registry={registry}
                  InputContext={InputContext}
                />
                {id === "new" || pageData.loaded && (
                  <>
                    <InputLine title={"Add "+activeMenu}>
                      <DatePicker
                        name="date_from"
                        grow
                        required
                        title="Date From "
                        defaultValue={pageData.date_from}
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
                        title={'Note'}
                        defaultValue={pageData.note}
                        placeholder="Enter a note"
                        InputContext={InputContext}
                      />

                      <FileInputMultiple
                        type="file"
                        name="files"
                        // required={activeMenu === 'Medical Excuse'}
                        title={"Multiple Files"}
                        grow
                        InputContext={InputContext}
                      />
                    </InputLine>
                  </>
                )}
              </InputContext.Provider>
            </Form>
            <div className='px-4 w-full flex-grow flex h-screen'>
              {pageData.data.length > 0 && (
                <div className="relative flex flex-1 justify-start w-full overflow-y-scroll bg-secondary-50 rounded-xl" style={{ height: 'min-content' }}>
                  <table className="w-full table-auto text-xs text-left whitespace-nowrap" style={{ height: 'min-content' }}>
                    <thead className="sticky top-0 bg-secondary-50">
                      <tr>
                        {/* <th className="p-2 min-w-[120px]" style={{ width: '50px' }}></th> */}
                        <th className="p-2 min-w-[120px]" style={{ width: '50px' }}></th>
                        <th className="p-2 min-w-[120px]" style={{ width: '120px' }}>Date From</th>
                        <th className="p-2 min-w-[120px]" style={{ width: '120px' }}>Date To</th>
                        <th className="p-2">Note</th>
                        <th className="p-2 text-left" style={{ width: '200px', maxWidth: '300px' }}>File</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.data.map((res, index) => (
                        <tr key={index}>
                          {/* <td className="px-2 py-2 bg-white" style={{ width: '50px' }}>
                            <button
                              type="button"
                              onClick={() => handleEdit(res.id)}
                              className="bg-white border rounded p-2 hover:bg-red-600 hover:text-white"
                            >
                              <Edit size={16} />
                            </button>
                          </td> */}
                          <td className="px-2 py-2 bg-transparent" style={{ width: '50px' }}>
                            <button
                              type="button"
                              onClick={() => handleRemove(res.id)}
                              className="bg-white border rounded p-2 hover:bg-red-600 hover:text-white"
                            >
                              <Trash size={16} />
                            </button>
                          </td>
                          <td className="px-2 py-2 bg-transparent" style={{ width: '120px' }}>{format(parseISO(res.date_from), "MM/dd/yyyy")}</td>
                          <td className="px-2 py-2 bg-transparent" style={{ width: '120px' }}>{format(parseISO(res.date_to), "MM/dd/yyyy")}</td>
                          <td className="px-2 py-2 bg-transparent">{res.note}</td>
                          <td className="pl-2 py-2 bg-transparent flex flex-wrap gap-2 h-full">
                            {res.files.length > 0 && res.files.map((data, i) => (
                              <a href={`${data.url}`} target='_blank' className='flex flex-row items-center gap-2 bg-white border rounded p-1'>
                                <File size={16} /> File {i + 1}
                              </a>
                            ))}
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
