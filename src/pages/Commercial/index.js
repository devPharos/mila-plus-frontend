import React, { useContext, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { PageContext } from '~/App';

export default function Commercial() {
  const { pathname } = useLocation()
  const navigate = useNavigate();

  const { pages } = useContext(PageContext)

  useEffect(() => {
    if (pathname.toUpperCase() === '/Commercial'.toUpperCase() || pathname.toUpperCase() === '/Commercial/'.toUpperCase()) {
      navigate("/Commercial/Dashboard")
    }
  }, [pathname])

  return <div className='w-full bg-gradient-to-br from-gray-300 via-indigo-300 to-mila_orange flex flex-1 flex-row justify-between items-center px-4 pt-8 shadow-lg'>
    <Sidebar pages={pages[2].children} />
    <Outlet />
  </div>
}
