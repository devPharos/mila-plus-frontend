import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function Financial() {
  const { pathname } = useLocation()
  const navigate = useNavigate();

  const sidebarPages = [
    {
      alias: 'financial_dashboard',
      path: '/Financial/Dashboard',
      title: 'Dashboard',
      icon: 'LayoutDashboard',
    },
    {
      alias: 'financial_students',
      path: '/Financial/Students',
      title: 'Students',
      icon: 'Users'
    },
    {
      alias: 'financial_documents',
      path: '/Financial/Documents',
      title: 'Documents',
      icon: 'Files'
    }
  ]
    
  useEffect(() => {
    if(pathname.toUpperCase() === '/Financial'.toUpperCase() || pathname.toUpperCase() === '/Financial/'.toUpperCase()) {
      navigate("/Financial/Dashboard")
    }
  },[pathname])

  return <div className='w-full flex flex-1 flex-row justify-between items-center px-4 shadow-lg'>
    <Sidebar pages={sidebarPages} />
    <Outlet />
  </div>
}
