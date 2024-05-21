import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import Icon from '~/components/Icon';
import { hasAccessTo } from '~/functions';

// import { Container } from './styles';

export default function Sidebar({ pages }) {
    const [opened, setOppened] = useState(false)
    const { accesses } = useSelector(state => state.auth);
    
  const activeMenu = {
    class: 'p-2 bg-mila_orange transition ease-out delay-100 duration-300 scale-110 rounded-xl flex flex-row justify-center items-center cursor-pointer text-xs text-white gap-2',
    color: '#FFF'
  }

  const inactiveMenu = {
    class: 'p-2 bg-transparent rounded-xl flex flex-row hover:bg-gray-300 justify-center items-center cursor-pointer text-xs gap-2',
    color: '#868686'
  }
  return <div className={`h-full bg-secondary flex flex-col justify-start items-start rounded-tl-2xl p-4`}>
        <div 
        className='p-2 hover:bg-gray-300 rounded-xl cursor-pointer flex flex-row justify-center items-center'
        onClick={() => setOppened(!opened)}>
            <Icon name="Menu" color={'#868686'} size={20} />
        </div>
        <div className='my-12 flex flex-1 flex-col justify-start items-start gap-8'>
            { pages.map((page, index) => {
                if(!hasAccessTo(accesses,page.alias)) {
                    return null;
                }
                return <NavLink key={index} to={page.path}>
                    {({ isActive }) => (
                      <div className={`${isActive ? activeMenu.class : inactiveMenu.class}`}>
                        <Icon name={page.icon} color={`${isActive ? activeMenu.color : inactiveMenu.color}`} size={20} /> {opened && <>{page.title}</>}
                      </div>
                    )}
                  </NavLink>
            })}
        </div>
    </div>
}
