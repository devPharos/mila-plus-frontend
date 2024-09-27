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
import { getRegistries, handleUpdatedFields } from '~/functions';
import SelectPopover from '~/components/RegisterForm/SelectPopover';
import FormLoading from '~/components/RegisterForm/FormLoading';

export const InputContext = createContext({})

export default function PagePreview({ access, id, handleOpened, setOpened, defaultFormType = 'preview', successfullyUpdated, setSuccessfullyUpdated }) {
    const [pageData, setPageData] = useState({
        origin: '',
        type: '',
        subtype: '',
        title: '',
        loaded: false
    })
    const [formType, setFormType] = useState(defaultFormType)
    const [fullscreen, setFullscreen] = useState(false)
    const [activeMenu, setActiveMenu] = useState('general')

    const [registry, setRegistry] = useState({ created_by: null, created_at: null, updated_by: null, updated_at: null, canceled_by: null, canceled_at: null })
    const generalForm = useRef()

    const options = [{
        origin: 'Employees',
        label: 'Employees',
        value: 'Employees',
        types: [
            {
                type: 'Faculty',
                label: 'Faculty',
                value: 'Faculty',
                subtypes: [
                    {
                        subtype: 'Pay Roll',
                        label: 'Pay Roll',
                        value: 'Pay Roll',
                        multiple: false,
                        required: false
                    },
                    {
                        subtype: 'Contract',
                        label: 'Contract',
                        value: 'Contract',
                        multiple: false,
                        required: false
                    }
                ]
            }
        ]
    }, {
        origin: 'Enrollment',
        label: 'Enrollment',
        value: 'Enrollment',
        types: [
            {
                type: 'Initial Visa',
                label: 'Initial Visa',
                value: 'Initial Visa',
                subtypes: [
                    {
                        subtype: 'Student',
                        label: 'Student',
                        value: 'Student',
                    },
                    {
                        subtype: 'Dependent',
                        label: 'Dependent',
                        value: 'Dependent',
                    },
                    {
                        subtype: 'Sponsor',
                        label: 'Sponsor',
                        value: 'Sponsor',
                    }
                ]
            },
            {
                type: 'Change of Status',
                label: 'Change of Status',
                value: 'Change of Status',
                subtypes: [
                    {
                        subtype: 'Student',
                        label: 'Student',
                        value: 'Student',
                    },
                    {
                        subtype: 'Depdendent',
                        label: 'Depdendent',
                        value: 'Depdendent',
                    },
                    {
                        subtype: 'Sponsor',
                        label: 'Sponsor',
                        value: 'Sponsor',
                    }
                ]
            },
            {
                type: 'Transfer',
                label: 'Transfer',
                value: 'Transfer',
                subtypes: [
                    {
                        subtype: 'Student',
                        label: 'Student',
                        value: 'Student',
                    },
                    {
                        subtype: 'Depdendent',
                        label: 'Depdendent',
                        value: 'Depdendent',
                    },
                    {
                        subtype: 'Sponsor',
                        label: 'Sponsor',
                        value: 'Sponsor',
                    }
                ]
            },
            {
                type: 'Reinstatement',
                label: 'Reinstatement',
                value: 'Reinstatement',
                subtypes: [
                    {
                        subtype: 'Student',
                        label: 'Student',
                        value: 'Student',
                    },
                    {
                        subtype: 'Depdendent',
                        label: 'Depdendent',
                        value: 'Depdendent',
                    },
                    {
                        subtype: 'Sponsor',
                        label: 'Sponsor',
                        value: 'Sponsor',
                    }
                ]
            },
            {
                type: 'Private',
                label: 'Private',
                value: 'Private',
                subtypes: [
                    {
                        subtype: 'Student',
                        label: 'Student',
                        value: 'Student',
                    },
                    {
                        subtype: 'Depdendent',
                        label: 'Depdendent',
                        value: 'Depdendent',
                    },
                    {
                        subtype: 'Sponsor',
                        label: 'Sponsor',
                        value: 'Sponsor',
                    }
                ]
            }
        ]
    }, {
        origin: 'Transfer Eligibility',
        label: 'Transfer Eligibility',
        value: 'Transfer Eligibility',
        types: [
            {
                type: 'Transfer',
                label: 'Transfer',
                value: 'Transfer',
                subtypes: [
                    {
                        subtype: 'Student',
                        label: 'Student',
                        value: 'Student',
                    },
                    {
                        subtype: 'Dependent',
                        label: 'Dependent',
                        value: 'Dependent',
                    },
                    {
                        subtype: 'Sponsor',
                        label: 'Sponsor',
                        value: 'Sponsor',
                    }
                ]
            },
        ]
    }]

    const yesOrNoOptions = [{ value: true, label: 'Yes' }, { value: false, label: 'No' }]

    useEffect(() => {
        async function getPageData() {
            if (id !== 'new') {
                try {
                    const { data } = await api.get(`/documents/${id}`)
                    setPageData({ ...data, loaded: true })
                    const { created_by, created_at, updated_by, updated_at, canceled_by, canceled_at } = data;
                    const registries = await getRegistries({ created_by, created_at, updated_by, updated_at, canceled_by, canceled_at })
                    setRegistry(registries)
                } catch (err) {
                    toast(err.response.data.error, { type: 'error', autoClose: 3000 })
                }
            } else {
                setPageData({ ...pageData, loaded: true })
                setFormType('full')
            }
        }
        getPageData()
    }, [])

    async function handleGeneralFormSubmit(data) {
        if (successfullyUpdated) {
            toast("No need to be saved!", { autoClose: 1000, type: 'info', transition: Zoom })
            return
        }
        if (id === 'new') {
            try {
                const response = await api.post(`/documents`, { ...data })
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
                    await api.put(`/documents/${id}`, { ...objUpdated })
                    setPageData({ ...pageData, ...objUpdated })
                    setSuccessfullyUpdated(true)
                    toast("Saved!", { autoClose: 1000 })
                    handleOpened(null)
                } catch (err) {
                    console.log(err)
                    toast(err.response.data.error, { type: 'error', autoClose: 3000 })
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

    async function handleInactivate() {
        try {
            await api.delete(`documents/${id}`)
            toast("Document Inactivated!", { autoClose: 1000 })
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
                    <p className='border-b mb-1 pb-1'>Document Information</p>
                    <div className='flex flex-row items-center gap-1 text-xs'><strong>Title:</strong> {pageData.title}</div>
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
                                    {pageData.loaded ?
                                        <>
                                            <FormHeader access={access} title={pageData.name} registry={registry} InputContext={InputContext} />
                                            <InputLineGroup title='GENERAL' activeMenu={activeMenu === 'general'}>
                                                <InputLine title='General Data'>
                                                    <SelectPopover name='origin' grow required title='Origin' isSearchable onChange={(el) => setPageData({ ...pageData, origin: el.value, type: null, subtype: null })} defaultValue={pageData.origin ? options.find(origin => origin.value === pageData.origin) : null} options={options} InputContext={InputContext} />
                                                    <SelectPopover name='type' grow required title='Type' isSearchable onChange={(el) => setPageData({ ...pageData, type: el.value, subtype: null })} defaultValue={pageData.origin ? options.find(origin => origin.value === pageData.origin).types.filter(type => type.value === pageData.type) : []} options={pageData.origin ? options.find(origin => origin.value === pageData.origin).types : []} InputContext={InputContext} />
                                                    <SelectPopover name='subtype' grow required title='Subtype' isSearchable defaultValue={pageData.origin && pageData.type ? options.find(origin => origin.value === pageData.origin).types.find(type => type.value === pageData.type).subtypes.filter(subtype => subtype.value === pageData.subtype) : []} options={pageData.origin && pageData.type ? options.find(origin => origin.value === pageData.origin).types.find(type => type.value === pageData.type).subtypes : []} InputContext={InputContext} />
                                                </InputLine>
                                                <InputLine>
                                                    <Input type='text' name='title' required grow title='Document Title' defaultValue={pageData.title} InputContext={InputContext} />
                                                    <SelectPopover name='required' required title='Required' isSearchable defaultValue={yesOrNoOptions.filter(required => required.value === pageData.required)} options={yesOrNoOptions} InputContext={InputContext} />
                                                    <SelectPopover name='multiple' required title='Multiple' isSearchable defaultValue={yesOrNoOptions.filter(multiple => multiple.value === pageData.multiple)} options={yesOrNoOptions} InputContext={InputContext} />
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
