import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function FilialTypes() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "name", asc: true };
  const defaultGridHeader = [
    {
      title: "Name",
      name: "name",
      type: "text",
      filter: false,
    },
  ];

  const { opened, orderBy, setGridData, page, setPages, limit, search } =
    useContext(FullGridContext);

  useEffect(() => {
    async function loader() {
      const data = await getData("filialtypes", {
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
      const gridDataValues = data.map(({ id, name }, index) => {
        return {
          show: true,
          id,
          fields: [name],
          page: Math.ceil((index + 1) / limit),
        };
      });
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
