import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function Documents() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "title", asc: true };
  const defaultGridHeader = [
    {
      title: "Origin",
      name: "origin",
      type: "text",
      filter: false,
    },
    {
      title: "Type",
      name: "type",
      type: "text",
      filter: false,
    },
    {
      title: "Subtype",
      name: "subtype",
      type: "text",
      filter: false,
    },
    {
      title: "Title",
      name: "title",
      type: "text",
      filter: false,
    },
  ];

  const { opened, orderBy, setGridData, page, setPages, limit, search } =
    useContext(FullGridContext);

  useEffect(() => {
    async function loader() {
      const data = await getData("documents", {
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
        ({ id, origin, type, subtype, title, canceled_at }, index) => {
          const ret = {
            show: true,
            id,
            fields: [origin, type, subtype, title],
            canceled: canceled_at,
            page: Math.ceil((index + 1) / limit),
          };
          return ret;
        }
      );
      setGridData(gridDataValues);
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
