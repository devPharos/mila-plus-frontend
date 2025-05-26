import { Form } from "@unform/web";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import api from "~/services/api";
import { toast } from "react-toastify";
import Input from "~/components/LoginForm/Input";
import { logout } from "~/store/modules/auth/actions";
import { Loader2 } from "lucide-react";

// import { Container } from './styles';

function ResetPassword() {
  const { token } = useParams();
  const [user, setUser] = useState({
    name: "",
    email: "",
    loading: true,
  });
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  if (!token) {
    return null;
  }

  function getData() {
    api
      .get(`/users/reset-password/${token}`)
      .then(({ data }) => {
        setUser({ ...data, loading: false });
      })
      .catch((err) => {
        setUser({ ...user, loading: false });
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      });
  }

  useEffect(() => {
    getData();
  }, []);

  function handleResetPassword(data) {
    api
      .post(`/users/reset-password/${token}`, data)
      .then((result) => {
        toast(result.data.message, { autoClose: 1000 });
        navigate("/login");
      })
      .catch((err) => {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
      });
  }

  return (
    <div className="bg-white w-full max-w-md mx-auto p-4 rounded-lg shadow-lg mt-8">
      {user.loading ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center gap-4 border border-gray-200 bg-slate-50 rounded-md p-4 text-xs">
          <Loader2 className="animate-spin" size={14} />
          <strong>Loading...</strong>
        </div>
      ) : !user.loading && !user.name ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center gap-4 border border-gray-200 bg-slate-50 rounded-md p-4 text-xs">
          <strong>Invalid token!</strong>
          <p>
            Maybe this token has expired or another token was generated to reset
            your password. Please use the latest e-mail you received.
          </p>
        </div>
      ) : (
        <>
          <div className="py-2 px-2 bg-gray-100 rounded-lg text-center">
            <h1 className="text-sm font-bold">{user.name}</h1>
            <p className="text-xs">{user.email}</p>
          </div>
          <p className="text-xs px-2 mt-4 text-center">
            To reset your password, please enter the following information:
          </p>
          <Form
            className="mt-4 border-t pt-4 text-xs"
            onSubmit={handleResetPassword}
          >
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                New Password
              </label>
              <Input
                name="password"
                placeholder="********"
                type="password"
                required
                grow
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Confirm Password
              </label>
              <Input
                name="confirmPassword"
                placeholder="********"
                type="password"
                required
                grow
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-white border text-primary border-primary hover:bg-primary hover:text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Reset my password
              </button>
            </div>
          </Form>
        </>
      )}
    </div>
  );
}

export default ResetPassword;
