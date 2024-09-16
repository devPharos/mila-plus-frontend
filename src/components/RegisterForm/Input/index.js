import React, { useContext, useEffect, useRef } from 'react'
import { useField } from '@unform/core'
import { Asterisk } from 'lucide-react'

const Input = ({ name, title, grow, shrink, defaultValueDDI = null, workloadUpdateName = false, readOnly = false, type, isZipCode = false, onlyUpperCase = false, onlyLowerCase = false, onlyInt = false, onlyFloat = false, isPhoneNumber = false, InputContext = null, ...rest }) => {
  const inputRef = useRef()
  const { fieldName, registerField, error } = useField(name)
  const { disabled, required } = { ...rest }

  function maskZipCode(input) {
    let output = "";
    input.replace(/^\D*(\d{0,5})/, function (match, g1) {
      if (g1.length) {
        output += g1;
      }
    })

    return output;
  }

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

  const { generalForm, setSuccessfullyUpdated } = useContext(InputContext)

  function handleChanged() {
    if (onlyUpperCase) {
      const value = generalForm.current.getFieldValue(name);
      generalForm.current.setFieldValue(name, value.toUpperCase())
    }
    if (onlyLowerCase) {
      const value = generalForm.current.getFieldValue(name);
      generalForm.current.setFieldValue(name, value.toLowerCase())
    }
    if (onlyInt) {
      const value = generalForm.current.getFieldValue(name);
      generalForm.current.setFieldValue(name, value.replace(/\D/g, ""))
    }
    if (onlyFloat) {
      const value = generalForm.current.getFieldValue(name);
      generalForm.current.setFieldValue(name, value.match(/^[0-9]*\.?[0-9]*$/))
    }
    if (isPhoneNumber) {
      // const value = generalForm.current.getFieldValue(name);
      // generalForm.current.setFieldValue(name, maskPhone(value))
    }
    if (isZipCode) {
      const value = generalForm.current.getFieldValue(name);
      generalForm.current.setFieldValue(name, maskZipCode(value))
    }
    if (workloadUpdateName) {
      const days_per_week = generalForm.current.getFieldValue('days_per_week');
      const hours_per_day = generalForm.current.getFieldValue('hours_per_day');
      generalForm.current.setFieldValue('name', `${days_per_week.toString()} day(s) per week, ${hours_per_day.toString()} hour(s) per day.`)
    }

    setSuccessfullyUpdated(false)
  }
  const width = shrink ? 'w-34' : 'w-full md:w-auto'
  return (
    <div className={`${type === 'hidden' ? 'hidden' : 'flex'} flex-col justify-center items-start relative ${width} ${grow ? 'grow' : ''}`}>
      <div className='px-2 text-xs flex flex-row justify-between items-center'>{title} {required && <Asterisk color='#e00' size={12} />}</div>
      <div className='w-full flex flex-row justify-center items-center'>
        <div htmlFor={name} className={`flex-1 border rounded-sm p-2 px-4 text-sm flex flex-row justify-between items-center gap-2 ${(disabled || readOnly) && 'bg-gray-100'} ${error && 'border-red-300'}`}>
          <input
            id={name}
            name={name}
            onChange={handleChanged}
            ref={inputRef}
            type={type}
            readOnly={readOnly}
            {...rest}
            className='text-sm focus:outline-none flex-1 bg-transparent w-full'
          />
        </div>

      </div>
      {/* {error && <span className={`text-xs text-red-500 absolute top-7 bg-white px-2 rounded-full right-4`}>{error}</span>} */}
    </div >
  )
}

export default Input
