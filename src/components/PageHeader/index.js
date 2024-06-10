import React from 'react';

// import { Container } from './styles';

export default function PageHeader({ children }) {
    return <div className='border-b w-full flex flex-row justify-between items-center px-2 py-3'>{children}</div>;
}
