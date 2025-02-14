import {
  Eraser,
  EyeOff,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Table2,
  X,
} from "lucide-react";
import React, { useContext, useState } from "react";
import Popover from "../Popover";
import PopoverAddFilter from "../Popover/PopoverAddFilter";
import Icon from "../Icon";
import {
  invoiceTypeDetailsOptions,
  invoiceTypesOptions,
  receivableStatusesOptions,
} from "~/functions/selectPopoverOptions";

export default function Filters({
  access = { view: false, edit: false, create: false, inactivate: false },
  Context = null,
  handleNew = null,
  selection = null,
  Excel = null,
}) {
  if (!Context) {
    return null;
  }
  const {
    activeFilters,
    gridHeader,
    setGridHeader,
    gridData,
    page,
    setPage,
    pages,
    limit,
    setLimit,
    handleFilters,
    search,
  } = useContext(Context);
  const [activePopover, setActivePopover] = useState("");
  const results = gridData.filter((data) => data.show === true).length;
  if (!gridHeader || !gridData) {
    return null;
  }

  function handleAddFilter(filter) {
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
            className="text-sky-700 font-bold hover:bg-gray-300 hover:text-white px-2 py-2 rounded text-left flex flex-row items-center justify-start gap-2 whitespace-nowrap"
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
            className="text-sky-700 font-bold transition-all hover:bg-gray-300 hover:text-white px-2 py-2 rounded text-left flex flex-row items-center justify-start gap-2 whitespace-nowrap"
          >
            <EyeOff size={12} /> Hide Filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-between items-center w-full gap-2">
      {access.create && handleNew !== null && (
        <button
          type="button"
          onClick={() => handleNew()}
          className="p-2 w-10 border border-mila_orange text-mila_orange transition-all hover:bg-mila_orange hover:text-white font-bold rounded text-xs"
        >
          +
        </button>
      )}
      {selection &&
        selection.functions &&
        selection.selected.length > 0 &&
        selection.functions.map((func, index) => {
          return (
            <button
              key={index}
              type="button"
              onClick={() => func.fun()}
              className="p-2 flex flex-row items-center justify-center gap-2 border border-mila_orange text-mila_orange transition-all hover:bg-mila_orange hover:text-white font-bold rounded text-xs"
            >
              <Icon name={func.icon} size={12} />
              {func.title}
            </button>
          );
        })}
      {((selection && selection.functions && selection.selected.length === 0) ||
        !selection) &&
        results === 0 && (
          <p className="text-xs pl-2 text-gray-500">No results</p>
        )}
      {((selection && selection.functions && selection.selected.length === 0) ||
        !selection) &&
        results > 0 && (
          <p className="text-xs pl-2 text-gray-500">
            Showing <span className="font-bold text-sky-700">{results}</span>{" "}
            line(s)
          </p>
        )}
      {((selection && selection.functions && selection.selected.length === 0) ||
        !selection) &&
        pages > 1 &&
        setPage !== null && (
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
                        page === retPage + 1 ? "bg-sky-700 text-white" : ""
                      } hover:bg-sky-700 hover:text-white px-2 py-1 rounded text-left whitespace-nowrap`}
                    >
                      {retPage + 1}
                    </option>
                  );
                })}
              </select>{" "}
              of <span className="font-bold text-sky-700">{pages}</span>
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
                        limit === retPage ? "bg-sky-700 text-white" : ""
                      } hover:bg-sky-700 hover:text-white px-2 py-1 rounded text-left whitespace-nowrap`}
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
      {
        <div className="flex flex-row flex-1 justify-start items-center bg-secondary rounded h-8 px-2 gap-2 m-2">
          <Search size={16} />
          <input
            type="text"
            onChange={(el) =>
              handleFilters({ title: "search", value: el.target.value })
            }
            defaultValue={search}
            className="bg-transparent min-w-0 text-xs text-gray-500 h-full focus:outline-none flex-1"
            autoFocus={true}
            placeholder="Search..."
          />
          <button
            type="button"
            className="bg-transparent text-xs text-slate-500 border border-slate-500 py-[2px] px-2 rounded focus:outline-none"
          >
            Fix across pages
          </button>
        </div>
      }
      <div className="flex flex-row justify-end items-center">
        {((selection &&
          selection.functions &&
          selection.selected.length === 0) ||
          !selection) &&
          gridHeader &&
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
                        ? "-translate-y-1 scale-110 bg-sky-700 text-white"
                        : "bg-secondary text-gray-500 "
                    } hover:bg-sky-700 hover:text-white duration-300 whitespace-nowrap`}
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
        {((selection &&
          selection.functions &&
          selection.selected.length === 0) ||
          !selection) &&
          gridHeader &&
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
                className={`flex flex-row justify-start items-center bg-sky-700 transition ease-in  hover:bg-sky-600 rounded h-8 px-2 gap-2 m-2`}
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
        {Excel && (
          <div className="relative">
            <button
              type="button"
              name={"excel"}
              onClick={() => Excel.fun(false)}
            >
              <div
                className={`relative flex flex-row justify-start items-center bg-lime-700 transition ease-in hover:bg-lime-600 rounded h-8 px-2 gap-2 m-2 text-white text-xs`}
              >
                <Table2 size={14} /> Excel
              </div>
            </button>

            {Excel.opened && (
              <div
                className={`absolute top-[52px] right-2 z-40 w-96 bg-white rounded-md shadow-lg text-xs overflow-y-scroll`}
              >
                <div className="flex flex-col items-start justify-start gap-2">
                  <h2 className="text-md font-bold w-full text-center bg-lime-700 p-2 text-white">
                    Filters to generate sheet
                  </h2>
                  <div className="flex w-full flex-col items-start justify-start gap-2 p-2">
                    {Excel.excelData.map((data, index) => {
                      return (
                        <div
                          key={index}
                          className="flex w-full flex-row items-center justify-between gap-2 p-2 border-b border-gray-300"
                        >
                          <label className="text-xs text-gray-500 flex-1">
                            {data.title}
                          </label>
                          {data.type === "select" ? (
                            <select
                              name={data.name}
                              className="bg-transparent w-32 text-xs h-full focus:outline-none"
                              value={data.value}
                              onChange={(el) => {
                                Excel.setExcelData(
                                  Excel.excelData.map((data) => {
                                    if (data.name === el.target.name) {
                                      return {
                                        ...data,
                                        value: el.target.value,
                                      };
                                    }
                                    return data;
                                  })
                                );
                              }}
                            >
                              <option value="All">All</option>
                              {data.options.map((option, index) => {
                                return (
                                  <option key={index} value={option.value}>
                                    {option.label}
                                  </option>
                                );
                              })}
                            </select>
                          ) : (
                            <input
                              type={data.type}
                              name={data.name}
                              onChange={(el) => {
                                Excel.setExcelData(
                                  Excel.excelData.map((data) => {
                                    if (data.name === el.target.name) {
                                      return {
                                        ...data,
                                        value: el.target.value,
                                      };
                                    }
                                    return data;
                                  })
                                );
                              }}
                              placeholder=""
                              className="bg-transparent w-32 text-xs h-full focus:outline-none"
                              value={data.value}
                            />
                          )}
                        </div>
                      );
                    })}
                    {/* <div
                          key={index}
                          className="flex w-full flex-row items-center justify-between gap-2 p-2 border-b border-gray-300"
                        >
                          <label className="text-xs text-gray-500 flex-1">
                            {data.title}
                          </label>
                          <input
                            type={data.type}
                            name={data.name}
                            placeholder=""
                            className="bg-transparent w-32 text-xs h-full focus:outline-none"
                            value={data.value}
                          />
                        </div> */}
                    <button type="button" onClick={Excel.fun}>
                      <div
                        className={`relative flex flex-row justify-start items-center bg-lime-700 transition ease-in hover:bg-lime-600 rounded h-8 px-2 gap-2 m-2 text-white text-xs`}
                      >
                        <Table2 size={14} /> Generate
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
