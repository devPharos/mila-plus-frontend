import React from 'react';

export default function Popover({ children, Content = null, name = 'default', opened = '', setOppened = () => null }) {
  return (
    <>
      {/* {opened === name && <button type='button' onClick={() => setOppened('')} className='cursor-default fixed z-40 left-0 top-0 w-full h-full bg-slate-100/50'></button>} */}
      <div className='relative z-40'>
        <button type='button' className='cursor-pointer' onClick={() => setOppened(opened === name ? '' : name)}>
          {children}
        </button>

        {opened === name && <Content />}
      </div>
    </>
  );
}
