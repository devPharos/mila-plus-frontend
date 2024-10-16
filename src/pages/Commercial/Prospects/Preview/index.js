import { Form } from '@unform/web';
import { Contact, Files, ListMinus, Pencil, X } from 'lucide-react';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Input from '~/components/RegisterForm/Input';
import RegisterFormMenu from '~/components/RegisterForm/Menu';
import api from '~/services/api';
import { Zoom, toast } from 'react-toastify';
import InputLine from '~/components/RegisterForm/InputLine';
import InputLineGroup from '~/components/RegisterForm/InputLineGroup';
import FormHeader from '~/components/RegisterForm/FormHeader';
import Preview from '~/components/Preview';
import { countries_list, formatter, getRegistries, handleUpdatedFields } from '~/functions';
import SelectPopover from '~/components/RegisterForm/SelectPopover';
import DatePicker from '~/components/RegisterForm/DatePicker';
import SelectCountry from '~/components/RegisterForm/SelectCountry';
import { format, parseISO } from 'date-fns';
import CountryList from 'country-list-with-dial-code-and-flag';
import FormLoading from '~/components/RegisterForm/FormLoading';
import { useSelector } from 'react-redux';
import { AlertContext } from '~/App';

export const InputContext = createContext({})

export const statusesOptions = [{ value: 'In Class', label: 'In Class' }, { value: 'School Waiting List', label: 'School Waiting List' }, { value: 'Waiting', label: 'Waiting' }, { value: 'Inactive', label: 'Inactive' }]

