import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { PageContext } from "~/App";
import { getCurrentPage } from "~/functions";
import PageHeader from "~/components/PageHeader";
import Breadcrumbs from "~/components/Breadcrumbs";
import FiltersBar from "~/components/FiltersBar";
import PeriodFilter from "../../components/filters/periodFilter";
import PeriodByFilter from "../../components/filters/periodByFilter";
import ChartReceivables from "../../components/charts/chartReceivables";
import GridReceivables from "../../components/grids/gridReceivables";
import api from "~/services/api";
import useReportsStore from "~/store/reportsStore";
import { format } from "date-fns";

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
  const { filters } = useReportsStore();

  // const [data, setData] = useState([
  //   {
  //     name: "Operational Revenue",
  //     total: 18000,
  //     opened: false,
  //     periods: [
  //       {
  //         name: "Jan/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Feb/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Mar/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Apr/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "May/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Jun/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Jul/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Aug/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Sep/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //     ],
  //     chartOfAccounts: [
  //       {
  //         name: "Enrollment",
  //         value: 200,
  //         periods: [
  //           {
  //             name: "Jan/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "Feb/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "Mar/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "Apr/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "May/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "Jun/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "Jul/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "Aug/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "Sep/2025",
  //             total: 2000,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Tuition",
  //         value: 200,
  //         periods: [
  //           {
  //             name: "Jan/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "Feb/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "Mar/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "Apr/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "May/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "Jun/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "Jul/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "Aug/2025",
  //             total: 2000,
  //           },
  //           {
  //             name: "Sep/2025",
  //             total: 2000,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     name: "Non-operational Revenue",
  //     total: 1200,
  //     periods: [
  //       {
  //         name: "Jan/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Feb/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Mar/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Apr/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "May/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Jun/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Jul/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Aug/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Sep/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     name: "Other Cash Inflows",
  //     total: 2400,
  //     periods: [
  //       {
  //         name: "Jan/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Feb/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Mar/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Apr/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "May/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Jun/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Jul/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Aug/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Sep/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     name: "Fee",
  //     total: 4000,
  //     periods: [
  //       {
  //         name: "Jan/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Feb/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Mar/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Apr/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "May/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Jun/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Jul/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Aug/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Sep/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     name: "Mailing Fee",
  //     total: 125,
  //     periods: [
  //       {
  //         name: "Jan/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Feb/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Mar/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Apr/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "May/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Jun/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Jul/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Aug/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Sep/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     name: "Registration Fee",
  //     total: 32000,
  //     periods: [
  //       {
  //         name: "Jan/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Feb/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Mar/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Apr/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "May/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Jun/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Jul/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Aug/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Sep/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     name: "Tuition Fee",
  //     total: 120000,
  //     periods: [
  //       {
  //         name: "Jan/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Feb/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Mar/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Apr/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "May/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Jun/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Jul/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Aug/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Sep/2025",
  //         total: 2000,
  //         chartOfAccounts: [
  //           {
  //             name: "Enrollment",
  //             value: 200,
  //           },
  //           {
  //             name: "Tuition",
  //             value: 300,
  //           },
  //           {
  //             name: "Extra Classes & Services",
  //             value: 250,
  //           },
  //           {
  //             name: "Book & Learning Materials",
  //             value: 125,
  //           },
  //           {
  //             name: "Product Sales",
  //             value: 125,
  //           },
  //           {
  //             name: "Facility Revenue",
  //             value: 400,
  //           },
  //           {
  //             name: "Penalty & Late Fees",
  //             value: 600,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // ]);

  const [data, setData] = useState(null);

  function loadData() {
    api
      .get(
        `/reports/receivables?period_from=${format(
          filters.period.from,
          "yyyy-MM-dd"
        )}&period_to=${format(filters.period.to, "yyyy-MM-dd")}&period_by=${
          filters.period_by.value
        }`
      )
      .then(({ data }) => setData(data));
  }

  useEffect(() => {
    loadData();
  }, [filters]);

  return (
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4 overflow-y-scroll">
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
        <FiltersBar></FiltersBar>
      </PageHeader>

      <div className="flex flex-row justify-start items-start rounded-tr-2xl p-4 gap-4">
        {profile.id === 1 && (
          <>
            <PeriodFilter />
            <PeriodByFilter />
          </>
        )}
      </div>

      <div className="flex w-full flex-1 flex-col justify-start items-start">
        <ChartReceivables data={data} />
        <GridReceivables data={data} setData={setData} />
      </div>
    </div>
  );
}
