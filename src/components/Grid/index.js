import { ArrowUpDown, CheckSquare, Dot, Square } from "lucide-react";
import React, { useContext } from "react";
import Icon from "../Icon";

// import { Container } from './styles';

export default function Grid({
  children,
  Context = null,
  selection = null,
  handleEdit = true,
}) {
  let { setSelected, selected } = { setSelected: () => null, selected: [] };
  if (selection !== null) {
    setSelected = selection.setSelected;
    selected = selection.selected;
  }
  if (!Context) {
    return null;
  }
  const {
    activeFilters,
    gridHeader,
    gridData,
    page,
    orderBy,
    limit,
    setOrderBy,
    opened,
    handleOpened,
  } = useContext(Context);
  if (!gridHeader || !gridData) {
    return null;
  }
  return (
    <div className="relative flex flex-1 justify-start w-full h-screen overflow-y-scroll">
      <table className="relative bg-secondary-50 rounded-xl p-4 w-full table-auto text-xs overflow-hidden text-left whitespace-nowrap">
        <thead className="sticky top-0 border-md">
          <tr className="bg-secondary h-8">
            {selection !== null && (
              <th className="px-4">
                <div className="flex flex-row justify-center items-center gap-2">
                  Sel.
                </div>
              </th>
            )}
            {gridHeader.length > 0 &&
              gridHeader.map((head, index) => {
                return (
                  <th className="px-4" key={index}>
                    <button
                      type="button"
                      onClick={() =>
                        setOrderBy({
                          column: head.name,
                          asc: orderBy ? !orderBy.asc : true,
                          page,
                        })
                      }
                      className={`flex flex-row items-center justify-between w-full ${
                        orderBy &&
                        orderBy.column === head.title &&
                        "text-primary"
                      }`}
                    >
                      <div className="flex flex-row items-center gap-2">
                        {head.title}{" "}
                        {gridHeader[index].action && (
                          <Icon
                            name={gridHeader[index].action.icon}
                            size={12}
                          />
                        )}
                      </div>{" "}
                      {orderBy && orderBy.column === head.name && (
                        <ArrowUpDown size={12} color="#0B2870" />
                      )}
                    </button>
                  </th>
                );
              })}
          </tr>
        </thead>
        <tbody className="align-center">
          {gridData.filter((row) => row.show).length > 0 ? (
            gridData
              .filter((row) => row.show)
              .map((row, index) => {
                if (page * limit < index + 1 || (page - 1) * limit > index) {
                  return null;
                }
                return (
                  row.show && (
                    <tr
                      key={index}
                      className={`${
                        opened === row.id
                          ? "bg-mila_orange text-white"
                          : row.canceled
                          ? "opacity-40"
                          : "odd:bg-white"
                      } h-10  hover:rounded hover:border hover:border-mila_orange cursor-pointer`}
                    >
                      {selection !== null && (
                        <>
                          {!row.selectable ? (
                            <td className="px-4">
                              <Dot size={18} />
                            </td>
                          ) : (
                            <td
                              className="px-4 pointer "
                              onClick={() =>
                                selection.multiple
                                  ? selected.find(
                                      (selectedRow) => selectedRow.id === row.id
                                    )
                                    ? setSelected(
                                        selected.filter(
                                          (selectedRow) =>
                                            selectedRow.id !== row.id
                                        )
                                      )
                                    : setSelected([...selected, row])
                                  : selected.find(
                                      (selectedRow) => selectedRow.id === row.id
                                    )
                                  ? setSelected([])
                                  : setSelected([row])
                              }
                            >
                              {selected.find(
                                (selectedRow) => selectedRow.id === row.id
                              ) ? (
                                <CheckSquare size={18} />
                              ) : (
                                <Square size={18} />
                              )}
                            </td>
                          )}
                        </>
                      )}
                      {row.fields.map((field, index) => {
                        if (gridHeader[index]?.type === "image") {
                          return (
                            <td
                              className="px-4 w-10"
                              key={index}
                              onClick={() =>
                                handleEdit ? handleOpened(row.id || null) : null
                              }
                            >
                              <img
                                src={field}
                                width="30"
                                className="rounded-md overflow-hidden"
                              />
                            </td>
                          );
                        }
                        if (gridHeader[index]?.type === "boolean") {
                          return (
                            <td
                              className={`px-4`}
                              key={index}
                              onClick={() =>
                                handleEdit ? handleOpened(row.id || null) : null
                              }
                            >
                              <div
                                className={`flex flex-row items-center justify-start gap-2`}
                              >
                                <span>{field ? "Yes" : "No"}</span>
                              </div>
                            </td>
                          );
                        }
                        if (gridHeader[index]?.type === "date") {
                          return (
                            <td
                              className={`px-4`}
                              key={index}
                              onClick={() =>
                                handleEdit ? handleOpened(row.id || null) : null
                              }
                            >
                              <div
                                className={`flex flex-row items-center justify-start gap-2`}
                              >
                                <span>
                                  {new Date(field).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    timeZone: "UTC",
                                  })}
                                </span>
                              </div>
                            </td>
                          );
                        }
                        return (
                          <td
                            className={`px-4`}
                            key={index}
                            onClick={() =>
                              handleEdit ? handleOpened(row.id || null) : null
                            }
                          >
                            <div
                              className={`flex flex-row items-center justify-start gap-2`}
                            >
                              <span>{field}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  )
                );
              })
          ) : (
            <tr className={`bg-gray-50 text-gray-500 h-10`}>
              <td className="px-4 w-10" colSpan="100">
                There&apos;s nothing here yet.
              </td>
            </tr>
          )}
          <tr>
            <td></td>
          </tr>
        </tbody>
      </table>
      {opened ? (
        <div
          className="fixed left-0 top-0 z-40 w-full h-full"
          style={{ background: "rgba(0,0,0,.2)" }}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
