import { Filter } from "lucide-react";
import React from "react";
import Breadcrumbs from "~/components/Breadcrumbs";
import FiltersBar from "~/components/FiltersBar";
import PageHeader from "~/components/PageHeader";

import { getCurrentPage } from "~/functions";
import AbsenceControl from "./AbsenceControl";
import { useSelector } from "react-redux";
import api from "~/services/api";
import { saveAs } from "file-saver";

export default function AdministrativeDashboard() {
  const { profile } = useSelector((state) => state.user);
  const currentPage = getCurrentPage();

  function handleReport() {
    api
      .get(
        `/studentgroups/attendanceReport/1?from_date=2025-05-01&to_date=2025-05-31`,
        {
          responseType: "blob",
        }
      )
      .then(({ data }) => {
        const pdfBlob = new Blob([data], { type: "application/pdf" });
        console.log(data);
        saveAs(
          pdfBlob,
          `affidavit_of_support_${"bc59904a-686e-4b05-b69f-64960af78565"}.pdf`
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

      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "start",
          paddingTop: 24,
        }}
      >
        {profile.id === 1 && <AbsenceControl />}
        <button
          type="button"
          onClick={handleReport}
          className="bg-mila_orange text-white rounded-md p-1 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1"
        >
          <span>Attendance Report</span>
        </button>
      </div>
    </div>
  );
}
