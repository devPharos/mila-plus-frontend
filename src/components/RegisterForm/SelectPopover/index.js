import React, { useContext, useEffect, useRef, useState } from "react";
import { useField } from "@unform/core";
import { Asterisk } from "lucide-react";
import AsyncSelect from "react-select/async";

export default function SelectPopover({
  name,
  title,
  grow,
  hidden = false,
  shrink,
  type,
  options = [],
  isSearchable = false,
  isClearable = false,
  InputContext,
  setReturnPopover = () => null,
  ...rest
}) {
  const inputRef = useRef();
  const { fieldName, registerField, error } = useField(name);
  const { defaultValue, required, disabled, readOnly } = { ...rest };

  const { setSuccessfullyUpdated } = useContext(InputContext);

  const filterColors = (inputValue) => {
    return options.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const loadOptions = (inputValue, callback) => {
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
          return "";
        }
        return ref.state.selectValue.length > 0
          ? ref.state.selectValue[0].value
          : null;
      },
    });
  }, [fieldName, registerField, rest.isMulti]);

  function handleChanged(value) {
    if (InputContext) {
      setSuccessfullyUpdated(false);
      if (setReturnPopover) {
        setReturnPopover(value);
      }
    }
  }

  const width = shrink ? "w-full md:w-auto max-w-32" : "w-full md:w-auto";
  return (
    <div
      className={`${
        type === "hidden" ? "hidden" : "flex"
      } flex-col justify-center items-start relative ${width} ${
        grow ? "grow" : ""
      }`}
    >
      <div className="px-1 text-xs flex flex-row justify-between items-center">
        {title} {required && <Asterisk color="#f00" size={12} />}
      </div>
      <div
        className={`text-sm focus:outline-none flex-1 w-full bg-transprearent`}
      >
        <AsyncSelect
          type="hidden"
          id={name}
          name={name}
          cacheOptions
          defaultOptions={options}
          isClearable={isClearable}
          loadOptions={loadOptions}
          isSearchable={isSearchable}
          isDisabled={disabled || readOnly}
          ref={inputRef}
          onChange={handleChanged}
          classNamePrefix="react-select"
          // filterOption={filterOptions}
          defaultValue={defaultValue}
          {...rest}
          styles={{
            control: (provided, state) => ({
              ...provided,
              backgroundColor: state.isDisabled ? "rgb(241,245,249)" : "#fff",
            }),
          }}
          className={`rounded-lg text-sm focus:outline-none flex-1 w-full bg-transparent text-left relative ${
            error && "[.react-select__control]:border-red-300"
          }`}
        />
      </div>

      {/* {error && <span className="text-xs text-red-500 absolute top-7 bg-white px-2 rounded-full right-4">{error}</span>} */}
    </div>
  );
}
