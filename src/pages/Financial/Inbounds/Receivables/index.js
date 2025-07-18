import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "../..";
import { format, parseISO, set } from "date-fns";
import Settlement from "./Settlement";
import { AlertContext, PageContext } from "~/App";
import { toast } from "react-toastify";
import api, { baseURL } from "~/services/api";
import FeeAdjustment from "./FeeAdjustment";
import {
  invoiceTypeDetailsOptions,
  invoiceTypesOptions,
  receivableStatusesOptions,
} from "~/functions/selectPopoverOptions";
import Renegociation from "./Renegociation";
import { Outlet, useLocation, useNavigate, useOutlet } from "react-router-dom";

export function FinancialInbounds() {
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

export default function FinancialReceivables() {
  const Outlet = useOutlet();
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
    {
      title: "Autopay",
      name: "is_autopay",
      type: "boolean",
      filter: true,
    },
  ];
  const [selected, setSelected] = useState([]);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [feeAdjustmentOpen, setFeeAdjustmentOpen] = useState(false);
  const [excelOpen, setExcelOpen] = useState(false);
  const [renegociationOpen, setRenegociationOpen] = useState(false);
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
    {
      title: "Type",
      name: "type",
      type: "select",
      options: invoiceTypesOptions,
      value: "All",
    },
    {
      title: "Type Detail",
      name: "type_detail",
      type: "select",
      options: invoiceTypeDetailsOptions,
      value: "All",
    },
  ];
  const [excelData, setExcelData] = useState(defaultExcelData);
  const { alertBox } = useContext(AlertContext);

  const {
    accessModule,
    activeFilters,
    gridData,
    gridDetails,
    gridHeader,
    handleFilters,
    handleOpened,
    limit,
    loadingData,
    opened,
    orderBy,
    page,
    pages,
    search,
    setActiveFilters,
    setGridData,
    setGridDetails,
    setGridHeader,
    setLimit,
    setLoadingData,
    setOpened,
    setOrderBy,
    setPage,
    setPages,
    setSearch,
    setTotalRows,
    setSuccessfullyUpdated,
    successfullyUpdated,
    totalRows,
  } = useContext(FullGridContext);

  const pageAccess = accessModule.children.find(
    (el) => el.alias === "financial-receivables"
  );

  useEffect(() => {
    setActiveFilters([]);
  }, []);

  async function loader() {
    setLoadingData(true);
    const data = await getData("receivables", {
      limit: 50,
      page,
      orderBy,
      setPages,
      setGridData,
      search,
      type: "pending",
      defaultGridHeader,
      defaultOrderBy,
      setTotalRows,
      setGridDetails,
    });
    if (!data) {
      return;
    }
    const gridDataValues = data
      .sort((a, b) => (a.due_date > b.due_date ? 1 : -1))
      .map(
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
              invoice_number.toString(),
              format(parseISO(due_date), "yyyy-MM-dd"),
              "$ " + amount.toFixed(2),
              "$ " + discount.toFixed(2),
              "$ " + fee.toFixed(2),
              "$ " + total.toFixed(2),
              "$ " + balance.toFixed(2),
              status,
              issuer &&
              issuer.issuer_x_recurrence &&
              issuer.issuer_x_recurrence.is_autopay
                ? true
                : false,
              // format(parseISO(status_date), "yyyy-MM-dd"),
              ,
            ],
            selectable:
              status.includes("Pending") || status.includes("Parcial Paid"),
            attention: {
              title: "Due Date",
              show:
                status.includes("Pending") &&
                due_date < format(new Date(), "yyyyMMdd"),
            },
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
  }, [opened, settlementOpen, filial, orderBy, search, limit, page]);

  function handleSettlement() {
    const newVarOpened = !settlementOpen;
    setSettlementOpen(newVarOpened);
    if (!newVarOpened) {
      loader();
    }
  }

  function handleRenegociation() {
    const newVarOpened = !renegociationOpen;
    setRenegociationOpen(newVarOpened);
    if (!newVarOpened) {
      setSelected([]);
      loader();
    }
  }

  useEffect(() => {
    let issuer = null;
    let differentIssuer = null;
    if (selected.length > 0) {
      selected.map(async (receivable) => {
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

  async function handleDelete() {
    if (selected.length === 0) {
      return;
    }
    alertBox({
      title: "Attention!",
      descriptionHTML:
        "Are you sure you want to delete the selected receivables? This action cannot be undone.",
      buttons: [
        {
          title: "No",
          class: "cancel",
        },
        {
          title: "Yes",
          onPress: async () => {
            const promises = [];
            let hasChanged = false;
            selected.map((receivable) => {
              promises.push(
                api
                  .delete(`/receivables/${receivable.id}`)
                  .then((response) => {
                    toast(response.data.message, { autoClose: 1000 });
                  })
                  .catch((err) => {
                    toast(err.response.data.error, {
                      type: "error",
                      autoClose: 3000,
                    });
                  })
              );
            });
            Promise.all(promises).then(() => {
              setSelected([]);
              loader();
            });
          },
        },
      ],
    });
  }

  async function handleExcel(generate = true) {
    if (excelOpen && generate) {
      api
        .post(`/receivables/excel`, {
          entry_date_from: excelData[0].value,
          entry_date_to: excelData[1].value,
          due_date_from: excelData[2].value,
          due_date_to: excelData[3].value,
          settlement_from: excelData[4].value,
          settlement_to: excelData[5].value,
          status: excelData[6].value,
          type: excelData[7].value,
          type_detail: excelData[8].value,
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

  async function handleFeeAdjustment() {
    if (selected.length === 0) {
      return;
    }
    if (selected.length > 1) {
      alertBox({
        title: "Attention!",
        descriptionHTML:
          "<p>You can only adjust fees of one receivable at a time.</p>",
        buttons: [
          {
            title: "Ok",
            class: "cancel",
            onPress: () => {
              setSelected([]);
            },
          },
        ],
      });
      return;
    }
    const newVarOpened = !feeAdjustmentOpen;
    setFeeAdjustmentOpen(newVarOpened);
    if (!newVarOpened) {
      loader();
    }
  }

  return (
    Outlet || (
      <PageContainer
        FullGridContext={FullGridContext}
        PagePreview={PagePreview}
        defaultGridHeader={defaultGridHeader}
        pageAccess={pageAccess}
        selection={{
          multiple: true,
          selected,
          setSelected,
          functions: [
            {
              title: "Fee Adjustment",
              fun: handleFeeAdjustment,
              icon: "Pencil",
              alias: "fee-adjustments",
              Page: FeeAdjustment,
              opened: feeAdjustmentOpen,
              setOpened: setFeeAdjustmentOpen,
              selected,
            },
            {
              title: "Settlement",
              alias: "settlement",
              fun: handleSettlement,
              icon: "ReplaceAll",
              Page: Settlement,
              opened: settlementOpen,
              setOpened: setSettlementOpen,
              selected,
            },
            {
              title: "Renegotiation",
              alias: "renegotiation",
              fun: handleRenegociation,
              icon: "Handshake",
              Page: Renegociation,
              opened: renegociationOpen,
              setOpened: setRenegociationOpen,
              selected,
            },
            {
              title: "Delete",
              alias: "delete",
              fun: handleDelete,
              icon: "X",
              Page: null,
              opened: false,
              setOpened: () => null,
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
    )
  );
}
