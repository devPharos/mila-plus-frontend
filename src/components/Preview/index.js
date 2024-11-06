import React from "react";

export default function Preview({ children, fullscreen = false, formType }) {
  return (
    <div
      className={`${
        fullscreen ? "fixed pt-20 " : "fixed"
      } z-40 animate-bounce-once right-0 top-0 bg-white ${
        formType === "full" ? "w-full" : "w-1/3"
      } h-full p-4 rounded-xl shadow-lg border border-gray-200`}
      style={
        fullscreen
          ? {}
          : { maxWidth: "84%", height: "86%", top: "14%", right: 16 }
      }
    >
      {children}
    </div>
  );
}
