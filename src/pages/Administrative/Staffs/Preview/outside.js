import { Form } from '@unform/web';
import { Building, CheckCircle, Files, Pencil, X } from 'lucide-react';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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
import Textarea from '~/components/RegisterForm/Textarea';
import DatePicker from '~/components/RegisterForm/DatePicker';
import { format, parseISO, set } from 'date-fns';
import CountryList from 'country-list-with-dial-code-and-flag';
import FormLoading from '~/components/RegisterForm/FormLoading';
import { useSelector } from 'react-redux';
import CheckboxInput from '~/components/RegisterForm/CheckboxInput';
import { AlertContext } from '~/App';
import { Scope } from '@unform/core';
import FileInputMultiple from '~/components/RegisterForm/FileInputMultiple';
import { organizeMultiAndSingleFiles } from '~/functions/uploadFile';
import { useSearchParams } from 'react-router-dom';

export const InputContext = createContext({})

export default function PagePreviewOutside({ access = null, id = null, handleOpened, setOpened, defaultFormType = 'preview' }) {
    const [pageData, setPageData] = useState({
        documents: [],
        name: '',
        last_name: '',
        email: '',
        birth_country: '',
        state: '',
        city: '',
        date_of_birth: null,
        whatsapp: '',
        address: '',
        sunday_availability: false,
        monday_availability: false,
        tuesday_availability: false,
        wednesday_availability: false,
        thursday_availability: false,
        friday_availability: false,
        saturday_availability: false,
        sunday_morning: false,
        sunday_afternoon: false,
        sunday_evening: false,
        monday_morning: false,
        monday_afternoon: false,
        monday_evening: false,
        tuesday_morning: false,
        tuesday_afternoon: false,
        tuesday_evening: false,
        wednesday_morning: false,
        wednesday_afternoon: false,
        wednesday_evening: false,
        thursday_morning: false,
        thursday_afternoon: false,
        thursday_evening: false,
        friday_morning: false,
        friday_afternoon: false,
        friday_evening: false,
        saturday_morning: false,
        saturday_afternoon: false,
        saturday_evening: false,
        comments: '',
        wage_amount: 0,
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

    const countriesOptions = countries_list.map(country => {
        return { value: country, label: country }
    })

    useEffect(() => {
        const params = atob(searchparams.get('crypt')).split('-');
        id = atob(params[0]);
        const filial_id = atob(params[1]);
        setPageData({ ...pageData, filial_id })
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
                    const { data } = await api.get(`/outside/staffs/${id}`)
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
        }
        getPageData()
    }, [])

    useEffect(() => {
        if (pageData.employee_type && pageData.employee_subtype) {
            getDocuments()
        }
        async function getDocuments() {
            const documents = await api.get(`/documentsByOrigin?origin=Employees&type=${pageData.employee_type}&subtype=${pageData.employee_subtype}`)
            setPageData({ ...pageData, documents: documents.data })
        }
    }, [pageData.employee_type, pageData.employee_subtype])

    async function handleGeneralFormSubmit(data) {
        setLoading(true)
        const params = atob(searchparams.get('crypt')).split('-');
        id = atob(params[0]);
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
                if (data.documents.length > 0) {
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

    function handleAvailability(day) {
        if (day === 'sunday') {
            if (pageData.sunday_availability) {
                setPageData({ ...pageData, sunday_availability: false, sunday_morning: false, sunday_afternoon: false, sunday_evening: false })
            } else {
                setPageData({ ...pageData, sunday_availability: true })
            }
        } else if (day === 'monday') {
            if (pageData.monday_availability) {
                setPageData({ ...pageData, monday_availability: false, monday_morning: false, monday_afternoon: false, monday_evening: false })
            } else {
                setPageData({ ...pageData, monday_availability: true })
            }
        } else if (day === 'tuesday') {
            if (pageData.tuesday_availability) {
                setPageData({ ...pageData, tuesday_availability: false, tuesday_morning: false, tuesday_afternoon: false, tuesday_evening: false })
            } else {
                setPageData({ ...pageData, tuesday_availability: true })
            }
        } else if (day === 'wednesday') {
            if (pageData.wednesday_availability) {
                setPageData({ ...pageData, wednesday_availability: false, wednesday_morning: false, wednesday_afternoon: false, wednesday_evening: false })
            } else {
                setPageData({ ...pageData, wednesday_availability: true })
            }
        } else if (day === 'thursday') {
            if (pageData.thursday_availability) {
                setPageData({ ...pageData, thursday_availability: false, thursday_morning: false, thursday_afternoon: false, thursday_evening: false })
            } else {
                setPageData({ ...pageData, thursday_availability: true })
            }
        } else if (day === 'friday') {
            if (pageData.friday_availability) {
                setPageData({ ...pageData, friday_availability: false, friday_morning: false, friday_afternoon: false, friday_evening: false })
            } else {
                setPageData({ ...pageData, friday_availability: true })
            }
        } else if (day === 'saturday') {
            if (pageData.saturday_availability) {
                setPageData({ ...pageData, saturday_availability: false, saturday_morning: false, saturday_afternoon: false, saturday_evening: false })
            } else {
                setPageData({ ...pageData, saturday_availability: true })
            }
        }
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
                    <RegisterFormMenu setActiveMenu={setActiveMenu} activeMenu={activeMenu} name='documents' disabled={id === 'new'} messageOnDisabled='Create the staff registry to have access to documents.' >
                        <Files size={16} /> Documents
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
                                                <SelectPopover name='birth_country' required grow title='Nationality' options={countriesOptions} isSearchable defaultValue={countriesOptions.find(country => country.value === pageData.birth_country)} InputContext={InputContext} />
                                                <DatePicker name='date_of_birth' required grow title='Birthday ' defaultValue={pageData.date_of_birth ? parseISO(pageData.date_of_birth) : null} placeholderText='MM/DD/YYYY' InputContext={InputContext} />
                                            </InputLine>
                                            <InputLine title='Contact'>
                                                <Input type='text' grow name='whatsapp' title='Whatsapp' isPhoneNumber defaultValue={pageData.whatsapp} defaultValueDDI={pageData.whatsapp_ddi} InputContext={InputContext} />
                                                <Input type='text' grow name='phone' title='Phone Number' isPhoneNumber defaultValue={pageData.phone} InputContext={InputContext} />
                                            </InputLine>
                                            <InputLine title='Location'>
                                                <Input type='text' name='address' required grow title='Address' defaultValue={pageData.address} InputContext={InputContext} />
                                            </InputLine>
                                            <InputLine>
                                                <Input type='text' name='state' required grow title='State' defaultValue={pageData.state} InputContext={InputContext} />
                                                <Input type='text' name='city' required grow title='City' defaultValue={pageData.city} InputContext={InputContext} />
                                                <Input type='text' name='zip' required grow title='Zip Code' defaultValue={pageData.zip} InputContext={InputContext} />
                                            </InputLine>
                                            <InputLine title='Availability'>
                                                <div className='flex flex-col md:flex-row items-center justify-start gap-4'>
                                                    <CheckboxInput name='sunday_availability' grow title='Sunday' onClick={() => handleAvailability('sunday')} defaultValue={pageData.sunday_availability} InputContext={InputContext} />
                                                    {pageData.sunday_availability &&
                                                        <div className='flex flex-row items-start justify-start gap-1'>
                                                            <CheckboxInput name='sunday_morning' grow title='Morning' onClick={() => setPageData({ ...pageData, sunday_morning: !pageData.sunday_morning })} defaultValue={pageData.sunday_morning} InputContext={InputContext} />
                                                            <CheckboxInput name='sunday_afternoon' grow title='Afternoon' onClick={() => setPageData({ ...pageData, sunday_afternoon: !pageData.sunday_afternoon })} defaultValue={pageData.sunday_afternoon} InputContext={InputContext} />
                                                            <CheckboxInput name='sunday_evening' grow title='Evening' onClick={() => setPageData({ ...pageData, sunday_evening: !pageData.sunday_evening })} defaultValue={pageData.sunday_evening} InputContext={InputContext} />
                                                        </div>
                                                    }
                                                </div>
                                            </InputLine>
                                            <InputLine>
                                                <div className='flex flex-col md:flex-row items-center justify-start gap-4'>
                                                    <CheckboxInput name='monday_availability' grow title='Monday' onClick={() => handleAvailability('monday')} defaultValue={pageData.monday_availability} InputContext={InputContext} />
                                                    {pageData.monday_availability &&
                                                        <div className='flex flex-row items-start justify-start gap-1'>
                                                            <CheckboxInput name='monday_morning' grow title='Morning' onClick={() => setPageData({ ...pageData, monday_morning: !pageData.monday_morning })} defaultValue={pageData.monday_morning} InputContext={InputContext} />
                                                            <CheckboxInput name='monday_afternoon' grow title='Afternoon' onClick={() => setPageData({ ...pageData, monday_afternoon: !pageData.monday_afternoon })} defaultValue={pageData.monday_afternoon} InputContext={InputContext} />
                                                            <CheckboxInput name='monday_evening' grow title='Evening' onClick={() => setPageData({ ...pageData, monday_evening: !pageData.monday_evening })} defaultValue={pageData.monday_evening} InputContext={InputContext} />
                                                        </div>
                                                    }
                                                </div>
                                            </InputLine>
                                            <InputLine>
                                                <div className='flex flex-col md:flex-row items-center justify-start gap-4'>
                                                    <CheckboxInput name='tuesday_availability' grow title='Tuesday' onClick={() => handleAvailability('tuesday')} defaultValue={pageData.tuesday_availability} InputContext={InputContext} />
                                                    {pageData.tuesday_availability &&
                                                        <div className='flex flex-row items-start justify-start gap-1'>
                                                            <CheckboxInput name='tuesday_morning' grow title='Morning' onClick={() => setPageData({ ...pageData, tuesday_morning: !pageData.tuesday_morning })} defaultValue={pageData.tuesday_morning} InputContext={InputContext} />
                                                            <CheckboxInput name='tuesday_afternoon' grow title='Afternoon' onClick={() => setPageData({ ...pageData, tuesday_afternoon: !pageData.tuesday_afternoon })} defaultValue={pageData.tuesday_afternoon} InputContext={InputContext} />
                                                            <CheckboxInput name='tuesday_evening' grow title='Evening' onClick={() => setPageData({ ...pageData, tuesday_evening: !pageData.tuesday_evening })} defaultValue={pageData.tuesday_evening} InputContext={InputContext} />
                                                        </div>
                                                    }
                                                </div>
                                            </InputLine>
                                            <InputLine>
                                                <div className='flex flex-col md:flex-row items-center justify-start gap-4'>
                                                    <CheckboxInput name='wednesday_availability' grow title='Wednesday' onClick={() => handleAvailability('wednesday')} defaultValue={pageData.wednesday_availability} InputContext={InputContext} />
                                                    {pageData.wednesday_availability &&
                                                        <div className='flex flex-row items-start justify-start gap-1'>
                                                            <CheckboxInput name='wednesday_morning' grow title='Morning' onClick={() => setPageData({ ...pageData, wednesday_morning: !pageData.wednesday_morning })} defaultValue={pageData.wednesday_morning} InputContext={InputContext} />
                                                            <CheckboxInput name='wednesday_afternoon' grow title='Afternoon' onClick={() => setPageData({ ...pageData, wednesday_afternoon: !pageData.wednesday_afternoon })} defaultValue={pageData.wednesday_afternoon} InputContext={InputContext} />
                                                            <CheckboxInput name='wednesday_evening' grow title='Evening' onClick={() => setPageData({ ...pageData, wednesday_evening: !pageData.wednesday_evening })} defaultValue={pageData.wednesday_evening} InputContext={InputContext} />
                                                        </div>
                                                    }
                                                </div>
                                            </InputLine>
                                            <InputLine>
                                                <div className='flex flex-col md:flex-row items-center justify-start gap-4'>
                                                    <CheckboxInput name='thursday_availability' grow title='Thursday' onClick={() => handleAvailability('thursday')} defaultValue={pageData.thursday_availability} InputContext={InputContext} />
                                                    {pageData.thursday_availability &&
                                                        <div className='flex flex-row items-start justify-start gap-1'>
                                                            <CheckboxInput name='thursday_morning' grow title='Morning' onClick={() => setPageData({ ...pageData, thursday_morning: !pageData.thursday_morning })} defaultValue={pageData.thursday_morning} InputContext={InputContext} />
                                                            <CheckboxInput name='thursday_afternoon' grow title='Afternoon' onClick={() => setPageData({ ...pageData, thursday_afternoon: !pageData.thursday_afternoon })} defaultValue={pageData.thursday_afternoon} InputContext={InputContext} />
                                                            <CheckboxInput name='thursday_evening' grow title='Evening' onClick={() => setPageData({ ...pageData, thursday_evening: !pageData.thursday_evening })} defaultValue={pageData.thursday_evening} InputContext={InputContext} />
                                                        </div>
                                                    }
                                                </div>
                                            </InputLine>
                                            <InputLine>
                                                <div className='flex flex-col md:flex-row items-center justify-start gap-4'>
                                                    <CheckboxInput name='friday_availability' grow title='Friday' onClick={() => handleAvailability('friday')} defaultValue={pageData.friday_availability} InputContext={InputContext} />
                                                    {pageData.friday_availability &&
                                                        <div className='flex flex-row items-start justify-start gap-1'>
                                                            <CheckboxInput name='friday_morning' grow title='Morning' onClick={() => setPageData({ ...pageData, friday_morning: !pageData.friday_morning })} defaultValue={pageData.friday_morning} InputContext={InputContext} />
                                                            <CheckboxInput name='friday_afternoon' grow title='Afternoon' onClick={() => setPageData({ ...pageData, friday_afternoon: !pageData.friday_afternoon })} defaultValue={pageData.friday_afternoon} InputContext={InputContext} />
                                                            <CheckboxInput name='friday_evening' grow title='Evening' onClick={() => setPageData({ ...pageData, friday_evening: !pageData.friday_evening })} defaultValue={pageData.friday_evening} InputContext={InputContext} />
                                                        </div>
                                                    }
                                                </div>
                                            </InputLine>
                                            <InputLine>
                                                <div className='flex flex-col md:flex-row items-center justify-start gap-4'>
                                                    <CheckboxInput name='saturday_availability' grow title='Saturday' onClick={() => handleAvailability('saturday')} defaultValue={pageData.saturday_availability} InputContext={InputContext} />
                                                    {pageData.saturday_availability &&
                                                        <div className='flex flex-row items-start justify-start gap-1'>
                                                            <CheckboxInput name='saturday_morning' grow title='Morning' onClick={() => setPageData({ ...pageData, saturday_morning: !pageData.saturday_morning })} defaultValue={pageData.saturday_morning} InputContext={InputContext} />
                                                            <CheckboxInput name='saturday_afternoon' grow title='Afternoon' onClick={() => setPageData({ ...pageData, saturday_afternoon: !pageData.saturday_afternoon })} defaultValue={pageData.saturday_afternoon} InputContext={InputContext} />
                                                            <CheckboxInput name='saturday_evening' grow title='Evening' onClick={() => setPageData({ ...pageData, saturday_evening: !pageData.saturday_evening })} defaultValue={pageData.saturday_evening} InputContext={InputContext} />
                                                        </div>
                                                    }
                                                </div>
                                            </InputLine>
                                            <Input type='hidden' name='employee_type' defaultValue={pageData.employee_type} InputContext={InputContext} />
                                            <Input type='hidden' name='employee_subtype' defaultValue={pageData.employee_subtype} InputContext={InputContext} />

                                        </InputLineGroup>
                                        <InputLineGroup title='DOCUMENTS' activeMenu={activeMenu === 'documents'}>

                                            {pageData.documents && pageData.documents.length > 0 && pageData.documents.map((document, index) => {
                                                return <Scope key={index} path={`documents[${index}]`} >
                                                    <Input type='hidden' name='document_id' defaultValue={document.id} InputContext={InputContext} />
                                                    <InputLine title={document.title}>
                                                        {!document.multiple && pageData.staffdocuments && pageData.staffdocuments.filter(staffdocument => staffdocument.document_id === document.id).length === 0 &&
                                                            <FileInput type='file' name='file_id' title={'File'} grow InputContext={InputContext} />
                                                        }
                                                        {document.multiple &&
                                                            <FileInputMultiple type='file' name='file_id' title={'Multiple Files'} grow InputContext={InputContext} />
                                                        }
                                                    </InputLine>
                                                    <InputLine subtitle='Attached Files'>
                                                        <div className='flex flex-col justify-center items-start gap-4'>
                                                            {
                                                                pageData.staffdocuments && pageData.staffdocuments.map((staffdocument, index) => {
                                                                    if (staffdocument.document_id === document.id) {
                                                                        return <>
                                                                            <div className='flex flex-row justify-center items-center gap-2'>
                                                                                <a href={staffdocument.file.url} target="_blank" className='text-xs'>
                                                                                    <div className='flex flex-row items-center border px-4 py-2 gap-1 rounded-md bg-gray-100 hover:border-gray-300' key={index}>
                                                                                        <Files size={16} />
                                                                                        {staffdocument.file.name}
                                                                                    </div>
                                                                                </a>
                                                                            </div>
                                                                        </>
                                                                    }
                                                                })}
                                                        </div>
                                                    </InputLine>
                                                </Scope>
                                            })}

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
