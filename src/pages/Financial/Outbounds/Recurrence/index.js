import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { FullGridContext } from "../..";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { AlertContext } from "~/App";
import api from "~/services/api";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

export default function PayeesRecurrence() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "first_due_date", asc: true };
  const defaultGridHeader = [
    {
      title: "Memo",
      name: "memo",
      type: "text",
      filter: false,
    },
    {
      title: "Amount",
      name: "amount",
      type: "currency",
      filter: false,
    },
    {
      title: "First Due Date",
      name: "first_due_date",
      type: "date",
      filter: false,
    },
    {
      title: "Issuer",
      name: ["issuer", "name"],
      type: "text",
      filter: false,
    },
  ];
  const [selected, setSelected] = useState([]);
  const { alertBox } = useContext(AlertContext);

  const {
    opened,
    orderBy,
    setGridData,
    page,
    setPages,
    limit,
    search,
    setActiveFilters,
    setLoadingData,
    setGridDetails,
  } = useContext(FullGridContext);

  useEffect(() => {
    setActiveFilters([]);
  }, []);

  async function loader() {
    setLoadingData(true);
    const data = await getData("payeerecurrences", {
      limit,
      page,
      orderBy,
      setPages,
      setGridData,
      search,
      defaultGridHeader,
      defaultOrderBy,
      setGridDetails,
    });
    if (!data) {
      return;
    }
    const gridDataValues = data.map(
      ({ memo, id, first_due_date, amount, issuer, canceled_at }, index) => {
        first_due_date = format(parseISO(first_due_date), "yyyy-MM-dd");
        const ret = {
          show: true,
          id,
          fields: [memo, amount, first_due_date, issuer.name],
          canceled: canceled_at,
          page: Math.ceil((index + 1) / limit),
        };
        return ret;
      }
    );
    setGridData(gridDataValues);
    setLoadingData(false);
  }

  useEffect(() => {
    if (!opened) {
      loader();
    }
  }, [opened, filial, orderBy, search, limit]);

  return (
    <PageContainer
      FullGridContext={FullGridContext}
      PagePreview={PagePreview}
      handleNew={true}
      defaultGridHeader={defaultGridHeader}
      // selection={{
      //   multiple: false,
      //   selected,
      //   setSelected,
      // functions: [
      //   {
      //     title: "Stop Recurrence",
      //     fun: handleStopRecurrence,
      //     icon: "X",
      //     Page: null,
      //     opened: false,
      //     setOpened: () => null,
      //     selected,
      //   },
      // ],
      // }}
    />
  );
}
