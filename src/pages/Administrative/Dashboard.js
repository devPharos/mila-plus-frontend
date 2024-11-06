import { Filter } from "lucide-react";
import React, { useState } from "react";
import Breadcrumbs from "~/components/Breadcrumbs";
import Filters from "~/components/Filters";
import FiltersBar from "~/components/FiltersBar";
import Grid from "~/components/Grid";
import PageHeader from "~/components/PageHeader";
// import 'rsuite/Calendar/styles/index.css';
// import Calendar from 'rsuite/Calendar';

import { saveAs } from "file-saver";

import { getCurrentPage } from "~/functions";
import api from "~/services/api";

export default function AdministrativeDashboard() {
  const [activeFilters, setActiveFilters] = useState([]);
  const [orderBy, setOrderBy] = useState({
    column: "Scheduled Date",
    asc: true,
  });
  const currentPage = getCurrentPage();
  const [gridHeader, setGridHeader] = useState(null);

  const [gridData, setGridData] = useState([]);

  function handleFilters({ title = "", value = "" }) {
    if (value || typeof value === "boolean") {
      setActiveFilters([
        ...activeFilters.filter((el) => el.title != title),
        { title, value },
      ]);
    } else {
      setActiveFilters([...activeFilters.filter((el) => el.title != title)]);
    }
  }

  function handlePDF() {
    api
      // .get("/pdf/affidavit-support/bc59904a-686e-4b05-b69f-64960af78565", {
      // .get("/pdf/transfer-eligibility/137a1ee0-3d8c-4122-b1bf-f41e9bf7def9", {
      .get("/pdf/enrollment/ab21c173-f60c-4cc0-ad22-b3fb61857bcb", {
        responseType: "blob",
      })
      .then((res) => {
        const pdfBlob = new Blob([res.data], { type: "application/pdf" });
        saveAs(
          pdfBlob,
          `enrollment_${"ab21c173-f60c-4cc0-ad22-b3fb61857bcb"}.pdf`
        );
      });
  }

  return (
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4">
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
        <FiltersBar>
          <Filter size={14} /> Custom Filters
        </FiltersBar>
      </PageHeader>
      <Filters
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
      />

      <div
        style={{
          flex: 1,
          width: "50%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "start",
          paddingTop: 24,
        }}
      >
        <button type="button" onClick={handlePDF}>
          PDF
        </button>
      </div>
    </div>
  );
}
