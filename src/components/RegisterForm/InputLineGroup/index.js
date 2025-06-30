import React from "react";

// import { Container } from './styles';

function InputLineGroup({
  children,
  title = "",
  activeMenu = false,
  gap = "4",
}) {
  return (
    <div
      id={title}
      className={`${
        activeMenu
          ? `flex flex-col justify-start items-start ${
              gap !== "4" ? "gap-" + gap : "gap-4"
            } w-full min-h-[600px]`
          : "hidden"
      }`}
    >
      {children}
    </div>
  );
}

export default InputLineGroup;
