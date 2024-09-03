import React, { useContext, useEffect, useRef } from 'react'
import { useField } from '@unform/core'
import { Asterisk } from 'lucide-react'
import AsyncSelect from 'react-select/async';

export default function SelectPopover({ name, title, grow, hidden = false, shrink, type, options = [], isSearchable = false, InputContext, ...rest }) {
  const inputRef = useRef()
  const { fieldName, registerField, error } = useField(name)
  const { defaultValue, required, disabled } = { ...rest }

  const { setSuccessfullyUpdated } = useContext(InputContext)

  const filterColors = (inputValue) => {
    return options.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
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

  function handleChanged() {
    setSuccessfullyUpdated(false)
  }

  const width = shrink ? 'w-34' : 'w-full md:w-auto'
  return (
    <div className={`${type === 'hidden' ? 'hidden' : 'flex'} flex-col justify-center items-start relative ${width} ${grow ? 'grow' : ''}`}>
      <div className='px-2 text-xs flex flex-row justify-between items-center'>{title} {required && <Asterisk color='#e00' size={12} />}</div>
      <div
        className={`text-sm focus:outline-none flex-1 w-full bg-transparent`}>
        <AsyncSelect
          type='hidden'
          id={name}
          name={name}
          cacheOptions
          defaultOptions={options}
          isClearable={false}
          loadOptions={loadOptions}
          isSearchable={isSearchable}
          isDisabled={disabled}
          ref={inputRef}
          onChange={handleChanged}
          classNamePrefix="react-select"
          // filterOption={filterOptions}
          defaultValue={defaultValue}
          {...rest}
          className={`rounded-lg text-sm focus:outline-none flex-1 w-full bg-transparent text-left relative`}
        />
      </div>

      {error && <span className="text-xs text-red-500 absolute top-7 bg-white px-2 rounded-full right-4">{error}</span>}
    </div>
  )
}
