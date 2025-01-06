import React, { useContext, useEffect, useRef } from "react";
import { useField } from "@unform/core";
import { Asterisk } from "lucide-react";

const Textarea = ({
  grow,
  shrink,
  name,
  title,
  rows = 1,
  InputContext,
  ...rest
}) => {
  const inputRef = useRef();
  const { fieldName, defaultValue, registerField, error } = useField(name);
  const { disabled, required, readOnly } = { ...rest };

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

  const width = shrink ? "w-full md:w-auto max-w-32" : "w-full md:w-auto";

  return (
    <div
      className={`flex flex-col justify-center items-start relative ${width} ${
        grow ? "grow" : ""
      }`}
    >
      <div className="px-2 text-xs flex flex-row justify-between items-center">
        {title} {required && <Asterisk color="#e00" size={12} />}
      </div>
      <div
        htmlFor={name}
        className={`border rounded-lg p-2 px-4 text-sm flex flex-row justify-between items-center gap-2 w-full ${
          error && "border-red-300"
        } ${(disabled || readOnly) && "bg-slate-100"}`}
      >
        <textarea
          id={name}
          name={name}
          ref={inputRef}
          required={required}
          onChange={() => setSuccessfullyUpdated(false)}
          type="text"
          rows={rows}
          {...rest}
          className="text-sm focus:outline-none flex-1 w-full bg-transparent"
        />
      </div>
      {/* {error && <span className="text-xs text-red-500 absolute top-7 bg-white px-2 rounded-full right-4">{error}</span>} */}
    </div>
  );
};

export default Textarea;
