import React, { useState } from 'react';

// import { Container } from './styles';

export default function Popover({ children, Content = null, name = 'default', position = 'bottom-left', opened = '', setOppened = () => null }) {
  return (
    <div className='relative z-40'>
        <button type='button' className='cursor-pointer' onClick={() => setOppened(opened === name ? '' : name)}>
            {children}
        </button>

        {opened === name && <Content />
        
        }
    </div>
  );
}
