import {
  Eraser,
  EyeOff,
  PlusCircle,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import React, { useState } from "react";
import Popover from "../Popover";
import PopoverAddFilter from "../Popover/PopoverAddFilter";

export default function Filters({
  access = { view: false, edit: false, create: false, inactivate: false },
  handleNew = null,
  search,
  handleFilters = null,
  gridHeader = null,
  pages = null,
  page = null,
  setPage = () => null,
  setGridHeader = () => null,
  limit = null,
  setLimit = () => null,
  orderBy = null,
  gridData = null,
  activeFilters = null,
}) {
  if (!gridHeader || !gridData) {
    return null;
  }
  const [activePopover, setActivePopover] = useState("");
  const results = gridData.filter((data) => data.show === true).length;

  function handleAddFilter(filter) {
    // filter.filter = !filter.filter;

    const newFilter =
      gridHeader &&
      [...gridHeader].map((item) => {
        if (item.title === filter.title) {
          item.filter = !item.filter;
        }
        return item;
      });
    setActivePopover("");
    setGridHeader(newFilter);
  }

  function PopoverFilter(index, options) {
    const { title, type } = gridHeader[index];
    const active = activeFilters.filter((el) => el.title === title);
    // if(type === 'text') {
    return (
      <div className="absolute top-12 right-2 flex flex-col bg-secondary border border-gray-300 rounded-xl gap-1 shadow-xl p-2 text-xs *:border-b">
        {options.map((option, elIndex) => {
          return (
            <button
              type="button"
              key={elIndex}
              onClick={() => {
                setActivePopover("");
                handleFilters({ title, value: option });
              }}
              className={`${
                active.length > 0 && active[0].value === option && "bg-gray-300"
              } hover:bg-gray-300 px-2 py-2 rounded text-left whitespace-nowrap`}
            >
              {typeof option === "boolean"
                ? option === true
                  ? "Yes"
                  : "No"
                : option}
            </button>
          );
        })}
        {active.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setActivePopover("");
              handleFilters({ title, value: "" });
            }}
            className="text-primary font-bold hover:bg-gray-300 hover:text-white px-2 py-2 rounded text-left flex flex-row items-center justify-start gap-2 whitespace-nowrap"
          >
            <Eraser size={12} /> Clear
          </button>
        )}
        {active.length === 0 && (
          <button
            type="button"
            onClick={() => {
              handleAddFilter(gridHeader[index]);
            }}
            className="text-primary font-bold transition-all hover:bg-gray-300 hover:text-white px-2 py-2 rounded text-left flex flex-row items-center justify-start gap-2 whitespace-nowrap"
          >
            <EyeOff size={12} /> Hide Filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-between items-center w-full">
      {access.create && handleNew && (
        <button
          type="button"
          onClick={() => handleNew()}
          className="p-2 w-10 border border-mila_orange text-mila_orange transition-all hover:bg-mila_orange hover:text-white font-bold rounded text-xs"
        >
          +
        </button>
      )}
      {results === 0 && (
        <p className="text-xs pl-2 text-gray-500">No results</p>
      )}
      {results > 0 && (
        <p className="text-xs pl-2 text-gray-500">
          Showing <span className="font-bold text-primary">{results}</span>{" "}
          line(s)
        </p>
      )}
      {pages > 1 && setPage !== null && (
        <div className="flex flex-row justify-end items-center">
          <p className="text-xs pl-2 text-gray-500">
            | Page{" "}
            <select className="bg-secondary rounded h-8 px-2 gap-2 m-1">
              {[...Array(pages).keys()].map((retPage, index) => {
                return (
                  <option
                    key={index}
                    onClick={() => setPage(retPage + 1)}
                    selected={page === retPage + 1}
                    className={`${
                      page === retPage + 1 ? "bg-primary text-white" : ""
                    } hover:bg-primary hover:text-white px-2 py-1 rounded text-left whitespace-nowrap`}
                  >
                    {retPage + 1}
                  </option>
                );
              })}
            </select>{" "}
            of <span className="font-bold text-primary">{pages}</span>
          </p>
          <p className="text-xs pl-1 text-gray-500">
            -
            <select
              className="bg-secondary rounded h-8 px-2 gap-2 m-1"
              onChange={(el) => setLimit(el.target.value)}
            >
              {[10, 20, 50, 100, 200].map((retPage, index) => {
                return (
                  <option
                    key={index}
                    onClick={() => setLimit(retPage)}
                    selected={limit === retPage}
                    className={`${
                      limit === retPage ? "bg-primary text-white" : ""
                    } hover:bg-primary hover:text-white px-2 py-1 rounded text-left whitespace-nowrap`}
                  >
                    {retPage}
                  </option>
                );
              })}
            </select>
            per page
          </p>
        </div>
      )}
      {search && (
        <div className="flex flex-row flex-1 justify-start items-center bg-secondary rounded h-8 px-2 gap-2 m-2">
          <Search size={16} />
          <input
            type="text"
            onChange={(el) =>
              handleFilters({ title: "search", value: el.target.value })
            }
            className="bg-transparent min-w-0 text-xs text-gray-500 h-full focus:outline-none flex-1"
            autoFocus={true}
            placeholder="Search..."
          />
        </div>
      )}
      <div className="flex flex-row justify-end items-center">
        {gridHeader &&
          gridHeader.map((head, index) => {
            if (head.filter) {
              const active = activeFilters.filter(
                (el) => el.title === head.title
              );
              return (
                <Popover
                  key={index}
                  Content={() =>
                    PopoverFilter(index, [
                      ...new Set(
                        gridData.map((row) => {
                          return row.fields[index];
                        })
                      ),
                    ])
                  }
                  name={head.title}
                  active={activePopover}
                  opened={activePopover}
                  setOppened={setActivePopover}
                >
                  {active.length > 0 && (
                    <span className="text-xs bg-white px-3 absolute left-0 bottom-10 text-gray-500 whitespace-nowrap">
                      {head.title}
                    </span>
                  )}
                  <div
                    className={`flex flex-row justify-start items-center rounded h-8 px-2 gap-2 m-2 transition ease-in-out ${
                      activePopover === head.title
                        ? "-translate-y-1 scale-110 bg-primary text-white"
                        : "bg-secondary text-gray-500 "
                    } hover:bg-primary hover:text-white duration-300 whitespace-nowrap`}
                  >
                    <SlidersHorizontal size={14} />
                    <div
                      className={`bg-transparent min-w-0 text-xs h-full focus:outline-none flex flex-1 justify-start items-center whitespace-nowrap`}
                    >
                      {/* {console.log(active)} */}
                      {(active.length > 0 && active[0].value) || head.title}
                    </div>
                  </div>
                </Popover>
              );
            }
          })}
        {gridHeader &&
          gridHeader.filter((head) => head.filter === false).length > 0 && (
            <Popover
              name={"addFilter"}
              Content={() =>
                PopoverAddFilter({
                  options: gridHeader.filter((head) => head.filter === false),
                  handleAddFilter,
                })
              }
              active={activePopover}
              opened={activePopover}
              setOppened={setActivePopover}
            >
              <div
                className={`flex flex-row justify-start items-center bg-primary rounded h-8 px-2 gap-2 m-2`}
              >
                <PlusCircle size={14} color="#FFF" />
                <div
                  className={`bg-transparent min-w-0 text-xs text-white h-full focus:outline-none flex flex-1 justify-start items-center whitespace-nowrap`}
                >
                  Filter
                </div>
              </div>
            </Popover>
          )}
      </div>
    </div>
  );
}
