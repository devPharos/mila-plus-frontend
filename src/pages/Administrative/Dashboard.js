import { Filter } from "lucide-react";
import React from "react";
import Breadcrumbs from "~/components/Breadcrumbs";
import FiltersBar from "~/components/FiltersBar";
import PageHeader from "~/components/PageHeader";

import { getCurrentPage } from "~/functions";
import AbsenceControl from "./Reports/AbsenceControl";
import { useSelector } from "react-redux";
import ClassSchedule from "./Reports/ClassSchedule";

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

      <div className="flex flex-1 flex-row gap-4 p-4 justify-start items-start rounded-tr-2xl">
        {profile.id === 1 && (
          <>
            <AbsenceControl />
            <ClassSchedule />
          </>
        )}
      </div>
    </div>
  );
}
