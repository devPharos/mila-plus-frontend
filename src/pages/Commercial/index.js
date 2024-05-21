import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function Commercial() {
  const { pathname } = useLocation()
  const navigate = useNavigate();
  
  useEffect(() => {
    if(pathname.toUpperCase() === '/commercial'.toUpperCase() || pathname.toUpperCase() === '/commercial/'.toUpperCase()) {
      navigate("/Commercial/Dashboard")
    }
  },[pathname])

  const sidebarPages = [
    {
      alias: 'commercial_dashboard',
      path: '/Commercial/Dashboard',
      title: 'Dashboard',
      icon: 'LayoutDashboard',
    },
    {
      alias: 'commercial_students',
      path: '/Commercial/Students',
      title: 'Students',
      icon: 'Users'
    },
    {
      alias: 'commercial_documents',
      path: '/Commercial/Documents',
      title: 'Documents',
      icon: 'Files'
    }
  ]

    
  return <div className='w-full bg-gradient-to-br from-gray-300 via-indigo-300 to-mila_orange flex flex-1 flex-row justify-between items-center px-4 pt-8 shadow-lg'>
    <Sidebar pages={sidebarPages} />
    <Outlet />
  </div>
}
