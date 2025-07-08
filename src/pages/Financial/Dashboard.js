import React from "react";
import { useSelector } from "react-redux";

import Breadcrumbs from "~/components/Breadcrumbs";
import ChartFinancialOutstanding from "~/components/Charts/FinancialOutstanding";
import FiltersBar from "~/components/FiltersBar";
import PageHeader from "~/components/PageHeader";

import { getCurrentPage } from "~/functions";

export default function FinancialDashboard() {
  const { profile } = useSelector((state) => state.user);
  const currentPage = getCurrentPage();

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
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "start",
          paddingTop: 24,
        }}
      >
        {profile.id === 1 && (
          <>
            <ChartFinancialOutstanding />
          </>
        )}
      </div>
    </div>
  );
}
