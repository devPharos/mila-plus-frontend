import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function Holding() {
  const { pathname } = useLocation()
  const navigate = useNavigate();

  const sidebarPages = [
    {
      alias: 'holding-config',
      path: '/Holding/Dashboard',
      title: 'Dashboard',
      icon: 'LayoutDashboard',
    },
    {
      alias: 'holding-filials',
      path: '/Holding/Filials',
      title: 'Filials',
      icon: 'Building'
    },
    {
      alias: 'holding-groups',
      path: '/Holding/Groups',
      title: 'Groups',
      icon: 'Users'
    },
    {
      alias: 'holding-users',
      path: '/Holding/Users',
      title: 'Users',
      icon: 'User'
    }
  ]

  useEffect(() => {
    if (pathname.toUpperCase() === '/Holding'.toUpperCase() || pathname.toUpperCase() === '/Holding/'.toUpperCase()) {
      navigate("/Holding/Dashboard")
    }
  }, [pathname])

  return <div className='w-full bg-gradient-to-br from-gray-300 via-indigo-300 to-mila_orange flex flex-1 flex-row justify-between items-center px-4 pt-8 shadow-lg'>
    <Sidebar pages={sidebarPages} />
    <Outlet />
  </div>
}
