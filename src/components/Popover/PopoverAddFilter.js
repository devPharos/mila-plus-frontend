import { Eye } from 'lucide-react';
import React from 'react';

export default function PopoverAddFilter({options, handleAddFilter}) {
  return <div className='absolute top-12 right-2 bg-secondary rounded-xl w-36 shadow-xl p-2 text-xs *:border-b last:border-b-0'>
    {options.map((option,index) => {
      return <button onClick={() => handleAddFilter(option)} key={index} className='w-full hover:bg-gray-300 px-2 py-2 rounded text-left flex flex-row justify-start items-center gap-2 border-b border-gray-300 last:border-b-0 text-primary'><Eye size={12} /> {option.title}</button>
    })}
</div>;
}
