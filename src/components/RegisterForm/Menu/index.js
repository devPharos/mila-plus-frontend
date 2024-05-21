import React from 'react';

// import { Container } from './styles';

export default function RegisterFormMenu({ children, setActiveMenu, activeMenu, name, disabled = false }) {
    const active = activeMenu === name;
  return <button type='text' onClick={() => !disabled && setActiveMenu(name)} className={`border ${disabled ? 'bg-gray-100 border-gray-200 opacity-35' : active ? 'bg-mila_orange text-white border-mila_orange' : 'bg-gray-100 border-gray-200'} rounded-lg hover:border-mila_orange w-full py-2 px-2 flex flex-row items-center gap-2`}>
    {children}
  </button>;
}
