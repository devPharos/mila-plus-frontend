import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import logo from "../assets/mila.png";
import { Form } from "@unform/web";
import Input from "~/components/LoginForm/Input";
import { loginRequest } from "~/store/modules/auth/actions";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import api from "~/services/api";

const schema = Yup.object().shape({
  email: Yup.string()
    .email("Insira um e-mail válido!")
    .required("O e-mail é obrigatório."),
  password: Yup.string().required("A senha é obrigatória."),
});

export default function Login() {
  const dispatch = useDispatch();
  const formRef = useRef();
  const [forgot, setForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (data) => {
    try {
      await schema.validate(data, {
        abortEarly: false,
      });
      const { email, password } = data;

      dispatch(loginRequest(email, password));

      // navigate("/commercial/dashboard")
    } catch (err) {
      console.log(err);
      const validationErrors = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        formRef.current.setErrors(validationErrors);
        // Validation failed
        // console.log(err);
        toast("Validation failed", { type: "error", autoClose: 3000 });
      }
    }
  };

  const handleForgotPassword = (data) => {
    setLoading(true);
    api
      .post("/users/reset-password-mail", {
        user_mail: data.email,
      })
      .then((response) => {
        setForgotSent(true);
        setLoading(false);
        toast.success("Check your email to reset your password!");
      })
      .catch((err) => {
        setLoading(false);
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      });
  };

  return (
    <div className="h-full flex flex-1 flex-col justify-center items-center rounded-tr-2xl gap-8">
      <div>
        <img alt="MILA" src={logo} className="h-16" />
      </div>
      {forgot ? (
        <Form
          ref={formRef}
          onSubmit={handleForgotPassword}
          className="flex flex-col justify-between items-center gap-4"
        >
          {forgotSent ? (
            <p className="bg-white text-center text-sm text-gray-500 p-4 rounded-lg">
              Please check your email to reset your password!
            </p>
          ) : (
            <>
              <Input name="email" placeholder="E-mail" />
              <button
                disabled={loading}
                type="submit"
                className="w-72 border rounded-full p-2 border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all duration-300"
              >
                Send me a reset link
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setForgot(false);
              setForgotSent(false);
            }}
            className="text-xs text-gray-500 text-left px-2 border-t pt-4"
          >
            Back to login
          </button>
        </Form>
      ) : (
        <Form
          ref={formRef}
          onSubmit={handleFormSubmit}
          className="flex flex-col justify-between items-center gap-4"
        >
          <Input name="email" placeholder="E-mail" />
          <Input name="password" placeholder="Password" type="password" />
          <button
            type="submit"
            className="w-72 border rounded-full p-2 border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all duration-300"
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setForgot(true)}
            className="text-xs text-gray-500 text-left px-2 border-t pt-4"
          >
            Forgot your password?
          </button>
        </Form>
      )}
    </div>
  );
}
