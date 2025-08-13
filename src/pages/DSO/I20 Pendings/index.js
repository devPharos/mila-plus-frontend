import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { FullGridContext } from "..";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { format, parseISO } from "date-fns";
import { useLocation } from "react-router-dom";

export default function I20Pendings() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "created_at", asc: false };
  const defaultGridHeader = [
    {
      title: "Full Name",
      name: "type",
      type: "text",
      filter: false,
    },
    {
      title: "Registration Number",
      name: "type",
      type: "text",
      filter: false,
    },
    {
      title: "Category",
      name: "type",
      type: "text",
      filter: true,
    },
    {
      title: "Application",
      name: "type",
      type: "text",
      filter: true,
    },
    {
      title: "Status",
      name: "subject",
      type: "text",
      filter: true,
    },
    {
      title: "Enrollment Date",
      name: "type",
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
      ({ status, enrollments, solicitation_date, canceled_at }, index) => {
        const { students, application } = enrollments;
        const { name, last_name, category, registration_number } = students;
        const ret = {
          show: true,
          id: enrollments.id,
          fields: [
            name + " " + last_name,
            registration_number,
            category,
            application,
            status,
            format(parseISO(solicitation_date), "MM/dd/yyyy"),
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
      pageAccess={pageAccess}
      handleNew={false}
      defaultGridHeader={defaultGridHeader}
    />
  );
}
