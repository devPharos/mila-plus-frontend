import React, { createContext, useState } from "react";

const Context = createContext();

export default function FullGridContext({ children }) {
  function handleFilters({ title = "", value = "" }) {
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

    if (title === "search") {
      clearTimeout(delayDebounceFn);
      delayDebounceFn = setTimeout(() => {
        setActiveFilters([]);
        setSearch(value);
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
  return (
    <Context.Provider
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
      }}
    >
      {children}
    </Context.Provider>
  );
}
