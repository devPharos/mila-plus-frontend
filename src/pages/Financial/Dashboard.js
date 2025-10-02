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
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4">
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
        <FiltersBar></FiltersBar>
      </PageHeader>

    

      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "start",
          alignItems: "start",
          paddingTop: 24,
        }}
      >
        {isAdmin && (
          <>
            <ChartFinancialOutstanding />
              {isAdmin && (
        <div className="w-full pt-6">
          <DefaultRateFilter />
        </div>
      )}
            <ChartDefaultRate filters={filters} />
          </>
        )}
      </div>
    </div>
  );
}