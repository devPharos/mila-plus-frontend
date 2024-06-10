import React, { useContext, useEffect, useRef } from 'react'
import { useField } from '@unform/core'

const CheckboxInput = ({ name, title, InputContext, ...rest }) => {
  const inputRef = useRef()
  const { fieldName, defaultValue, registerField, error } = useField(name)
  const { disabled, required } = { ...rest }

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

  const { setSuccessfullyUpdated } = useContext(InputContext)

  return (
    <div className='flex flex-col justify-center items-start relative'>

      <div htmlFor={name} className={`border rounded-lg p-2 px-4 text-sm flex flex-row justify-between items-center gap-2 ${disabled && 'bg-gray-100'} ${error && 'border-red-300'}`}>

        <input
          id={name}
          name={name}
          ref={inputRef}
          type="checkbox"
          onChange={() => setSuccessfullyUpdated(false)}
          {...rest}
          className='text-sm focus:outline-none flex-1 bg-transparent'
        /> <label htmlFor={name} className='text-xs'>{title}</label>

      </div>
      {error && <span className={`text-xs text-red-500 absolute top-7 bg-white px-2 rounded-full right-4`}>{error}</span>}
    </div>
  )
}

export default CheckboxInput
