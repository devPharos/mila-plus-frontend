import React from "react";

// import { Container } from './styles';

function InputLine({
  children,
  title = "",
  subtitle = "",
  disabled = false,
  left = false,
}) {
  return (
    <div
      className={`w-full ${subtitle ? "px-8" : "px-4"} ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {title && <h1 className="w-full border-b pb-2 font-bold">{title}</h1>}
      {subtitle && (
        <h3 className="w-full border-b pb-2 text-xs text-gray-500">
          {subtitle}
        </h3>
      )}
      <div
        className={`flex flex-col md:flex-row ${
          left ? "items-start" : "justify-between"
        } items-center gap-4 w-full p-4 pt-2 pb-2`}
      >
        {children}
      </div>
    </div>
  );
}

export default InputLine;
