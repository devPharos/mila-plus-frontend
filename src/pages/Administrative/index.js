import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function Administrative() {
  const { pathname } = useLocation()
  const navigate = useNavigate();

  const sidebarPages = [
    {
      alias: 'administrative-dashboard',
      path: '/Administrative/Dashboard',
      title: 'Dashboard',
      icon: 'LayoutDashboard',
    },
    {
      alias: 'filial-types',
      path: '/Administrative/FilialTypes',
      title: 'Filial Types',
      icon: 'Building2'
    },
    {
      alias: 'filials',
      path: '/Administrative/Filials',
      title: 'Filials',
      icon: 'Building'
    },
    {
      alias: 'parameters',
      path: '/Administrative/Parameters',
      title: 'Parameters',
      icon: 'SlidersHorizontal'
    },
    {
      alias: 'chart-of-accounts',
      path: '/Administrative/ChartOfAccounts',
      title: 'Chart of Accounts',
      icon: 'GanttChart'
    },
    {
      alias: 'groups',
      path: '/Administrative/Groups',
      title: 'Groups',
      icon: 'Users'
    }
  ]

  useEffect(() => {
    if (pathname.toUpperCase() === '/Administrative'.toUpperCase() || pathname.toUpperCase() === '/Administrative/'.toUpperCase()) {
      navigate("/Administrative/Dashboard")
    }
  }, [pathname])

  return <div className='w-full bg-gradient-to-br from-gray-300 via-indigo-300 to-mila_orange flex flex-1 flex-row justify-between items-center px-4 pt-8 shadow-lg'>
    <Sidebar pages={sidebarPages} />
    <Outlet />
  </div>
}
