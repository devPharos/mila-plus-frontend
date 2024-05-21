import React, { useContext, useEffect, useRef } from 'react'
import { useField } from '@unform/core'
import { Asterisk } from 'lucide-react'
import { InputContext } from '~/pages/Holding/Filials/Preview'

const Input = ({ name, title, ...rest }) => {
  const inputRef = useRef()
  const { fieldName, defaultValue, registerField, error } = useField(name)
  const { disabled, required } = {...rest}

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef,
      getValue: ref => {
        return ref.current.value
      },
      setValue: (ref, value) => {
        ref.current.value = value;
      },
      clearValue: ref => {
        ref.current.value = ''
      },
    })
  }, [fieldName, registerField])

  const { setSuccessfullyUpdated } = useContext(InputContext)

  return (
    <div className='flex flex-col justify-center items-start relative'>
        <div className='px-2 text-xs flex flex-row justify-between items-center'>{title} {required && <Asterisk color='#e00' size={12} /> }</div>
        <div htmlFor={name} className={`border rounded-lg p-2 px-4 text-sm flex flex-row justify-between items-center gap-2 ${disabled && 'bg-gray-100'} ${error && 'border-red-300'}`}>
            <input
            id={name}
            name={name}
            onChange={() => setSuccessfullyUpdated(false)}
            ref={inputRef}
            type="text"
            {...rest}
            className='text-sm focus:outline-none flex-1 bg-transparent'
            />

        </div>
        { error && <span className={`text-xs text-red-500 absolute top-7 bg-white px-2 rounded-full right-4`}>{error}</span> }
    </div>
  )
}

export default Input