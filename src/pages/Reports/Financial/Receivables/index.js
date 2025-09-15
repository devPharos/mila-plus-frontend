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
import useReportsStore, { periodByOptions } from "~/store/reportsStore";
import { format } from "date-fns";
import { toast } from "react-toastify";

export function ReportFinancialInbounds() {
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

export default function ReportFinancialReceivables() {
  const { profile } = useSelector((state) => state.user);
  const currentPage = getCurrentPage();
  const { filters, setFilters, chartOfAccountSelected } = useReportsStore();
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    api
      .get(
        `/reports/receivables?period_from=${format(
          filters.period.from,
          "yyyy-MM-dd"
        )}&period_to=${format(filters.period.to, "yyyy-MM-dd")}&period_by=${
          filters.period_by.value
        }`
      )
      .then(({ data }) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        toast(err.response.data.error, { type: "error", autoClose: 3000 });
        setLoading(false);
      });
  }
  useEffect(() => {
    if (chartOfAccountSelected) {
      setTimeout(() => {
        // smooth scroll to 500
        document.getElementById("reportPage").scrollTo(0, 500);
      }, 300);
    }
  }, [chartOfAccountSelected]);

  useEffect(() => {
    loadData();
  }, [filters]);

  return (
    <div
      id="reportPage"
      className="scroll-smooth h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4 overflow-y-scroll"
    >
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
        <FiltersBar></FiltersBar>
      </PageHeader>

      <div className="w-full flex flex-row justify-start items-start gap-4">
        <div className="flex flex-col h-full px-2 min-w-44 w-44 items-center justify-start text-xs gap-4 bg-gray-100">
          <div className="text-sm p-2 py-4">
            <strong>Receivable Reports</strong>
          </div>
          {["Received", "Outstanding", "Renegotiated", "Custom"].map(
            (report, index) => (
              <button
                key={index}
                onClick={() => setFilters({ ...filters, report })}
                className={`text-sm w-full p-2 ${
                  filters.report === report && "bg-zinc-200"
                } rounded hover:bg-zinc-300`}
              >
                {report}
              </button>
            )
          )}
        </div>
        <div className="flex flex-col w-full max-w-[68rem] flex-1 items-center justify-center text-xs">
          <div className="flex w-full flex-row justify-start items-start rounded-tr-2xl p-2 gap-4">
            {profile.id === 1 && (
              <>
                <PeriodFilter />
                {filters.report === "Custom" && <PeriodByFilter />}
              </>
            )}
          </div>

          <div className="flex w-full flex-1 flex-col justify-start items-start">
            <ChartReceivables data={data} />
            <GridReceivables data={data} setData={setData} />
          </div>

          {loading && (
            <div className="flex justify-center items-center h-screen absolute top-0 left-0 w-full bg-gray-500 bg-opacity-50 z-10">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-700" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
