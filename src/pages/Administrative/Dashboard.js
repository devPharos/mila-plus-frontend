import { Filter } from "lucide-react";
import React from "react";
import Breadcrumbs from "~/components/Breadcrumbs";
import FiltersBar from "~/components/FiltersBar";
import PageHeader from "~/components/PageHeader";

import { getCurrentPage } from "~/functions";
import AbsenceControl from "./Reports/AbsenceControl";
import ClassSchedule from "./Reports/ClassSchedule";
import EvaluationChart from "./Reports/EvaluationChart";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import EnrollmentBarChart from "./Reports/EnrollmentBarChart";
import StudentSummaryCard from "./Reports/StudentSummaryCard";

export default function AdministrativeDashboard() {
  const currentPage = getCurrentPage();

 
  return (
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4">
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
        <FiltersBar>
          <Filter size={14} /> Custom Filters
        </FiltersBar>
      </PageHeader>

    <StudentSummaryCard></StudentSummaryCard>
      <EnrollmentBarChart></EnrollmentBarChart>
      <div className="flex flex-1 flex-row gap-4 p-4 justify-start items-start rounded-tr-2xl">
        <AbsenceControl />
        <ClassSchedule />
        <EvaluationChart />
      </div>
    </div>
  );
}
