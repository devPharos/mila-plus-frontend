import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { useDispatch } from 'react-redux';
import { logout } from '~/store/modules/auth/actions';

export default function Errors({ children }) {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const sidebarPages = [
    ]

    // useEffect(() => {
    //     dispatch(logout())
    //     navigate("/login")
    // }, [])

    return <div className='w-full bg-gradient-to-br from-gray-300 via-indigo-300 to-mila_orange flex flex-1 flex-row justify-between items-center px-4 pt-8 shadow-lg overflow-y-scroll'>
        <Sidebar pages={sidebarPages} />
        {children}
    </div>
}
