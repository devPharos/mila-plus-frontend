import React, { createContext, useState } from "react";

const Context = createContext();

export default function FullGridContext({ children }) {
  function handleFilters({ title = "", value = "" }) {
    const [activeFilters, setActiveFilters] = useState([]);
    const [search, setSearch] = useState("");
    const [gridDetails, setGridDetails] = useState({
      totalRows: 0,
      pages: 1,
    });

    if (title === "search") {
      clearTimeout(delayDebounceFn);
      delayDebounceFn = setTimeout(() => {
        setActiveFilters([]);
        // setSearch({ route: title, value });
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
