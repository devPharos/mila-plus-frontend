import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function Filials() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "name", asc: true };
  const defaultGridHeader = [
    {
      title: "Active",
      name: "active",
      type: "boolean",
      filter: true,
    },
    {
      title: "Alias",
      name: "alias",
      type: "text",
      filter: false,
    },
    {
      title: "Name",
      name: "name",
      type: "text",
      filter: false,
    },
    {
      title: "Type",
      name: "type",
      type: "text",
      filter: true,
    },
    {
      title: "Ein",
      name: "ein",
      type: "text",
      filter: false,
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
      title: "Country",
      name: "country",
      type: "text",
      filter: false,
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
      const data = await getData("filials", {
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
          { id, active, alias, name, Filialtype, ein, city, state, country },
          index
        ) => {
          const type = Filialtype.name;
          return {
            show: true,
            id,
            fields: [active, alias, name, type, ein, city, state, country],
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
