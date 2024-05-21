import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function Academic() {
  const { pathname } = useLocation()
  const navigate = useNavigate();

  const sidebarPages = [
    {
      alias: 'academic_dashboard',
      path: '/Academic/Dashboard',
      title: 'Dashboard',
      icon: 'LayoutDashboard',
    },
    {
      alias: 'academic_students',
      path: '/Academic/Students',
      title: 'Students',
      icon: 'Users'
    },
    {
      alias: 'academic_documents',
      path: '/Academic/Documents',
      title: 'Documents',
      icon: 'Files'
    }
  ]
    
  useEffect(() => {
    if(pathname.toUpperCase() === '/Academic'.toUpperCase() || pathname.toUpperCase() === '/Academic/'.toUpperCase()) {
      navigate("/Academic/Dashboard")
    }
  },[pathname])

  return <div className='w-full flex flex-1 flex-row justify-between items-center px-4 shadow-lg'>
    <Sidebar pages={sidebarPages} />
    <Outlet />
  </div>
}
