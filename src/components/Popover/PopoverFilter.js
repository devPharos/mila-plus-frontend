import React from 'react';

export default function PopoverFilter({ options }) {
  return <div className='absolute top-12 right-2 flex flex-col bg-secondary border border-gray-300 rounded-xl gap-1 shadow-xl p-2 text-xs *:border-b'>
    {options.map((option,index) => {
      return <div key={index} className='hover:bg-gray-500 hover:text-white px-2 py-1 rounded whitespace-nowrap'>{option}</div>
    })}
</div>;
}
