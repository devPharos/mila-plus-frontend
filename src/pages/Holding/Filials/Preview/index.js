import { Form } from '@unform/web';
import { Building, CheckCheck, CircleDollarSign, Pencil, Presentation, Save, Scaling, Trash, X } from 'lucide-react';
import React, { useEffect, useRef, useState, createContext } from 'react';
import Input from '~/components/RegisterForm/Input';
import RegisterFormMenu from '~/components/RegisterForm/Menu';
import Select from '~/components/RegisterForm/Select';
import Textarea from '~/components/RegisterForm/Textarea';
import api from '~/services/api';
import { countries_list } from '~/functions';
import { ToastContainer, Zoom, toast } from 'react-toastify';
import InputLine from '~/components/RegisterForm/InputLine';
import InputLineGroup from '~/components/RegisterForm/InputLineGroup';
import FormHeader from '~/components/RegisterForm/FormHeader';
import { format } from 'date-fns';
import { Scope } from '@unform/core';
import CheckboxInput from '~/components/RegisterForm/CheckboxInput';

export const InputContext = createContext({})

export default function FilialsPreview({ id, handleOpened, setOpened }) {
    const [filial, setFilial] = useState({
        active: false,
        alias: '',
        name: '',
        type: '',
        ein: '',
        address: '',
        zipcode: '',
        city: '',
        state: '',
        country: ''
    })
    const [formType, setFormType] = useState('preview')
    const [fullscreen, setFullscreen] = useState(false)
    const [activeMenu, setActiveMenu] = useState('general')
    const [successfullyUpdated, setSuccessfullyUpdated] = useState(true)
    const [registry, setRegistry] = useState({ created_by: null, created_at: null, updated_by: null, updated_at: null, canceled_by: null, canceled_at: null })
    const generalForm = useRef()

    useEffect(() => {
        async function getFilialData() {
            try {
                const { data } = await api.get(`filials/${id}`)
                setFilial(data)
                const { created_by, created_at, updated_by, updated_at, canceled_by, canceled_at } = data;

                let registryBy = null;
                let registryAt = null;
                let registryStatus = null;
                if (canceled_by) {
                    const { data: userRet } = await api.get(`users_short_info/${canceled_by}`)
                    registryBy = userRet.name
                    registryAt = canceled_at;
                    registryStatus = 'Canceled';
                } else if (updated_by) {
                    const { data: userRet } = await api.get(`users_short_info/${updated_by}`)
                    registryBy = userRet.name
                    registryAt = updated_at;
                    registryStatus = 'Updated';
                } else if (created_by) {
                    const { data: userRet } = await api.get(`users_short_info/${created_by}`)
                    registryBy = userRet.name
                    registryAt = created_at;
                    registryStatus = 'Created';
                }
                setRegistry({ registryBy, registryAt, registryStatus })
            } catch (err) {
                console.log(err)
            }
        }
        if (id === 'new') {
            setFormType('full')
        } else if (id) {
            getFilialData()
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
                setFilial({ ...filial, ...data })
                setSuccessfullyUpdated(true)
                toast("Saved!", { autoClose: 1000 })
                handleOpened(null)
            } catch (err) {
                console.log(err)
            }
        } else if (id !== 'new') {
            const dataInArray = Object.keys(data).map((key) => [key, data[key]])
            const filialInArray = Object.keys(filial).map((key) => [key, filial[key]]);

            // console.log(filialInArray)
            const updated = dataInArray.filter((field) => {
                const x = field[1] === 'Yes' ? true : field[1] === 'No' ? false : field[1];
                // const y = 999;
                // console.log(field[0])
                const y = filialInArray.find(filialField => filialField[0] === field[0])[1];

                if (x !== y && (x || y)) {
                    return field;
                }
            })

            if (updated.length > 0) {
                const objUpdated = Object.fromEntries(updated);
                try {
                    await api.put(`/filials/${id}`, objUpdated)
                    setFilial({ ...filial, ...objUpdated })
                    setSuccessfullyUpdated(true)
                    toast("Saved!", { autoClose: 1000 })
                    handleOpened(null)
                } catch (err) {
                    toast("An unexpected error occurred on this transactions. Please verify all fields again.", { type: 'error' })
                    console.log(err)
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
        const newPrices = [...filial.pricelists, { id: null, name: null, installment: 0, installment_f1: 0, mailling: 0, private: 0, book: 0, registration_fee: 0, active: true }];
        setFilial({ ...filial, pricelists: newPrices })
        setSuccessfullyUpdated(false)
    }

    function handleRemovePrice(index) {
        const newPrices = generalForm.current.getData()
        const removed = newPrices.pricelists.splice(index, 1)
        generalForm.current.setData(newPrices)
        setFilial({ ...filial, pricelists: [...newPrices.pricelists] })
        setSuccessfullyUpdated(false)
    }

    function handleAddDiscount() {
        const newDiscounts = [...filial.discountlists, { id: null, name: null, type: null, value: 0, percent: 0, ponctuality_discount: false, all_installments: false, free_vacation: false, special_discount: false, active: true }]
        setFilial({ ...filial, discountlists: newDiscounts })
        setSuccessfullyUpdated(false)
    }

    function handleRemoveDiscount(index) {
        const newDiscounts = generalForm.current.getData()
        const removed = newDiscounts.discountlists.splice(index, 1)
        generalForm.current.setData(newDiscounts)
        setFilial({ ...filial, discountlists: [...newDiscounts.discountlists] })
        setSuccessfullyUpdated(false)
    }

    return filial && <div className={`${fullscreen ? 'fixed' : 'absolute'} z-50 animate-bounce-once right-0 top-0 bg-white ${formType === 'full' ? 'w-full' : 'w-1/3'} h-full p-4 rounded-xl shadow-lg border border-gray-200`}>
        {formType === 'preview' ? <div className='border h-full rounded-xl overflow-hidden flex flex-col justify-start gap-1 overflow-y-scroll'>
            <div className='relative bg-gray-100 h-16 px-4 py-2 flex flex-row items-start justify-start'>

                <button onClick={() => setFormType('full')} className='absolute top-2 right-20 text-md font-bold bg-mila_orange text-white rounded-md p-1 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1'>
                    <Pencil size={16} color="#fff" /> Edit
                </button>
                <button onClick={() => handleOpened(null)} className='absolute top-2 right-2 text-md font-bold bg-secondary rounded-md p-1 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1'>
                    <X size={16} /> Close
                </button>
                <h2 style={{ fontSize: 24 }}>{filial.name}</h2>

            </div>
            <div className='flex flex-1 flex-col items-left px-4 py-2 gap-1'>
                <p className='border-b mb-1 pb-1'>Filial Information</p>
                <div className='flex flex-row items-center gap-1 text-xs'><strong>Initials:</strong> {filial.alias}</div>
                <div className='flex flex-row items-center gap-1 text-xs'><strong>Type:</strong> {filial.type}</div>
                <div className='flex flex-row items-center gap-1 text-xs'><strong>Ein:</strong> {filial.ein}</div>
            </div>
            <div className='flex flex-1 flex-col items-left px-4 py-2 gap-1'>
                <p className='border-b mb-1 pb-1'>Address Information</p>
                <div className='flex flex-row items-center gap-1 text-xs'><strong>Country:</strong> {filial.country}</div>
                <div className='flex flex-row items-center gap-1 text-xs'><strong>State:</strong> {filial.state}</div>
                <div className='flex flex-row items-center gap-1 text-xs'><strong>City:</strong> {filial.city}</div>
                <div className='flex flex-row items-center gap-1 text-xs'><strong>Zip Code:</strong> {filial.zipcode}</div>
                <div className='flex flex-row items-start gap-1 text-xs'><strong>Address:</strong> {filial.address}</div>
            </div>
            <div className='flex flex-1 flex-col items-left px-4 py-2 gap-1'>
                <p className='border-b mb-1 pb-1'>Observations</p>
                <textarea readOnly className='flex flex-row items-center gap-1 text-xs h-24'>{filial.observations}</textarea>
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
                    <RegisterFormMenu setActiveMenu={setActiveMenu} activeMenu={activeMenu} name='price-list' disabled={false}>
                        <CircleDollarSign size={16} /> Price List
                    </RegisterFormMenu>
                    <RegisterFormMenu setActiveMenu={setActiveMenu} activeMenu={activeMenu} name='discount-list' disabled={false}>
                        <CircleDollarSign size={16} /> Discount List
                    </RegisterFormMenu>

                </div>
                <div className='border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start'>
                    <div className='flex flex-col items-start justify-start text-sm overflow-y-scroll'>
                        <Form ref={generalForm} onSubmit={handleGeneralFormSubmit} className='w-full'>
                            <InputContext.Provider value={{ id, setSuccessfullyUpdated, fullscreen, setFullscreen, successfullyUpdated, handleCloseForm }}>

                                <FormHeader title={filial.name} registry={registry} />

                                <InputLineGroup title='GENERAL' activeMenu={activeMenu === 'general'}>
                                    <InputLine title='General Data'>
                                        <Input type='text' name='ein' required title='EIN' defaultValue={filial.ein} />
                                        <Input type='text' name='name' required title='Name' grow defaultValue={filial.name} />
                                        <Input type='text' name='alias' required title='Alias' defaultValue={filial.alias} />
                                        <Select name='active' title='Active' options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} defaultValue={filial.active ? 'Yes' : 'No'} />
                                    </InputLine>

                                    <InputLine>
                                        <Select name='type' title='Type' options={[{ value: 'Own', label: 'Own' }, { value: 'Participation', label: 'Participation' }]} defaultValue={filial.type} />
                                    </InputLine>

                                    <InputLine title='Localization'>
                                        <Select name='country' title='Country' required options={countries_list} defaultValue={filial.country} />
                                        <Input type='text' name='state' required title='State' defaultValue={filial.state} />
                                        <Input type='text' name='city' required title='City' defaultValue={filial.city} />
                                        <Input type='text' name='zipcode' grow required title='Zip Code' defaultValue={filial.zipcode} placeholder='-----' />
                                    </InputLine>

                                    <InputLine>
                                        <Textarea type='text' required name='address' title='Address' rows={5} defaultValue={filial.address} />
                                    </InputLine>

                                    <InputLine title='Contact / On the web'>
                                        <Input type='text' name='phone' title='Phone' defaultValue={filial.phone} />
                                        <Input type='text' name='phone2' title='Phone 2' defaultValue={filial.phone2} placeholder='(---) -------' />
                                        <Input type='text' name='email' grow title='Email' defaultValue={filial.email} placeholder='email@mila.usa' />
                                    </InputLine>

                                    <InputLine>
                                        <Input type='text' name='whatsapp' title='Whatsapp' defaultValue={filial.whatsapp} placeholder='(---) -------' />
                                        <Input type='text' name='facebook' title='Facebook' defaultValue={filial.facebook} />
                                        <Input type='text' name='instagram' title='Instagram' defaultValue={filial.instagram} />
                                        <Input type='text' name='website' grow title='Website' defaultValue={filial.website} />
                                    </InputLine>

                                    <InputLine title='Observations'>
                                        <Textarea type='text' name='observations' rows={3} defaultValue={filial.observations} />
                                    </InputLine>

                                </InputLineGroup>

                                <InputLineGroup title='PRICE LIST' activeMenu={activeMenu === 'price-list'}>
                                    <h1 className='w-full border-b p-4 pb-0 pt-2 pb-2 font-bold'>Price List</h1>
                                    {filial.pricelists && filial.pricelists.map((price, index) =>
                                        <Scope key={index} path={`pricelists[${index}]`}>
                                            <InputLine>
                                                {!price.id && <button type='button' className='mt-3 bg-none border-none' onClick={() => handleRemovePrice(index)}><Trash size={14} /></button>}
                                                <Input type='hidden' name={`id`} defaultValue={price.id} />
                                                <Input type='text' grow name={`name`} title='Name' defaultValue={price.name} />
                                                <Input type='text' shrink name={`installment`} title='Installment' defaultValue={price.installment} />
                                                <Input type='text' shrink name={`installment_f1`} title='Installment F1' defaultValue={price.installment_f1} />
                                                <Input type='text' shrink name={`mailling`} grow title='Mailling' defaultValue={price.mailling} />
                                                <Input type='text' shrink name={`private`} grow title='Private' defaultValue={price.private} />
                                                <Input type='text' shrink name={`book`} grow title='Book' defaultValue={price.book} />
                                                <Input type='text' shrink name={`registration_fee`} grow title='Registration Fee' defaultValue={price.registration_fee} />
                                                <Select name='active' shrink title='Active' options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} defaultValue={price.active ? 'Yes' : 'No'} />

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
                                    {filial.discountlists && filial.discountlists.map((discount, index) =>
                                        <Scope key={index} path={`discountlists[${index}]`}>
                                            <InputLine>

                                                {!discount.id && <button type='button' className='mt-3 bg-none border-none' onClick={() => handleRemoveDiscount(index)}><Trash size={14} /></button>}
                                                <Input type='hidden' name={`id`} defaultValue={discount.id} />
                                                <Select name='active' shrink title='Active' options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} defaultValue={discount.active ? 'Yes' : 'No'} />
                                                <Input type='text' grow name={`name`} title='Name' defaultValue={discount.name} />
                                                <Input type='text' shrink name={`type`} title='Installment' defaultValue={discount.type} />
                                                <Input type='text' shrink name={`value`} title='Installment F1' defaultValue={discount.value} />
                                                <Input type='text' shrink name={`percent`} grow title='Mailling' defaultValue={discount.percent} />
                                            </InputLine>
                                            <InputLine>
                                                <CheckboxInput name='ponctuality_discount' title='Ponctuality Discount' />
                                                <CheckboxInput name='all_installments' title='All Installments' />
                                                <CheckboxInput name='free_vacation' title='Free Vacation' />
                                                <CheckboxInput name='special_discount' title='Special Discount' />
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
            </div>}

    </div>;
}
