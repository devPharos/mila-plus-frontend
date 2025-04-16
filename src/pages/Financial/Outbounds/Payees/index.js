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
import { receivableStatusesOptions } from "~/functions/selectPopoverOptions";
import api, { baseURL } from "~/services/api";

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
    // {
    //   title: "Balance",
    //   name: "balance",
    //   type: "currency",
    //   filter: false,
    // },
    {
      title: "Memo",
      name: "memo",
      type: "text",
      filter: false,
    },
    {
      title: "Chart of Account",
      name: "chartOfAccount",
      type: "text",
      filter: true,
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
  const [excelOpen, setExcelOpen] = useState(false);
  const defaultExcelData = [
    {
      title: "Entry date from",
      name: "entry_date_from",
      type: "date",
      value: null,
    },
    {
      title: "Entry date to",
      name: "entry_date_to",
      type: "date",
      value: null,
    },
    {
      title: "Due date from",
      name: "due_date_from",
      type: "date",
      value: null,
    },
    { title: "Due date to", name: "due_date_to", type: "date", value: null },
    {
      title: "Settlement date from",
      name: "settlement_from",
      type: "date",
      value: null,
    },
    {
      title: "Settlement date to",
      name: "settlement_to",
      type: "date",
      value: null,
    },
    {
      title: "Status",
      name: "status",
      type: "select",
      options: receivableStatusesOptions,
      value: "All",
    },
  ];
  const [excelData, setExcelData] = useState(defaultExcelData);

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
          // balance,
          memo,
          status,
          chartOfAccount,
        },
        index
      ) => {
        const { name: chartOfAccountName } = chartOfAccount;
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
            // "$ " + balance.toFixed(2),
            memo,
            chartOfAccountName,
            status,
          ],
          selectable: !status.includes("Paid"),
          canceled: canceled_at,
          page: Math.ceil((index + 1) / limit),
        };
        return ret;
      }
    );
    console.log(gridDataValues);
    setGridData(gridDataValues);
    setLoadingData(false);
  }

  useEffect(() => {
    if (!settlementOpen) {
      setSelected([]);
    }
    loader();
  }, [opened, filial, orderBy, search, limit]);

  async function handleExcel(generate = true) {
    if (excelOpen && generate) {
      api
        .post(`/payee/excel`, {
          entry_date_from: excelData[0].value,
          entry_date_to: excelData[1].value,
          due_date_from: excelData[2].value,
          due_date_to: excelData[3].value,
          settlement_from: excelData[4].value,
          settlement_to: excelData[5].value,
          status: excelData[6].value,
        })
        .then(({ data }) => {
          saveAs(`${baseURL}/get-file/${data.name}`, `${data.name}.xlsx`);
          // setExcelData(defaultExcelData);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    setExcelOpen(!excelOpen);
  }

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
        ],
      }}
      Excel={{
        fun: handleExcel,
        opened: excelOpen,
        excelData,
        setExcelData,
      }}
    />
  );
}
