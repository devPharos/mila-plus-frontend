import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function Parameters() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "name", asc: true };
  const defaultGridHeader = [
    {
      title: "Name",
      name: "name",
      type: "text",
      filter: false,
    },
    {
      title: "Value",
      name: "value",
      type: "text",
      filter: false,
    },
    {
      title: "Type",
      name: "type",
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
  } = useContext(FullGridContext);

  useEffect(() => {
    setActiveFilters([]);
  }, []);

  useEffect(() => {
    async function loader() {
      setLoadingData(true);
      const data = await getData("parameters", {
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
      const gridDataValues = data.map(({ id, name, value, type }, index) => {
        return {
          show: true,
          id,
          fields: [name, value, type],
          page: Math.ceil((index + 1) / limit),
        };
      });
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
