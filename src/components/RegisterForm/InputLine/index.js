import React from 'react';

// import { Container } from './styles';

function InputLine({ children, title, border }) {
    return (
        <div className='w-full px-4'>
            {title && <h1 className='w-full border-b pb-2 font-bold'>{title}</h1>}
            <div className='flex flex-row items-center justify-between gap-4 w-full p-4 pt-2 pb-2'>
                {children}
            </div>
        </div>);
}

export default InputLine;
