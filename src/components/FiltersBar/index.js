import React from 'react';

// import { Container } from './styles';

export default function FiltersBar({ children }) {
  return <div className='text-xs flex flex-row justify-end items-start gap-2 text-gray-600 flex-1'>
    {children}
  </div>;
}