export default function PagePreview({ access, id, handleOpened, setOpened, defaultFormType = 'preview', successfullyUpdated, setSuccessfullyUpdated }) {

    const { alertBox } = useContext(AlertContext)
    const [pageData, setPageData] = useState({
        name: '',
        last_name: '',
        email: '',
        visa_expiration: null,
        gender: null,
        processtype_id: null,
        processsubstatus_id: null,
        status: 'Waiting',
        date_of_birth: null,
        loaded: false
    })
    const [formType, setFormType] = useState(defaultFormType)
    const [fullscreen, setFullscreen] = useState(false)
    const [activeMenu, setActiveMenu] = useState('general')
    const [registry, setRegistry] = useState({ created_by: null, created_at: null, updated_by: null, updated_at: null, canceled_by: null, canceled_at: null })
    const [countriesList, setCountriesList] = useState([])
    const [filialOptions, setFilialOptions] = useState([])
    const [agentOptions, setAgentOptions] = useState([])
    const [priceLists, setPriceLists] = useState(null)
    const [discountLists, setDiscountLists] = useState(null)
    const [totalDiscount, setTotalDiscount] = useState(0)
    const generalForm = useRef()
    const auth = useSelector(state => state.auth);

    const genderOptions = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'not specified', label: 'Not Specified' }]
    const yesOrNoOptions = [{ value: true, label: 'Yes' }, { value: false, label: 'No' }]

    const countriesOptions = countries_list.map(country => {
        return { value: country, label: country }
    })

    useEffect(() => {
        async function getCountriesList() {
            const getList = CountryList.getAll().map(country => {
                return { value: country.dial_code, label: country.flag + " " + country.dial_code + " " + country.name, code: country.dial_code, name: country.name }
            })
            setCountriesList(getList)
        }
        async function getDefaultFilialOptions() {
            const { data } = await api.get('/filials')
            const retGroupOptions = data.map((filial) => {
                return { value: filial.id, label: filial.name }
            })
            setFilialOptions(retGroupOptions)
        }
        async function getDefaultAgentOptions() {
            const { data } = await api.get('/agents')
            const retAgentOptions = data.map((agent) => {
                return { value: agent.id, label: agent.name }
            })
            setAgentOptions(retAgentOptions)
        }
        async function getTypesOptions() {
            const { data } = await api.get('/processtypes')
            const retTypesOptions = data.map((type) => {
                return { value: type.id, label: type.name }
            })
            return retTypesOptions
        }
        async function getSubStatusOptions() {
            const { data } = await api.get('/processsubstatuses')
            const retSubStatusOptions = data.map((subStatus) => {
                return { value: subStatus.id, label: subStatus.name, father_id: subStatus.processtype_id }
            })
            return retSubStatusOptions
        }
        async function getPageData() {
            const filialOptions = await getDefaultFilialOptions()
            const agentOptions = await getDefaultAgentOptions();
            const ddiOptions = await getCountriesList()
            const typesOptions = await getTypesOptions()
            const subStatusOptions = await getSubStatusOptions()
            if (id !== 'new') {
                try {
                    const { data } = await api.get(`/prospects/${id}`)
                    setPageData({ ...data, find_processtype_id: data.processtype_id, loaded: true, ddiOptions, filialOptions, agentOptions, typesOptions, subStatusOptions })
                    const { created_by, created_at, updated_by, updated_at, canceled_by, canceled_at } = data;
                    const registries = await getRegistries({ created_by, created_at, updated_by, updated_at, canceled_by, canceled_at })
                    setRegistry(registries)
                } catch (err) {
                    toast(err.response.data.error, { type: 'error', autoClose: 3000 })
                }
            } else {
                setPageData({ ...pageData, loaded: true, ddiOptions, filialOptions, typesOptions, subStatusOptions })
                setFormType('full')
            }
        }
        getPageData()
    }, [])

    useEffect(() => {
        if (pageData.processtype_id && pageData.processsubstatus_id) {
            api.get(`filials/${pageData.filial_id}`).then(({ data }) => {
                setPriceLists(data.pricelists.find(price => price.processsubstatus_id === pageData.processsubstatus_id))
                setDiscountLists(data.discountlists.filter(discount => discount.active))
            })
        } else {
            setPriceLists(null)
            setDiscountLists(null)
        }
    }, [pageData.processtype_id, pageData.processsubstatus_id])


    async function handleGeneralFormSubmit(data) {
        if (data.processsubstatus_id && pageData.subStatusOptions.find(subStatus => subStatus.value === data.processsubstatus_id).father_id !== data.processtype_id) {
            toast("Sub Status is not valid for this Type!", { autoClose: 1000, type: 'error', transition: Zoom })
            return
        }
        if (successfullyUpdated) {
            toast("No need to be saved!", { autoClose: 1000, type: 'info', transition: Zoom })
            return
        }
        delete data.status;
        if (id === 'new') {
            try {
                const { date_of_birth, visa_expiration } = data;
                const response = await api.post(`/prospects`, { ...data, date_of_birth: date_of_birth ? format(date_of_birth, 'yyyy-MM-dd') : null, visa_expiration: visa_expiration ? format(visa_expiration, 'yyyy-MM-dd') : null })
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
                    await api.put(`/students/${id}`, { ...objUpdated, date_of_birth: date_of_birth ? format(date_of_birth, 'yyyy-MM-dd') : null, visa_expiration: visa_expiration ? format(visa_expiration, 'yyyy-MM-dd') : null })
                    setPageData({ ...pageData, ...objUpdated })
                    setSuccessfullyUpdated(true)
                    toast("Saved!", { autoClose: 1000 })
                    handleOpened(null)
                } catch (err) {
                    console.log(err)
                    toast(err.response.data.error, { type: 'error', autoClose: 3000 })
                }
            } else {
                toast("No need to be saved!", { autoClose: 1000, type: 'info', transition: Zoom })
                setSuccessfullyUpdated(true)
                handleOpened(null)
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

    function handleOutsideMail() {
        alertBox({
            title: 'Attention!',
            descriptionHTML: '<p>Would you like to send the prospect a link to continue the process?</p>',
            buttons: [
                {
                    title: 'No',
                    class: 'cancel'
                },
                {
                    title: 'Yes',
                    onPress: async () => {
                        try {
                            await api.post(`/prospects/formMail`, { crypt: id })
                            toast("E-mail sent!", { autoClose: 1000 })
                        } catch (err) {
                            toast("Error!", { autoClose: 1000 })
                            console.log(err)
                        }
                    }
                }
            ]
        })
    }

    let emailButtonText = '';

    if (pageData.enrollments) {
        const enrollment = pageData.enrollments;
        const lastTimeline = pageData.enrollments.enrollmenttimelines ? pageData.enrollments.enrollmenttimelines[pageData.enrollments.enrollmenttimelines.length - 1] : null;
        const step = pageData.enrollments.form_step;
        if (step === 'transfer-request') {
            if (lastTimeline) {
                if (lastTimeline.status === 'Waiting') {
                    emailButtonText = '';
                }
            }
            emailButtonText = 'Send Transfer Eligibility Form'
        } else {
            emailButtonText = 'Send Enrollment Form'
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
                            <Contact size={16} /> General
                        </RegisterFormMenu>
                        <RegisterFormMenu setActiveMenu={setActiveMenu} activeMenu={activeMenu} name='follow-up' >
                            <ListMinus size={16} /> Follow Up
                        </RegisterFormMenu>
                        <RegisterFormMenu setActiveMenu={setActiveMenu} activeMenu={activeMenu} name='documents' >
                            <Files size={16} /> Documents
                        </RegisterFormMenu>

                    </div>
                    <div className='border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start'>
                        <div className='flex flex-col items-start justify-start text-sm overflow-y-scroll'>
                            <Form ref={generalForm} onSubmit={handleGeneralFormSubmit} className='w-full'>
                                <InputContext.Provider value={{ id, generalForm, setSuccessfullyUpdated, fullscreen, setFullscreen, successfullyUpdated, handleCloseForm, handleInactivate, handleOutsideMail, canceled: pageData.canceled_at }}>
                                    {id === 'new' || pageData.loaded ?
                                        <>
                                            <FormHeader access={access} title={pageData.name + ' ' + pageData.last_name} registry={registry} InputContext={InputContext} disabled={!pageData.processtype_id} emailButtonText={emailButtonText} />
                                            <InputLineGroup title='GENERAL' activeMenu={activeMenu === 'general'}>
                                                {auth.filial.id === 1 && <InputLine title='Filial'>
                                                    <SelectPopover name='filial_id' required title='Filial' isSearchable defaultValue={filialOptions.filter(filial => filial.value === pageData.filial_id)} options={filialOptions} InputContext={InputContext} />
                                                </InputLine>}
                                                <InputLine title='Agent'>
                                                    <SelectPopover name='agent_id' required title='Responsible Agent' isSearchable defaultValue={agentOptions.filter(agent => agent.value === pageData.agent_id)} options={agentOptions} InputContext={InputContext} />
                                                </InputLine>
                                                <InputLine title='General Data'>
                                                    <Input type='hidden' name='category' required grow title='Category' defaultValue='prospect' InputContext={InputContext} />
                                                    <Input type='text' name='name' required grow title='Name' defaultValue={pageData.name} InputContext={InputContext} />
                                                    <Input type='text' name='middle_name' grow title='Middle Name' defaultValue={pageData.middle_name} InputContext={InputContext} />
                                                    <Input type='text' name='last_name' required grow title='Last Name' defaultValue={pageData.last_name} InputContext={InputContext} />
                                                    <SelectPopover name='gender' required title='Gender' isSearchable defaultValue={genderOptions.find(gender => gender.value === pageData.gender)} options={genderOptions} InputContext={InputContext} />
                                                    <DatePicker name='date_of_birth' grow title='Birthday ' defaultValue={pageData.date_of_birth ? parseISO(pageData.date_of_birth) : null} placeholderText='MM/DD/YYYY' InputContext={InputContext} />
                                                </InputLine>
                                                <InputLine>
                                                    <Input type='text' name='passport_number' grow title='Passport Number' placeholder='-----' defaultValue={pageData.passport_number} InputContext={InputContext} />
                                                    <Input type='text' name='visa_number' grow title='Visa Number' placeholder='-----' defaultValue={pageData.visa_number} InputContext={InputContext} />
                                                    <DatePicker name='visa_expiration' title='Visa Expiration' defaultValue={pageData.visa_expiration ? parseISO(pageData.visa_expiration) : null} placeholderText='MM/DD/YYYY' InputContext={InputContext} />
                                                    <Input type='text' name='nsevis' title='NSEVIS' grow defaultValue={pageData.nsevis} placeholder='-----' InputContext={InputContext} />
                                                </InputLine>
                                                <InputLine title='Enrollment'>
                                                    <SelectPopover name='processtype_id' grow required title='Type' onChange={(el) => { setPageData({ ...pageData, find_processtype_id: el.value, processsubstatus_id: null }); generalForm.current.setFieldValue('processsubstatus_id', null); setSuccessfullyUpdated(false) }} defaultValue={pageData.processtype_id ? pageData.typesOptions.find(type => type.value === pageData.processtype_id) : null} options={pageData.typesOptions} InputContext={InputContext} />
                                                    <SelectPopover name='processsubstatus_id' grow required title='Sub Status' onChange={(el) => setPageData({ ...pageData, processsubstatus_id: el.value })} isSearchable defaultValue={pageData.processsubstatus_id ? pageData.subStatusOptions.find(substatus => substatus.value === pageData.processsubstatus_id) : null} options={pageData.find_processtype_id ? pageData.subStatusOptions.filter(type => type.father_id === pageData.find_processtype_id) : []} InputContext={InputContext} />
                                                </InputLine>
                                                {priceLists && <InputLine title='Prices'>
                                                    <table className='table-auto w-full text-center'>
                                                        <thead className='bg-slate-100 rounded-lg overflow-hidden'>
                                                            <tr>
                                                                <th className='w-1/6'>Registration Fee</th>
                                                                <th className='w-1/6'>Books</th>
                                                                <th className='w-1/6'>Tuition</th>
                                                                <th className='w-1/6'>Tuition in Advanced</th>
                                                                <th className='w-1/6'>Discount</th>
                                                                <th className='w-1/6'>Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>{formatter.format(priceLists.registration_fee)}</td>
                                                                <td>{formatter.format(priceLists.book)}</td>
                                                                <td>{formatter.format(priceLists.tuition)}</td>
                                                                <td>{priceLists.tuition_in_advance ? 'Yes' : 'No'}</td>
                                                                <td>{formatter.format(totalDiscount)}</td>
                                                                <td>{formatter.format(priceLists.registration_fee + priceLists.book + priceLists.tuition)}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </InputLine>}
                                                {discountLists && discountLists.map((discount) => {
                                                    return <InputLine>
                                                        {console.log({ discount })}
                                                        <Input readOnly={true} type='text' name='discount_id' grow title='Discount' defaultValue={discount.name} InputContext={InputContext} />
                                                        <Input readOnly={true} type='text' name='value' grow title='Discount' defaultValue={(discount.percent ? '%' : '$') + ' ' + discount.value} InputContext={InputContext} />
                                                        <SelectPopover readOnly={true} name='all_installments' title='All Installments?' options={yesOrNoOptions} defaultValue={yesOrNoOptions.find(option => option.value === discount.all_installments)} InputContext={InputContext} />
                                                        <SelectPopover readOnly={true} name='free_vacation' title='Free Vacation?' options={yesOrNoOptions} defaultValue={yesOrNoOptions.find(option => option.value === discount.free_vacation)} InputContext={InputContext} />
                                                        <SelectPopover name='apply' title='Apply?' options={yesOrNoOptions} InputContext={InputContext} />
                                                    </InputLine>
                                                })
                                                }
                                                <InputLine title='Location'>

                                                    <Input type='text' name='foreign_address' title='Address' grow defaultValue={pageData.foreign_address} InputContext={InputContext} />
                                                    <SelectPopover name='birth_country' grow title='Country' options={countriesOptions} isSearchable defaultValue={countriesOptions.find(country => country.value === pageData.birth_country)} InputContext={InputContext} />
                                                    <Input type='text' name='birth_state' grow title='State' defaultValue={pageData.birth_state} InputContext={InputContext} />
                                                    <Input type='text' name='birth_city' grow title='City' defaultValue={pageData.birth_city} InputContext={InputContext} />
                                                </InputLine>
                                                <InputLine title='Contact'>
                                                    <Input type='text' name='email' required title='E-mail' grow defaultValue={pageData.email} InputContext={InputContext} />
                                                    <SelectCountry name='whatsapp_ddi' title='DDI' options={countriesList} defaultValue={countriesList.find(ddi => ddi.value === pageData.whatsapp_ddi)} InputContext={InputContext} />
                                                    <Input type='text' grow name='whatsapp' title='Whatsapp' isPhoneNumber defaultValue={pageData.whatsapp} defaultValueDDI={pageData.whatsapp_ddi} InputContext={InputContext} />
                                                    <Input type='text' grow name='home_country_phone' hasDDI title='Home Country Phone' isPhoneNumber defaultValue={pageData.home_country_phone} InputContext={InputContext} />
                                                </InputLine>
                                                <InputLine>
                                                    <Input type='text' name='preferred_contact_form' grow title='Preferred Contact Form' defaultValue={pageData.preferred_contact_form} InputContext={InputContext} />
                                                </InputLine>
                                            </InputLineGroup>

                                            <InputLineGroup title='Documents' activeMenu={activeMenu === 'documents'}>
                                                {pageData.enrollmentdocuments && pageData.enrollmentdocuments.length > 0 && <InputLine subtitle='Attached Files'>
                                                    <div className='flex flex-col justify-center items-start gap-4'>
                                                        {
                                                            pageData.enrollmentdocuments && pageData.enrollmentdocuments.map((enrollmentdocument, index) => {
                                                                if (enrollmentdocument.document_id === document.id) {
                                                                    return <>
                                                                        <div className='flex flex-row justify-center items-center gap-2'>
                                                                            <a href={enrollmentdocument.file.url} target="_blank" className='text-xs'>
                                                                                <div className='flex flex-row items-center border px-4 py-2 gap-1 rounded-md bg-gray-100 hover:border-gray-300' key={index}>
                                                                                    <Files size={16} />
                                                                                    {enrollmentdocument.file.name}
                                                                                </div>
                                                                            </a>
                                                                            <button type='button' onClick={() => handleDeleteDocument(enrollmentdocument.id)} className='text-xs text-red-700 cursor-pointer flex flex-row items-center justify-start gap-1 mt-1 px-2 py-1 rounded hover:bg-red-100'><X size={12} /> Delete</button>
                                                                        </div>
                                                                    </>
                                                                }
                                                            })}
                                                    </div>
                                                </InputLine>}
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
