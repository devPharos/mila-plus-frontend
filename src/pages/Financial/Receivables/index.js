import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";
import { format, parseISO } from "date-fns";

export default function FinancialReceivables() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "code", asc: true };
  const defaultGridHeader = [
    {
      title: "Issuer Name",
      name: "name",
      type: "text",
      filter: true,
    },
    {
      title: "Filial Name",
      name: "filial_name",
      type: "text",
      filter: true,
    },
    {
      title: "Entry Date",
      name: "entry_date",
      type: "date",
      filter: false,
    },
    {
      title: "First Due Date",
      name: "first_due_date",
      type: "date",
      filter: false,
    },
    {
      title: "Due Date",
      name: "due_date",
      type: "date",
      filter: false,
    },
    {
      title: "Amount",
      name: "amount",
      type: "currency",
      filter: false,
    },
    {
      title: "Fee",
      name: "fee",
      type: "currency",
      filter: false,
    },
    {
      title: "Total",
      name: "total",
      type: "currency",
      filter: false,
    },
    {
      title: "Payment Criteria",
      name: "paymentcriteria_id",
      type: "text",
      filter: false,
    },
    {
      title: "Status",
      name: "status",
      type: "text",
      filter: false,
    },
    {
      title: "Status Date",
      name: "status_date",
      type: "date",
      filter: false,
    },
  ];

  const { opened, orderBy, setGridData, page, setPages, limit, search } =
    useContext(FullGridContext);

  useEffect(() => {
    async function loader() {
      const data = await getData("receivables", {
        limit,
        page,
        orderBy,
        setPages,
        setGridData,
        search,
        defaultGridHeader,
        defaultOrderBy,
      });
      if (!data) {
        return;
      }
      const gridDataValues = data.map(
        (
          {
            id,
            canceled_at,
            filial,
            issuer,
            entry_date,
            first_due_date,
            due_date,
            amount,
            fee,
            total,
            paymentcriteria_id,
            paymentCriteria,
            status,
            status_date,
          },
          index
        ) => {
          const ret = {
            show: true,
            id,
            fields: [
              issuer.name,
              filial.name,
              format(parseISO(entry_date), "yyyy-MM-dd"),
              format(parseISO(first_due_date), "yyyy-MM-dd"),
              format(parseISO(due_date), "yyyy-MM-dd"),
              amount,
              fee,
              total,
              paymentcriteria_id
                ? paymentCriteria.description.slice(0, 20)
                : "",
              status,
              format(parseISO(status_date), "yyyy-MM-dd"),
              ,
            ],
            canceled: canceled_at,
            page: Math.ceil((index + 1) / limit),
          };
          return ret;
        }
      );
      setGridData(gridDataValues);
    }
    loader();
  }, [opened, filial, orderBy, search, limit]);

  return (
    <PageContainer
      FullGridContext={FullGridContext}
      PagePreview={PagePreview}
      defaultGridHeader={defaultGridHeader}
    />
  );
}
