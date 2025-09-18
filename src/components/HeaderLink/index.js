import React from "react";

export default function HeaderLink({ isActive = false, title = "" }) {
  return (
    <div
      className={`transition flex flex-row items-center gap-1 ease-in-out py-1 px-2 hover:text-mila_orange ${
        isActive ? "text-mila_orange border-mila_orange" : "border-white"
      }`}
    >
      {isActive && (
        <div className="w-1 h-1 relative">
          <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-mila_orange opacity-75"></span>
          <span className="absolute inline-flex rounded-full h-1 w-1 bg-mila_orange"></span>
        </div>
      )}
      {title}
    </div>
  );
}
