import React from "react";
import { useSelector } from "react-redux";

import Breadcrumbs from "~/components/Breadcrumbs";
import ChartFinancialOutstanding from "~/components/Charts/FinancialOutstanding";
import FiltersBar from "~/components/FiltersBar";
import PageHeader from "~/components/PageHeader";
import useReportsStore from "~/store/reportsStore";
import ChartDefaultRate from "./Reports/chartDelinquecy";
import DefaultRateFilter from "./Reports/filters/defaultFilter";
import { getCurrentPage } from "~/functions";

export default function FinancialDashboard() {
  const { profile } = useSelector((state) => state.auth);
  const { filters } = useReportsStore();
  const currentPage = getCurrentPage();
  const isAdmin = profile.id === 1;

  return (
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4 overflow-hidden">
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
        <FiltersBar></FiltersBar>
      </PageHeader>

      <div className="flex-1 w-full flex flex-col pt-6 overflow-x-auto overflow-y-auto">
        {isAdmin && (
          <div className="min-w-[1200px] w-full">
            <ChartFinancialOutstanding />

            <div className="w-full pt-6">
              <DefaultRateFilter />
            </div>

            <div className="pb-6">
              <ChartDefaultRate filters={filters} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}