import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function Errors({ children }) {

    const sidebarPages = [
    ]

    return <div className='w-full bg-gradient-to-br from-gray-300 via-indigo-300 to-mila_orange flex flex-1 flex-row justify-between items-center px-4 pt-8 shadow-lg'>
        <Sidebar pages={sidebarPages} />
        {children}
    </div>
}
