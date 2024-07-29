import React, { useContext, useEffect, useRef, useState } from 'react'
import { useField } from '@unform/core'
import { Asterisk } from 'lucide-react'
import AsyncSelect from 'react-select/async';

export default function SelectCountry({ name, title, grow, hidden = false, shrink, type, options = [], isSearchable = false, InputContext, ...rest }) {
  const inputRef = useRef()
  const { fieldName, registerField, error } = useField(name)
  const { defaultValue, required, readOnly, disabled } = { ...rest }

  const { setSuccessfullyUpdated } = useContext(InputContext)

  const filterColors = (inputValue) => {
    const filtered = options.filter((i) => i.label.toLowerCase().includes(inputValue.toLowerCase()));

    return filtered.sort((a, b) => inputValue.substring(0, 1) === '+' ? a.code > b.code : a.name > b.name)
  };

  const loadOptions = (
    inputValue,
    callback
  ) => {
    callback(filterColors(inputValue));
  };

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      getValue: (ref) => {
        if (rest.isMulti) {
          if (!ref.state.selectValue) {
            return [];
          }
          return ref.state.selectValue.map((option) => option.value);
        }
        if (!ref.state.selectValue) {
          return '';
        }
        return ref.state.selectValue.length > 0 ? ref.state.selectValue[0].value : null;
      },
    });

  }, [fieldName, registerField, rest.isMulti]);

  function handleChanged(value) {
    setSuccessfullyUpdated(false)
  }

  return (
    <div className={`${type === 'hidden' ? 'hidden' : 'flex'} flex-col justify-center items-start relative w-42 ${grow ? 'grow' : ''}`}>
      <div className='px-2 text-xs flex flex-row justify-between items-center'>{title} {required && <Asterisk color='#e00' size={12} />}</div>
      <div
        className={`text-sm focus:outline-none flex-1 w-full bg-transparent w-full`}>
        <AsyncSelect
          type='hidden'
          id={name}
          name={name}
          cacheOptions
          defaultOptions={options}
          isClearable={false}
          loadOptions={loadOptions}
          isSearchable={true}
          isDisabled={disabled}
          ref={inputRef}
          onChange={handleChanged}
          classNamePrefix="react-select"
          defaultValue={defaultValue}
          {...rest}
          className={`w-40 rounded-lg text-sm w-full focus:outline-none bg-transparent text-left relative`}
        />
      </div>
    </div>
  )
}
