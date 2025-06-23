import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function FinancialIssuers() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "name", asc: true };
  const defaultGridHeader = [
    {
      title: "Issuer Name",
      name: "name",
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
  ];

  const {
    opened,
    orderBy,
    setGridData,
    page,
    setPages,
    limit,
    search,
    setSearch,
    setActiveFilters,
    setLoadingData,
    setGridDetails,
  } = useContext(FullGridContext);

  useEffect(() => {
    setActiveFilters([]);
  }, []);
  async function loader() {
    setLoadingData(true);
    const data = await getData("issuers", {
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
        {
          id,
          name,
          address,
          city,
          state,
          zip,
          country,
          email,
          phone_number,
          bank_name,
        },
        index
      ) => {
        return {
          show: true,
          id,
          fields: [name, city, state, email, phone_number, bank_name],
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
