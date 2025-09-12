import React, { useRef, useState, useEffect, useContext } from "react";
import ReactDatePicker from "react-datepicker";

import { useField } from "@unform/core";
import { Asterisk } from "lucide-react";

// import 'react-datepicker/dist/react-datepicker.css';

export default function DatePicker({
  name,
  title,
  grow,
  defaultValue,
  shrink,
  workloadUpdateName = false,
  readOnly = false,
  type,
  isZipCode = false,
  onlyUpperCase = false,
  onlyLowerCase = false,
  onlyInt = false,
  onlyFloat = false,
  isPhoneNumber = false,
  InputContext = null,
  ...rest
}) {
  const datepickerRef = useRef(null);
  const { fieldName, registerField, error } = useField(name);
  const { disabled, required } = { ...rest };

  const [date, setDate] = useState(defaultValue || null);

  const { setSuccessfullyUpdated } = useContext(InputContext);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: datepickerRef.current,
      path: "props.selected",
      clearValue: (ref) => {
        ref.clear();
      },
    });
  }, [fieldName, registerField]);

  function handleOnChange(date) {
    setDate(date);
    setSuccessfullyUpdated(false);
  }

  const width = shrink ? "w-32" : "w-full md:w-auto";
  return (
    <div
      className={`${
        type === "hidden" ? "hidden" : "flex"
      } flex-col justify-center items-start relative ${width} ${
        grow ? "grow" : ""
      }`}
    >
      <div className="px-2 text-xs flex flex-row justify-between items-center">
        {title} {required && <Asterisk color="#e00" size={12} />}
      </div>
      <div
        htmlFor={name}
        className={`w-full border rounded-sm p-2 px-4 text-sm flex flex-row justify-between items-center gap-2 ${
          (disabled || readOnly) && "bg-slate-100"
        } ${error && "border-red-300"}`}
      >
        <ReactDatePicker
          ref={datepickerRef}
          selected={date}
          className={`bg-transparent w-full ${
            disabled || readOnly ? "text-black/40" : ""
          } `}
          onChange={handleOnChange}
          {...rest}
        />
      </div>
    </div>
  );
}
