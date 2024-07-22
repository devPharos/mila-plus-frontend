import React, { useContext, useEffect, useRef } from 'react'
import { useField } from '@unform/core'
import { Asterisk } from 'lucide-react'
import AsyncSelect from 'react-select/async';
import CountryList from 'country-list-with-dial-code-and-flag';

export default function SelectPopover({ name, title, grow, hidden = false, shrink, type, options = [], isSearchable = false, InputContext, ...rest }) {
  const inputRef = useRef()
  const { fieldName, registerField, error } = useField(name)
  const { defaultValue, required, disabled } = { ...rest }

  const { setSuccessfullyUpdated } = useContext(InputContext)
  const countriesList = CountryList.getAll().map(country => {
    return { value: country.dial_code, label: country.flag + " " + country.dial_code + " " + country.name, code: country.dial_code, name: country.name }
  })

  const filterColors = (inputValue) => {
    const filtered = countriesList.filter((i) => i.label.toLowerCase().includes(inputValue.toLowerCase()));

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
        return ref.state.selectValue[0].value;
      },
    });

  }, [fieldName, registerField, rest.isMulti]);

  function handleChanged(value) {
    setSuccessfullyUpdated(false)
  }

  return (
    <AsyncSelect
      type='hidden'
      id={name}
      name={name}
      cacheOptions={false}
      defaultOptions={countriesList}
      isClearable={false}
      loadOptions={loadOptions}
      isSearchable={true}
      isDisabled={disabled}
      ref={inputRef}
      onChange={handleChanged}
      classNamePrefix="react-select"
      defaultValue={countriesList.find((i) => i.label.toLowerCase().includes('united states'))}
      {...rest}
      className={`w-40 rounded-lg text-sm focus:outline-none bg-transparent text-left relative`}
    />
  )
}
