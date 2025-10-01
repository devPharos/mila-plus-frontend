// Sidebar.jsx (Refatorado)
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import Icon from "~/components/Icon";
import OpenClose from "~/components/Sidebar/OpenClose";
import SidebarItem from "~/components/SidebarItem";

export default function Sidebar({ main = null, pages = [] }) {
  const [oppened, setOppened] = useState(true);
  const { accesses } = useSelector((state) => state.auth);

  const activeMenu = {
    class:
      "p-2 bg-mila_orange transition ease-out delay-100 duration-300 rounded flex flex-row justify-center items-center cursor-pointer text-xs text-white gap-2",
    color: "#FFF",
  };

  const inactiveMenu = {
    class:
      "p-2 bg-transparent rounded flex flex-row hover:bg-gray-300 justify-center items-center cursor-pointer text-xs gap-2",
    color: "#6b7280",
  };

  // Lógica de acesso centralizada para evitar repetição
  const hasAccess = (page) => {
    const mainAccess = accesses.hierarchy.find(
      (h) => h.alias?.toUpperCase() === main?.toUpperCase()
    );
    if (!mainAccess) return false;
    return mainAccess.children.some(
      (h) => h.alias?.toUpperCase() === page?.alias?.toUpperCase()
    );
  };

  return (
    <div
      className={`${
        oppened ? "min-w-[180px]" : "min-w-[70px]"
      } h-full bg-secondary flex flex-col justify-start items-start rounded-tl-2xl p-4 overflow-y-scroll`}
    >
      <OpenClose oppened={oppened} setOppened={setOppened} />

      <div
        className={`my-12 flex flex-1 flex-col justify-start items-start gap-4 w-full`}
      >
        {pages.filter(hasAccess).map((page, index) => (
          <div key={index} className="w-full">
            <SidebarItem
              page={page}
              oppened={oppened}
              activeMenu={activeMenu}
              inactiveMenu={inactiveMenu}
            />
            {page.isActive && page.children && (
              <div className="flex flex-col w-full">
                {page.children.filter(hasAccess).map((child, childIndex) => (
                  <NavLink
                    key={childIndex}
                    to={child.path}
                    className="flex flex-row items-center justify-between rounded-md pl-4 w-full flex-1 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    {({ isActive }) => (
                      <div
                        className={`w-full border ${
                          isActive
                            ? "p-2 border-mila_orange transition ease-out delay-100 duration-300 rounded flex flex-row justify-center items-center cursor-pointer text-xs gap-2"
                            : inactiveMenu.class
                        }`}
                      >
                        {child.icon && (
                          <Icon
                            name={child.icon}
                            color={isActive ? "#ff5618" : inactiveMenu.color}
                            size={16}
                          />
                        )}
                        {oppened && (
                          <div
                            className={`flex-1 ${
                              isActive ? "text-mila_orange" : "text-gray-500"
                            }`}
                          >
                            {child.title}
                          </div>
                        )}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
