// SidebarItem.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import Icon from "~/components/Icon";

export default function SidebarItem({
  page,
  oppened,
  activeMenu,
  inactiveMenu,
}) {
  const isParentActive = page.isActive;
  const isCollapsible = page.children && page.children.length > 0;
  const showSubmenu = isParentActive && isCollapsible;

  const IconComponent = isCollapsible
    ? isParentActive
      ? ChevronDown
      : ChevronRight
    : Icon;

  const iconProps = {
    color: isParentActive ? activeMenu.color : inactiveMenu.color,
    size: 20,
  };

  return (
    <NavLink to={page.path} className="w-full">
      {({ isActive }) => {
        page.isActive = isActive;
        return (
          <div className={isActive ? activeMenu.class : inactiveMenu.class}>
            {page.icon && <IconComponent {...iconProps} name={page.icon} />}
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
  );
}
