import { Form } from '@unform/web';
import { Building, CheckCircle, Files } from 'lucide-react';
import React, { createContext, useEffect, useRef, useState } from 'react';
import Input from '~/components/RegisterForm/Input';
import FileInput from '~/components/RegisterForm/FileInput';
import RegisterFormMenu from '~/components/RegisterForm/Menu';
import api from '~/services/api';
import { Zoom, toast } from 'react-toastify';
import InputLine from '~/components/RegisterForm/InputLine';
import InputLineGroup from '~/components/RegisterForm/InputLineGroup';
import FormHeader from '~/components/RegisterForm/FormHeader';
import Preview from '~/components/Preview';
import { countries_list, getRegistries, handleUpdatedFields } from '~/functions';
import SelectPopover from '~/components/RegisterForm/SelectPopover';
import DatePicker from '~/components/RegisterForm/DatePicker';
import { format, parseISO } from 'date-fns';
import CountryList from 'country-list-with-dial-code-and-flag';
import FormLoading from '~/components/RegisterForm/FormLoading';
import { Scope } from '@unform/core';
import FileInputMultiple from '~/components/RegisterForm/FileInputMultiple';
import { organizeMultiAndSingleFiles } from '~/functions/uploadFile';
import { useSearchParams } from 'react-router-dom';

export const InputContext = createContext({})

