import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { FullGridContext } from "..";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";

export default function I20Pendings() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "created_at", asc: false };
  const defaultGridHeader = [
    {
      title: "Student",
      name: "type",
      type: "text",
      filter: false,
    },
    {
      title: "Status",
      name: "subject",
      type: "text",
      filter: false,
    },
  ];

  const {
    accessModule,
    activeFilters,
    gridData,
    gridDetails,
    gridHeader,
    handleFilters,
    handleOpened,
    limit,
    loadingData,
    opened,
    orderBy,
    page,
    pages,
    search,
    setActiveFilters,
    setGridData,
    setGridDetails,
    setGridHeader,
    setLimit,
    setLoadingData,
    setOpened,
    setOrderBy,
    setPage,
    setPages,
    setSearch,
    setTotalRows,
    setSuccessfullyUpdated,
    successfullyUpdated,
    totalRows,
  } = useContext(FullGridContext);

  const pageAccess = accessModule.children.find(
    (el) => el.alias === "i20-pendings"
  );

  const { pathname } = useLocation();

  async function loader() {
    setLoadingData(true);
    const data = await getData("i20pendings", {
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
      ({ id, status, enrollments, canceled_at }, index) => {
        const { students } = enrollments;
        const { name, last_name } = students;
        const ret = {
          show: true,
          id: enrollments.id,
          fields: [name + " " + last_name, status],
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
      pageAccess={pageAccess}
      handleNew={false}
      defaultGridHeader={defaultGridHeader}
    />
  );
}
