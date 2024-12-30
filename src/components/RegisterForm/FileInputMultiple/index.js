import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useField } from "@unform/core";
import { Loader, Asterisk } from "lucide-react";

const FileInputMultiple = ({
  name,
  title,
  grow,
  shrink,
  defaultValueDDI = null,
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
}) => {
  const inputRef = useRef();
  const { fieldName, registerField, error } = useField(name);
  const { disabled, required } = { ...rest };
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: "files",
      setValue: (ref, value) => {
        return ref.files && Array.from(ref.files);
      },
      clearValue: (ref) => {
        ref.value = "";
      },
    });
  }, [fieldName, registerField]);

  const { generalForm, setSuccessfullyUpdated } = useContext(InputContext);

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
      <div className={`w-full flex-row justify-center items-center flex `}>
        {!loading ? (
          <div
            htmlFor={name}
            className={`flex-1 border rounded-sm p-2 px-4 text-sm flex flex-row justify-between items-center gap-2 ${
              (disabled || readOnly) && "bg-gray-100"
            } ${error && "border-red-300"}`}
          >
            <input
              id={name}
              name={name}
              ref={inputRef}
              onChange={() => setSuccessfullyUpdated(false)}
              type="file"
              multiple
              readOnly={readOnly}
              {...rest}
              className="text-sm focus:outline-none flex-1 bg-transparent w-full"
            />
          </div>
        ) : (
          <div
            htmlFor={name}
            className={`flex-1 border rounded-sm p-2 px-4 text-sm flex flex-row flex-start items-center gap-2 ${
              (disabled || readOnly) && "bg-gray-100"
            } ${error && "border-red-300"}`}
          >
            <Loader size={16} color="#111" />
            <div>Please wait...</div>
          </div>
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
  );
};

export default FileInputMultiple;
