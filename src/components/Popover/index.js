import React from 'react';

export default function Popover({ children, Content = null, name = 'default', opened = '', setOppened = () => null }) {
  return (
    <div className='relative z-40'>
      <button type='button' className='cursor-pointer' onClick={() => setOppened(opened === name ? '' : name)}>
        {children}
      </button>

      {opened === name && <Content />}
    </div>
  );
}
