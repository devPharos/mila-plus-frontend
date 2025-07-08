import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function FinancialMerchants() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "name", asc: true };
  const defaultGridHeader = [
    {
      title: "Merchant Name",
      name: "merchant_name",
      type: "text",
      filter: true,
    },
    {
      title: "City",
      name: "city",
      type: "text",
      filter: false,
    },
    {
      title: "State",
      name: "state",
      type: "text",
      filter: false,
    },
    {
      title: "Email",
      name: "email",
      type: "text",
      filter: false,
    },
    {
      title: "Phone Number",
      name: "phone_number",
      type: "text",
      filter: false,
    },
    {
      title: "Bank Name",
      name: "bank_name",
      type: "text",
      filter: true,
    },
    {
      title: "Late Payees",
      name: "late_payees",
      type: "number",
      filter: false,
    },
    {
      title: "Balance Payees",
      name: "balance_payees",
      type: "number",
      filter: false,
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
    (el) => el.alias === "financial-merchants"
  );

  useEffect(() => {
    setActiveFilters([]);
  }, []);
  async function loader() {
    setLoadingData(true);
    const data = await getData("merchants", {
      limit,
      page,
      orderBy,
      setOrderBy,
      setPages,
      setGridData,
      search,
      setSearch,
      defaultGridHeader,
      defaultOrderBy,
      setGridDetails,
    });
    if (!data) {
      return;
    }
    const gridDataValues = data.map(
      (
        {
          id,
          name,
          address,
          city,
          state,
          zip,
          country,
          ein,
          email,
          phone_number,
          bank_name,
          late_payees,
          balance_payees,
          filial_id,
          filial,
        },
        index
      ) => {
        return {
          show: true,
          id,
          fields: [
            name,
            city,
            state,
            email,
            phone_number,
            bank_name,
            late_payees,
            balance_payees,
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
