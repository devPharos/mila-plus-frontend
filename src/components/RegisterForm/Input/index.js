import React, { useContext, useEffect, useRef } from "react";
import { useField } from "@unform/core";
import { Asterisk } from "lucide-react";

const Input = ({
  name,
  title,
  grow,
  shrink,
  defaultValueDDI = null,
  workloadUpdateName = false,
  readOnly = false,
  readOnlyOnFocus = false,
  type = "text",
  value = null,
  isZipCode = false,
  onlyUpperCase = false,
  onlyLowerCase = false,
  onlyInt = false,
  onlyFloat = false,
  isPhoneNumber = false,
  InputContext = null,
  centeredText = false,
  onChange = () => null,
  className = null,
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

  const { generalForm, setSuccessfullyUpdated } = useContext(InputContext);

  function handleChanged() {
    const value = generalForm?.current?.getFieldValue(name);
    if (onlyUpperCase) {
      generalForm.current.setFieldValue(name, value.toUpperCase());
    }
    if (onlyLowerCase) {
      generalForm.current.setFieldValue(name, value.toLowerCase());
    }
    if (onlyInt) {
      generalForm.current.setFieldValue(name, value.replace(/\D/g, ""));
    }
    if (onlyFloat) {
      generalForm.current.setFieldValue(name, value.match(/^[0-9]*\.?[0-9]*$/));
    }
    if (isPhoneNumber) {
      // const value = generalForm.current.getFieldValue(name);
      // generalForm.current.setFieldValue(name, maskPhone(value))
    }
    if (isZipCode) {
      // const value = generalForm.current.getFieldValue(name);
      // generalForm.current.setFieldValue(name, maskZipCode(value))
    }
    if (workloadUpdateName) {
      const days_per_week = generalForm.current.getFieldValue("days_per_week");
      const hours_per_day = generalForm.current.getFieldValue("hours_per_day");
      generalForm.current.setFieldValue(
        "name",
        `${days_per_week.toString()} day(s) per week, ${hours_per_day.toString()} hour(s) per day.`
      );
    }

    if (onChange) {
      onChange(value);
    }

    setSuccessfullyUpdated(false);
  }

  useEffect(() => {
    if (defaultValue) {
      inputRef.current.value = defaultValue;
    }
  }, [defaultValue]);

  function handleFocus(value) {
    inputRef.current.readOnly = value;
  }

  const width = shrink ? "w-full md:w-auto max-w-32" : "w-full md:w-auto";
  return (
    <div
      className={`${className} ${
        type === "hidden" ? "hidden" : "flex"
      } flex-col justify-center items-start relative ${width} ${
        grow ? "grow" : ""
      }`}
    >
      <div className="px-1 text-xs flex flex-row justify-between items-center">
        {title} {required && <Asterisk color="#e00" size={12} />}
      </div>
      <div className="w-full flex flex-row justify-center items-center">
        <div
          htmlFor={name}
          className={`flex-1 border rounded-sm p-2 px-2 text-sm flex flex-row justify-between items-center gap-2 ${
            (disabled || readOnly) && "bg-slate-100"
          } ${error && "border-red-300"}`}
        >
          <input
            id={name}
            name={name}
            onChange={handleChanged}
            ref={inputRef}
            type={type}
            readOnly={readOnly}
            onFocus={readOnlyOnFocus ? () => handleFocus(true) : null}
            onBlur={readOnlyOnFocus ? () => handleFocus(false) : null}
            defaultValue={defaultValue}
            {...rest}
            className={`${
              centeredText ? "text-center" : "text-left"
            } text-sm focus:outline-none flex-1 w-full bg-transparent`}
          />
        </div>
      </div>
      {/* {error && <span className={`text-xs text-red-500 absolute top-7 bg-white px-2 rounded-full right-4`}>{error}</span>} */}
    </div>
  );
};

export default Input;
