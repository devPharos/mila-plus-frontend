import React, { useContext, useState } from 'react';
import { AlertContext } from '~/App';

// import { Container } from './styles';

export default function AlertBox() {
    const { alertData, setAlertData } = useContext(AlertContext)

    function handleOpen() {
        setAlertData({ ...alertData, open: !alertData.open });
    }

    function handleOnPress(button) {
        if (button.onPress) {
            button.onPress()
        }
        handleOpen()
    }

    return alertData.open && <div className='fixed left-0 top-0 z-50 w-full h-full bg-slate-900/50 flex flex-row justify-center items-center'>
        <div className='bg-white rounded-md p-4 min-w-36'>

            {alertData.title && <strong className='text-md text-slate-900'>{alertData.title}</strong>}
            {alertData.descriptionHTML && <div className='text-sm text-slate-700' dangerouslySetInnerHTML={{ __html: alertData.descriptionHTML }} />}
            {alertData.description && <p className='text-sm text-slate-700'>{alertData.description}</p>}

            {alertData.buttons && (
                <footer className='border-t pt-2 mt-2 gap-4 border-dotted flex flex-row justify-end items-center'>
                    {alertData.buttons.map((button, index) => {
                        return <button key={index} type='button' onClick={() => handleOnPress(button)} className='bg-mila_orange text-white py-1 px-2 rounded'>{button.title}</button>
                    })}
                </footer>
            )}
        </div>
    </div>;
}
