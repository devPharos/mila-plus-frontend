import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function Administrative() {
  const { pathname } = useLocation()
  const navigate = useNavigate();
  const sidebarPages = [
    {
      alias: 'administrative_dashboard',
      path: '/Administrative/Dashboard',
      title: 'Dashboard',
      icon: 'LayoutDashboard',
    },
    {
      alias: 'administrative_students',
      path: '/Administrative/Students',
      title: 'Students',
      icon: 'Users'
    },
    {
      alias: 'administrative_documents',
      path: '/Administrative/Documents',
      title: 'Documents',
      icon: 'Files'
    }
  ]
    
  useEffect(() => {
    if(pathname.toUpperCase() === '/administrative'.toUpperCase() || pathname.toUpperCase() === '/administrative/'.toUpperCase()) {
      navigate("/Administrative/Dashboard")
    }
  },[pathname])

  return <div className='w-full flex flex-1 flex-row justify-between items-center px-4 shadow-lg'>
    <Sidebar pages={sidebarPages} />
    <Outlet />
  </div>
}
