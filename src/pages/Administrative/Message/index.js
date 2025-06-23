import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { FullGridContext } from "..";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";

export default function Messages() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "created_at", asc: false };
  const defaultGridHeader = [
    {
      title: "Type",
      name: "type",
      type: "text",
      filter: true,
    },
    {
      title: "Subject",
      name: "subject",
      type: "text",
      filter: false,
    },
    {
      title: "Delivered to",
      name: "students",
      type: "text",
      filter: false,
    },
    {
      title: "Sent on",
      name: "created_at",
      type: "text",
      filter: false,
    },
    {
      title: "Method",
      name: "method",
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
    setLoadingData,
    setGridDetails,
  } = useContext(FullGridContext);

  const { pathname } = useLocation();

  async function loader() {
    setLoadingData(true);
    const data = await getData("messages", {
      limit,
      page,
      orderBy,
      setPages,
      setGridData,
      search,
      defaultGridHeader,
      defaultOrderBy,
      setGridDetails,
      pathname,
    });

    if (!data) {
      return;
    }
    const gridDataValues = data.map(
      (
        { id, type, subject, students, canceled_at, created_at, method },
        index
      ) => {
        const ret = {
          show: true,
          id,
          fields: [
            type,
            subject,
            students.length + " students",
            format(created_at, "yyyy-MM-dd @ HH:mm"),
            method,
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