export default function EnrollmentOutside({ access = null, id = null, handleOpened, setOpened, defaultFormType = 'preview' }) {
    const [pageData, setPageData] = useState({
        loaded: false
    })
    const [searchparams, setSearchParams] = useSearchParams();
    const [formType, setFormType] = useState(defaultFormType)
    const [fullscreen, setFullscreen] = useState(false)
    const [activeMenu, setActiveMenu] = useState('general')
    const [successfullyUpdated, setSuccessfullyUpdated] = useState(true)
    const [registry, setRegistry] = useState({ created_by: null, created_at: null, updated_by: null, updated_at: null, canceled_by: null, canceled_at: null })
    const generalForm = useRef()
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [agentOptions, setAgentOptions] = useState([])

    const countriesOptions = countries_list.map(country => {
        return { value: country, label: country }
    })

    const applicationsOptions = [{ value: 'Initial F-1 Visa', label: 'Initial F-1 Visa' }, { value: 'Change of Visa Status', label: 'Change of Visa Status' }, { value: 'Reinstatement', label: 'Reinstatement' }, { value: 'Transfer F-1 Visa', label: 'Transfer F-1 Visa' }]

    useEffect(() => {
        const id = atob(searchparams.get('crypt'));
        setPageData({ ...pageData })
        setFullscreen(true);
        setFormType('full');
        async function getCountriesList() {
            const countriesList = CountryList.getAll().map(country => {
                return { value: country.dial_code, label: country.flag + " " + country.dial_code + " " + country.name, code: country.dial_code, name: country.name }
            })

            return countriesList
        }
        async function getPageData() {
            const ddiOptions = await getCountriesList()
            if (id !== 'new') {
                try {
                    const { data } = await api.get(`/outside/enrollments/${id}`)
                    setPageData({ ...data, loaded: true, ddiOptions })
                    const { created_by, created_at, updated_by, updated_at, canceled_by, canceled_at } = data;
                    const registries = await getRegistries({ created_by, created_at, updated_by, updated_at, canceled_by, canceled_at })
                    setRegistry(registries)
                } catch (err) {
                    toast(err.response.data.error, { type: 'error', autoClose: 3000 })
                }
            } else {
                setPageData({ ...pageData, loaded: true, ddiOptions })
                setFormType('full')
            }
            async function getAgents() {
                const { data } = await api.get(`/agents`)
                const retGroupOptions = data.map((agent) => {
                    return { value: agent.id, label: agent.name }
                })
                setAgentOptions(retGroupOptions)
            }
            getAgents()
        }
        getPageData()
    }, [])

    useEffect(() => {
        if (pageData.employee_type && pageData.employee_subtype) {
            getDocuments()
        }
        async function getDocuments() {
            const documents = await api.get(`/documentsByOrigin?origin=Enrollments&type=${pageData.employee_type}&subtype=${pageData.employee_subtype}`)
            setPageData({ ...pageData, documents: documents.data })
        }
    }, [pageData.employee_type, pageData.employee_subtype])

    async function handleGeneralFormSubmit(data) {
        setLoading(true)
        const id = atob(searchparams.get('crypt'));
        if (successfullyUpdated) {
            toast("No need to be saved!", { autoClose: 1000, type: 'info', transition: Zoom })
            setLoading(false)
            return
        }
        if (id !== 'new') {
            const updated = handleUpdatedFields(data, pageData)

            if (updated.length > 0) {
                const objUpdated = Object.fromEntries(updated);
                const { date_of_birth } = objUpdated;
                if (data.documents && data.documents.length > 0) {
                    let toastId = null;
                    if (data.documents.find(document => (typeof document.file_id === 'undefined' && document.file_id) || (typeof document.file_id === 'object' && Array.from(document.file_id).length > 0))) {
                        toastId = toast.loading("Files are being uploaded...");
                    }
                    const allPromises = organizeMultiAndSingleFiles(data.documents, 'Staffs');
                    Promise.all(allPromises).then(async (files) => {
                        try {
                            files.map(async (file) => {
                                if (!file) {
                                    return
                                }
                                if (file.name) {
                                    api.post(`/staffdocuments`, { staff_id: id, files: file })
                                    toastId && toast.update(toastId, { render: 'All files have been uploaded!', type: 'success', autoClose: 3000, isLoading: false });
                                } else {
                                    file.sort((a, b) => a.size > b.size).map(async (promise, index) => {
                                        await Promise.all([promise]).then(async (singleFile) => {
                                            console.log(singleFile[0])
                                            if (index + 1 === file.length) {
                                                toastId && toast.update(toastId, { render: 'All files have been uploaded!', type: 'success', autoClose: 3000, isLoading: false });
                                            }
                                            await api.post(`/staffdocuments`, { staff_id: id, files: singleFile[0] })
                                        })
                                    })
                                }
                            })
                        } catch (err) {
                            console.log(err)
                            // toast(err.response.data.error, { type: 'error', autoClose: 3000 })
                        }
                        delete objUpdated.documents;
                        await api.put(`/outside/staffs/${id}`, { ...objUpdated, date_of_birth: date_of_birth ? format(date_of_birth, 'yyyy-MM-dd') : null })
                        setPageData({ ...pageData, ...objUpdated })
                        setSuccessfullyUpdated(true)
                        toast("Saved!", { autoClose: 1000 })
                        setSent(true);
                        setLoading(false)
                    })
                } else {
                    try {
                        delete objUpdated.documents;
                        await api.put(`/staffs/${id}`, { ...objUpdated, date_of_birth: date_of_birth ? format(date_of_birth, 'yyyy-MM-dd') : null })
                        setPageData({ ...pageData, ...objUpdated })
                        setSuccessfullyUpdated(true)
                        toast("Saved!", { autoClose: 1000 })
                        setSent(true);
                        setLoading(false)
                    } catch (err) {
                        console.log(err)
                        toast(err.response.data.error, { type: 'error', autoClose: 3000 })
                        setLoading(false)
                    }
                }
            } else {
                // console.log(updated)
            }
        }
    }

    function handleCloseForm() {
        if (!successfullyUpdated) {
            toast("Changes discarted!", { autoClose: 1000 })
        }
        handleOpened(null)
    }

    function handleInactivate() {
    }

    function handleOutsideMail() {
    }

    return <Preview formType={formType} fullscreen={fullscreen}>
        {sent && <div className='flex h-full flex-row items-center justify-center text-center gap-4'>
            <CheckCircle size={32} color='#00b361' />
            Thank you!</div>}
        {!sent && pageData ?
            <div className='flex h-full flex-col items-start justify-between gap-4 md:flex-row'>

                <div className='flex flex-row items-center justify-between text-xs w-32 gap-4 md:flex-col'>
                    <RegisterFormMenu setActiveMenu={setActiveMenu} activeMenu={activeMenu} name='general' >
                        <Building size={16} /> General
                    </RegisterFormMenu>
                </div>
                <div className='border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start'>
                    <div className='flex flex-col items-start justify-start text-sm overflow-y-scroll'>
                        <Form ref={generalForm} onSubmit={handleGeneralFormSubmit} className='w-full'>
                            <InputContext.Provider value={{ id, generalForm, setSuccessfullyUpdated, fullscreen, setFullscreen, successfullyUpdated, handleCloseForm, handleInactivate, handleOutsideMail, canceled: pageData.canceled_at }}>
                                {pageData.loaded ?
                                    <>
                                        <FormHeader outside loading={loading} access={access} title={pageData.name + ' ' + pageData.last_name} registry={registry} InputContext={InputContext} />
                                        <InputLineGroup title='GENERAL' activeMenu={activeMenu === 'general'}>
                                            <InputLine title='General Data'>
                                                <SelectPopover name='aplication' required grow title='Are you applying for:' options={applicationsOptions} isSearchable defaultValue={applicationsOptions.find(application => application.value === pageData.aplication)} InputContext={InputContext} />
                                                <SelectPopover name='agent' required grow title='Commercial Agent (MILA):' options={agentOptions} isSearchable defaultValue={agentOptions.find(agent => agent.value === pageData.agent)} InputContext={InputContext} />
                                            </InputLine>
                                        </InputLineGroup>
                                    </>
                                    :
                                    <FormLoading />}


                            </InputContext.Provider>
                        </Form>
                    </div>

                </div>
            </div>
            : null}

    </Preview>;
}
