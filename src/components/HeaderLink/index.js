import React from 'react';

export default function HeaderLink({ isActive = false, title = '' }) {
    return <>
        {isActive && <span className="absolute top-3 left-0 flex h-1 w-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mila_orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1 w-1 bg-mila_orange"></span>
        </span>}
        <div className={`transition ease-in-out py-1 px-2 hover:text-mila_orange ${isActive ? 'text-mila_orange border-mila_orange' : 'border-white'}`}>{title}</div>
    </>;
}
