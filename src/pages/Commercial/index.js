import React, { createContext, useContext, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import { PageContext } from "~/App";
import { capitalizeFirstLetter } from "~/functions";

export const FullGridContext = createContext();

export default function Commercial() {
  const { pages } = useContext(PageContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState([]);
  const [opened, setOpened] = useState(false);
  const [orderBy, setOrderBy] = useState(null);
  const [gridHeader, setGridHeader] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [successfullyUpdated, setSuccessfullyUpdated] = useState(true);
  const [page, setPage] = useState(1);
  const [pagesNo, setPages] = useState(1);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState("");
  const [gridDetails, setGridDetails] = useState({
    totalRows: 0,
    pages: 1,
  });
  let delayDebounceFn = null;
  const paths = pathname.split("/");
  const routeName = capitalizeFirstLetter(paths[1]);
  const finalRouteName = capitalizeFirstLetter(
    paths.length > 2 ? paths[2] : "Prospects"
  );

  function handleFilters({ title = "", value = "" }) {
    if (title === "search") {
      clearTimeout(delayDebounceFn);
      delayDebounceFn = setTimeout(() => {
        setActiveFilters([]);
        setSearch({ pathname, value });
      }, 700);

      return;
    } else {
      if (value === false || value) {
        setActiveFilters([
          ...activeFilters.filter((el) => el.title != title),
          { title, value },
        ]);
      } else {
        setActiveFilters([...activeFilters.filter((el) => el.title != title)]);
      }
    }
  }

  function handleOpened(id) {
    if (!id) {
      setSuccessfullyUpdated(true);
    }
    setOpened(id);
  }

  useEffect(() => {
    if (
      pathname.toUpperCase() === `/${routeName}`.toUpperCase() ||
      pathname.toUpperCase() === `/${routeName}/`.toUpperCase()
    ) {
      navigate(`/${routeName}/${finalRouteName}`);
    }
  }, [pathname]);

  return (
    <div className="w-full bg-gradient-to-br from-gray-300 via-indigo-300 to-mila_orange flex flex-1 flex-row justify-between items-center px-4 pt-8 shadow-lg overflow-y-scroll">
      <Sidebar
        main={routeName.toLowerCase()}
        pages={pages && pages.find((page) => page.name === routeName).children}
      />

      <FullGridContext.Provider
        value={{
          activeFilters,
          setActiveFilters,
          opened,
          setOpened,
          orderBy,
          setOrderBy,
          gridHeader,
          setGridHeader,
          gridData,
          setGridData,
          successfullyUpdated,
          setSuccessfullyUpdated,
          page,
          setPage,
          pages: pagesNo,
          setPages,
          limit,
          setLimit,
          search,
          setSearch,
          handleFilters,
          handleOpened,
          loadingData,
          setLoadingData,
          gridDetails,
          setGridDetails,
        }}
      >
        <Outlet />
      </FullGridContext.Provider>
    </div>
  );
}
