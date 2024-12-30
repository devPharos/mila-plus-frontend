import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { FullGridContext } from "..";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";

export default function AdministrativeStudent() {
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
      title: "Last Name",
      name: "last_name",
      type: "text",
      filter: false,
    },
    {
      title: "Academic Formation",
      name: "academic_formation",
      type: "text",
      filter: false,
    },
  ];
  const { opened, orderBy, setGridData, page, setPages, limit, search } =
    useContext(FullGridContext);

  useEffect(() => {
    async function loader() {
      const data = await getData("staffs", {
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
        ({ id, name, last_name, academic_formation, canceled_at }, index) => {
          const ret = {
            show: true,
            id,
            fields: [name, last_name, academic_formation],
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
