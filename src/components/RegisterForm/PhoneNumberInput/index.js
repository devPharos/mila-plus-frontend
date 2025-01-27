import React, { useContext, useEffect, useRef } from "react";
import "react-phone-number-input/style.css";
import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import { useField } from "@unform/core";
import { Asterisk } from "lucide-react";

const PhoneNumberInput = ({
  name,
  title,
  grow,
  shrink,
  workloadUpdateName = false,
  readOnly = false,
  type,
  InputContext = null,
  centeredText = false,
  country = null,
  ...rest
}) => {
  const inputRef = useRef();
  const { fieldName, registerField, error } = useField(name);
  const { disabled, required } = { ...rest };

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
    setSuccessfullyUpdated(false);
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
        {title} {required && <Asterisk color="#e00" size={12} />}
      </div>
      <div className="w-full flex flex-row justify-center items-center">
        <div
          htmlFor={name}
          className={`flex-1 border rounded-sm p-2 px-2 text-sm flex flex-row justify-between items-center gap-2 ${
            (disabled || readOnly) && "bg-slate-100"
          } ${error && "border-red-300"}`}
        >
          <PhoneInput
            id={name}
            name={name}
            onChange={handleChanged}
            ref={inputRef}
            type={type}
            readOnly={readOnly}
            {...rest}
            international={true}
            smartCaret={false}
            defaultCountry="US"
            country={country}
            withCountryCallingCode={true}
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

export default PhoneNumberInput;
