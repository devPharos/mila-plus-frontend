import { ChevronRight, LayoutDashboard } from 'lucide-react';
import React from 'react';
import { useLocation } from 'react-router-dom';

// import { Container } from './styles';

export default function Breadcrumbs() {

  const { pathname } = useLocation();
  const paths = pathname.substring(1).split('/');

  return <div className='text-xs flex flex-row justify-start items-center gap-1 text-gray-600'>
    <LayoutDashboard size={14} /> {
      paths.map((path, index) => {
        const pageName = path.substring(0, 1).toUpperCase() + path.substring(1)
        return (<div key={index} className='flex flex-row justify-start items-center gap-1'>
          <div className={`${index === paths.length - 1 && 'text-mila_orange font-bold text-lg'}`}>{pageName}</div>
          {paths.length > 1 && index < paths.length - 1 && <ChevronRight size={10} />}
        </div>)
      })
    }
  </div>;
}
