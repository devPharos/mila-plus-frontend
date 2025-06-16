import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function FinancialBankAccounts() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "account", asc: true };
  const defaultGridHeader = [
    {
      title: "Account",
      name: "account",
      type: "text",
      filter: false,
    },
    {
      title: "Routing Number",
      name: "routing_number",
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
    setActiveFilters,
    setLoadingData,
    setGridDetails,
  } = useContext(FullGridContext);

  useEffect(() => {
    setActiveFilters([]);
  }, []);
  async function loader() {
    setLoadingData(true);
    const data = await getData("bankaccounts", {
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
      (
        { id, bank_id, bank, filial_id, filial, account, routing_number },
        index
      ) => {
        return {
          show: true,
          id,
          fields: [account, routing_number, bank.bank_name, filial.name],
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
      defaultGridHeader={defaultGridHeader}
    />
  );
}
