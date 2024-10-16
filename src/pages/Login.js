import React, { useRef } from 'react';
import { useDispatch } from "react-redux";
import * as Yup from 'yup';
import logo from '../assets/mila.png';
import { Form } from '@unform/web'
import Input from '~/components/LoginForm/Input';
import { loginRequest } from '~/store/modules/auth/actions';
import { toast } from 'react-toastify';

const schema = Yup.object().shape({
  email: Yup.string()
    .email("Insira um e-mail válido!")
    .required("O e-mail é obrigatório."),
  password: Yup.string().required("A senha é obrigatória.")
});

export default function Login() {
  const dispatch = useDispatch();
  const formRef = useRef()

  const handleFormSubmit = async data => {
    try {
      await schema.validate(data, {
        abortEarly: false,
      });
      const { email, password } = data;

      dispatch(loginRequest(email, password));

      // navigate("/commercial/dashboard")
    } catch (err) {
      const validationErrors = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach(error => {
          validationErrors[error.path] = error.message;
        });
        formRef.current.setErrors(validationErrors);
        // Validation failed
        toast(err.response.data.error, { type: 'error', autoClose: 3000 })

      }
    }

  }
  // const { user } = useSelector(state => state);
  return <div className='h-full flex flex-1 flex-col justify-center items-center rounded-tr-2xl gap-8'>

    <div>
      <img alt='MILA' src={logo} className='h-16' />
    </div>
    <Form ref={formRef} onSubmit={handleFormSubmit} className='flex flex-col justify-between items-center gap-4'>
      <Input name="email" placeholder="E-mail" />
      <Input name="password" placeholder="Password" type="password" />
      <button type="submit" className='w-72 border rounded-full p-2 border-primary text-primary font-bold text-sm'>Log In</button>
    </Form>

  </div>;
}
