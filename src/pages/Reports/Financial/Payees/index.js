import React, { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { PageContext } from "~/App";
import { getCurrentPage } from "~/functions";
import PageHeader from "~/components/PageHeader";
import Breadcrumbs from "~/components/Breadcrumbs";
import FiltersBar from "~/components/FiltersBar";
import ChartFinancialOutstanding from "~/components/Charts/FinancialOutstanding";
import { ChevronDown } from "lucide-react";
import PeriodFilter from "../../components/periodFilter";

export function ReportFinancialOutbounds() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { pages } = useContext(PageContext);
  const paths = pathname.split("/");
  const redirectRouteName = pages
    .find((page) => page.name === paths[1])
    .children.find((page) => page.path === `/${paths[1]}/${paths[2]}`)
    .children[0].path;
  useEffect(() => {
    if (pathname.toUpperCase() === `/${paths[1]}/${paths[2]}`.toUpperCase()) {
      navigate(`${redirectRouteName}`);
    }
  }, [pathname]);
  return <Outlet />;
}

export default function ReportFinancialPayees() {
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
            <PeriodFilter defaultValue="This month" />
          </>
        )}
      </div>
    </div>
  );
}
