import { useEffect, useRef } from "react";
import { useField } from "@unform/core";

export default function InputField({ name, label, required, ...rest }) {
  const inputRef = useRef(null);
  const { fieldName, defaultValue, registerField, error } = useField(name);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: "value",
    });
  }, [fieldName, registerField]);

  return (
    <div className="flex flex-col space-y-1 w-full">
      <label className="text-xs font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        ref={inputRef}
        defaultValue={defaultValue}
        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-xs shadow-sm 
                   placeholder:text-gray-400 focus:outline-none focus:ring-2 
                   focus:ring-blue-500 focus:border-blue-500 ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}`}
        {...rest}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
