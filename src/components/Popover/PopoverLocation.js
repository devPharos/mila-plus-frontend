import { Star } from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { filial_change } from '~/store/modules/auth/actions';

export default function PopoverLocation() {
  const { profile } = useSelector(state => state.user)
  const { filial } = useSelector(state => state.auth)

  const dispatch = useDispatch();

  function handleFilialChange(filArray) {
    dispatch(filial_change(filArray))
  }

  return <div className='absolute top-9 left-2 bg-secondary rounded-xl w-36 shadow-xl p-2 text-xs *:border-b last:border-b-0'>
    {profile.filials.map(({ filial: filArray }, index) => {
      return <button key={index} type="button" onClick={() => handleFilialChange(filArray)} className={`w-full flex flex-row justify-start items-center border gap-2 hover:bg-slate-100 px-2 py-1 rounded ${filial.alias === filArray.alias && 'bg-white'}`}>
        <span className={`w-8 py-2 flex flex-row justify-center items-center ${filial.alias === filArray.alias ? 'bg-white' : 'bg-slate-100'} rounded text-xs`}>{filArray.alias === 'AAA' ? <Star size={12} /> : filArray.alias}</span>
        <span>{filArray.name}</span>
      </button>

    })}
  </div>;
}
