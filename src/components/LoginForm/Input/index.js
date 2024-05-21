import React, { useEffect, useRef } from 'react'
import { useField } from '@unform/core'
import { AtSign, Key } from 'lucide-react';

const Input = ({ name, ...rest }) => {
  const inputRef = useRef()
  const { fieldName, defaultValue, registerField, error } = useField(name)

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef,
      getValue: ref => {
        return ref.current.value
      },
      setValue: (ref, value) => {
        ref.current.value = value
      },
      clearValue: ref => {
        ref.current.value = ''
      },
    })
  }, [fieldName, registerField])

  return (
    <div className='flex flex-col justify-center items-center relative'>
      <div htmlFor={name} className={`w-72 border rounded-full p-2 px-4 text-sm flex flex-row justify-between items-center gap-2 bg-white ${error && 'border-red-300'}`}>
        { name === 'email' && <AtSign size={12} color='#9ca3af' />}
        { name === 'password' && <Key size={12} color='#9ca3af' />}
        <input
          id={name}
          name={name}
          ref={inputRef}
          type="text"
          {...rest}
          className='text-sm focus:outline-none flex-1'
        />

      </div>
      { error && <span className="text-xs text-red-500 absolute top-7 bg-white px-2 rounded-full right-4">{error}</span> }
    </div>
  )
}

export default Input