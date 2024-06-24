import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function Academic() {
  const { pathname } = useLocation()
  const navigate = useNavigate();

  const sidebarPages = [
    {
      alias: 'academic-dashboard',
      path: '/Academic/Dashboard',
      title: 'Dashboard',
      icon: 'LayoutDashboard',
    },
    {
      alias: 'languages',
      path: '/Academic/Languages',
      title: 'Languages',
      icon: 'Languages'
    },
    {
      alias: 'program-categories',
      path: '/Academic/ProgramCategory',
      title: 'Program Categories',
      icon: 'BookMarked'
    },
    {
      alias: 'levels',
      path: '/Academic/Levels',
      title: 'Levels',
      icon: 'School'
    },
    {
      alias: 'language-modes',
      path: '/Academic/LanguageModes',
      title: 'Language Modes',
      icon: 'BookType'
    },
    {
      alias: 'workloads',
      path: '/Academic/Workloads',
      title: 'Workloads',
      icon: 'CalendarClock'
    },
  ]

  useEffect(() => {
    if (pathname.toUpperCase() === '/Academic'.toUpperCase() || pathname.toUpperCase() === '/Academic/'.toUpperCase()) {
      navigate("/Academic/Dashboard")
    }
  }, [pathname])

  return <div className='w-full bg-gradient-to-br from-gray-300 via-indigo-300 to-mila_orange flex flex-1 flex-row justify-between items-center px-4 pt-8 shadow-lg'>
    <Sidebar pages={sidebarPages} />
    <Outlet />
  </div>
}
