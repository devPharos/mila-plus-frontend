import { Form } from '@unform/web';
import { Building, Pencil, X } from 'lucide-react';
import React, { createContext, useEffect, useRef, useState } from 'react';
import Input from '~/components/RegisterForm/Input';
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
import { format, parseISO } from 'date-fns';

export const InputContext = createContext({})

export default function PagePreview({ access, id, handleOpened, setOpened, defaultFormType = 'preview' }) {
    const [pageData, setPageData] = useState({
        name: '',
        last_name: '',
        email: '',
        preferred_contact_form: '',
        visa_expiration: null,
        birth_country: '',
        birth_state: '',
        birth_city: '',
        gender: null,
        date_of_birth: null,
        passport_number: '',
        visa_number: '',
        nsevis: '',
        whatsapp: '',
        whatsapp_ddi: '',
        home_country_phone_ddi: '',
        home_country_phone: '',
        address: '',
    })
    const [formType, setFormType] = useState(defaultFormType)
    const [fullscreen, setFullscreen] = useState(false)
    const [activeMenu, setActiveMenu] = useState('general')
    const [successfullyUpdated, setSuccessfullyUpdated] = useState(true)
    const [registry, setRegistry] = useState({ created_by: null, created_at: null, updated_by: null, updated_at: null, canceled_by: null, canceled_at: null })
    const generalForm = useRef()

    const optionsCategories = [{ value: 'prospect', label: 'Prospect' }]
    const optionsTypes = [{ value: 'initial', label: 'Initial' }]
    const optionsStatus = [{ value: 'sales', label: 'Sales' }]
    const genderOptions = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'not specified', label: 'Not Specified' }]

    const countriesOptions = countries_list.map(country => {
        return { value: country, label: country }
    })

    useEffect(() => {
        async function getPageData() {
            try {
                const { data } = await api.get(`/students/${id}`)
                setPageData(data)
                const { created_by, created_at, updated_by, updated_at, canceled_by, canceled_at } = data;
                const registries = await getRegistries({ created_by, created_at, updated_by, updated_at, canceled_by, canceled_at })
                setRegistry(registries)
            } catch (err) {
                toast(err.response.data.error, { type: 'error', autoClose: 3000 })
            }
        }

        if (id === 'new') {
            setFormType('full')
        } else if (id) {
            getPageData()
        }
    }, [])

    async function handleGeneralFormSubmit(data) {
        if (successfullyUpdated) {
            toast("No need to be saved!", { autoClose: 1000, type: 'info', transition: Zoom })
            return
        }
        if (id === 'new') {
            try {
                const { date_of_birth, visa_expiration } = data;
                const response = await api.post(`/students`, { ...data, date_of_birth: format(date_of_birth, 'yyyy-MM-dd'), visa_expiration: format(visa_expiration, 'yyyy-MM-dd') })
                setOpened(response.data.id)
                setPageData({ ...pageData, ...data })
                setSuccessfullyUpdated(true)
                toast("Saved!", { autoClose: 1000 })
                handleOpened(null)
            } catch (err) {
                toast(err.response.data.error, { type: 'error', autoClose: 3000 })
            }
        } else if (id !== 'new') {
            const updated = handleUpdatedFields(data, pageData)

            if (updated.length > 0) {
                const objUpdated = Object.fromEntries(updated);
                const { date_of_birth, visa_expiration } = objUpdated;
                try {
                    await api.put(`/students/${id}`, { ...objUpdated, date_of_birth: format(date_of_birth, 'yyyy-MM-dd'), visa_expiration: format(visa_expiration, 'yyyy-MM-dd') })
                    setPageData({ ...pageData, ...objUpdated })
                    setSuccessfullyUpdated(true)
                    toast("Saved!", { autoClose: 1000 })
                    handleOpened(null)
                } catch (err) {
                    console.log(err)
                    toast(err.response.data.error, { type: 'error', autoClose: 3000 })
                }
            } else {
                console.log(updated)
            }
        }
    }

    function handleCloseForm() {
        if (!successfullyUpdated) {
            toast("Changes discarted!", { autoClose: 1000 })
        }
        handleOpened(null)
    }

    async function handleInactivate() {
        try {
            await api.delete(`students/${id}`)
            toast("Group Inactivated!", { autoClose: 1000 })
            handleOpened(null)
        } catch (err) {
            toast(err.response.data.error, { type: 'error', autoClose: 3000 })
        }
    }

    return <Preview formType={formType} fullscreen={fullscreen}>
        {pageData ?
            formType === 'preview' ? <div className='border h-full rounded-xl overflow-hidden flex flex-col justify-start gap-1 overflow-y-scroll'>
                <div className='relative bg-gray-100 h-16 px-4 py-2 flex flex-row items-start justify-start'>

                    <button onClick={() => setFormType('full')} className='absolute top-2 right-20 text-md font-bold bg-mila_orange text-white rounded-md p-1 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1'>
                        <Pencil size={16} color="#fff" /> Open
                    </button>
                    <button onClick={() => handleOpened(null)} className='absolute top-2 right-2 text-md font-bold bg-secondary rounded-md p-1 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1'>
                        <X size={16} /> Close
                    </button>
                    <h2 style={{ fontSize: 24 }}>{pageData.name}</h2>

                </div>
                <div className='flex flex-1 flex-col items-left px-4 py-2 gap-1'>
                    <p className='border-b mb-1 pb-1'>Prospect Information</p>
                    <div className='flex flex-row items-center gap-1 text-xs'><strong>Name:</strong> {pageData.name}</div>
                </div>

            </div>
                :
                <div className='flex h-full flex-row items-start justify-between gap-4'>

                    <div className='flex flex-col items-center justify-between text-xs w-32 gap-4'>
                        <RegisterFormMenu setActiveMenu={setActiveMenu} activeMenu={activeMenu} name='general' >
                            <Building size={16} /> General
                        </RegisterFormMenu>

                    </div>
                    <div className='border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start'>
                        <div className='flex flex-col items-start justify-start text-sm overflow-y-scroll'>
                            <Form ref={generalForm} onSubmit={handleGeneralFormSubmit} className='w-full'>
                                <InputContext.Provider value={{ id, generalForm, setSuccessfullyUpdated, fullscreen, setFullscreen, successfullyUpdated, handleCloseForm, handleInactivate, canceled: pageData.canceled_at }}>

                                    <FormHeader access={access} title={pageData.name} registry={registry} InputContext={InputContext} />

                                    <InputLineGroup title='GENERAL' activeMenu={activeMenu === 'general'}>
                                        <InputLine title='General Data'>
                                            <Input type='text' name='name' required grow title='Name' defaultValue={pageData.name} InputContext={InputContext} />
                                            <Input type='text' name='middle_name' grow title='Middle Name' defaultValue={pageData.middle_name} InputContext={InputContext} />
                                            <Input type='text' name='last_name' required grow title='Last Name' defaultValue={pageData.last_name} InputContext={InputContext} />
                                            {id === 'new' || pageData.gender ? <SelectPopover name='gender' required title='Gender' isSearchable defaultValue={genderOptions.find(gender => gender.value === pageData.gender)} options={genderOptions} InputContext={InputContext} /> : null}
                                            {id === 'new' || pageData.date_of_birth ? <DatePicker name='date_of_birth' grow title='Birthday ' defaultValue={parseISO(pageData.date_of_birth)} placeholderText='MM/DD/YYYY' InputContext={InputContext} /> : null}
                                        </InputLine>
                                        <InputLine>
                                            <Input type='text' name='passport_number' grow title='Passport Number' placeholder='-----' defaultValue={pageData.passport_number} InputContext={InputContext} />
                                            <Input type='text' name='visa_number' grow title='Visa Number' placeholder='-----' defaultValue={pageData.visa_number} InputContext={InputContext} />
                                            {id === 'new' || pageData.visa_expiration ? <DatePicker name='visa_expiration' required title='Visa Expiration' defaultValue={parseISO(pageData.visa_expiration)} placeholderText='MM/DD/YYYY' InputContext={InputContext} /> : null}
                                            <Input type='text' name='nsevis' title='NSEVIS' grow defaultValue={pageData.nsevis} placeholder='-----' InputContext={InputContext} />
                                        </InputLine>
                                        <InputLine title='Contact'>
                                            <Input type='text' name='email' title='E-mail' grow defaultValue={pageData.email} InputContext={InputContext} />
                                            <Input type='text' grow name='whatsapp' hasDDI title='Whatsapp' isPhoneNumber defaultValue={pageData.whatsapp} defaultValueDDI={pageData.whatsapp_ddi} InputContext={InputContext} />
                                            <Input type='text' grow name='home_country_phone' hasDDI title='Home Country Phone' isPhoneNumber defaultValue={pageData.home_country_phone} InputContext={InputContext} />
                                        </InputLine>
                                        <InputLine>
                                            <Input type='text' name='preferred_contact_form' title='Preferred Contact Form' defaultValue={pageData.preferred_contact_form} InputContext={InputContext} />
                                        </InputLine>
                                        <InputLine title='Location'>
                                            {id === 'new' || pageData.birth_country ? <SelectPopover name='birth_country' required grow title='Country' options={countriesOptions} isSearchable defaultValue={countriesOptions.find(country => country.value === pageData.birth_country)} InputContext={InputContext} /> : null}
                                            <Input type='text' name='birth_state' required grow title='State' defaultValue={pageData.birth_state} InputContext={InputContext} />
                                            <Input type='text' name='birth_city' required grow title='City' defaultValue={pageData.birth_city} InputContext={InputContext} />
                                        </InputLine>

                                        <InputLine>
                                            <Textarea type='text' required name='foreign_address' title='Address' rows={5} defaultValue={pageData.foreign_address} InputContext={InputContext} />
                                        </InputLine>
                                    </InputLineGroup>


                                </InputContext.Provider>
                            </Form>
                        </div>

                    </div>
                </div>
            : null}

    </Preview>;
}
