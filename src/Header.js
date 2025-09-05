import React, { createContext, useState } from "react";
import Popover from "./components/Popover";
import { BellRing, Inbox, MapPin, Menu, User } from "lucide-react";
import PopoverNotifications from "./components/Popover/PopoverNotifications";
import PopoverInbox from "./components/Popover/PopoverInbox";
import PopoverProfile from "./components/Popover/PopoverProfile";
import logo from "./assets/mila.png";
import PopoverLocation from "./components/Popover/PopoverLocation";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { hasAccessTo } from "./functions";
import HeaderLink from "./components/HeaderLink";

export const HeaderContext = createContext({});

export default function Header() {
  const { signed } = useSelector((state) => state.auth);
  const [activePopover, setActivePopover] = useState("");
  const { profile } = useSelector((state) => state.user);
  const [openBurger, setOpenBurger] = useState(false);
  const auth = useSelector((state) => state.auth);
  const defaultModules = [
    {
      title: "Academic",
      alias: "academic",
    },
    {
      title: "Administrative",
      alias: "administrative",
    },
    {
      title: "Commercial",
      alias: "commercial",
    },
    {
      title: "Financial",
      alias: "financial",
    },
    {
      title: "DSO",
      alias: "dso",
    },
    {
      title: "Settings",
      alias: "settings",
    },
    {
      title: "Reports",
      alias: "reports",
    },
  ];
  const modules = defaultModules;

  return (
    <HeaderContext.Provider value={{ activePopover, setActivePopover }}>
      <header className="z-50 sticky top-0 bg-white min-h-16 h-16 border-b flex w-full">
        <div className="flex flex-row justify-between items-center w-screen">
          <button
            type="button"
            onClick={() => setOpenBurger(!openBurger)}
            className="flex md:hidden px-2 flex-row justify-between items-center"
          >
            <Menu size={24} color="#000" />
          </button>
          <div className="min-w-[70px] px-2 md:px-4 h-12 flex flex-row justify-between items-center md:border-r">
            <Link to="/">
              <img alt="MILA" src={logo} style={{ height: 32 }} />
            </Link>
          </div>
          {signed && (
            <div className="px-2 md:px-4 h-12 flex flex-1 flex-row justify-between items-center">
              <div className="flex flex-row justify-between items-center gap-x-2">
                <Popover
                  Content={PopoverLocation}
                  name="location"
                  active={activePopover}
                  opened={activePopover}
                  setOppened={setActivePopover}
                >
                  <div
                    className={`rounded-xl p-2 bg-secondary flex flex-row justify-center items-center cursor-pointer hover:ring hover:ring-secondary-50`}
                  >
                    <MapPin size={16} />
                  </div>
                </Popover>
                <div className="leading-none text-xs">
                  Location
                  <br />
                  <strong className="text-mila_orange">
                    {auth.filial.name}
                  </strong>
                </div>
              </div>

              <div className="hidden md:flex flex flex-row justify-between items-center gap-x-8 text-xl">
                {modules.map((module, index) => {
                  if (
                    auth.accesses?.hierarchy?.find(
                      (access) => access.alias === module.alias
                    )?.children.length > 0 ||
                    module.alias === "reports"
                  ) {
                    return (
                      <NavLink
                        key={index}
                        to={`/${module.alias}`}
                        className={`relative text-gray-400 text-sm`}
                      >
                        {({ isActive }) => {
                          return (
                            <HeaderLink
                              isActive={isActive}
                              title={module.title}
                            />
                          );
                        }}
                      </NavLink>
                    );
                  }
                })}
              </div>

              <div className="hidden md:block leading-none text-xs text-right">
                Welcome,
                <br />
                <strong className="text-gray-700">{profile.name}</strong>
              </div>
            </div>
          )}
          {signed && (
            <div className="px-2 md:px-4 h-12 md:border-l flex flex-row justify-between items-center gap-x-2 md:gap-x-4">
              <Popover
                Content={PopoverNotifications}
                name="notifications"
                active={activePopover}
                opened={activePopover}
                setOppened={setActivePopover}
              >
                <div
                  className={`rounded-xl p-2 bg-secondary flex flex-row justify-center items-center cursor-pointer hover:ring hover:ring-secondary-50`}
                >
                  <BellRing size={16} />
                </div>
              </Popover>
              <Popover
                Content={PopoverInbox}
                name="inbox"
                active={activePopover}
                opened={activePopover}
                setOppened={setActivePopover}
              >
                <div
                  className={`rounded-xl p-2 bg-secondary flex flex-row justify-center items-center cursor-pointer hover:ring hover:ring-secondary-50`}
                >
                  <Inbox size={16} />
                </div>
              </Popover>
              <Popover
                Content={PopoverProfile}
                name="profile"
                active={activePopover}
                opened={activePopover}
                setOppened={setActivePopover}
              >
                <div
                  className={`rounded-xl p-2 bg-secondary flex flex-row justify-center items-center cursor-pointer hover:ring hover:ring-secondary-50`}
                >
                  <User size={16} />
                </div>
              </Popover>
            </div>
          )}
        </div>
      </header>
      {openBurger && (
        <>
          <div className="fixed inset-0 z-50 mt-[64px] w-full backdrop-blur-sm"></div>
          <div className="fixed inset-0 z-50 mt-[64px] w-4/5 backdrop-blur-sm">
            <div className="fixed inset-0 z-50 flex flex-col justify-between flex-start gap-8 p-4 bg-white shadow-lg">
              <div className="flex flex-col flex-start flex-start gap-y-4 text-xl">
                {modules.map((module, index) => {
                  if (hasAccessTo(auth.accesses, null, module.alias).view) {
                    return (
                      <NavLink
                        key={index}
                        to={`/${module.alias}`}
                        className={`relative text-gray-400 text-sm`}
                      >
                        {({ isActive }) => {
                          return (
                            <HeaderLink
                              isActive={isActive}
                              title={module.title}
                            />
                          );
                        }}
                      </NavLink>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </HeaderContext.Provider>
  );
}
