import { Filter } from "lucide-react";
import React, { useState } from "react";
import Breadcrumbs from "~/components/Breadcrumbs";
import FiltersBar from "~/components/FiltersBar";
import PageHeader from "~/components/PageHeader";
import { getCurrentPage } from "~/functions";
import AbsenceControl from "./Reports/AbsenceControl";
import ClassSchedule from "./Reports/ClassSchedule";
import EvaluationChart from "./Reports/EvaluationChart";
import EnrollmentBarChart from "./Reports/EnrollmentBarChart";
import PeriodDropdown from "./Reports/PeriodDropdown";
import MapCount from "./Reports/MapCount";
import { useSelector } from "react-redux";

export default function AdministrativeDashboard() {
  const currentPage = getCurrentPage();
  const { profile } = useSelector((state) => state.auth);
  const isAdmin = profile.id === 1;

  const [periodChoice, setPeriodChoice] = useState("2025");
  const year = periodChoice === "2024" ? 2024 : undefined;

  return (
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4 overflow-y-scroll">
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
        <FiltersBar>
          <Filter size={14} /> Custom Filters
        </FiltersBar>
      </PageHeader>

      {isAdmin && (
        <>
          <PeriodDropdown value={periodChoice} onChange={setPeriodChoice} />
          <EnrollmentBarChart year={year} />
          <MapCount></MapCount>
        </>
      )}

      <div className="flex flex-1 flex-row gap-4 p-4 justify-start items-start rounded-tr-2xl">
        <AbsenceControl />
        <ClassSchedule />
        <EvaluationChart />
      </div>
    </div>
  );
}
