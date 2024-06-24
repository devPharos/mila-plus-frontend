import React from 'react';

// import { Container } from './styles';

function InputLineGroup({ children, title = '', activeMenu = false }) {
    return <div id={title} className={`${activeMenu ? 'flex flex-col justify-start items-start gap-4 w-full min-h-96' : 'hidden'}`}>
        {children}
    </div>;
}

export default InputLineGroup;
