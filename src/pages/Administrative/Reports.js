import { Filter } from "lucide-react";
import React, { useContext } from "react";
import Breadcrumbs from "~/components/Breadcrumbs";
import FiltersBar from "~/components/FiltersBar";
import PageHeader from "~/components/PageHeader";
import { getCurrentPage } from "~/functions";
import AbsenceControl from "./Reports/AbsenceControl";
import ClassSchedule from "./Reports/ClassSchedule";
import EvaluationChart from "./Reports/EvaluationChart";
import FullGridContext from "~/components/FullGridContext";
import { useSelector } from "react-redux";

export default function AdministrativeReports() {
  const currentPage = getCurrentPage();
  const { accesses } = useSelector((state) => state.auth);
  const accessModule = accesses.hierarchy.find(
    (el) => el.alias === "administrative"
  );

  const pageAccess = accessModule.children.find(
    (el) => el.alias === "administrative-reports"
  );

  const hasAccessToAlias = (alias) => {
    return pageAccess.children.find((el) => el.alias === alias)
      ?.MenuHierarchyXGroup?.view;
  };

  return (
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4 overflow-y-scroll">
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
        <FiltersBar>
          <Filter size={14} /> Custom Filters
        </FiltersBar>
      </PageHeader>

      {console.log(
        pageAccess.children.find((el) => el.alias === "absence-control")
          ?.MenuHierarchyXGroup
      )}

      <div className="flex flex-1 flex-row gap-4 p-4 justify-start items-start rounded-tr-2xl">
        {hasAccessToAlias("absence-control") && <AbsenceControl />}
        {hasAccessToAlias("class-schedule") && <ClassSchedule />}
        {hasAccessToAlias("evaluation-chart") && <EvaluationChart />}
      </div>
    </div>
  );
}
