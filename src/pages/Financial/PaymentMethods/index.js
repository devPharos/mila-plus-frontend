import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function FinancialPaymentMethods() {
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
      title: "Type of Payment",
      name: "type_of_payment",
      type: "text",
      filter: true,
    },
    {
      title: "Platform",
      name: "platform",
      type: "text",
      filter: true,
    },
    {
      title: "Payment Details",
      name: "payment_details",
      type: "text",
      filter: true,
    },
    {
      title: "Bank Account",
      name: "bank_account",
      type: "text",
      filter: true,
    },
    {
      title: "Filial Name",
      name: "filial_name",
      type: "text",
      filter: true,
    },
  ];

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
    (el) => el.alias === "financial-payment-method"
  );

  useEffect(() => {
    setActiveFilters([]);
  }, []);
  async function loader() {
    setLoadingData(true);
    const data = await getData("paymentmethods", {
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
    const gridDataValues = data
      .sort((a, b) => a.description > b.description)
      .map(
        (
          {
            id,
            description,
            type_of_payment,
            platform,
            payment_details,
            filial,
            bankAccount,
          },
          index
        ) => {
          return {
            show: true,
            id,
            fields: [
              description,
              type_of_payment,
              platform,
              payment_details,
              bankAccount.account + " - " + bankAccount.bank.bank_name,
              filial.name,
            ],
            page: Math.ceil((index + 1) / limit),
          };
        }
      );
    setGridData(gridDataValues);
    setLoadingData(false);
  }

  useEffect(() => {
    loader();
  }, [opened, filial, orderBy, search, limit, page]);

  return (
    <PageContainer
      FullGridContext={FullGridContext}
      PagePreview={PagePreview}
      pageAccess={pageAccess}
      defaultGridHeader={defaultGridHeader}
    />
  );
}
