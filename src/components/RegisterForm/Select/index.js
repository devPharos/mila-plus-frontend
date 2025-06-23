import React, { useContext, useEffect, useRef } from "react";
import { useField } from "@unform/core";
import { Asterisk } from "lucide-react";

const Select = ({
  name,
  title,
  grow,
  shrink,
  type,
  options = [],
  InputContext,
  generalForm,
  ...rest
}) => {
  const inputRef = useRef();
  const { fieldName, registerField, error } = useField(name);
  const { defaultValue, required } = { ...rest };

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef,
      getValue: (ref) => {
        return ref.current.value;
      },
      setValue: (ref, value) => {
        ref.current.value = value;
      },
      clearValue: (ref) => {
        ref.current.value = "";
      },
    });
  }, [fieldName, registerField, rest.isMulti]);

  const { setSuccessfullyUpdated } = useContext(InputContext);

  return (
    <div
      className={`${
        type === "hidden" ? "hidden" : "flex"
      } flex-col justify-center items-start relative ${
        shrink ? "w-32" : "w-48"
      } ${grow ? "grow" : ""}`}
    >
      <div className="px-2 text-xs flex flex-row justify-between items-center">
        {title} {required && <Asterisk color="#e00" size={12} />}
      </div>
      <div
        className={`border p-2 rounded-lg text-sm focus:outline-none flex-1 w-full bg-transparent`}
      >
        <select
          id={name}
          name={name}
          ref={inputRef}
          onChange={() => setSuccessfullyUpdated(false)}
          defaultValue={defaultValue}
          {...rest}
          className={`rounded-lg text-sm focus:outline-none flex-1 w-full bg-transparent`}
        >
          {options.map((option, index) => {
            if (typeof option !== "object") {
              return (
                <option key={index} value={option}>
                  {option}
                </option>
              );
            }
            return (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </select>
      </div>

      {error && (
        <span className="text-xs text-red-500 absolute top-7 bg-white px-2 rounded-full right-4">
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;
