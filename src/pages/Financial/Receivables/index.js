import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";
import { format, parseISO } from "date-fns";
import Settlement from "./Settlement";
import { AlertContext } from "~/App";

export default function FinancialReceivables() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "due_date", asc: true };
  const { alertBox } = useContext(AlertContext);
  const defaultGridHeader = [
    {
      title: "Issuer Name",
      name: ["issuer", "name"],
      type: "text",
      filter: false,
    },
    {
      title: "Filial Name",
      name: ["filial", "name"],
      type: "text",
      filter: true,
    },
    {
      title: "Invoice Number",
      name: "invoice_number",
      type: "text",
      filter: false,
    },
    {
      title: "Entry Date",
      name: "entry_date",
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
      title: "Discount",
      name: "discount",
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
      title: "Balance",
      name: "balance",
      type: "currency",
      filter: false,
    },
    {
      title: "Status",
      name: "status",
      type: "text",
      filter: true,
    },
    // {
    //   title: "Status Date",
    //   name: "status_date",
    //   type: "date",
    //   filter: false,
    // },
  ];
  const [selected, setSelected] = useState([]);
  const [settlementOpen, setSettlementOpen] = useState(false);

  const {
    opened,
    orderBy,
    setGridData,
    page,
    setPages,
    limit,
    search,
    setLoadingData,
  } = useContext(FullGridContext);

  useEffect(() => {
    async function loader() {
      setLoadingData(true);
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
            invoice_number,
            entry_date,
            due_date,
            amount,
            discount,
            fee,
            total,
            balance,
            status,
            // status_date,
          },
          index
        ) => {
          const ret = {
            show: true,
            id,
            fields: [
              issuer.name,
              filial.name,
              "I" + invoice_number.toString().padStart(6, "0"),
              format(parseISO(entry_date), "yyyy-MM-dd"),
              format(parseISO(due_date), "yyyy-MM-dd"),
              "$ " + amount.toFixed(2),
              "$ " + discount.toFixed(2),
              "$ " + fee.toFixed(2),
              "$ " + total.toFixed(2),
              "$ " + balance.toFixed(2),
              status,
              // format(parseISO(status_date), "yyyy-MM-dd"),
              ,
            ],
            selectable: status !== "Paid",
            canceled: canceled_at,
            page: Math.ceil((index + 1) / limit),
          };
          return ret;
        }
      );
      setGridData(gridDataValues);
      setLoadingData(false);
      if (!settlementOpen) {
        setSelected([]);
      }
    }
    loader();
  }, [opened, settlementOpen, filial, orderBy, search, limit]);

  function handleSettlement() {
    setSettlementOpen(!settlementOpen);
  }

  useEffect(() => {
    let issuer = null;
    let differentIssuer = null;
    if (selected.length > 0) {
      selected.map(async (receivable) => {
        console.log(receivable.fields[0], issuer);
        if (issuer) {
          if (receivable.fields[0] !== issuer) {
            differentIssuer = receivable.fields[0];
          }
        }
        issuer = receivable.fields[0];
      });
    }
    if (differentIssuer) {
      alertBox({
        title: "Attention!",
        descriptionHTML: `<p>You have selected receivables from different issuers. Please select only receivables from the same issuer.</p>`,
        buttons: [
          {
            title: "Ok",
            class: "cancel",
          },
        ],
      });
      setSelected(
        selected.filter(
          (receivable) => receivable.fields[0] !== differentIssuer
        )
      );
    }
  }, [selected]);

  return (
    <PageContainer
      FullGridContext={FullGridContext}
      PagePreview={PagePreview}
      defaultGridHeader={defaultGridHeader}
      selection={{
        multiple: true,
        selected,
        setSelected,
        functions: [
          {
            title: "Settlement",
            fun: handleSettlement,
            icon: "ReplaceAll",
            Page: Settlement,
            opened: settlementOpen,
            setOpened: setSettlementOpen,
            selected,
          },
        ],
      }}
    />
  );
}
