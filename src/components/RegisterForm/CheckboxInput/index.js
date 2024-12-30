import React, { useContext, useEffect, useRef } from "react";
import { useField } from "@unform/core";
import { Asterisk } from "lucide-react";

const CheckboxInput = ({
  name,
  title,
  InputContext,
  grow,
  shrink,
  type,
  ...rest
}) => {
  const inputRef = useRef();
  const { fieldName, registerField, error } = useField(name);
  const { disabled, required, defaultValue } = { ...rest };

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

  const { setSuccessfullyUpdated } = useContext(InputContext);

  return (
    <div
      className={`${
        type === "hidden" ? "hidden" : "flex"
      } flex-col justify-center items-start relative ${shrink ? "w-32" : ""} ${
        grow ? "grow" : "max-w-48"
      } `}
    >
      <div
        htmlFor={name}
        className={`w-full border rounded-lg p-2 px-4 text-sm flex flex-row justify-start items-center gap-2 ${
          disabled && "bg-gray-100"
        } ${error && "border-red-300"}`}
      >
        <input
          id={name}
          name={name}
          ref={inputRef}
          type="checkbox"
          checked={defaultValue}
          onChange={() => setSuccessfullyUpdated(false)}
          {...rest}
          className="text-sm focus:outline-none bg-transparent"
        />{" "}
        <label htmlFor={name} className="text-md flex-1 flex flex-row">
          {title} {required && <Asterisk color="#e00" size={12} />}
        </label>
      </div>
      {error && (
        <span
          className={`text-xs text-red-500 absolute top-7 bg-white px-2 rounded-full right-4`}
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default CheckboxInput;
