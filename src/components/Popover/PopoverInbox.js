import { Mail } from 'lucide-react';
import React from 'react';

export default function PopoverInbox() {
  return <div className='absolute top-9 right-0 bg-secondary rounded-xl flex flex-col shadow-xl p-2 text-xs *:border-b last:border-b-0'>
  <strong className='whitespace-nowrap text-center p-2 border-b border-gray-300'>In Box</strong>
  <button className='text-left border-b border-gray-300 p-2 whitespace-nowrap flex flex-row items-center justify-between gap-2'>
    <Mail size={12} /> 8 unread messages from students.
  </button>

</div>;
}
