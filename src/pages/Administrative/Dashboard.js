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
import { format, lastDayOfMonth } from "date-fns";

export default function AdministrativeDashboard() {
  const { profile } = useSelector((state) => state.user);
  const currentPage = getCurrentPage();

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
        {profile.id === 1 && (
          <>
            <AbsenceControl />
          </>
        )}
      </div>
    </div>
  );
}
