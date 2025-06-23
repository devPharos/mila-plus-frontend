import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { FullGridContext } from "..";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";

export default function Classrooms() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "class_number", asc: true };
  const defaultGridHeader = [
    {
      title: "Class Number",
      name: "class_number",
      type: "text",
      filter: false,
    },
    {
      title: "Status",
      name: "status",
      type: "text",
      filter: true,
    },
    {
      title: "Quantity of Students",
      name: "quantity_of_students",
      type: "text",
      filter: false,
    },
    {
      title: "Groups in Classroom",
      name: "studentgroups",
      type: "integer",
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
    setLoadingData,
    setGridDetails,
  } = useContext(FullGridContext);

  async function loader() {
    setLoadingData(true);
    const data = await getData("classrooms", {
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
          class_number,
          status,
          quantity_of_students,
          studentgroups,
          canceled_at,
        },
        index
      ) => {
        const ret = {
          show: true,
          id,
          fields: [
            class_number,
            status,
            quantity_of_students,
            studentgroups.length,
          ],
          selectable: true,
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
