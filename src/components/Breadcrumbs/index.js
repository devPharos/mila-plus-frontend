import { ChevronRight, LayoutDashboard } from 'lucide-react';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { getCurrentPage } from '~/functions';


export default function Breadcrumbs({ currentPage = null }) {
  const { pathname } = useLocation();
  const paths = pathname.substring(1).split('/');

  if (!currentPage) {
    currentPage = getCurrentPage();
  }

  return <div className='text-xs flex flex-row justify-start items-center gap-1 text-gray-600'>
    <LayoutDashboard size={14} />
    {
      paths.map((path, index) => {
        return (<div key={index} className='flex flex-row justify-start items-center gap-1'>
          {currentPage && <div className={`${index === paths.length - 1 && 'text-mila_orange font-bold text-lg'}`}>{index === paths.length - 1 ? currentPage.title : path}</div>}
          {paths.length > 1 && index < paths.length - 1 && <ChevronRight size={10} />}
        </div>)
      })
    }
  </div>;
}
