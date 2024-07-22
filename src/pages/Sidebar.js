import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import Icon from '~/components/Icon';
import { hasAccessTo } from '~/functions';

// import { Container } from './styles';

export default function Sidebar({ pages }) {
  const [oppened, setOppened] = useState(true)
  const { accesses } = useSelector(state => state.auth);

  const activeMenu = {
    class: 'p-2 bg-mila_orange transition ease-out delay-100 duration-300 rounded flex flex-row justify-center items-center cursor-pointer text-xs text-white gap-2',
    color: '#FFF'
  }

  const inactiveMenu = {
    class: 'p-2 bg-transparent rounded flex flex-row hover:bg-gray-300 justify-center items-center cursor-pointer text-xs gap-2',
    color: '#6b7280'
  }
  return <div className={`h-full bg-secondary flex flex-col justify-start items-start rounded-tl-2xl p-4`}>

    <div className='flex flex-row justify-center items-center'>
      <button type="button" onClick={() => setOppened(!oppened)} className="relative w-10 h-10 text-gray-300 rounded hover:bg-gray-300 transition mr-2 lg:block" id="menu-toggle" aria-label="Abrir Menu" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:R9b6uubda:" data-state="closed">
        <span className={`${!oppened ? 'bg-gray-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition' : 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition bg-transparent'}`}></span>
        <span className={`bg-gray-500 ${!oppened ? 'absolute left-1/2 top-[calc(50%-6px)] -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition-all' : 'absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition-all top-1/2 rotate-45'}`}></span>
        <span className={`bg-gray-500 ${!oppened ? 'absolute left-1/2 top-[calc(50%+6px)] -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition-all' : 'absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition-all top-1/2 -rotate-45'}`}></span>
      </button>
      {oppened && <span className='text-gray-500 text-xs'>Minimize</span>}
    </div>

    <div className='my-12 flex flex-1 flex-col justify-start items-start gap-8 w-full'>
      {pages.map((page, index) => {
        if (hasAccessTo(accesses, page.alias).view) {
          return <NavLink key={index} to={page.path} className='w-full'>
            {({ isActive }) => (<div className={`${isActive ? activeMenu.class : inactiveMenu.class}`}>
              <Icon name={page.icon} color={`${isActive ? activeMenu.color : inactiveMenu.color}`} size={20} /> {oppened && <div className={`flex-1 ${isActive ? 'text-white' : 'text-gray-500'}`}>{page.title}</div>}
            </div>
            )}
          </NavLink>
        }

      })}
    </div>
  </div>
}
