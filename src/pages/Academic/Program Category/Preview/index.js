import { Form } from '@unform/web';
import { Building, Pencil, X } from 'lucide-react';
import React, { createContext, useEffect, useRef, useState } from 'react';
import Input from '~/components/RegisterForm/Input';
import RegisterFormMenu from '~/components/RegisterForm/Menu';
import InputLine from '~/components/RegisterForm/InputLine';
import InputLineGroup from '~/components/RegisterForm/InputLineGroup';
import FormHeader from '~/components/RegisterForm/FormHeader';
import Preview from '~/components/Preview';
import { Zoom, toast } from 'react-toastify';
import api from '~/services/api';
import { getRegistries } from '~/functions';
import Select from '~/components/RegisterForm/Select';
import SelectPopover from '~/components/RegisterForm/SelectPopover';

export const InputContext = createContext({})

export default function ProgramCategoryPreview({ id, handleOpened, setOpened, defaultFormType = 'preview' }) {
    const [pageData, setPageData] = useState({
        name: '',
        language_id: null,
        Language: null,
    })
    const [successfullyUpdated, setSuccessfullyUpdated] = useState(true)
    const [registry, setRegistry] = useState({ created_by: null, created_at: null, updated_by: null, updated_at: null, canceled_by: null, canceled_at: null })
    const [formType, setFormType] = useState(defaultFormType)
    const [fullscreen, setFullscreen] = useState(false)
    const [activeMenu, setActiveMenu] = useState('general')
    const generalForm = useRef()

    const [languageOptions, setLanguageOptions] = useState([])

    function handleCloseForm() {
        if (!successfullyUpdated) {
            toast("Changes discarted!", { autoClose: 1000 })
        }
        handleOpened(null)
    }

    async function handleGeneralFormSubmit(data) {
        if (successfullyUpdated) {
            toast("No need to be saved!", { autoClose: 1000, type: 'info', transition: Zoom })
            return
        }
        if (id === 'new') {
            console.log('new')
            try {
                const response = await api.post(`/programcategories`, data)
                setOpened(response.data.id)
                setPageData({ ...pageData, ...data })
                setSuccessfullyUpdated(true)
                toast("Saved!", { autoClose: 1000 })
                handleOpened(null)
            } catch (err) {
                console.log(err)
            }
        } else if (id !== 'new') {
            console.log('edit')
            const dataInArray = Object.keys(data).map((key) => [key, data[key]])
            const pageDataInArray = Object.keys(pageData).map((key) => [key, pageData[key]]);

            // console.log(pageDataInArray)
            const updated = dataInArray.filter((field) => {
                const x = field[1] === 'Yes' ? true : field[1] === 'No' ? false : field[1];
                // const y = 999;
                // console.log(field[0])
                const y = pageDataInArray.find(filialField => filialField[0] === field[0])[1];

                if (x !== y && (x || y)) {
                    return field;
                }
            })

            if (updated.length > 0) {
                const objUpdated = Object.fromEntries(updated);
                try {
                    // console.log(objUpdated)
                    await api.put(`/programcategories/${id}`, objUpdated)
                    setPageData({ ...pageData, ...objUpdated })
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

    useEffect(() => {
        async function getPageData() {
            try {
                const { data } = await api.get(`programcategories/${id}`)
                setPageData(data)
                const { created_by, created_at, updated_by, updated_at, canceled_by, canceled_at } = data;
                const registries = await getRegistries({ created_by, created_at, updated_by, updated_at, canceled_by, canceled_at })
                setRegistry(registries)
            } catch (err) {
                console.log(err)
            }
        }
        async function getLanguages() {
            try {
                const { data } = await api.get(`languages`)
                const languages = data.map(({ id, name }) => {
                    return { value: id, label: name }

                })
                setLanguageOptions(languages)
            } catch (err) {
                console.log(err)
            }
        }
        getLanguages()
        if (id === 'new') {
            setFormType('full')
        } else if (id) {
            getPageData()
        }
    }, [])

    return <Preview formType={formType} fullscreen={fullscreen}>
        {pageData ?
            formType === 'preview' ? <div className='border h-full rounded-xl overflow-hidden flex flex-col justify-start gap-1 overflow-y-scroll'>
                <div className='relative bg-gray-100 h-16 px-4 py-2 flex flex-row items-start justify-start'>

                    <button onClick={() => setFormType('full')} className='absolute top-2 right-20 text-md font-bold bg-mila_orange text-white rounded-md p-1 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1'>
                        <Pencil size={16} color="#fff" /> Edit
                    </button>
                    <button onClick={() => handleOpened(null)} className='absolute top-2 right-2 text-md font-bold bg-secondary rounded-md p-1 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1'>
                        <X size={16} /> Close
                    </button>
                    <h2 style={{ fontSize: 24 }}>{pageData.name}</h2>

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
                                <InputContext.Provider value={{ id, generalForm, setSuccessfullyUpdated, fullscreen, setFullscreen, successfullyUpdated, handleCloseForm }}>

                                    <FormHeader title={pageData.name} registry={registry} InputContext={InputContext} />

                                    <InputLineGroup title='GENERAL' activeMenu={activeMenu === 'general'}>
                                        <InputLine title='General Data'>
                                            <Input type='text' name='name' required title='Name' grow defaultValue={pageData.name} InputContext={InputContext} />
                                            {id === 'new' || pageData.Language ?
                                                <SelectPopover type='text' name='language_id' required title='Language' options={languageOptions} grow defaultValue={{ value: pageData.language_id, label: pageData.Language ? pageData.Language.name : '' }} InputContext={InputContext} />
                                                : null
                                            }
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
