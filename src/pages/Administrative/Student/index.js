import { Filter } from "lucide-react";
import React, { useEffect, useState } from "react";
import Breadcrumbs from "~/components/Breadcrumbs";
import Filters from "~/components/Filters";
import FiltersBar from "~/components/FiltersBar";
import Grid from "~/components/Grid";
import api from "~/services/api";
import { applyFilters, getCurrentPage, hasAccessTo } from "~/functions";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import PageHeader from "~/components/PageHeader";
import { PreviewContext } from "~/pages/Commercial/Enrollments";
import PreviewController from "~/components/PreviewController";

export default function AdministrativeStudent() {
  const [activeFilters, setActiveFilters] = useState([]);
  const [opened, setOpened] = useState(false);
  const [orderBy, setOrderBy] = useState({ column: "Name", asc: true });
  const accesses = useSelector((state) => state.auth.accesses);
  const filial = useSelector((state) => state.auth.filial);
  const currentPage = getCurrentPage();
  const [gridHeader, setGridHeader] = useState([
    {
      title: "Registration Number",
      type: "text",
      filter: false,
    },
    {
      title: "Name",
      type: "text",
      filter: false,
    },
    {
      title: "Last Name",
      type: "text",
      filter: false,
    },
    {
      title: "E-mail",
      type: "text",
      filter: false,
    },
    {
      title: "Phone",
      type: "text",
      filter: false,
    },
    {
      title: "Category",
      type: "text",
      filter: true,
    },
    {
      title: "Status",
      type: "text",
      filter: true,
    },
  ]);
  const [successfullyUpdated, setSuccessfullyUpdated] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [gridData, setGridData] = useState();
  let delayDebounceFn = null;

  function handleFilters({ title = "", value = "" }) {
    function runFilter(title, value) {
      if (value) {
        setActiveFilters([
          ...activeFilters.filter((el) => el.title != title),
          { title, value },
        ]);
      } else {
        setActiveFilters([...activeFilters.filter((el) => el.title != title)]);
      }
    }
    if (title === "search" && value) {
      clearTimeout(delayDebounceFn);
      delayDebounceFn = setTimeout(() => {
        runFilter(title, value);
        // Send Axios request here
      }, 700);

      return;
    } else {
      runFilter(title, value);
    }
  }

  useEffect(() => {
    async function getData() {
      const { data } = await api.get(`/students`);
      let pages = Math.ceil(data.length / limit);
      setPages(pages);
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
            filial: studentFilial,
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
          // console.log(ret);
          // if (filial.id === 1) {
          //   ret.fields.push(studentFilial.name)
          // }
          return ret;
        }
      );
      setGridData(gridDataValues);
    }
    getData();
  }, [opened, filial]);

  function handleOpened(id) {
    if (!id) {
      setSuccessfullyUpdated(true);
    }
    setOpened(id);
  }

  useEffect(() => {
    if (gridData && gridHeader) {
      applyFilters(activeFilters, gridData, gridHeader, orderBy, setGridData);
    }
  }, [activeFilters, orderBy]);

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
        handleFilters={handleFilters}
        gridHeader={gridHeader}
        gridData={gridData}
        setGridHeader={setGridHeader}
        activeFilters={activeFilters}
      />

      <Grid
        gridData={gridData}
        page={page}
        gridHeader={gridHeader}
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
            <PreviewController>
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
    </div>
  );
}
