import { Form } from '@unform/web';
import { Ambulance, BadgeDollarSign, BookText, Building, CheckCircle, Contact, Files, FileSignature, PlusCircle, Trash, User } from 'lucide-react';
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
import DatePicker from '~/components/RegisterForm/DatePicker';
import { add, format, parseISO, set } from 'date-fns';
import CountryList from 'country-list-with-dial-code-and-flag';
import FormLoading from '~/components/RegisterForm/FormLoading';
import { useSearchParams } from 'react-router-dom';
import { Scope } from '@unform/core';

export const InputContext = createContext({})

export default function EnrollmentOutside({ access = null, handleOpened, setOpened, defaultFormType = 'preview' }) {
    const [pageData, setPageData] = useState({
        enrollmentemergencies: [{
            name: '',
            relationship_type: '',
            email: '',
            phone: ''
        }],
        activeMenu: null,
        loaded: false
    })
    const [searchparams, setSearchParams] = useSearchParams();
    const [formType, setFormType] = useState('full')
    const [fullscreen, setFullscreen] = useState(true)

    const [registry, setRegistry] = useState({ created_by: null, created_at: null, updated_by: null, updated_at: null, canceled_by: null, canceled_at: null })
    const generalForm = useRef()
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const genderOptions = [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Not Specified', label: 'Not Specified' }]
    const maritalStatusOptions = [{ value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Widowed', label: 'Widowed' }, { value: 'Divorced', label: 'Divorced' }, { value: 'Separated', label: 'Separated' }]
    const relationshipTypeOptions = [{ value: 'Parents', label: 'Parents' }, { value: 'Grand Parents', label: 'Grand Parents' }, { value: 'Brother/Sister', label: 'Brother/Sister' }, { value: 'Friend', label: 'Friend' }, { value: 'Husband/Wife', label: 'Husband/Wife' }, { value: 'Other', label: 'Other' }]
    const sponsorRelationshipTypeOptions = [{ value: 'Parents', label: 'Parents' }, { value: 'Family', label: 'Family' }, { value: 'Student Loan', label: 'Student Loan' }, { value: 'Government Scholarship or Loan', label: 'Government Scholarship or Loan' }, { value: 'Other', label: 'Other' }]
    const scheduleOptions = [{ value: '4 days - Morning - 08:30 to 01:00', label: '4 days - Morning - 08:30 to 01:00' }, { value: '4 days - Evening - 06:00 to 10:30', label: '4 days - Evening - 06:00 to 10:30' }, { value: '2 days - Full Time (Wed - Thu) - 08:30 to 18:00', label: '2 days - Full Time (Wed - Thu) - 08:30 to 18:00' }]
    const dept1TypeOptions = [{ value: 'Wholly Dependent', label: 'Wholly Dependent' }, { value: 'Partially Dependent', label: 'Partially Dependent' }]
    const addressOptions = [{ value: 'Address in USA', label: 'Address in USA' }, { value: 'Address in Home Country', label: 'Address in Home Country' }]
    const id = searchparams.get('crypt');

    const countriesOptions = countries_list.map(country => {
        return { value: country, label: country }
    })

    useEffect(() => {
        async function getCountriesList() {
            const countriesList = CountryList.getAll().map(country => {
                return { value: country.dial_code, label: country.flag + " " + country.dial_code + " " + country.name, code: country.dial_code, name: country.name }
            })

            return countriesList
        }
        async function getPageData() {
            if (id !== 'new') {
                try {
                    const ddiOptions = await getCountriesList()
                    const { data } = await api.get(`/outside/enrollments/${id}`)
                    const { created_by, created_at, updated_by, updated_at, canceled_by, canceled_at } = data;
                    const registries = await getRegistries({ created_by, created_at, updated_by, updated_at, canceled_by, canceled_at })
                    setRegistry(registries)
                    setPageData({ ...data, loaded: true, ddiOptions, activeMenu: data.form_step })

                } catch (err) {
                    toast(err.response.data.error, { type: 'error', autoClose: 3000 })
                }
            }
        }
        if (!pageData.loaded) {
            getPageData()
        }
    }, [pageData.loaded])

    async function handleGeneralFormSubmit(data) {
        // setLoading(true)
        if (successfullyUpdated) {
            toast("No need to be saved!", { autoClose: 1000, type: 'info', transition: Zoom })
            setLoading(false)
            return
        }
        if (id !== 'new') {
            const updated = handleUpdatedFields(data, pageData)

            if (updated.length > 0) {
                const objUpdated = Object.fromEntries(updated);
                const { birth_date, passport_expiration_date, i94_expiration_date } = objUpdated;
                try {
                    await api.put(`/outside/enrollments/${id}`, { ...objUpdated, birth_date: birth_date ? format(birth_date, 'yyyyMMdd') : null, passport_expiration_date: passport_expiration_date ? format(passport_expiration_date, 'yyyyMMdd') : null, i94_expiration_date: i94_expiration_date ? format(i94_expiration_date, 'yyyyMMdd') : null })
                    setSuccessfullyUpdated(true)
                    toast("Saved!", { autoClose: 1000 })
                    setPageData({ ...pageData, loaded: false })
                    setLoading(false)
                } catch (err) {
                    console.log(err)
                    toast(err.response.data.error, { type: 'error', autoClose: 3000 })
                    setLoading(false)
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

    function handleHasDependents(el) {
        setSuccessfullyUpdated(false)
        setPageData({ ...pageData, has_dependents: el.value, enrollmentdependents: el.value === 'Yes' ? [{ name: null, relationship_type: null, gender: null, dept1_type: null, email: null, phone: null }] : [] })
    }

    function handleHasSponsors(el) {
        setSuccessfullyUpdated(false)
        setPageData({ ...pageData, need_sponsorship: el.value, enrollmentsponsors: el.value === 'Yes' ? [{ name: null, relationship_type: null, email: null, phone: null }] : [] })
    }

    function handleAddDependent() {
        setSuccessfullyUpdated(false)
        const addedDependents = [...pageData.enrollmentdependents]
        addedDependents.push({ name: null, relationship_type: null, gender: null, dept1_type: null, email: null, phone: null })
        setPageData({ ...pageData, enrollmentdependents: addedDependents })
    }

    function handleAddSponsor() {
        setSuccessfullyUpdated(false)
        const addedSponsors = [...pageData.enrollmentsponsors]
        addedSponsors.push({ name: null, relationship_type: null, email: null, phone: null })
        setPageData({ ...pageData, enrollmentsponsors: addedSponsors })
    }

    function handleRemoveDependent(index) {
        setSuccessfullyUpdated(false)

        const newData = generalForm.current.getData()
        const removedDependent = { ...newData.enrollmentdependents[index] }

        newData.enrollmentdependents.splice(index, 1);
        generalForm.current.setData(newData)

        const removedDependents = pageData.enrollmentdependents.filter(dependent => dependent.id !== removedDependent.id)
        setPageData({ ...pageData, enrollmentdependents: removedDependents })
    }

    function handleRemoveSponsor(index) {
        setSuccessfullyUpdated(false)

        const newData = generalForm.current.getData()
        const removedSponsor = { ...newData.enrollmentsponsors[index] }

        newData.enrollmentsponsors.splice(index, 1);
        generalForm.current.setData(newData)

        const removedSponsors = pageData.enrollmentsponsors.filter(sponsor => sponsor.id !== removedSponsor.id)
        setPageData({ ...pageData, enrollmentsponsors: removedSponsors })
    }

    return <Preview formType={formType} fullscreen={fullscreen}>
        {/* {sent && <div className='flex h-full flex-row items-center justify-center text-center gap-4'>
            <CheckCircle size={32} color='#00b361' />
            Thank you!</div>} */}
        {!sent && pageData.loaded ?
            <div className='flex h-full flex-col items-start justify-between gap-4 md:flex-row'>

                <div className='flex flex-row items-center justify-between text-xs w-32 gap-4 md:flex-col'>
                    <RegisterFormMenu disabled={pageData.activeMenu !== 'student-information'} activeMenu={pageData.activeMenu} name='student-information' >
                        <User size={22} /> Student Information
                    </RegisterFormMenu>
                    <RegisterFormMenu disabled={pageData.activeMenu !== 'emergency-contact'} activeMenu={pageData.activeMenu} name='emergency-contact' >
                        <Ambulance size={22} /> Emergency Contact
                    </RegisterFormMenu>
                    <RegisterFormMenu disabled={pageData.activeMenu !== 'enrollment-information'} activeMenu={pageData.activeMenu} name='enrollment-information' >
                        <BookText size={22} /> Enrollment Information
                    </RegisterFormMenu>
                    <RegisterFormMenu disabled={pageData.activeMenu !== 'dependent-information'} activeMenu={pageData.activeMenu} name='dependent-information' >
                        <Contact size={22} /> Dependent Information
                    </RegisterFormMenu>
                    <RegisterFormMenu disabled={pageData.activeMenu !== 'affidavit-of-support'} activeMenu={pageData.activeMenu} name='affidavit-of-support' >
                        <BadgeDollarSign size={22} /> Affidavit of Support
                    </RegisterFormMenu>
                    <RegisterFormMenu disabled={pageData.activeMenu !== 'documents-upload'} activeMenu={pageData.activeMenu} name='documents-upload' >
                        <Files size={22} /> Documents Upload
                    </RegisterFormMenu>
                    <RegisterFormMenu disabled={pageData.activeMenu !== 'student-signature'} activeMenu={pageData.activeMenu} name='student-signature' >
                        <FileSignature size={22} /> Student's Signature
                    </RegisterFormMenu>
                </div>
                <div className='border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start'>
                    <div className='flex flex-col items-start justify-start text-sm overflow-y-scroll h-full'>
                        <Form ref={generalForm} onSubmit={handleGeneralFormSubmit} className='w-full h-full'>
                            <InputContext.Provider value={{ id, generalForm, setSuccessfullyUpdated, fullscreen, setFullscreen, successfullyUpdated, handleCloseForm, handleInactivate, handleOutsideMail, canceled: pageData.canceled_at }}>
                                {pageData.loaded ?
                                    <>
                                        <FormHeader saveText='Save & Continue' outside loading={loading} access={access} title={pageData.students.name + ' ' + pageData.students.last_name + ' - Enrollment Process'} registry={registry} InputContext={InputContext} />
                                        {pageData.activeMenu === 'student-information' && <InputLineGroup title='Student Information' activeMenu={pageData.activeMenu === 'student-information'}>
                                            <InputLine title='General Data'>
                                                <Input type='text' required name='legal_name' grow title='Legal Name' defaultValue={pageData.legal_name} InputContext={InputContext} />
                                                <SelectPopover name='gender' required grow title='Gender' isSearchable defaultValue={genderOptions.find(gender => gender.value === pageData.gender)} options={genderOptions} InputContext={InputContext} />
                                                <DatePicker name='birth_date' required grow title='Birth Date' defaultValue={pageData.birth_date ? parseISO(pageData.birth_date) : null} placeholderText='MM/DD/YYYY' InputContext={InputContext} />
                                                <SelectPopover name='marital_status' required grow title='Marital Status' isSearchable defaultValue={maritalStatusOptions.find(maritalStatus => maritalStatus.value === pageData.marital_status)} options={maritalStatusOptions} InputContext={InputContext} />
                                            </InputLine>
                                            {pageData.students.sub_status === 'Transfer In' && <InputLine title='Previous School'>
                                                <Input type='text' name='previous_school' grow title='Name' defaultValue={pageData.previous_school} InputContext={InputContext} />
                                            </InputLine>}
                                            <InputLine title='Birth Details'>
                                                <Input type='text' name='birth_city' grow title='Birth City' defaultValue={pageData.birth_city} InputContext={InputContext} />
                                                <Input type='text' name='birth_state' grow title='Birth State' defaultValue={pageData.birth_state} InputContext={InputContext} />
                                                <SelectPopover name='birth_country' grow title='Birth Country' isSearchable defaultValue={countriesOptions.find(country => country.value === pageData.birth_country)} options={countriesOptions} InputContext={InputContext} />
                                                <Input type='text' name='native_language' grow title='Native Language' defaultValue={pageData.native_language} InputContext={InputContext} />
                                                {console.log(countriesOptions)}
                                                <SelectPopover name='citizen_country' grow title='Citizen Country' isSearchable defaultValue={countriesOptions.find(country => country.value === pageData.citizen_country)} options={countriesOptions} InputContext={InputContext} />
                                            </InputLine>
                                            <InputLine title='Documentation'>
                                                <Input type='text' name='passport_number' grow title='Passport Number' placeholder='-----' defaultValue={pageData.passport_number} InputContext={InputContext} />
                                                <DatePicker name='passport_expiration_date' grow title='Passport Expiration Date' defaultValue={pageData.passport_expiration_date ? parseISO(pageData.passport_expiration_date) : null} placeholderText='MM/DD/YYYY' InputContext={InputContext} />
                                                {pageData.students.sub_status === 'Change of Visa Status' && <DatePicker name='i94_expiration_date' grow title='I94 Expiration Date' defaultValue={pageData.i94_expiration_date ? parseISO(pageData.i94_expiration_date) : null} placeholderText='MM/DD/YYYY' InputContext={InputContext} />}
                                            </InputLine>

                                            {pageData.students.sub_status !== 'Initial' && <InputLine title='Admission Correspondence'>
                                                <SelectPopover name='admission_correspondence_address' grow title='Please check the box where you wish your admission correspondence to be mailed' options={addressOptions} defaultValue={addressOptions.find(address => address.value === pageData.admission_correspondence_address)} InputContext={InputContext} />
                                            </InputLine>}

                                            {pageData.students.sub_status !== 'Transfer In' && <InputLine title='Address in Home Country'>
                                                <Input type='text' name='home_phone_number' grow title='Phone Number' isPhoneNumber defaultValue={pageData.home_phone_number} InputContext={InputContext} />
                                                <Input type='text' name='usa_address' grow title='Address' defaultValue={pageData.usa_address} InputContext={InputContext} />
                                                <Input type='text' name='home_zip_code' grow title='Zip Code' defaultValue={pageData.home_zip_code} InputContext={InputContext} />
                                            </InputLine>}
                                            {pageData.students.sub_status !== 'Transfer In' && <InputLine>
                                                <Input type='text' name='home_city' grow title='City' defaultValue={pageData.home_city} InputContext={InputContext} />
                                                <Input type='text' name='home_state' grow title='State' defaultValue={pageData.home_state} InputContext={InputContext} />
                                                <SelectPopover name='home_country' grow title='Country' isSearchable defaultValue={countriesOptions.find(country => country.value === pageData.home_country)} options={countriesOptions} InputContext={InputContext} />
                                            </InputLine>}
                                            {pageData.students.sub_status !== 'Initial' && <InputLine title='Address in United States'>
                                                <Input type='text' name='usa_phone_number' grow title='USA Phone Number' isPhoneNumber defaultValue={pageData.usa_phone_number} InputContext={InputContext} />
                                                <Input type='text' name='usa_address' grow title='USA Address' defaultValue={pageData.usa_address} InputContext={InputContext} />
                                                <Input type='text' name='usa_zip_code' grow title='USA Zip Code' isZipCode defaultValue={pageData.usa_zip_code} InputContext={InputContext} />
                                            </InputLine>}
                                            {pageData.students.sub_status !== 'Initial' && <InputLine>
                                                <Input type='text' name='usa_city' grow title='USA City' defaultValue={pageData.usa_city} InputContext={InputContext} />
                                                <Input type='text' name='usa_state' grow title='USA State' defaultValue={pageData.usa_state} InputContext={InputContext} />
                                            </InputLine>}
                                        </InputLineGroup>}
                                        {pageData.activeMenu === 'emergency-contact' && <InputLineGroup title='Emergency Contact' activeMenu={pageData.activeMenu === 'emergency-contact'}>
                                            <Scope path={`enrollmentemergencies[0]`}>
                                                <InputLine title='Emergency Contact'>
                                                    <Input type='text' name='name' required grow title='Full Name' defaultValue={pageData.enrollmentemergencies.length > 0 ? pageData.enrollmentemergencies[0].name : ''} InputContext={InputContext} />
                                                    <SelectPopover name='relationship_type' required grow title='Relationship Type' options={relationshipTypeOptions} isSearchable defaultValue={relationshipTypeOptions.find(relationshipType => relationshipType.value === pageData.enrollmentemergencies[0].relationship_type)} InputContext={InputContext} />
                                                </InputLine>
                                                <InputLine>
                                                    <Input type='text' name='email' required grow title='E-mail' defaultValue={pageData.enrollmentemergencies.length > 0 ? pageData.enrollmentemergencies[0].email : ''} InputContext={InputContext} />
                                                    <Input type='text' name='phone' required grow title='Phone Number' isPhoneNumber defaultValue={pageData.enrollmentemergencies.length > 0 ? pageData.enrollmentemergencies[0].phone : ''} InputContext={InputContext} />
                                                </InputLine>
                                            </Scope>
                                        </InputLineGroup>}
                                        {pageData.activeMenu === 'enrollment-information' && <InputLineGroup title='Enrollment Information' activeMenu={pageData.activeMenu === 'enrollment-information'}>
                                            <InputLine title='Enrollment Information'>
                                                <Input type='text' name='plan_months' required onlyInt title='How many months do you plan to study?' defaultValue={pageData.plan_months} InputContext={InputContext} />
                                                <SelectPopover name='plan_schedule' required grow title='What is your plan schedule?' options={scheduleOptions} isSearchable defaultValue={scheduleOptions.find(schedule => schedule.value === pageData.plan_schedule)} InputContext={InputContext} />
                                                <DatePicker name='plan_date' required grow title='What date do you wish to begin classes (M)?' defaultValue={pageData.plan_date ? parseISO(pageData.plan_date) : null} placeholderText='MM/DD/YYYY' InputContext={InputContext} />
                                            </InputLine>
                                        </InputLineGroup>}
                                        {pageData.activeMenu === 'dependent-information' && <InputLineGroup title='Dependent Information' activeMenu={pageData.activeMenu === 'dependent-information'}>
                                            <InputLine title='Dependent Information'>
                                                <SelectPopover name='has_dependents' onChange={(el) => handleHasDependents(el)} required grow title='Do you have dependents?' options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} InputContext={InputContext} />
                                            </InputLine>
                                            {pageData.has_dependents === 'Yes' && <>
                                                {pageData.enrollmentdependents.map((dependent, index) => {
                                                    if (dependent.id !== 1) {
                                                        return <Scope key={index} path={`enrollmentdependents[${index}]`}>
                                                            <InputLine title={`Dependent ${index + 1}`}>
                                                                {index ? <button type='button' onClick={() => handleRemoveDependent(index)}><Trash size={14} className='mt-4' /></button> : null}
                                                                <Input type='text' name='name' required grow title='Name' defaultValue={dependent.name} InputContext={InputContext} />
                                                                <SelectPopover name='gender' required grow title='Gender' options={genderOptions} isSearchable defaultValue={genderOptions.find(gender => gender.value === dependent.gender)} InputContext={InputContext} />
                                                                <SelectPopover name='dept1_type' required grow title='Dept1 Type' options={dept1TypeOptions} isSearchable defaultValue={dept1TypeOptions.find(dept1Type => dept1Type.value === dependent.dept1_type)} InputContext={InputContext} />
                                                                <SelectPopover name='relationship_type' required grow title='Relationship Type' options={relationshipTypeOptions} isSearchable defaultValue={relationshipTypeOptions.find(relationshipType => relationshipType.value === dependent.relationship_type)} InputContext={InputContext} />
                                                                <Input type='text' name='email' required grow title='E-mail' defaultValue={dependent.email} InputContext={InputContext} />
                                                                <Input type='text' name='phone' required grow title='Phone Number' isPhoneNumber defaultValue={dependent.phone} InputContext={InputContext} />
                                                            </InputLine>
                                                        </Scope>
                                                    }
                                                })}
                                                <button type='button' onClick={() => handleAddDependent()} className='bg-slate-100 border ml-6 py-1 px-2 text-xs flex flex-row justify-center items-center gap-2 rounded-md transition-all hover:border-primary hover:text-primary'><PlusCircle size={16} /> Dependent</button>
                                            </>}
                                        </InputLineGroup>}
                                        {pageData.activeMenu === 'affidavit-of-support' && <InputLineGroup title='Affidavit of Support' activeMenu={pageData.activeMenu === 'affidavit-of-support'}>
                                            <InputLine title='Affidavit of Support'>
                                                <SelectPopover name='need_sponsorship' onChange={(el) => handleHasSponsors(el)} required grow title='Do you need sponsorship?' options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No (Self Financial Resource)' }]} InputContext={InputContext} />
                                            </InputLine>
                                            {pageData.need_sponsorship === 'Yes' && <>
                                                {pageData.enrollmentsponsors && pageData.enrollmentsponsors.map((sponsor, index) => {
                                                    return <Scope key={index} path={`enrollmentsponsors[${index}]`}>
                                                        <InputLine title={`Sponsor ${index + 1}`}>
                                                            {index ? <button type='button' onClick={() => handleRemoveSponsor(index)}><Trash size={14} className='mt-4' /></button> : null}
                                                            <Input type='text' name='name' required grow title='Full Name' defaultValue={sponsor.name} InputContext={InputContext} />
                                                            <SelectPopover name='relationship_type' required grow title='Relationship Type' options={sponsorRelationshipTypeOptions} isSearchable defaultValue={sponsorRelationshipTypeOptions.find(relationshipType => relationshipType.value === sponsor.relationship_type)} InputContext={InputContext} />
                                                        </InputLine>
                                                        <InputLine>
                                                            <Input type='text' name='email' required grow title='E-mail' defaultValue={sponsor.email} InputContext={InputContext} />
                                                            <Input type='text' name='phone' required grow title='Phone Number' isPhoneNumber defaultValue={sponsor.phone} InputContext={InputContext} />
                                                        </InputLine>
                                                    </Scope>
                                                })}
                                                <button type='button' onClick={() => handleAddSponsor()} className='bg-slate-100 border ml-6 py-1 px-2 text-xs flex flex-row justify-center items-center gap-2 rounded-md transition-all hover:border-primary hover:text-primary'><PlusCircle size={16} /> Sponsor</button>
                                            </>}
                                        </InputLineGroup>}
                                        {pageData.activeMenu === 'documents-upload' && <InputLineGroup title='Documents Upload' activeMenu={pageData.activeMenu === 'documents-upload'}>
                                            <InputLine title='Documents Upload'>
                                                <Input type='text' name='documents' required grow title='Documents' defaultValue={pageData.documents} InputContext={InputContext} />
                                            </InputLine>
                                        </InputLineGroup>}
                                        {pageData.activeMenu === 'student-signature' && <InputLineGroup title='Student Signature' activeMenu={pageData.activeMenu === 'student-signature'}>
                                            <InputLine title='Student Signature'>
                                                <Input type='text' name='student_signature' required grow title='Student Signature' defaultValue={pageData.student_signature} InputContext={InputContext} />
                                            </InputLine>
                                        </InputLineGroup>}
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
