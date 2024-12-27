import { Form } from "@unform/web";
import {
  AtSign,
  BookText,
  CircleDollarSign,
  Contact,
  Files,
  GanttChart,
  Hash,
  History,
  Mail,
  Pencil,
  Phone,
  Plane,
  Save,
  Scaling,
  School,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Input from "~/components/RegisterForm/Input";
import RegisterFormMenu from "~/components/RegisterForm/Menu";
import Select from "~/components/RegisterForm/Select";
import Textarea from "~/components/RegisterForm/Textarea";
import {
  genderOptions,
  optionsCategories,
  optionsStatus,
  optionsSubStatus,
  optionsTypes,
} from "~/functions/selectPopoverOptions";
import api from "~/services/api";

export default function StudentPreview({ id, handleOpened }) {
  const [student, setStudent] = useState(null);
  const [formType, setFormType] = useState("preview");
  const [fullscreen, setFullscreen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("data");
  const formRef = useRef();
  useEffect(() => {
    async function getStudentData() {
      try {
        const { data } = await api.get(`students/${id}`, {
          company_id: 1,
          filial_id: 1,
        });
        setStudent(data);
      } catch (err) {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      }
    }
    if (id) {
      getStudentData();
    }
  }, []);

  const handleFormSubmit = async (data) => {
    console.log(data);
  };

  return (
    student && (
      <div
        className={`${
          fullscreen ? "fixed" : "absolute"
        } z-50 animate-bounce-once right-0 top-0 bg-white ${
          formType === "full" ? "w-full" : "w-96"
        } h-full p-4 rounded-xl shadow-lg border border-gray-200`}
      >
        {formType === "preview" ? (
          <div className="border h-full rounded-xl overflow-hidden flex flex-col justify-start gap-1 overflow-y-scroll">
            <div className="relative bg-gray-100 h-28 px-4 py-2 flex flex-row items-start justify-start">
              <button
                onClick={() => setFormType("full")}
                className="absolute top-2 right-20 text-md font-bold bg-mila_orange text-white rounded-md p-1 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1"
              >
                <Pencil size={16} color="#fff" /> Open
              </button>
              <button
                onClick={() => handleOpened(null)}
                className="absolute top-2 right-2 text-md font-bold bg-secondary rounded-md p-1 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1"
              >
                <X size={16} /> Close
              </button>
              <img
                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                className="rounded-xl"
                width={95}
              />
              <div className="h-32 p-4 text-md flex flex-col items-start">
                <div className="text-xs">{student.category}</div>
                <p className="overflow-hidden w-48 whitespace-nowrap text-ellipsis">
                  {student.first_name} {student.last_name}
                </p>
                <div className="text-xs font-bold">
                  {student.type} - {student.registration_number}
                </div>
              </div>
            </div>
            <div className="px-4 py-2">
              <p className="border-b mb-2 pb-2">Class Information</p>
              <div className="bg-gray-100 p-4 rounded-md text-center border border-gray-200 flex flex-col gap-2">
                <p className="text-sm font-bold">
                  Proficient Morning - February 24/1
                </p>
                <p className="text-sm">
                  <strong>Teacher:</strong> Alder Varela
                </p>
                <div className="text-xs flex flex-row items-center">
                  <div className="flex flex-1 flex-row items-center justify-center gap-1">
                    <strong>S/D:</strong>02/27/2024
                  </div>
                  <div className="flex flex-1 flex-row items-center justify-center gap-1">
                    <strong>E/D:</strong> 06/20/2024
                  </div>
                </div>
                <p className="text-xs mt-1">
                  <strong>Expected Student Start Date:</strong> 04/04/2022
                </p>
              </div>
            </div>
            <div className="flex flex-1 flex-col items-left px-4 py-2 gap-1">
              <p className="border-b mb-1 pb-1">Visa Information</p>
              <div className="flex flex-row items-center gap-1 text-xs">
                <Hash size={14} /> <strong>NSEVIS:</strong> N0030925646
              </div>
              <div className="flex flex-row items-center gap-1 text-xs">
                <Contact size={14} /> <strong>VISA:</strong> -
              </div>
              <div className="flex flex-row items-center gap-1 text-xs">
                <Plane size={14} /> <strong>PASSPORT:</strong> -
              </div>
            </div>
            <div className="flex flex-1 flex-col items-left px-4 py-2 gap-1">
              <p className="border-b mb-1 pb-1">Contact Information</p>
              <div className="flex flex-row items-center gap-1 text-xs">
                <Mail size={14} /> dansouz1712@gmail.com
              </div>
              <div className="flex flex-row items-center gap-1 text-xs">
                <Phone size={14} /> (321) 900-9984
              </div>
              <div className="flex flex-row items-center gap-1 text-xs">
                <AtSign size={14} /> danielpaulo
              </div>
            </div>
            <div className="flex flex-1 flex-col items-left px-4 py-2 gap-1">
              {/* <button type="button" className='bg-transparent border border-primary p-2 rounded-lg hover:bg-gray-100 text-primary flex flex-row items-center justify-center gap-2 font-bold text-sm'><Pencil size={14} color="#0B2870" /> Edit Student</button> */}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-row items-start justify-between gap-4">
            <div className="flex flex-col items-center justify-between text-xs w-32 gap-4">
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="data"
              >
                <User size={16} /> Data
              </RegisterFormMenu>
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="follow-up"
              >
                <GanttChart size={16} /> Follow Up
              </RegisterFormMenu>
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="contract"
              >
                <Files size={16} /> Contract
              </RegisterFormMenu>
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="academic-area"
              >
                <School size={16} /> Academic Area
              </RegisterFormMenu>
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="financial"
              >
                <CircleDollarSign size={16} /> Financial
              </RegisterFormMenu>
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="timeline"
              >
                <History size={16} /> Timeline
              </RegisterFormMenu>
              <RegisterFormMenu
                setActiveMenu={setActiveMenu}
                activeMenu={activeMenu}
                name="documents"
              >
                <BookText size={16} /> Documents
              </RegisterFormMenu>
            </div>
            <div className="border h-full rounded-xl overflow-hidden flex flex-1 flex-col justify-start">
              <div className="flex flex-col items-start justify-start text-sm overflow-y-scroll">
                <Form
                  ref={formRef}
                  onSubmit={handleFormSubmit}
                  className="w-full"
                >
                  <div className="relative bg-gray-100 h-14 px-4 py-2 flex flex-row items-center justify-between w-full">
                    <img
                      src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                      className="rounded-xl"
                      width={40}
                    />

                    <div className="flex flex-row justify-between items-center gap-4">
                      <button
                        onClick={() => setFullscreen(!fullscreen)}
                        className="text-md font-bold bg-secondary border hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
                      >
                        <Scaling size={16} />{" "}
                        {fullscreen ? "Minimize" : "Full Screen"}
                      </button>
                      <button
                        onClick={() => handleOpened(null)}
                        className="text-md font-bold bg-secondary border hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
                      >
                        <X size={16} /> Close
                      </button>
                      <button
                        type="submit"
                        className="text-md font-bold bg-primary text-white hover:bg-mila_orange rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
                      >
                        <Save size={16} /> Salvar Alterações
                      </button>
                    </div>
                  </div>
                  <div
                    id="DATA"
                    className={`${
                      activeMenu === "data"
                        ? "flex flex-col justify-between items-start gap-4 p-4 w-full"
                        : "hidden"
                    }`}
                  >
                    <h1 className="w-full border-b pb-2 font-bold">
                      General Data
                    </h1>
                    <div className="flex flex-row items-center justify-between gap-4">
                      <Input
                        type="text"
                        name="registration_nome"
                        disabled
                        title="Registration Number"
                        defaultValue={student.registration_number}
                      />
                    </div>
                    <div className="flex flex-row items-center justify-between gap-4">
                      <Input
                        type="text"
                        name="first_name"
                        required
                        title="First Name"
                        defaultValue={student.first_name}
                      />
                      <Input
                        type="text"
                        name="last_name"
                        title="Last Name"
                        defaultValue={student.last_name}
                      />
                      <Select
                        name="gender"
                        title="Gender"
                        options={genderOptions}
                        defaultValue={genderOptions.find(
                          (gender) => gender.value === student.gender
                        )}
                      />
                    </div>
                    <div className="flex flex-row items-center justify-between gap-4">
                      <Input
                        type="text"
                        name="state"
                        title="State"
                        defaultValue={student.state}
                      />
                      <Input
                        type="text"
                        name="city"
                        title="City"
                        defaultValue={student.city}
                      />
                      <Input
                        type="text"
                        name="zip"
                        title="Zip Code"
                        defaultValue={student.zip}
                        placeholder="-----"
                      />
                    </div>
                    <div className="flex flex-row items-center justify-between gap-4 w-96">
                      <Textarea
                        type="text"
                        name="address"
                        title="Address"
                        rows={5}
                        defaultValue={student.address}
                      />
                    </div>
                    <h1 className="w-full border-b pb-2 font-bold">
                      Student Status
                    </h1>
                    <div className="flex flex-row items-center justify-between gap-4">
                      <Select
                        name="category"
                        title="Category"
                        options={optionsCategories}
                        defaultValue={student.category}
                      />
                      <Select
                        name="type"
                        title="Type"
                        options={optionsTypes}
                        defaultValue={student.type}
                      />
                      <Select
                        name="status"
                        title="Status"
                        options={optionsStatus}
                        defaultValue={student.status}
                      />
                      <Select
                        name="sub_status"
                        title="Sub Status"
                        options={optionsSubStatus}
                        defaultValue={student.sub_status}
                      />
                    </div>
                    <div className="flex flex-row items-center justify-between gap-4">
                      <Input
                        type="text"
                        name="passport_number"
                        title="Passport Number"
                        placeholder="-----"
                        defaultValue={student.passport_number}
                      />
                      <Input
                        type="text"
                        name="visa_number"
                        title="Visa Number"
                        placeholder="-----"
                        defaultValue={student.visa_number}
                      />
                      <Input
                        type="text"
                        name="visa_expiration"
                        title="Visa Expiration"
                        placeholder="--/--/----"
                        defaultValue={student.visa_expiration}
                      />
                      <Input
                        type="text"
                        name="nsevis"
                        title="NSEVIS"
                        defaultValue={student.nsevis}
                        placeholder="-----"
                      />
                    </div>
                    <h1 className="w-full border-b pb-2 font-bold">
                      Contact Information
                    </h1>
                    <div className="flex flex-row items-center justify-between gap-4">
                      <Input
                        type="text"
                        name="phone"
                        title="Phone"
                        placeholder=""
                        defaultValue={student.phone}
                      />
                      <Input
                        type="text"
                        name="home_contry_phone"
                        title="Home Contry Phone"
                        placeholder=""
                        defaultValue={student.home_contry_phone}
                      />
                      <Input
                        type="text"
                        name="whatsapp"
                        title="Whatsapp"
                        placeholder=""
                        defaultValue={student.whatsapp}
                      />
                      <Input
                        type="text"
                        name="email"
                        title="E-mail"
                        defaultValue={student.email}
                        placeholder=""
                      />
                    </div>
                    <h1 className="w-full border-b pb-2 font-bold">
                      Birth Localization
                    </h1>
                    <div className="flex flex-row items-center justify-between gap-4">
                      <Input
                        type="text"
                        name="country"
                        title="Country"
                        defaultValue={student.birth_country}
                      />
                      <Input
                        type="text"
                        name="state"
                        title="State"
                        defaultValue={student.birth_state}
                      />
                      <Input
                        type="text"
                        name="city"
                        title="City"
                        defaultValue={student.birth_city}
                      />
                    </div>
                    <div className="flex flex-row items-center justify-between gap-4 w-96">
                      {console.log(student.foreign_address)}
                      <Textarea
                        type="text"
                        name="address"
                        title="Address"
                        rows={5}
                        defaultValue={student.foreign_address}
                      />
                    </div>
                    <h1 className="w-full border-b pb-2 font-bold">Other</h1>
                    <div className="flex flex-row items-center justify-between gap-4">
                      <Input
                        type="text"
                        name="date_of_birth"
                        title="Date of Birth"
                        placeholder=""
                        defaultValue={student.date_of_birth}
                      />
                      <Input
                        type="text"
                        name="preferred_contact_form"
                        title="Preferred Contact"
                        placeholder=""
                        defaultValue={student.home_contry_phone}
                      />
                      <Input
                        type="text"
                        name="how_did_you_hear_about_us"
                        title="How did you hear about MILA?"
                        placeholder=""
                        defaultValue={student.how_did_you_hear_about_us}
                      />
                    </div>
                  </div>

                  <div
                    id="FOLLOW UP"
                    className={`${
                      activeMenu === "follow-up"
                        ? "flex flex-col justify-between items-start gap-4 p-4 w-full"
                        : "hidden"
                    }`}
                  >
                    <h1 className="w-full border-b pb-2 font-bold">
                      Follow Up
                    </h1>
                    {/* <div className='flex flex-row items-center justify-between gap-4'>
                            <Input type='text' name='registration_nome' disabled title='Registration Number' defaultValue={student.registration_number} />
                        </div> */}
                  </div>

                  <div
                    id="CONTRACT"
                    className={`${
                      activeMenu === "contract"
                        ? "flex flex-col justify-between items-start gap-4 p-4 w-full"
                        : "hidden"
                    }`}
                  >
                    <h1 className="w-full border-b pb-2 font-bold">Contract</h1>
                    {/* <div className='flex flex-row items-center justify-between gap-4'>
                            <Input type='text' name='registration_nome' disabled title='Registration Number' defaultValue={student.registration_number} />
                        </div> */}
                  </div>

                  <div
                    id="ACADEMIC AREA"
                    className={`${
                      activeMenu === "academic-area"
                        ? "flex flex-col justify-between items-start gap-4 p-4 w-full"
                        : "hidden"
                    }`}
                  >
                    <h1 className="w-full border-b pb-2 font-bold">
                      Academic Area
                    </h1>
                    {/* <div className='flex flex-row items-center justify-between gap-4'>
                            <Input type='text' name='registration_nome' disabled title='Registration Number' defaultValue={student.registration_number} />
                        </div> */}
                  </div>

                  <div
                    id="FINANCIAL"
                    className={`${
                      activeMenu === "financial"
                        ? "flex flex-col justify-between items-start gap-4 p-4 w-full"
                        : "hidden"
                    }`}
                  >
                    <h1 className="w-full border-b pb-2 font-bold">
                      Financial
                    </h1>
                    {/* <div className='flex flex-row items-center justify-between gap-4'>
                            <Input type='text' name='registration_nome' disabled title='Registration Number' defaultValue={student.registration_number} />
                        </div> */}
                  </div>

                  <div
                    id="TIMELINE"
                    className={`${
                      activeMenu === "timeline"
                        ? "flex flex-col justify-between items-start gap-4 p-4 w-full"
                        : "hidden"
                    }`}
                  >
                    <h1 className="w-full border-b pb-2 font-bold">Timeline</h1>
                    {/* <div className='flex flex-row items-center justify-between gap-4'>
                            <Input type='text' name='registration_nome' disabled title='Registration Number' defaultValue={student.registration_number} />
                        </div> */}
                  </div>

                  <div
                    id="DOCUMENTS"
                    className={`${
                      activeMenu === "documents"
                        ? "flex flex-col justify-between items-start gap-4 p-4 w-full"
                        : "hidden"
                    }`}
                  >
                    <h1 className="w-full border-b pb-2 font-bold">
                      Documents
                    </h1>
                    {/* <div className='flex flex-row items-center justify-between gap-4'>
                            <Input type='text' name='registration_nome' disabled title='Registration Number' defaultValue={student.registration_number} />
                        </div> */}
                  </div>
                </Form>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
}
