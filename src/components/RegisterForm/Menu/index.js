import React from "react";
import { toast } from "react-toastify";

// import { Container } from './styles';

export default function RegisterFormMenu({
  children,
  setActiveMenu = null,
  activeMenu,
  name,
  disabled = false,
  messageOnDisabled = "",
  status = null,
}) {
  const active = activeMenu === name;
  const activeClass =
    status === "pending"
      ? `text-white bg-red-500 border-black`
      : status === "started"
      ? `text-black bg-yellow-400 border-black`
      : status === "finished"
      ? `text-black bg-green-400 border-black`
      : "bg-mila_orange text-slate-700 text-white border-mila_orange";
  const inactiveClass = "bg-slate-100 border-slate-200";
  const hoverColor =
    status === "pending"
      ? `border-primary`
      : status === "started"
      ? `border-primary`
      : status === "finished"
      ? `border-primary`
      : "border-mila_orange";
  return (
    <button
      type="text"
      onClick={() =>
        !disabled
          ? setActiveMenu(name)
          : messageOnDisabled
          ? toast(messageOnDisabled, { autoClose: 2000 })
          : null
      }
      className={`border text-left ${
        disabled
          ? "bg-slate-100 border-slate-200 opacity-35"
          : active
          ? activeClass
          : inactiveClass
      } rounded-lg hover:${hoverColor} w-full py-2 px-2 flex flex-row items-center gap-2`}
    >
      {children}
    </button>
  );
}
