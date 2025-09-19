import { LogOut, Save, User } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logout } from '~/store/modules/auth/actions';
import InputField from '../InputField';
import Separator from '../Separator';
import * as Yup from "yup";
import { Form } from '@unform/web';
import api from '~/services/api';
import { updateProfileRequest } from '~/store/modules/user/actions';

const schema = Yup.object().shape({
    name: Yup.string().required("O nome é obrigatório"),
    email: Yup.string()
        .email("Insira um e-mail válido!")
        .required("O e-mail é obrigatório."),
    password: Yup.string(),
});

export default function PopoverProfile() {
    const { profile } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const formRef = useRef();
    const navigate = useNavigate();

    const handleSumbit = useCallback(async (data) => {
        try {
            formRef.current.setErrors({});

            await schema.validate(data, { abortEarly: false });

            dispatch(updateProfileRequest(data));
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const validationErrors = {};
                err.inner.forEach((error) => {
                    validationErrors[error.path] = error.message;
                });

                formRef.current.setErrors(validationErrors);
            }
        }
    }, [dispatch])

    function handleLogout() {
        try {
            dispatch(logout())
            navigate("/login")
        } catch (err) {
            toast(err.response.data.error, { type: 'error', autoClose: 3000 })
        }
    }

    return <div className='w-80 absolute top-9 right-0 bg-secondary rounded-xl flex flex-col shadow-xl p-2 text-xs'>
        <Form
            ref={formRef}
            onSubmit={handleSumbit}
            className="p-2 space-y-4"
            initialData={{
                name: profile.name,
                email: profile.email
            }}
        >
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#ee5827] flex items-center justify-center">
                    <User size={16} className="text-white" />
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-foreground">My Profile</h3>
                    <p className="text-xs text-muted-foreground">Manager your infos</p>
                </div>
            </div>
            <Separator />
            <div className="space-y-4">
                <InputField
                    required={true}
                    label={"Name"}
                    name="name"
                    id="name"
                    placeholder={"Name"}
                />
                <InputField
                    label={"Email"}
                    required={true}
                    name={"email"}
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                />
                <InputField
                    label={"Password"}
                    name={"password"}
                    id="password"
                    type="password"
                    placeholder="Leave blank to keep the current password"
                />
            </div>
            <Separator />
            <div className="space-y-3">
                <button
                    type='submit'
                    variant="outline"
                    className="flex items-center justify-center w-full h-10 font-medium bg-[#ee5827] rounded-md hover:bg-[#d34414] transition-colors"
                >
                    <Save size={16} className="mr-2 text-white" />
                    <h3 className="font-semibold text-foreground text-white">Save</h3>
                </button>
                <button
                    onClick={handleLogout}
                    variant="outline"
                    className="flex items-center justify-center w-full h-10 font-medium border border-red-500 rounded-md hover:bg-red-500/20 transition-colors"
                >
                    <LogOut size={16} className="mr-2 text-red-500" />
                    <h3 className="font-semibold text-foreground text-red-500">Logout</h3>
                </button>
            </div>
        </Form>
    </div >;
}
