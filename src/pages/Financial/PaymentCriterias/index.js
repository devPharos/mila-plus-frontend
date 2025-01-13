import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function FinancialPaymentCriteria() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "description", asc: true };
  const defaultGridHeader = [
    {
      title: "Description",
      name: "description",
      type: "text",
      filter: true,
    },
    {
      title: "Recurring Quantity",
      name: "recurring_qt",
      type: "number",
      filter: false,
    },
    {
      title: "Recurring Metric",
      name: "recurring_metric",
      type: "text",
      filter: false,
    },
    {
      title: "Fee Quantity",
      name: "fee_qt",
      type: "number",
      filter: false,
    },
    {
      title: "Fee Metric",
      name: "fee_metric",
      type: "text",
      filter: false,
    },
    {
      title: "Fee Type",
      name: "fee_type",
      type: "text",
      filter: false,
    },
    {
      title: "Fee Value",
      name: "fee_value",
      type: "number",
      filter: false,
    },
    {
      title: "Filial Name",
      name: "filial_name",
      type: "text",
      filter: true,
    },
  ];

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
      const data = await getData("paymentcriterias", {
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
            company_id,
            company,
            filial_id,
            filial,
            description,
            recurring_qt,
            recurring_metric,
            fee_qt,
            fee_metric,
            fee_type,
            fee_value,
          },
          index
        ) => {
          return {
            show: true,
            id,
            fields: [
              description.slice(0, 50) + "...",
              recurring_qt,
              recurring_metric,
              fee_qt,
              fee_metric,
              fee_type,
              fee_value,
              filial.name,
            ],
            page: Math.ceil((index + 1) / limit),
          };
        }
      );
      setGridData(gridDataValues);
      setLoadingData(false);
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
