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
      title: "Type",
      name: "employee_type",
      type: "text",
      filter: true,
    },
    {
      title: "Subtype",
      name: "employee_subtype",
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
    setLoadingData,
    setGridDetails,
  } = useContext(FullGridContext);
  async function loader() {
    setLoadingData(true);
    const data = await getData("staffs", {
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
        { id, name, last_name, employee_type, employee_subtype, canceled_at },
        index
      ) => {
        const ret = {
          show: true,
          id,
          fields: [name, last_name, employee_type, employee_subtype],
          canceled: canceled_at,
          page: Math.ceil((index + 1) / limit),
        };
        return ret;
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
