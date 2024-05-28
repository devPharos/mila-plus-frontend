import React from 'react';

// import { Container } from './styles';

function InputLineGroup({ children, title = '', activeMenu = false }) {
    return <div id={title} className={`${activeMenu ? 'flex flex-col justify-between items-start gap-4 w-full' : 'hidden'}`}>
        {children}
    </div>;
}

export default InputLineGroup;
