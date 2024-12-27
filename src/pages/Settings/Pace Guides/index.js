import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function PaceGuides() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "bank_name", asc: true };
  const defaultGridHeader = [
    {
      title: "Workload",
      name: "workload_name",
      type: "text",
      filter: true,
    },
    {
      title: "Type",
      name: "type",
      type: "text",
      filter: true,
    },
    {
      title: "Description",
      name: "description",
      type: "text",
      filter: true,
    },
  ];

  const { opened, orderBy, setGridData, page, setPages, limit, search } =
    useContext(FullGridContext);

  useEffect(() => {
    async function loader() {
      const data = await getData("paceguides", {
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
        ({ id, Workload, type, description }, index) => {
          const workload_name = Workload.name;
          return {
            show: true,
            id,
            fields: [workload_name, type, description],
            page: Math.ceil((index + 1) / limit),
          };
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
