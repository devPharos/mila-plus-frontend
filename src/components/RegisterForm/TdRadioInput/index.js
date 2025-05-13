import React, { useContext, useEffect, useRef, useState } from "react";
import { useField } from "@unform/core";
import { Asterisk } from "lucide-react";

const TdRadioInput = ({
  name,
  title,
  InputContext,
  grow,
  shrink,
  type,
  options = [],
  ...rest
}) => {
  const inputRef = useRef();
  const { fieldName, registerField, error } = useField(name);
  const { disabled, required, defaultValue, readOnly, value, onChange } = {
    ...rest,
  };

  const [checkedValue, setCheckedValue] = useState(defaultValue || false);

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
  }, [fieldName, registerField]);

  useEffect(() => {
    if (defaultValue) {
      inputRef.current.value = defaultValue;
      setCheckedValue(defaultValue);
    }
  }, []);

  const { generalForm, setSuccessfullyUpdated } = useContext(InputContext);

  function handleChange(e, inputRef) {
    console.log(e.currentTarget.value);
    setSuccessfullyUpdated(false);
    setCheckedValue(e.target.value);
    inputRef.current.value = e.target.value;

    // if (onChange) {
    //   onChange(e.target.checked);
    // }
  }

  return options.map((option, index) => {
    return (
      <td>
        {index === 0 && (
          <input
            type="hidden"
            name={name}
            ref={inputRef}
            value={checkedValue}
          />
        )}
        <div
          className={`cursor-pointer ${
            type === "hidden" ? "hidden" : "flex"
          } flex-col justify-center items-start relative ${
            shrink ? "w-32" : ""
          } ${grow ? "grow" : "max-w-48"} `}
        >
          <div
            htmlFor={name}
            className={`w-full ${
              title ? "border-b" : ""
            } hover:bg-gray-50 rounded-lg p-2 px-4 text-sm flex flex-row justify-center items-center gap-2 ${
              disabled ? "bg-gray-100" : ""
            } ${error ? "border-red-300" : ""}`}
          >
            <input
              id={name}
              name={name + "_checkbox"}
              type="radio"
              value={option}
              disabled={readOnly}
              onChange={(e) => handleChange(e, inputRef)}
              className="cursor-pointer text-sm focus:outline-none bg-transparent"
              checked={option === checkedValue}
            />{" "}
            {title && (
              <label
                htmlFor={name}
                className="cursor-pointer text-xs flex-1 flex flex-row"
              >
                {title} {required && <Asterisk color="#e00" size={12} />}
              </label>
            )}
          </div>
          {error && (
            <span
              className={`text-xs text-red-500 absolute top-7 bg-white px-2 rounded-full right-4`}
            >
              {error}
            </span>
          )}
        </div>
      </td>
    );
  });
};

export default TdRadioInput;
