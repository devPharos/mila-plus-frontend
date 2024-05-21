import React from 'react';

export default function PopoverNotifications() {
  return <div className='absolute top-9 right-0 bg-secondary rounded-xl flex flex-col shadow-xl p-2 text-xs *:border-b last:border-b-0'>
    <strong className='whitespace-nowrap text-center p-2 border-b border-gray-300'>Notifications</strong>
  <button className='text-left border-b border-gray-300 p-2 whitespace-nowrap'>
    You have 8 tasks scheduled for today.
  </button>
</div>;
}
