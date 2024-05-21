import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '~/store/modules/auth/actions';
export default function PopoverProfile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  function handleLogout() {
    try {
      dispatch(logout())
      navigate("/login")
    } catch(err) {
      console.log(err)
    }
  }
    return <div className='absolute top-9 right-0 bg-gray-500 rounded-xl flex flex-col shadow-xl p-2 text-xs'>
    <button type="button" onClick={handleLogout} className='px-2 py-1 text-white whitespace-nowrap'>Logout</button>
  </div>;
}
