import {
  ChevronDown,
  ChevronRight,
  CornerDownLeft,
  CornerDownRight,
  X,
} from "lucide-react";
import React, { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { PageContext } from "~/App";
import Icon from "~/components/Icon";
import { hasAccessTo } from "~/functions";

// import { Container } from './styles';

export default function Sidebar({ main = null, pages = [] }) {
  const [oppened, setOppened] = useState(true);
  const { accesses } = useSelector((state) => state.auth);

  // const { pages } = useContext(PageContext)

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

  return (
    <div
      className={`${
        oppened ? "min-w-[140px]" : "min-w-[70px]"
      } h-full bg-secondary flex flex-col justify-start items-start rounded-tl-2xl p-4 overflow-y-scroll`}
    >
      <div className="flex flex-row justify-center items-center">
        <button
          type="button"
          onClick={() => setOppened(!oppened)}
          className="relative w-10 h-10 text-gray-300 rounded hover:bg-gray-300 transition mr-2 lg:block"
          id="menu-toggle"
          aria-label="Abrir Menu"
          aria-haspopup="dialog"
          aria-expanded="false"
          aria-controls="radix-:R9b6uubda:"
          data-state="closed"
        >
          <span
            className={`${
              !oppened
                ? "bg-gray-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition"
                : "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition bg-transparent"
            }`}
          ></span>
          <span
            className={`bg-gray-500 ${
              !oppened
                ? "absolute left-1/2 top-[calc(50%-6px)] -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition-all"
                : "absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition-all top-1/2 rotate-45"
            }`}
          ></span>
          <span
            className={`bg-gray-500 ${
              !oppened
                ? "absolute left-1/2 top-[calc(50%+6px)] -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition-all"
                : "absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition-all top-1/2 -rotate-45"
            }`}
          ></span>
        </button>
        {oppened && <span className="text-gray-500 text-xs">Minimize</span>}
      </div>

      <div
        className={`my-12 flex flex-1 flex-col justify-start items-start gap-4 w-full`}
      >
        {console.log({ main })}
        {pages.map((page, index) => {
          if (
            accesses.hierarchy
              .find((h) => h.alias?.toUpperCase() === main?.toUpperCase())
              .children.find(
                (h) => h.alias?.toUpperCase() === page?.alias?.toUpperCase()
              )
          ) {
            return (
              <>
                <NavLink key={index} to={page.path} className="w-full">
                  {({ isActive }) => {
                    page.isActive = isActive;
                    return (
                      <div
                        className={`${
                          isActive ? activeMenu.class : inactiveMenu.class
                        }`}
                      >
                        {page.icon ? (
                          page.children ? (
                            isActive ? (
                              <ChevronDown
                                color={`${
                                  isActive
                                    ? activeMenu.color
                                    : inactiveMenu.color
                                }`}
                                size={20}
                              />
                            ) : (
                              <ChevronRight
                                color={`${
                                  isActive
                                    ? activeMenu.color
                                    : inactiveMenu.color
                                }`}
                                size={20}
                              />
                            )
                          ) : (
                            <Icon
                              name={page.icon}
                              color={`${
                                isActive ? activeMenu.color : inactiveMenu.color
                              }`}
                              size={20}
                            />
                          )
                        ) : null}{" "}
                        {oppened && (
                          <div
                            className={`flex-1 ${
                              isActive ? "text-white" : "text-gray-500"
                            }`}
                          >
                            {page.title}
                          </div>
                        )}
                      </div>
                    );
                  }}
                </NavLink>
                {page.isActive &&
                  page.children &&
                  page.children.filter((child) => child.title !== page.title)
                    .length > 0 && (
                    <div className="flex flex-col w-full">
                      {page.children.map((child, childIndex) => {
                        if (
                          accesses.hierarchy
                            .find(
                              (h) =>
                                h.alias.toUpperCase() === main.toUpperCase()
                            )
                            .children.find(
                              (h) =>
                                h.alias.toUpperCase() ===
                                  child.alias.toUpperCase() ||
                                h.alias.includes("report")
                            )
                        ) {
                          return (
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
                                      color={`${
                                        isActive
                                          ? "#ff5618"
                                          : inactiveMenu.color
                                      }`}
                                      size={16}
                                    />
                                  )}{" "}
                                  {oppened && (
                                    <div
                                      className={`flex-1 ${
                                        isActive
                                          ? "text-mila_orange"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {child.title}
                                    </div>
                                  )}
                                </div>
                              )}
                            </NavLink>
                          );
                        }
                      })}
                    </div>
                  )}
              </>
            );
            // } else {
            //   console.log("no access", page);
          }
        })}
      </div>
    </div>
  );
}
