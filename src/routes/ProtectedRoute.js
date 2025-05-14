import { Form } from "@unform/web";
import React, { createContext, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import FormHeader from "~/components/RegisterForm/FormHeader";
import Input from "~/components/RegisterForm/Input";
import InputLine from "~/components/RegisterForm/InputLine";
import InputLineGroup from "~/components/RegisterForm/InputLineGroup";
import Header from "~/Header";
import api from "~/services/api";

function ProtectedRoute({ children }) {
  const { signed } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.user);
  const [successfullyUpdated, setSuccessfullyUpdated] = useState(true);
  // console.log(auth)
  if (!signed) {
    console.log(state);
    // user is not authenticated
    return <Navigate to="/login" />;
  }
  const InputContext = createContext({});

  async function handleUpdatePassword(data) {
    console.log(data, profile);
    try {
      const response = await api.put(`/users/${profile.id}`, data);
      console.log(response);
    } catch (err) {
      toast(err.response.data.error, { type: "error", autoClose: 3000 });
    }
  }
  return (
    <div className="h-screen flex flex-col justify-start items-start ">
      <Header />
      {/* {profile.force_password_change && <div className='fixed top-0 bg-slate-900/50 left-0 z-50 w-full h-full flex flex-row justify-center items-center'>
        <Form onSubmit={handleUpdatePassword} className='bg-white rounded-md p-4'>

          <InputContext.Provider value={{ setSuccessfullyUpdated }}>
            <InputLineGroup title='GENERAL' activeMenu={true}>
              <InputLine title='Please update your password'>
                <Input type='password' name='password' required title='Password' InputContext={InputContext} />
                <Input type='password' name='confirmPassword' required title='Confirm Password' InputContext={InputContext} />
                <button type='submit' className='text-sm rounded-md border p-2 bg-zinc-100'>Update</button>
              </InputLine>
            </InputLineGroup>
          </InputContext.Provider>
        </Form>
      </div>} */}
      {children}
    </div>
  );
}

export default ProtectedRoute;
