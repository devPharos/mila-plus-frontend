import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function Operational() {
  const { pathname } = useLocation()
  const navigate = useNavigate();

  const sidebarPages = [
    {
      alias: 'operational_dashboard',
      path: '/Operational/Dashboard',
      title: 'Dashboard',
      icon: 'LayoutDashboard',
    },
    {
      alias: 'operational_students',
      path: '/Operational/Students',
      title: 'Students',
      icon: 'Users'
    },
    {
      alias: 'operational_documents',
      path: '/Operational/Documents',
      title: 'Documents',
      icon: 'Files'
    }
  ]
    
  useEffect(() => {
    if(pathname.toUpperCase() === '/Operational'.toUpperCase() || pathname.toUpperCase() === '/Operational/'.toUpperCase()) {
      navigate("/Operational/Dashboard")
    }
  },[pathname])

  return <div className='w-full flex flex-1 flex-row justify-between items-center px-4 shadow-lg'>
    <Sidebar pages={sidebarPages} />
    <Outlet />
  </div>
}
