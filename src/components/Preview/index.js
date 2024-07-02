import React from 'react';

export default function Preview({ children, fullscreen = false, formType }) {

    return <div className={`${fullscreen ? 'fixed pt-20 ' : 'absolute'} z-40 animate-bounce-once right-0 top-0 bg-white ${formType === 'full' ? 'w-full' : 'w-1/3'} h-full p-4 rounded-xl shadow-lg border border-gray-200`}>
        {children}
    </div>;
}
