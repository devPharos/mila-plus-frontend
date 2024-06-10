import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { filial_change } from '~/store/modules/auth/actions';

export default function PopoverLocation() {
  const { profile } = useSelector(state => state.user)

  const dispatch = useDispatch();

  return <div className='absolute top-9 left-2 bg-secondary rounded-xl w-36 shadow-xl p-2 text-xs *:border-b last:border-b-0'>
    {profile.filials.map(({ filial }, index) => {
      return <button key={index} type="button" onClick={() => dispatch(filial_change(filial))} className='w-full text-left hover:bg-white px-2 py-1 rounded'>{filial.name}</button>
    })}

  </div>;
}
