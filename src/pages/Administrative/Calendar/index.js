import "rsuite/Calendar/styles/index.css";
import React, { createContext, useContext, useEffect, useState } from "react";
import Breadcrumbs from "~/components/Breadcrumbs";
import api from "~/services/api";
import { getCurrentPage, hasAccessTo } from "~/functions";
import { useSelector } from "react-redux";
import PageHeader from "~/components/PageHeader";
import { Badge, Calendar } from "rsuite";
import { format, parseISO, addYears, subYears } from "date-fns";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import { Form } from "@unform/web";
import Icon from "~/components/Icon";
import PreviewController from "~/components/PreviewController";
import PagePreview from "./Preview";
import { FullGridContext } from "..";
import PageContainer from "~/components/PageContainer";

export const InputContext = createContext({});

export default function AdministrativeCalendar() {
  const filial = useSelector((state) => state.auth.filial);
  const currentPage = getCurrentPage();
  const [date, setDate] = useState(new Date());
  const [successfullyUpdated, setSuccessfullyUpdated] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const accesses = useSelector((state) => state.auth.accesses);
  const [freeDays, setFreeDays] = useState([]);

  const { opened, handleOpened } = useContext(FullGridContext);

  useEffect(() => {
    async function getData() {
      const { data } = await api.get(`/calendar-days`);
      setFreeDays(
        data.filter((freeDay) => freeDay.day.substring(0, 4) == year)
      );
    }
    getData();
  }, [filial, year, opened]);

  // This year, next year, and last year
  const yearsOptions = [
    {
      label: format(addYears(new Date(), 1), "yyyy"),
      value: format(addYears(new Date(), 1), "yyyy"),
    },
    { label: format(new Date(), "yyyy"), value: format(new Date(), "yyyy") },
    {
      label: format(subYears(new Date(), 1), "yyyy"),
      value: format(subYears(new Date(), 1), "yyyy"),
    },
  ];

  function getTodoList(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().padStart(4, "0");

    return freeDays.filter((freeDay) => {
      if (freeDay.dayto) {
        if (
          `${year}-${month}-${day}` >= freeDay.day &&
          `${year}-${month}-${day}` <= freeDay.dayto
        ) {
          return freeDays.filter(
            (freeDay) => freeDay.day.substring(5, 10) == `${month}/${day}`
          );
        }
      } else {
        if (`${year}-${month}-${day}` == freeDay.day) {
          return freeDays.filter(
            (freeDay) => freeDay.day.substring(5, 10) == `${month}/${day}`
          );
        }
      }
    });
  }

  function renderCell(date) {
    const list = getTodoList(date);

    if (list.length) {
      return list.map((item) => (
        <Badge
          className={`w-full ${
            item.type == "Academic" ? "bg-yellow-100" : "bg-green-100"
          } text-xs text-zinc-500`}
          content={item.title}
        />
      ));
    }

    return null;
  }

  useEffect(() => {
    if (date && year) {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");

      setDate(parseISO(`${year}-${month}-${day}`));
    }
  }, [year]);

  function handleSelect(date = null) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().padStart(4, "0");
    const founded = freeDays.filter((freeDay) => {
      if (freeDay.dayto) {
        if (
          `${year}-${month}-${day}` >= freeDay.day &&
          `${year}-${month}-${day}` <= freeDay.dayto &&
          freeDay.type === "Administrative"
        ) {
          return freeDays.filter(
            (freeDay) => freeDay.day.substring(5, 10) == `${month}/${day}`
          );
        }
      } else {
        if (
          `${year}-${month}-${day}` == freeDay.day &&
          freeDay.type === "Administrative"
        ) {
          return freeDays.filter(
            (freeDay) => freeDay.day.substring(5, 10) == `${month}/${day}`
          );
        }
      }
    });
    if (founded.length == 0) {
      handleOpened(null);
      return;
    }
    handleOpened(founded[0].id);
  }

  return (
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4">
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
      </PageHeader>
      <div className="relative flex flex-1 justify-start w-full h-screen overflow-y-scroll">
        <div className="relative flex flex-1 flex-row justify-between items-start rounded-tr-2xl px-4">
          <Calendar
            value={date}
            compact={false}
            onSelect={handleSelect}
            onChange={setDate}
            renderCell={renderCell}
            bordered
            cellClassName={(date) =>
              date.getDay() % 2 ? "bg-zinc-50" : undefined
            }
          />

          <div className="flex w-full min-w-44 flex-col items-center justify-center pt-2 pb-2">
            <Form className="w-full">
              <InputContext.Provider
                value={{ setSuccessfullyUpdated, successfullyUpdated }}
              >
                <SelectPopover
                  onChange={(year) => setYear(year.value)}
                  name="year"
                  options={yearsOptions}
                  defaultValue={yearsOptions[1]}
                  InputContext={InputContext}
                />
                <button
                  type="button"
                  onClick={() => handleOpened("new")}
                  className="w-full bg-mila_orange text-white rounded-md py-6 my-2 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1"
                >
                  <Icon name="Plus" size={16} /> <strong>Free Day</strong>
                </button>
              </InputContext.Provider>
            </Form>
            {freeDays.map((freeDay, index) => (
              <button
                type="button"
                key={index}
                onClick={() => handleOpened(freeDay.id)}
                className={`w-48 text-xs text-center text-zinc-500 py-1 px-2 my-1 ${
                  freeDay.type == "Academic" ? "bg-yellow-100" : "bg-green-100"
                } transition hover:bg-zinc-500 hover:text-white rounded-md`}
              >
                <strong>
                  {format(parseISO(freeDay.day), "MMM, do")}{" "}
                  {freeDay.dayto
                    ? `- ${format(parseISO(freeDay.dayto), "MMM, do")}`
                    : ""}
                </strong>
                <div>{freeDay.title}</div>
              </button>
            ))}
          </div>
        </div>

        {opened && (
          <div
            className="fixed left-0 top-0 z-40 w-full h-full"
            style={{ background: "rgba(0,0,0,.2)" }}
          ></div>
        )}
        {opened && (
          <PagePreview
            access={hasAccessTo(
              accesses,
              currentPage.path.split("/")[1],
              currentPage.alias
            )}
            id={opened}
            FullGridContext={FullGridContext}
            defaultFormType="full"
          />
        )}
      </div>
    </div>
  );
}
