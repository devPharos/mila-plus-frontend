import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function Levels() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "bank_name", asc: true };
  const defaultGridHeader = [
    {
      title: "Name",
      name: "name",
      type: "text",
      filter: false,
    },
    {
      title: "Total Hours",
      name: "total_hours",
      type: "text",
      filter: true,
    },
    {
      title: "Program Category",
      name: "programcategory_id",
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
    const data = await getData("levels", {
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
      ({ id, name, total_hours, Programcategory }, index) => {
        const programcategory = Programcategory.name;
        return {
          show: true,
          id,
          fields: [name, total_hours.toString() + "h", programcategory],
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
