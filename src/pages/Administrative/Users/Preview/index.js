import { Form } from '@unform/web';
import { Building, Lock, Pencil, PlusCircle, Trash, X } from 'lucide-react';
import React, { createContext, useEffect, useRef, useState } from 'react';
import Input from '~/components/RegisterForm/Input';
import RegisterFormMenu from '~/components/RegisterForm/Menu';
import api from '~/services/api';
import { Zoom, toast } from 'react-toastify';
import InputLine from '~/components/RegisterForm/InputLine';
import InputLineGroup from '~/components/RegisterForm/InputLineGroup';
import FormHeader from '~/components/RegisterForm/FormHeader';
import Preview from '~/components/Preview';
import { getRegistries, handleUpdatedFields } from '~/functions';
import SelectPopover from '~/components/RegisterForm/SelectPopover';
import { Scope } from '@unform/core';
import FormLoading from '~/components/RegisterForm/FormLoading';

export const InputContext = createContext({})

export default function PagePreview({ access, id, handleOpened, setOpened, defaultFormType = 'preview' }) {
    const [pageData, setPageData] = useState({
        name: '',
        email: '',
        group_id: null,
        filials: [{ id: null }],
        loaded: false
    })
    const [formType, setFormType] = useState(defaultFormType)
    const [fullscreen, setFullscreen] = useState(false)
    const [activeMenu, setActiveMenu] = useState('general')
    const [successfullyUpdated, setSuccessfullyUpdated] = useState(true)
    const [registry, setRegistry] = useState({ created_by: null, created_at: null, updated_by: null, updated_at: null, canceled_by: null, canceled_at: null })
    const [filialOptions, setFilialOptions] = useState([])
    const [groupOptions, setGroupOptions] = useState([])
    const generalForm = useRef()

    useEffect(() => {
        async function getPageData() {
            await getDefaultGroupOptions()
            await getDefaultFilialOptions()
            try {
                const { data } = await api.get(`users/${id}`)
                setPageData({ ...data, group_id: data.groups[0].group.id, loaded: true })
                const { created_by, created_at, updated_by, updated_at, canceled_by, canceled_at } = data;
                const registries = await getRegistries({ created_by, created_at, updated_by, updated_at, canceled_by, canceled_at })
                setRegistry(registries)
            } catch (err) {
                toast(err.response.data.error, { type: 'error', autoClose: 3000 })
            }
        }

        async function getDefaultGroupOptions() {
            const { data } = await api.get('/groups')
            const retGroupOptions = data.map((group) => {
                return { value: group.id, label: group.name }
            })
            setGroupOptions(retGroupOptions)
        }

        async function getDefaultFilialOptions() {
            const { data } = await api.get('/filials')
            const retGroupOptions = data.map((filial) => {
                return { value: filial.id, label: filial.name }
            })
            setFilialOptions(retGroupOptions)
        }

        if (id === 'new') {
            getDefaultGroupOptions()
            getDefaultFilialOptions()
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
                const response = await api.post(`/users/filial`, data)
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
                    await api.put(`/users/${id}`, objUpdated)
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
            await api.delete(`users/${id}`)
            toast("Group Inactivated!", { autoClose: 1000 })
            handleOpened(null)
        } catch (err) {
            toast(err.response.data.error, { type: 'error', autoClose: 3000 })
        }
    }

    function handleAddFilial() {
        setSuccessfullyUpdated(false)
        const addedFilials = [...pageData.filials]
        addedFilials.push({ filial_id: null, filial: { id: null } })
        setPageData({ ...pageData, filials: addedFilials })
    }

    function handleRemoveFilial(index) {
        setSuccessfullyUpdated(false)

        const newData = generalForm.current.getData()
        const removedFilial = { ...newData.filials[index] }

        newData.filials.splice(index, 1);
        generalForm.current.setData(newData)

        const removedFilials = pageData.filials.filter(filial => filial.filial_id !== removedFilial.filial_id)
        // console.log(removedFilials)
        setPageData({ ...pageData, filials: removedFilials })
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
                    <p className='border-b mb-1 pb-1'>User Information</p>
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
                                <InputContext.Provider value={{ id, setSuccessfullyUpdated, fullscreen, setFullscreen, successfullyUpdated, handleCloseForm, handleInactivate, canceled: pageData.canceled_at }}>
                                    {id === 'new' || pageData.loaded ?
                                        <>
                                            <FormHeader access={access} title={pageData.name} registry={registry} InputContext={InputContext} />

                                            <InputLineGroup title='GENERAL' activeMenu={activeMenu === 'general'}>
                                                <InputLine title='General Data'>
                                                    <Input type='text' name='name' required title='Name' defaultValue={pageData.name} InputContext={InputContext} />
                                                    <Input type='text' name='email' required title='E-mail' grow defaultValue={pageData.email} InputContext={InputContext} />
                                                    <SelectPopover disabled={pageData.group_id === 'a05b7c30-e4bc-495c-85f3-b88b958b46fe'} name='group_id' title='Group' required grow options={pageData.group_id === 'a05b7c30-e4bc-495c-85f3-b88b958b46fe' ? groupOptions.filter((group) => group.value === 'a05b7c30-e4bc-495c-85f3-b88b958b46fe') : groupOptions.filter((group) => !('a05b7c30-e4bc-495c-85f3-b88b958b46fe;ae0453fd-b493-41ff-803b-9aea989a8567'.includes(group.value)))} defaultValue={pageData.group_id ? groupOptions.filter((group) => group.value === pageData.group_id) : groupOptions.filter((group) => group.value === 1)} InputContext={InputContext} />
                                                </InputLine>
                                                <h3 className='font-bold pl-4 pb-2 mt-4 border-b w-full'>Filials</h3>
                                                {pageData.filials.map((filial, index) => {
                                                    if (filial.id !== 1) {
                                                        return <Scope key={index} path={`filials[${index}]`}>
                                                            <InputLine>
                                                                {id === 'new' || (filial && filial.filial) ?
                                                                    <>
                                                                        {index ? <button type='button' onClick={() => handleRemoveFilial(index)}><Trash size={14} className='mt-4' /></button> : null}
                                                                        <SelectPopover name='filial_id' title='Filial' required grow options={filialOptions} defaultValue={filialOptions.filter((filOpt) => filOpt.value === filial.filial_id)} InputContext={InputContext} />
                                                                    </>
                                                                    : null}
                                                            </InputLine>
                                                        </Scope>
                                                    }
                                                })}
                                                <button type='button' onClick={() => handleAddFilial()} className='bg-slate-100 border ml-6 py-1 px-2 text-xs flex flex-row justify-center items-center gap-2 rounded-md transition-all hover:border-primary hover:text-primary'><PlusCircle size={16} /> Filial</button>

                                            </InputLineGroup>
                                        </> : <FormLoading />}

                                </InputContext.Provider>
                            </Form>
                        </div>

                    </div>
                </div>
            : null}

    </Preview>;
}
