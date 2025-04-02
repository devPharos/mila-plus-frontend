import React, { useRef, useState } from "react";
import { Search, Square, SquareCheck, X } from "lucide-react";
import { getData } from "~/functions/gridFunctions";
import Input from "../../RegisterForm/Input";
import { Scope } from "@unform/core";
import InputLine from "~/components/RegisterForm/InputLine";

const FindPaymentMethod = ({
  defaultValue = { id: null, code: null, name: null },
  InputContext = null,
  type = null,
  setSuccessfullyUpdated = () => null,
  ...rest
}) => {
  const searchRef = useRef();
  const [active, setActive] = useState(false);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(defaultValue);
  async function loadData(search = null) {
    const data = await getData("paymentmethods", {
      limit: 10,
      search,
      type,
    });
    if (!data) {
      setRows([]);
      return;
    }
    setRows(data);
  }

  function handleActive() {
    setActive(!active);
    loadData();
  }

  return (
    <InputLine title="Payment Method">
      <div className="flex flex-col justify-center items-start relative w-full">
        <div className="flex flex-row items-center justify-start gap-2 relative w-full">
          <button
            type="button"
            onClick={handleActive}
            className="bg-white border rounded p-2 mt-4 hover:bg-gray-100"
          >
            {!active ? <Search size={16} /> : <X size={16} />}
          </button>
          <Scope path={`paymentMethod`}>
            <Input
              type="hidden"
              name="id"
              required
              defaultValue={selected.id}
              InputContext={InputContext}
            />
            <Input
              type="text"
              name="description"
              title="Description"
              required
              readOnly
              grow
              defaultValue={selected.description}
              InputContext={InputContext}
            />
            <Input
              type="text"
              name="platform"
              title="Platform"
              required
              readOnly
              grow
              defaultValue={selected.platform}
              InputContext={InputContext}
            />
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
                  <th className="bg-transparent border-0 rounded p-2 hover:bg-gray-100 w-[43px] "></th>
                  <th className="bg-white border rounded p-2 hover:bg-gray-100">
                    Description
                  </th>
                  <th className="bg-white border rounded p-2 hover:bg-gray-100">
                    Platform
                  </th>
                </tr>
              </thead>
              {rows.map((row, index) => {
                return (
                  <tr key={index}>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(row);
                          handleActive();
                          setSuccessfullyUpdated(false);
                        }}
                        className="bg-transparent border-0 w-full text-center flex flex-row justify-center items-center"
                      >
                        {selected.id === row.id ? (
                          <SquareCheck size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>
                    <td className="bg-white border rounded p-2 hover:bg-gray-100 text-center">
                      {row.description}
                    </td>
                    <td className="bg-white border rounded p-2 hover:bg-gray-100 text-center">
                      {row.platform}
                    </td>
                  </tr>
                );
              })}
            </table>
          </div>
        )}
      </div>
    </InputLine>
  );
};

export default FindPaymentMethod;
