import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Eye,
  EyeClosed,
  EyeOff,
  Search,
  Square,
  SquareCheck,
  Trash,
  X,
} from "lucide-react";
import { getData } from "~/functions/gridFunctions";
import Input from "../../RegisterForm/Input";
import { Scope } from "@unform/core";
import InputLine from "~/components/RegisterForm/InputLine";

const FindGeneric = ({
  defaultValue = null,
  InputContext = null,
  type = null,
  fields = [],
  route = "",
  title = "",
  scope = "",
  searchDefault = null,
  required = false,
  readOnly = false,
  handleRemove = null,
  setReturnFindGeneric = () => null,
  ...rest
}) => {
  const searchRef = useRef();
  const [active, setActive] = useState(false);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(defaultValue);
  const [limit, setLimit] = useState(10);
  async function loadData(search = null) {
    const data = await getData(route, {
      limit,
      search: searchDefault ? searchDefault : search,
      type,
    });
    if (!data) {
      setRows([]);
      return;
    }
    setRows(data);
  }

  useEffect(() => {
    loadData();
  }, [limit]);

  function handleActive() {
    setActive(!active);
    if (!active) {
      loadData();
    }
  }

  function handleSelect(row) {
    setSelected(row);
    handleActive();
    setSuccessfullyUpdated(false);
    setReturnFindGeneric(row);
  }
  const { setSuccessfullyUpdated } = useContext(InputContext);

  return (
    <InputLine title={title}>
      <div className="flex flex-col justify-center items-start relative w-full">
        <div className="flex flex-row items-center justify-start gap-2 relative w-full">
          {!readOnly && handleRemove && (
            <button
              type="button"
              onClick={() => handleRemove(selected.id)}
              className="bg-white border rounded p-2 mt-4 hover:bg-red-600 hover:text-white"
            >
              <Trash size={16} />
            </button>
          )}
          {!readOnly && (
            <button
              type="button"
              onClick={handleActive}
              className="bg-white border rounded p-2 mt-4 hover:bg-gray-100"
            >
              {!active ? <Search size={16} /> : <X size={16} />}
            </button>
          )}
          <Scope path={scope}>
            <Input
              type="hidden"
              name="id"
              required={required}
              defaultValue={selected.id}
              InputContext={InputContext}
            />
            {fields.map((field, index) => {
              let retValue = selected[field.name];
              if (field.model && selected[field.model]) {
                retValue = selected[field.model];
                if (typeof selected[field.model] === "object") {
                  retValue = selected[field.model][field.name];
                }
              } else if (field.field && selected[field.field]) {
                retValue = selected[field.field].id;
              }
              if (
                retValue === undefined ||
                retValue === null ||
                retValue === ""
              ) {
                retValue = " ";
              }
              return (
                <Input
                  type={field.type || "text"}
                  name={field.name}
                  title={field.title}
                  required={index === 0 ? required : false}
                  readOnlyOnFocus
                  readOnly={index === 0 ? readOnly : true}
                  grow
                  defaultValue={retValue}
                  InputContext={InputContext}
                />
              );
            })}
          </Scope>
        </div>
        {active && (
          <div className="flex flex-col items-center justify-start gap-2 relative w-full">
            <div className="flex flex-row items-center justify-start gap-2 relative w-full mt-2 border-t pt-2">
              <input
                ref={searchRef}
                type="text"
                placeholder="Type to search..."
                className="bg-white border rounded p-2 flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    loadData(searchRef.current.value);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => loadData(searchRef.current.value)}
                className="flex flex-row justify-between items-center gap-2 bg-primary text-white rounded p-2 opacity-80 hover:opacity-100"
              >
                <Search size={16} /> Search
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="bg-transparent border-0 rounded p-2 hover:bg-gray-100 w-[43px]"></th>
                  {fields
                    .filter((field) => !field.field)
                    .map((field) => {
                      return (
                        <th className="bg-white border rounded p-2 hover:bg-gray-100 text-left">
                          {field.title}
                        </th>
                      );
                    })}
                </tr>
              </thead>
              {rows.map((row, index) => {
                return (
                  <tr key={index}>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleSelect(row)}
                        className="bg-transparent border-0 w-full text-center flex flex-row justify-center items-center"
                      >
                        {selected.id === row.id ? (
                          <SquareCheck size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>
                    {fields
                      .filter((field) => !field.field)
                      .map((field) => {
                        return (
                          <td
                            onClick={() => handleSelect(row)}
                            className={`cursor-pointer bg-white border rounded p-2 hover:bg-gray-100 text-left`}
                          >
                            {field.model
                              ? row[field.model][field.name]
                              : row[field.name]}
                          </td>
                        );
                      })}
                  </tr>
                );
              })}
            </table>
            {rows.length >= 10 && (
              <div className="flex flex-row items-center justify-start gap-2 relative w-full">
                <button
                  type="button"
                  disabled={rows.length < limit}
                  onClick={() => setLimit(limit + 10)}
                  className={`border rounded p-2 bg-secondary ${
                    rows.length < limit ? "text-gray-400" : "text-gray-800"
                  } text-xs flex flex-row items-center gap-2`}
                >
                  <Eye size={14} /> Show more
                </button>

                <button
                  type="button"
                  onClick={() => setLimit(10)}
                  disabled={limit === 10}
                  className={`border rounded p-2 bg-secondary ${
                    limit === 10 ? "text-gray-400" : "text-gray-800"
                  } text-xs flex flex-row items-center gap-2`}
                >
                  <EyeOff size={14} /> Minimize
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </InputLine>
  );
};

export default FindGeneric;
