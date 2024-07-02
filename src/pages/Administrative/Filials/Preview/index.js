import { Form } from '@unform/web';
import { Building, CircleDollarSign, Pencil, Trash, X } from 'lucide-react';
import React, { useEffect, useRef, useState, createContext } from 'react';
import Input from '~/components/RegisterForm/Input';
import RegisterFormMenu from '~/components/RegisterForm/Menu';
import Select from '~/components/RegisterForm/Select';
import Textarea from '~/components/RegisterForm/Textarea';
import api from '~/services/api';
import { countries_list, getRegistries, handleUpdatedFields } from '~/functions';
import { Zoom, toast } from 'react-toastify';
import InputLine from '~/components/RegisterForm/InputLine';
import InputLineGroup from '~/components/RegisterForm/InputLineGroup';
import FormHeader from '~/components/RegisterForm/FormHeader';
import { Scope } from '@unform/core';
import CheckboxInput from '~/components/RegisterForm/CheckboxInput';
import Preview from '~/components/Preview';
import SelectPopover from '~/components/RegisterForm/SelectPopover';

export const InputContext = createContext({})

export default function PagePreview({ access, id, handleOpened, setOpened, defaultFormType = 'preview' }) {
    const [pageData, setPageData] = useState({
        active: false,
        alias: '',
        name: '',
        Filialtype: { id: null, label: '' },
        ein: '',
        address: '',
        zipcode: '',
        city: '',
        state: '',
        country: '',
        observations: ''
    })
    const [formType, setFormType] = useState(defaultFormType)
    const [fullscreen, setFullscreen] = useState(false)
    const [activeMenu, setActiveMenu] = useState('general')
    const [successfullyUpdated, setSuccessfullyUpdated] = useState(true)
    const [registry, setRegistry] = useState({ created_by: null, created_at: null, updated_by: null, updated_at: null, canceled_by: null, canceled_at: null })
    const [filialTypesOptions, setFilialTypesOptions] = useState([])
    const generalForm = useRef()

    const countriesOptions = countries_list.map(country => {
        return { value: country, label: country }
    })

    useEffect(() => {
        async function getPageData() {
            try {
                const { data } = await api.get(`filials/${id}`)
                setPageData(data)
                const { created_by, created_at, updated_by, updated_at, canceled_by, canceled_at } = data;
                const registries = await getRegistries({ created_by, created_at, updated_by, updated_at, canceled_by, canceled_at })
                setRegistry(registries)
            } catch (err) {
                toast(err.response.data.error, { type: 'error', autoClose: 3000 })
            }
        }
        async function getDefaultOptions() {
            try {
                const { data } = await api.get(`filialtypes`)
                const filialTypes = data.map(({ id, name }) => {
                    return { value: id, label: name }
                })
                setFilialTypesOptions(filialTypes)
            } catch (err) {
                toast(err.response.data.error, { type: 'error', autoClose: 3000 })
            }
        }

        getDefaultOptions()
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
                const response = await api.post(`/filials`, data)
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
                try {
                    await api.put(`/filials/${id}`, objUpdated)
                    setPageData({ ...pageData, ...objUpdated })
                    setSuccessfullyUpdated(true)
                    toast("Saved!", { autoClose: 1000 })
                    handleOpened(null)
                } catch (err) {
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

    function handleAddPrice() {
        const newPrices = [...pageData.pricelists, { id: null, name: null, installment: 0, installment_f1: 0, mailling: 0, private: 0, book: 0, registration_fee: 0, active: true }];
        setPageData({ ...pageData, pricelists: newPrices })
        setSuccessfullyUpdated(false)
    }

    function handleRemovePrice(index) {
        const newPrices = generalForm.current.getData()
        const removed = newPrices.pricelists.splice(index, 1)
        generalForm.current.setData(newPrices)
        setPageData({ ...pageData, pricelists: [...newPrices.pricelists] })
        setSuccessfullyUpdated(false)
    }

    function handleAddDiscount() {
        const newDiscounts = [...pageData.discountlists, { id: null, name: null, type: null, value: 0, percent: 0, ponctuality_discount: false, all_installments: false, free_vacation: false, special_discount: false, active: true }]
        setPageData({ ...pageData, discountlists: newDiscounts })
        setSuccessfullyUpdated(false)
    }

    function handleRemoveDiscount(index) {
        const newDiscounts = generalForm.current.getData()
        const removed = newDiscounts.discountlists.splice(index, 1)
        generalForm.current.setData(newDiscounts)
        setPageData({ ...pageData, discountlists: [...newDiscounts.discountlists] })
        setSuccessfullyUpdated(false)
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
                    <p className='border-b mb-1 pb-1'>Filial Information</p>
                    <div className='flex flex-row items-center gap-1 text-xs'><strong>Initials:</strong> {pageData.alias}</div>
                    <div className='flex flex-row items-center gap-1 text-xs'><strong>Type:</strong> {pageData.Filialtype && pageData.Filialtype.name}</div>
                    <div className='flex flex-row items-center gap-1 text-xs'><strong>Ein:</strong> {pageData.ein}</div>
                </div>
                <div className='flex flex-1 flex-col items-left px-4 py-2 gap-1'>
                    <p className='border-b mb-1 pb-1'>Address Information</p>
                    <div className='flex flex-row items-center gap-1 text-xs'><strong>Country:</strong> {pageData.country}</div>
                    <div className='flex flex-row items-center gap-1 text-xs'><strong>State:</strong> {pageData.state}</div>
                    <div className='flex flex-row items-center gap-1 text-xs'><strong>City:</strong> {pageData.city}</div>
                    <div className='flex flex-row items-center gap-1 text-xs'><strong>Zip Code:</strong> {pageData.zipcode}</div>
                    <div className='flex flex-row items-start gap-1 text-xs'><strong>Address:</strong> {pageData.address}</div>
                </div>
                <div className='flex flex-1 flex-col items-left px-4 py-2 gap-1'>
                    <p className='border-b mb-1 pb-1'>Observations</p>
                    <div readOnly className='flex flex-row items-start gap-1 text-xs h-24'>{pageData.observations}</div>
                </div>
                <div className='flex flex-1 flex-col items-left px-4 py-2 gap-1'>
                    {/* <button type="button" className='bg-transparent border border-primary p-2 rounded-lg hover:bg-gray-100 text-primary flex flex-row items-center justify-center gap-2 font-bold text-sm'><Pencil size={14} color="#0B2870" /> Edit Filial</button> */}
                </div>

            </div>
                :
                <div className='flex h-full flex-row items-start justify-between gap-4'>
                    <div className='flex flex-col items-center justify-between text-xs w-32 gap-4'>
                        <RegisterFormMenu setActiveMenu={setActiveMenu} activeMenu={activeMenu} name='general' >
                            <Building size={16} /> General
                        </RegisterFormMenu>
                        <RegisterFormMenu setActiveMenu={setActiveMenu} activeMenu={activeMenu} name='price-list' messageOnDisabled='Create the filial to have access to Price List.' disabled={id === 'new'}>
                            <CircleDollarSign size={16} /> Price List
                        </RegisterFormMenu>
                        <RegisterFormMenu setActiveMenu={setActiveMenu} activeMenu={activeMenu} name='discount-list' disabled={id === 'new'} messageOnDisabled='Create the filial to have access to Discount List.'>
                            <CircleDollarSign size={16} /> Discount List
                        </RegisterFormMenu>

                    </div>
                    <div className='border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start'>
                        <div className='flex flex-col items-start justify-start text-sm overflow-y-scroll'>
                            <Form ref={generalForm} onSubmit={handleGeneralFormSubmit} className='w-full'>
                                <InputContext.Provider value={{ id, generalForm, setSuccessfullyUpdated, fullscreen, setFullscreen, successfullyUpdated, handleCloseForm }}>

                                    <FormHeader access={access} title={pageData.name} registry={registry} InputContext={InputContext} />

                                    <InputLineGroup title='GENERAL' activeMenu={activeMenu === 'general'}>
                                        <InputLine title='General Data'>
                                            <Input type='text' name='ein' required title='EIN' defaultValue={pageData.ein} InputContext={InputContext} />
                                            <Input type='text' name='name' required title='Name' grow defaultValue={pageData.name} InputContext={InputContext} />
                                            <Input type='text' name='alias' onlyUpperCase required title='Alias' defaultValue={pageData.alias} InputContext={InputContext} />
                                            {/* {console.log(pageData.active)} */}
                                            {id === 'new' || pageData.Filialtype ? <SelectPopover name='filialtype_id' title='Filial Type' options={filialTypesOptions} defaultValue={{ value: pageData.filialtype_id, label: pageData.Filialtype.name }} InputContext={InputContext} /> : null}
                                            <SelectPopover name='active' title='Active' options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} defaultValue={{ value: pageData.active, label: pageData.active ? 'Yes' : 'No' }} InputContext={InputContext} />
                                        </InputLine>

                                        {/* <InputLine>
                                        <Select name='type' title='Type' options={[{ value: 'Own', label: 'Own' }, { value: 'Participation', label: 'Participation' }]} defaultValue={pageData.types.name} InputContext={InputContext} />
                                    </InputLine> */}

                                        <InputLine title='Localization'>
                                            <SelectPopover name='country' title='Country' required options={countriesOptions} isSearchable defaultValue={{ value: pageData.country, label: pageData.country }} InputContext={InputContext} />
                                            <Input type='text' name='state' required title='State' defaultValue={pageData.state} InputContext={InputContext} />
                                            <Input type='text' name='city' required title='City' defaultValue={pageData.city} InputContext={InputContext} />
                                            <Input type='text' name='zipcode' isZipCode grow required title='Zip Code' defaultValue={pageData.zipcode} placeholder='-----' InputContext={InputContext} />
                                        </InputLine>

                                        <InputLine>
                                            <Textarea type='text' required name='address' title='Address' rows={5} defaultValue={pageData.address} InputContext={InputContext} />
                                        </InputLine>

                                        <InputLine title='Contact / On the web'>
                                            <Input type='text' name='phone' isPhoneNumber title='Phone' defaultValue={pageData.phone} InputContext={InputContext} />
                                            <Input type='text' name='phone2' isPhoneNumber title='Phone 2' defaultValue={pageData.phone2} placeholder='(---) -------' InputContext={InputContext} />
                                            <Input type='text' name='email' onlyLowerCase grow title='Email' defaultValue={pageData.email} placeholder='email@mila.usa' InputContext={InputContext} />
                                        </InputLine>

                                        <InputLine>
                                            <Input type='text' name='whatsapp' isPhoneNumber title='Whatsapp' defaultValue={pageData.whatsapp} placeholder='(---) -------' InputContext={InputContext} />
                                            <Input type='text' name='facebook' onlyLowerCase title='Facebook' defaultValue={pageData.facebook} InputContext={InputContext} />
                                            <Input type='text' name='instagram' onlyLowerCase title='Instagram' defaultValue={pageData.instagram} InputContext={InputContext} />
                                            <Input type='text' name='website' onlyLowerCase grow title='Website' defaultValue={pageData.website} InputContext={InputContext} />
                                        </InputLine>

                                        <InputLine title='Observations'>
                                            <Textarea type='text' name='observations' rows={3} defaultValue={pageData.observations} InputContext={InputContext} />
                                        </InputLine>

                                    </InputLineGroup>

                                    <InputLineGroup title='PRICE LIST' activeMenu={activeMenu === 'price-list'}>
                                        <h1 className='w-full border-b p-4 pb-0 pt-2 pb-2 font-bold'>Price List</h1>
                                        {pageData.pricelists && pageData.pricelists.map((price, index) =>
                                            <Scope key={index} path={`pricelists[${index}]`}>
                                                <InputLine>
                                                    {!price.id && <button type='button' className='mt-3 bg-none border-none' onClick={() => handleRemovePrice(index)}><Trash size={14} /></button>}
                                                    <Input type='hidden' name={`id`} defaultValue={price.id} InputContext={InputContext} />
                                                    <Input type='text' grow name={`name`} title='Name' defaultValue={price.name} InputContext={InputContext} />
                                                    <Input type='text' shrink name={`installment`} title='Installment' defaultValue={price.installment} InputContext={InputContext} />
                                                    <Input type='text' shrink name={`installment_f1`} title='Installment F1' defaultValue={price.installment_f1} InputContext={InputContext} />
                                                    <Input type='text' shrink name={`mailling`} grow title='Mailling' defaultValue={price.mailling} InputContext={InputContext} />
                                                    <Input type='text' shrink name={`private`} grow title='Private' defaultValue={price.private} InputContext={InputContext} />
                                                    <Input type='text' shrink name={`book`} grow title='Book' defaultValue={price.book} InputContext={InputContext} />
                                                    <Input type='text' shrink name={`registration_fee`} grow title='Registration Fee' defaultValue={price.registration_fee} InputContext={InputContext} />
                                                    <Select name='active' shrink title='Active' options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} defaultValue={price.active ? 'Yes' : 'No'} InputContext={InputContext} />

                                                </InputLine>
                                                <div className='w-full border-b p-4 pt-2'></div>
                                            </Scope>
                                        )}
                                        <button type="button" onClick={handleAddPrice} className={`m-2 mt-4 text-md font-bold border border-mila_orange text-mila_orange rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1`}>
                                            + Add Price
                                        </button>
                                    </InputLineGroup>

                                    <InputLineGroup title='DISCOUNT LIST' activeMenu={activeMenu === 'discount-list'}>
                                        <h1 className='w-full border-b p-4 pb-0 pt-2 pb-2 font-bold'>Discount List</h1>
                                        {pageData.discountlists && pageData.discountlists.map((discount, index) =>
                                            <Scope key={index} path={`discountlists[${index}]`}>
                                                <InputLine>

                                                    {!discount.id && <button type='button' className='mt-3 bg-none border-none' onClick={() => handleRemoveDiscount(index)}><Trash size={14} /></button>}
                                                    <Input type='hidden' name={`id`} defaultValue={discount.id} InputContext={InputContext} />
                                                    <Select name='active' shrink title='Active' options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} defaultValue={discount.active ? 'Yes' : 'No'} InputContext={InputContext} />
                                                    <Input type='text' grow name={`name`} title='Name' defaultValue={discount.name} InputContext={InputContext} />
                                                    <Input type='text' shrink name={`value`} title='Value' defaultValue={discount.value} InputContext={InputContext} />
                                                    <CheckboxInput name='percent' title='Percent' InputContext={InputContext} />
                                                    {/* <Input type='text' shrink name={`punctuality_discount`} grow title='Mailling' defaultValue={discount.percent} /> */}
                                                </InputLine>
                                                <InputLine>
                                                    <CheckboxInput name='ponctuality_discount' title='Ponctuality Discount' InputContext={InputContext} />
                                                    <CheckboxInput name='all_installments' title='All Installments' InputContext={InputContext} />
                                                    <CheckboxInput name='free_vacation' title='Free Vacation' InputContext={InputContext} />
                                                    <CheckboxInput name='special_discount' title='Special Discount' InputContext={InputContext} />
                                                </InputLine>
                                                <div className='w-full border-b p-4 pt-2'></div>
                                            </Scope>

                                        )}
                                        <button type="button" onClick={handleAddDiscount} className={`m-2 mt-4 text-md font-bold border border-mila_orange text-mila_orange rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1`}>
                                            + Add Discount
                                        </button>
                                    </InputLineGroup>

                                </InputContext.Provider>
                            </Form>
                        </div>

                    </div>
                </div>
            : null}

    </Preview>;
}
