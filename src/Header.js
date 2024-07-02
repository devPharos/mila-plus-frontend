import React, { useState } from 'react';
import Popover from './components/Popover';
import Secondary from './components/buttons/Secondary';
import { BellRing, Inbox, MapPin, User } from 'lucide-react';
import PopoverNotifications from './components/Popover/PopoverNotifications';
import PopoverInbox from './components/Popover/PopoverInbox';
import PopoverProfile from './components/Popover/PopoverProfile';
import logo from './assets/mila.png';
import PopoverLocation from './components/Popover/PopoverLocation';
import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { hasAccessTo } from './functions';

export default function Header() {
  const [activePopover, setActivePopover] = useState('');
  const { profile } = useSelector(state => state.user);
  const { accesses } = useSelector(state => state.auth);

  return <header className="z-50 sticky top-0 bg-white min-h-16 h-16 border-b flex">
    <div className="max-w-screen-2xl flex flex-row justify-between items-center w-screen">
      <div className='px-4 h-12 flex flex-row justify-between items-center border-r'>
        <Link to='/'>
          <img alt='Mila' src={logo} style={{ height: 32 }} />
        </Link>
      </div>
      <div className='px-4 h-12 flex flex-1 flex-row justify-between items-center'>
        <div className='flex flex-row justify-between items-center gap-x-2'>
          <Popover Content={PopoverLocation} name='location' active={activePopover} opened={activePopover} setOppened={setActivePopover}>
            <Secondary>
              <MapPin size={16} />
            </Secondary>
          </Popover>
          <div className='leading-none text-xs'>Location<br /><strong className='text-mila_orange'>{profile.filials[0].filial.name}</strong></div>
        </div>

        <div className='flex flex-row justify-between items-center gap-x-8 text-xl'>
          {hasAccessTo(accesses, 'administrative') && <NavLink to='/Administrative' className={`text-gray-400 text-sm`}>
            {({ isActive }) => (
              <div className={`transition ease-in-out ${isActive && 'scale-125 text-mila_orange font-bold'}`}>Administrative</div>
            )
            }
          </NavLink>}
          {hasAccessTo(accesses, 'academic') && <NavLink to='/Academic' className={`text-gray-400 text-sm`}>
            {({ isActive }) => (
              <div className={`transition ease-in-out ${isActive && 'scale-125 text-mila_orange font-bold'}`}>Academic</div>
            )
            }</NavLink>}
        </div>


        <div className='leading-none text-xs text-right'>Welcome,
          <br />
          <strong className='text-gray-700'>{profile.name}</strong>
        </div>
      </div>
      <div className='px-4 h-12 border-l flex flex-row justify-between items-center gap-x-4'>
        <Popover Content={PopoverNotifications} name='notifications' active={activePopover} opened={activePopover} setOppened={setActivePopover}>
          <Secondary>
            <BellRing size={16} />
          </Secondary>
        </Popover>
        <Popover Content={PopoverInbox} name='inbox' active={activePopover} opened={activePopover} setOppened={setActivePopover}>
          <Secondary>
            <Inbox size={16} />
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mila_orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-mila_orange"></span>
            </span>
          </Secondary>
        </Popover>
        <Popover Content={PopoverProfile} name='profile' active={activePopover} opened={activePopover} setOppened={setActivePopover}>
          <Secondary>
            <User size={16} />
          </Secondary>
        </Popover>
      </div>
    </div>
  </header>;
}
