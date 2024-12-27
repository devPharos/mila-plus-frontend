import { Filter, Loader2 } from "lucide-react";
import React, { useEffect, useContext } from "react";
import Breadcrumbs from "~/components/Breadcrumbs";
import Filters from "~/components/Filters";
import FiltersBar from "~/components/FiltersBar";
import Grid from "~/components/Grid";
import api from "~/services/api";
import { applyFilters, getCurrentPage, hasAccessTo } from "~/functions";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import PageHeader from "~/components/PageHeader";
import { PreviewContext } from "~/pages/Commercial/Enrollments/index2";
import PreviewController from "~/components/PreviewController";
import { FullGridContext } from "..";
import { getData } from "~/functions/gridFunctions";

export default function AdministrativeStudent() {
  const accesses = useSelector((state) => state.auth.accesses);
  const filial = useSelector((state) => state.auth.filial);
  const currentPage = getCurrentPage();
  const defaultOrderBy = { column: "name", asc: true };
  const defaultGridHeader = [
    {
      title: "Registration Number",
      name: "registration_number",
      type: "text",
      filter: false,
    },
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
      title: "E-mail",
      name: "email",
      type: "text",
      filter: false,
    },
    {
      title: "Phone",
      name: "phone",
      type: "text",
      filter: false,
    },
    {
      title: "Category",
      name: "category",
      type: "text",
      filter: true,
    },
    {
      title: "Status",
      name: "status",
      type: "text",
      filter: true,
    },
  ];

  const {
    activeFilters,
    setActiveFilters,
    opened,
    setOpened,
    orderBy = defaultOrderBy,
    setOrderBy,
    gridHeader,
    setGridHeader,
    gridData = defaultGridHeader,
    setGridData,
    successfullyUpdated,
    setSuccessfullyUpdated,
    page,
    setPage,
    pages,
    setPages,
    limit,
    setLimit,
    search,
    setSearch,
    handleFilters,
    handleOpened,
  } = useContext(FullGridContext);

  useEffect(() => {
    async function loader() {
      const data = await getData("students", {
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
        (
          {
            registration_number,
            id,
            name,
            last_name,
            email,
            phone,
            category,
            status,
            canceled_at,
          },
          index
        ) => {
          const ret = {
            show: true,
            id,
            fields: [
              registration_number,
              name,
              last_name,
              email,
              phone,
              category,
              status,
            ],
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

  useEffect(() => {
    if (gridData && gridHeader) {
      applyFilters(activeFilters, gridData, gridHeader, orderBy, setGridData);
    }
  }, [activeFilters]);

  return (
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4">
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
        <FiltersBar>
          <Filter size={14} /> Custom Filters
        </FiltersBar>
      </PageHeader>
      <Filters
        access={hasAccessTo(
          accesses,
          currentPage.path.split("/")[1],
          currentPage.alias
        )}
        handleNew={() => setOpened("new")}
        search
        pages={pages}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        handleFilters={handleFilters}
        gridHeader={gridHeader.length > 0 ? gridHeader : defaultGridHeader}
        gridData={gridData}
        setGridHeader={setGridHeader}
        activeFilters={activeFilters}
      />

      {gridData && gridData.length > 0 ? (
        <Grid
          gridData={gridData}
          page={page}
          gridHeader={gridHeader.length > 0 ? gridHeader : defaultGridHeader}
          orderBy={orderBy}
          activeFilters={activeFilters}
          setOrderBy={setOrderBy}
          handleOpened={handleOpened}
          opened={opened}
        >
          {opened && (
            <div
              className="fixed left-0 top-0 z-40 w-full h-full"
              style={{ background: "rgba(0,0,0,.2)" }}
            ></div>
          )}
          {opened && (
            <PreviewContext.Provider
              value={{ successfullyUpdated, handleOpened }}
            >
              <PreviewController Context={FullGridContext}>
                <PagePreview
                  access={hasAccessTo(
                    accesses,
                    currentPage.path.split("/")[1],
                    currentPage.alias
                  )}
                  id={opened}
                  handleOpened={handleOpened}
                  setOpened={setOpened}
                  defaultFormType="full"
                  successfullyUpdated={successfullyUpdated}
                  setSuccessfullyUpdated={setSuccessfullyUpdated}
                />
              </PreviewController>
            </PreviewContext.Provider>
          )}
        </Grid>
      ) : (
        <div className="flex flex-row items-center justify-start h-16 w-full gap-2 mx-2 w-full">
          <Loader2 size={16} color={"#111"} className="animate-spin" />
          <div>Loading...</div>
        </div>
      )}
    </div>
  );
}
