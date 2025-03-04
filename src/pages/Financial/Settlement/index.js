import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";
import { format, parseISO } from "date-fns";
import { AlertContext } from "~/App";
import api from "~/services/api";
import { toast } from "react-toastify";

export default function FinancialSettlement() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "receivable,due_date", asc: true };
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
      title: "Payment Method",
      name: ["paymentMethod", "description"],
      type: "text",
      filter: false,
    },
    {
      title: "Payment Method",
      name: ["paymentMethod", "platform"],
      type: "text",
      filter: false,
    },
    {
      title: "Settlement Date",
      name: "created_at",
      type: "date",
      filter: false,
    },
  ];
  const [selected, setSelected] = useState([]);
  const [settlementOpen, setSettlementOpen] = useState(false);
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
  } = useContext(FullGridContext);

  useEffect(() => {
    setActiveFilters([]);
  }, []);

  async function loader() {
    setLoadingData(true);
    setTimeout(async () => {
      const data = await getData("settlements", {
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
            receivable,
            status,
            amount,
            created_at,
            paymentMethod,
            // status_date,
          },
          index
        ) => {
          const ret = {
            show: true,
            id,
            fields: [
              receivable.issuer.name,
              receivable.filial.name,
              "I" + receivable.invoice_number.toString().padStart(6, "0"),
              format(parseISO(receivable.entry_date), "yyyy-MM-dd"),
              format(parseISO(receivable.due_date), "yyyy-MM-dd"),
              "$ " + amount.toFixed(2),
              paymentMethod ? paymentMethod.description : "",
              paymentMethod ? paymentMethod.platform : "",
              format(parseISO(created_at), "yyyy-MM-dd"),
              ,
            ],
            selectable: !paymentMethod.platform == "Gravity",

            canceled: canceled_at,
            page: Math.ceil((index + 1) / limit),
          };
          return ret;
        }
      );
      setGridData(gridDataValues);
      setLoadingData(false);
    }, 500);
  }

  useEffect(() => {
    loader();
  }, [opened, filial, orderBy, search, limit]);

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

  function handleDelete() {
    if (selected.length === 0) {
      return;
    }
    alertBox({
      title: "Attention!",
      descriptionHTML:
        "Are you sure you want to delete the selected settlements? This action cannot be undone.",
      buttons: [
        {
          title: "No",
          class: "cancel",
        },
        {
          title: "Yes",
          onPress: async () => {
            try {
              const promises = [];
              selected.map((receivable) => {
                promises.push(
                  api
                    .delete(`/settlements/${receivable.id}`)
                    .then((response) => {
                      toast(response.data.message, { autoClose: 1000 });
                    })
                    .catch((err) => {
                      toast(err.response.data.error, {
                        type: "error",
                        autoClose: 5000,
                      });
                    })
                );
              });
              Promise.all(promises).then(() => {
                loader();
                setSelected([]);
              });
            } catch (err) {
              toast(err.response.data.error, {
                type: "error",
                autoClose: 3000,
              });
            }
          },
        },
      ],
    });
  }

  return (
    <PageContainer
      FullGridContext={FullGridContext}
      PagePreview={null}
      defaultGridHeader={defaultGridHeader}
      handleNew={false}
      handleEdit={false}
      selection={{
        multiple: true,
        selected,
        setSelected,
        functions: [
          {
            title: "Delete settlement",
            fun: handleDelete,
            icon: "X",
            Page: null,
            opened: null,
            setOpened: () => null,
            selected,
          },
        ],
      }}
    />
  );
}
