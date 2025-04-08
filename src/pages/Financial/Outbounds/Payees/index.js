import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "../..";
import { format, parseISO } from "date-fns";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { PageContext } from "~/App";
import Settlement from "./Settlement";

export function FinancialOutbounds() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { pages } = useContext(PageContext);
  const paths = pathname.split("/");
  const redirectRouteName = pages
    .find((page) => page.name === paths[1])
    .children.find((page) => page.path === `/${paths[1]}/${paths[2]}`)
    .children[0].path;
  useEffect(() => {
    if (pathname.toUpperCase() === `/${paths[1]}/${paths[2]}`.toUpperCase()) {
      navigate(`${redirectRouteName}`);
    }
  }, [pathname]);
  return <Outlet />;
}

export default function FinancialPayees() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "due_date", asc: true };
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
      filter: false,
    },
    {
      title: "Invoice Number",
      name: "invoice_number",
      type: "text",
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
  ];
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [selected, setSelected] = useState([]);

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
  } = useContext(FullGridContext);

  function handleSettlement() {
    const newVarOpened = !settlementOpen;
    setSettlementOpen(newVarOpened);
    if (!newVarOpened) {
      loader();
    }
  }

  useEffect(() => {
    setActiveFilters([]);
  }, []);

  async function loader() {
    setLoadingData(true);
    const data = await getData("payee", {
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
          due_date,
          amount,
          discount,
          fee,
          total,
          balance,
          status,
        },
        index
      ) => {
        const ret = {
          show: true,
          id,
          fields: [
            issuer.name,
            filial.name,
            invoice_number ? invoice_number.toString() : null,
            format(parseISO(due_date), "yyyy-MM-dd"),
            "$ " + amount.toFixed(2),
            "$ " + discount.toFixed(2),
            "$ " + fee.toFixed(2),
            "$ " + total.toFixed(2),
            "$ " + balance.toFixed(2),
            status,
          ],
          selectable: !status.includes("Paid"),
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
    if (!settlementOpen) {
      setSelected([]);
    }
    loader();
  }, [opened, filial, orderBy, search, limit]);

  return (
    <PageContainer
      FullGridContext={FullGridContext}
      PagePreview={PagePreview}
      defaultGridHeader={defaultGridHeader}
      selection={{
        multiple: false,
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
          // {
          //   title: "Delete",
          //   fun: handleDelete,
          //   icon: "X",
          //   Page: null,
          //   opened: false,
          //   setOpened: () => null,
          //   selected,
          // },
        ],
      }}
    />
  );
}
