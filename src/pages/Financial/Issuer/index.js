import { Filter } from "lucide-react";
import React, { useEffect, useState } from "react";
import Breadcrumbs from "~/components/Breadcrumbs";
import Filters from "~/components/Filters";
import FiltersBar from "~/components/FiltersBar";
import Grid from "~/components/Grid";
import api from "~/services/api";
import { applyFilters, getCurrentPage, hasAccessTo } from "~/functions";
import PageHeader from "~/components/PageHeader";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import PreviewController from "~/components/PreviewController";
import { createContext } from "react";

export const PreviewContext = createContext({});

export default function FinancialIssuers() {
  const [activeFilters, setActiveFilters] = useState([]);
  const [opened, setOpened] = useState(false);
  const [orderBy, setOrderBy] = useState({ column: "Code", asc: true });
  const { accesses } = useSelector((state) => state.auth);
  const currentPage = getCurrentPage();
  const [gridHeader, setGridHeader] = useState([
    {
      title: "Issuer Name",
      type: "text",
      filter: true,
    },
    {
      title: "Full Address",
      type: "text",
      filter: false,
    },
    {
      title: "Email",
      type: "text",
      filter: false,
    },
    {
      title: "Phone Number",
      type: "text",
      filter: false,
    },
    {
      title: "Bank Name",
      type: "text",
      filter: true,
    },
  ]);


  const [successfullyUpdated, setSuccessfullyUpdated] = useState(true);

  const [gridData, setGridData] = useState();

  function handleFilters({ title = "", value = "" }) {
    if (value || (title === "Active" && value !== "")) {
      setActiveFilters([
        ...activeFilters.filter((el) => el.title != title),
        { title, value },
      ]);
    } else {
      setActiveFilters([...activeFilters.filter((el) => el.title != title)]);
    }
  }

  useEffect(() => {
    async function getBankAccounts() {
      const { data } = await api.get("/issuers");
      const gridDataValues = data.map(
        ({
          id,
          name,
          address,
          city,
          state,
          zip,
          country,
          email,
          phone_number,
          bank_name,
        }) => {
          return {
            show: true,
            id,
            fields: [
              name,
              `${address}, ${city}, ${state}, ${zip}, ${country} `,
              email,
              phone_number,
              bank_name,
            ],
          };
        }
      );
      setGridData(gridDataValues);
    }
    getBankAccounts();
  }, [opened]);

  function handleOpened(id) {
    if (!id) {
      setSuccessfullyUpdated(true);
    }

    console.log("handle opened", id);
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
        handleFilters={handleFilters}
        gridHeader={gridHeader}
        gridData={gridData}
        setGridHeader={setGridHeader}
        activeFilters={activeFilters}
      />

      <Grid
        gridData={gridData}
        gridHeader={gridHeader}
        orderBy={orderBy}
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
