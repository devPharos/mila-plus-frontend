import { Form } from '@unform/web';
import { Building, CheckCheck, CircleDollarSign, Pencil, Presentation, Save, Scaling, X } from 'lucide-react';
import React, { useEffect, useRef, useState, createContext } from 'react';
import Input from '~/components/RegisterForm/Input';
import RegisterFormMenu from '~/components/RegisterForm/Menu';
import Select from '~/components/RegisterForm/Select';
import Textarea from '~/components/RegisterForm/Textarea';
import api from '~/services/api';
import { countries_list } from '~/functions';
import { ToastContainer, toast } from 'react-toastify';

export const InputContext = createContext({})

export default function FilialsPreview({ id, handleOpened, setOpened }) {
    const [filial, setFilial] = useState({
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
    const formRef = useRef()
    let myTimeOut = null;

    useEffect(() => {
        async function getFilialData() {
            try {
                const { data } = await api.get(`filials/${id}`)
                setFilial(data)
            } catch(err) {
                console.log(err)
            }
        }
        if(id === 'new') {
            setFormType('full')
        } else if(id) {
            getFilialData()
        }
    },[])

    useEffect(() => {
        if(id !== 'new' && !successfullyUpdated) {
            clearTimeout(myTimeOut);
            myTimeOut = setTimeout(() => {
                formRef.current.submitForm()
            },3000)
        }
    },[successfullyUpdated])

    async function handleFormSubmit(data) {
        if(id === 'new') {
            try {
                const response = await api.post(`/filials`, data)
                setOpened(response.data.id)
                setFilial({...filial, ...data})
                setSuccessfullyUpdated(true)
                toast("Saved!", { autoClose: 1000 })
            } catch(err) {
                console.log(err)
            }
        } else if(id !== 'new') {
            const dataInArray = Object.keys(data).map((key) => [key, data[key]])
            const filialInArray = Object.keys(filial).map((key) => [key, filial[key]]);
    
            const updated = dataInArray.filter((field) => {
                const x = field[1];
                const y = filialInArray.find(filialField => filialField[0] === field[0])[1];
    
                if(x !== y &&(x || y)) {
                    return field;
                }
            })
    
            if(updated.length > 0) {
                const objUpdated = Object.fromEntries(updated);
                try {
                    await api.put(`/filials/${id}`, objUpdated)
                    setFilial({...filial, ...objUpdated})
                    setSuccessfullyUpdated(true)
                    toast("Saved!", { autoClose: 1000 })
                } catch(err) {
                    console.log(err)
                }
            } else {
                console.log(updated)
            }
        }
    }

    function handleCloseForm() {
        if(!successfullyUpdated) {
            toast("Don`t forget to save!", { autoClose: 1000 })
        }
        handleOpened(null)
    }

  return filial && <div className={`${fullscreen ? 'fixed': 'absolute'} z-50 animate-bounce-once right-0 top-0 bg-white ${formType === 'full' ? 'w-full' : 'w-1/3'} h-full p-4 rounded-xl shadow-lg border border-gray-200`}>
    { formType === 'preview' ? <div className='border h-full rounded-xl overflow-hidden flex flex-col justify-start gap-1 overflow-y-scroll'>
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
            <div className='flex flex-row items-center gap-1 text-xs'><strong>Address:</strong> {filial.address}</div>
            <div className='flex flex-row items-center gap-1 text-xs'><strong>Zip Code:</strong> {filial.zipcode}</div>
            <div className='flex flex-row items-center gap-1 text-xs'><strong>City:</strong> {filial.city}</div>
            <div className='flex flex-row items-center gap-1 text-xs'><strong>State:</strong> {filial.state}</div>
            <div className='flex flex-row items-center gap-1 text-xs'><strong>Country:</strong> {filial.country}</div>
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
            <RegisterFormMenu setActiveMenu={setActiveMenu} activeMenu={activeMenu} name='price-list' disabled={true}>
                <CircleDollarSign size={16} /> Price List
            </RegisterFormMenu>
            <RegisterFormMenu setActiveMenu={setActiveMenu} activeMenu={activeMenu} name='discount-list' disabled={true}>
                <CircleDollarSign size={16} /> Discount List
            </RegisterFormMenu>
            
        </div>
        <div className='border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start'>
            

            <div className='flex flex-col items-start justify-start text-sm overflow-y-scroll'>
                <Form ref={formRef} onSubmit={handleFormSubmit} className='w-full'>
                    <InputContext.Provider value={{setSuccessfullyUpdated}}>
                    <div className='relative bg-gray-100 h-14 px-4 py-2 flex flex-row items-center justify-between w-full'>
                        <h2 style={{ fontSize: 24 }}>{filial.name}</h2>

                        <div className='flex flex-row justify-between items-center gap-4'>
                            <button onClick={() => setFullscreen(!fullscreen)} className='text-md font-bold bg-secondary border hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1'>
                                <Scaling size={16} /> {fullscreen ? 'Minimize': 'Full Screen'}
                            </button>
                            <button onClick={() => handleCloseForm()} className='text-md font-bold bg-secondary border hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1'>
                                <X size={16} /> Close
                            </button>
                            <button type="submit" className={`text-md font-bold ${!successfullyUpdated ? 'bg-red-500' : 'bg-primary'} text-white rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1`}>
                                {!successfullyUpdated ? <><Save size={16} /> Save</> : <><CheckCheck size={16} /> Saved</>}
                            </button>
                        </div>
                    </div>
                    <div id="GENERAL" className={`${activeMenu === 'general' ? 'flex flex-col justify-between items-start gap-4 p-4 w-full' : 'hidden'}`}>
                        <h1 className='w-full border-b pb-2 font-bold'>General Data</h1>
                        <div className='flex flex-row items-center justify-between gap-4'>
                            <Input type='text' name='ein' required title='EIN' defaultValue={filial.ein} />
                            <Input type='text' name='name' required title='Name' defaultValue={filial.name} />
                            <Input type='text' name='alias' required title='Alias' defaultValue={filial.alias} />
                            <Select name='type' title='Type' options={[{value: 'Own', label: 'Own'},{value: 'Participation', label: 'Participation'}]} defaultValue={filial.canceled_at ? 'Inactive' : 'Active'} />
                        </div>
                        <div className='flex flex-row items-center justify-between gap-4'>
                            <Select name='country' title='Country' required options={countries_list} defaultValue={filial.country} />
                            <Input type='text' name='state' required title='State' defaultValue={filial.state} />
                            <Input type='text' name='city' required title='City' defaultValue={filial.city} />
                            <Input type='text' name='zipcode' required title='Zip Code' defaultValue={filial.zipcode} placeholder='-----' />
                        </div>
                        <div className='flex flex-row items-center justify-between gap-4 w-96'>
                            <Textarea type='text' required name='address' title='Address' rows={5} defaultValue={filial.address} />
                        </div>
                        <div className='flex flex-row items-center justify-between gap-4'>
                            <Input type='text' name='phone' title='Phone' defaultValue={filial.phone} />
                            <Input type='text' name='phone2' title='Phone 2' defaultValue={filial.phone2} placeholder='(---) -------'  />
                            <Input type='text' name='email' title='Email' defaultValue={filial.email} placeholder='email@mila.usa'  />
                        </div>
                        <div className='flex flex-row items-center justify-between gap-4'>
                            <Input type='text' name='whatsapp' title='Whatsapp' defaultValue={filial.whatsapp} placeholder='(---) -------'  />
                            <Input type='text' name='facebook' title='Facebook' defaultValue={filial.facebook} />
                            <Input type='text' name='instagram' title='Instagram' defaultValue={filial.instagram}  />
                            <Input type='text' name='website' title='Website' defaultValue={filial.website}  />
                        </div>
                        <div className='flex flex-row items-center justify-between gap-4'>
                            <div className='w-96'>
                                <Textarea type='text' name='observations' title='Observations' rows={5} defaultValue={filial.observations} />
                            </div>
                        </div>


                        {/* <div className='flex flex-row items-center justify-between gap-4'></div>
                            <div className='flex flex-col items-center justify-between gap-4 w-56'>
                                <div>Allow <strong>on hold</strong> for student type</div>
                                <div className='flex flex-row items-center justify-between gap-4'>
                                    <CheckboxInput name='allow_on_hold_f1' title='F1' defaultValue={filial.allow_on_hold_f1} />
                                    <CheckboxInput name='allow_on_hold_nonf1' title='NON F1' defaultValue={filial.allow_on_hold_nonf1} />
                                </div>
                            </div>
                            <div className='flex flex-col items-center justify-between gap-4 w-62'>
                                <div>Allow control of Payment Method per user</div>
                                <div className='flex flex-row items-center justify-between gap-4'>
                                    <CheckboxInput name='allow_control_payment_method_by_user' title='Allowed' defaultValue={filial.allow_control_payment_method_by_user} />
                                </div>
                            </div>
                        </div> */}
                            
                    </div>

                    <div id="PRICE LIST" className={`${activeMenu === 'price-list' ? 'flex flex-col justify-between items-start gap-4 p-4 w-full' : 'hidden'}`}>
                        <h1 className='w-full border-b pb-2 font-bold'>Price List</h1>
                        {/* <div className='flex flex-row items-center justify-between gap-4'>
                            <Input type='text' name='registration_nome' disabled title='Registration Number' defaultValue={student.registration_number} />
                        </div> */}
                    </div>

                    <div id="DISCOUNT LIST" className={`${activeMenu === 'discount-list' ? 'flex flex-col justify-between items-start gap-4 p-4 w-full' : 'hidden'}`}>
                        <h1 className='w-full border-b pb-2 font-bold'>Discount List</h1>
                        {/* <div className='flex flex-row items-center justify-between gap-4'>
                            <Input type='text' name='registration_nome' disabled title='Registration Number' defaultValue={student.registration_number} />
                        </div> */}
                    </div>
                    </InputContext.Provider>
                </Form>
            </div>

        </div>
    </div>}
        <ToastContainer autoClose={8000} />
    
  </div>;
}
