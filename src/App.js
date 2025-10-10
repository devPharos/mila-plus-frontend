import React, { createContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AlertBoxContainer from "./components/AlertBox/AlertBoxContainer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const AlertContext = createContext();

export const PageContext = createContext();

const queryClient = new QueryClient();

function App() {
  const [alertData, setAlertData] = useState({ open: false, title: false });
  function alertBox(content) {
    setAlertData({ open: true, ...content });
  }
  const pages = [
    {
      name: "Academic",
      children: [
        {
          alias: "calendar",
          path: "/Academic/Calendar",
          title: "Calendar",
          icon: "CalendarDays",
        },
      ],
    },
    {
      name: "Administrative",
      children: [
        {
          alias: "administrative-dashboard",
          path: "/Administrative/Dashboard",
          title: "Dashboard",
          icon: "LayoutDashboard",
        },
        {
          alias: "calendar",
          path: "/Administrative/Calendar",
          title: "Calendar",
          icon: "CalendarDays",
        },
        {
          alias: "students",
          path: "/Administrative/Students",
          title: "Students",
          icon: "GraduationCap",
        },
        {
          alias: "messages",
          path: "/Administrative/Messages",
          title: "Messages",
          icon: "MessageSquareShare",
        },
        {
          alias: "staffs",
          path: "/Administrative/Staffs",
          title: "Staff",
          icon: "Users",
        },
        {
          alias: "classrooms",
          path: "/Administrative/Classrooms",
          title: "Classrooms",
          icon: "Armchair",
        },
        {
          alias: "studentgroups",
          path: "/Administrative/StudentGroups",
          title: "Student Groups",
          icon: "GraduationCap",
        },
        {
          alias: "rotation",
          path: "/Administrative/RotationFaseOne",
          title: "Rotation 1st Step",
          icon: "Rotate3d",
        },
        {
          alias: "rotation",
          path: "/Administrative/RotationFaseTwo",
          title: "Rotation 2st Step",
          icon: "Rotate3d",
        },
        {
          alias: "administrative-reports",
          path: "/Administrative/Reports",
          title: "Reports",
          icon: "ChartLine",
        },
      ],
    },
    {
      name: "Commercial",
      children: [
        {
          alias: "commercial-dashboard",
          path: "/Commercial/Dashboard",
          title: "Dashboard",
          icon: "LayoutDashboard",
        },
        {
          alias: "prospects",
          path: "/Commercial/Prospects",
          title: "Prospects",
          icon: "Users",
        },
        {
          alias: "enrollments",
          path: "/Commercial/Enrollments",
          title: "Enrollments",
          icon: "History",
        },
        {
          alias: "agents",
          path: "/Commercial/Agents",
          title: "Agents",
          icon: "CircleUserRound",
        },
        {
          alias: "partners-and-influencers",
          path: "/Commercial/PartnersAndInfluencers",
          title: "Partners & influencers",
          icon: "Handshake",
        },
        {
          alias: "campaign",
          path: "/Commercial/Campaign",
          title: "Campaign",
          icon: "Megaphone",
        },
      ],
    },
    {
      name: "Financial",
      children: [
        {
          alias: "financial-dashboard",
          path: "/Financial/Dashboard",
          title: "Dashboard",
          icon: "LayoutDashboard",
        },
        {
          alias: "financial-bank",
          path: "/Financial/Bank",
          title: "Bank",
          icon: "Landmark",
        },
        {
          alias: "financial-bank-account",
          path: "/Financial/BankAccount",
          title: "Bank Accounts",
          icon: "CreditCard",
        },
        {
          alias: "financial-payment-criteria",
          path: "/Financial/PaymentCriteria",
          title: "Payment Criteria",
          icon: "HandCoins",
        },
        {
          alias: "financial-payment-method",
          path: "/Financial/PaymentMethod",
          title: "Payment Methods",
          icon: "WalletCards",
        },
        {
          alias: "financial-merchants",
          path: "/Financial/Merchants",
          title: "Merchants",
          icon: "Store",
        },
        {
          alias: "cost-centers",
          path: "/Financial/CostCenters",
          title: "Cost Centers",
          icon: "ChartGantt",
        },
        {
          alias: "chart-of-accounts",
          path: "/Financial/ChartOfAccounts",
          title: "Chart of Accounts",
          icon: "ChartGantt",
        },
        {
          alias: "financial-issuer",
          path: "/Financial/Issuer",
          title: "Issuer",
          icon: "SatelliteDish",
        },
        {
          alias: "financial-receivables",
          path: "/Financial/Receivables",
          title: "Receivables",
          icon: "HandCoins",
          children: [
            {
              alias: "financial-receivables",
              path: "/Financial/Receivables/Receivables",
              title: "Receivables",
              icon: "HandCoins",
            },
            {
              alias: "financial-recurrence",
              path: "/Financial/Receivables/Recurrence",
              title: "Recurrence",
              icon: "CalendarSync",
            },
            {
              alias: "financial-settlement",
              path: "/Financial/Receivables/Settlement",
              title: "Settlement",
              icon: "ReplaceAll",
            },
          ],
        },
        {
          alias: "financial-payees",
          path: "/Financial/Payees",
          title: "Payees",
          icon: "BadgeDollarSign",
          children: [
            {
              alias: "financial-payees",
              path: "/Financial/Payees/Payees",
              title: "Payees",
              icon: "BadgeDollarSign",
            },
            {
              alias: "payees-recurrence",
              path: "/Financial/Payees/Recurrence",
              title: "Recurrence",
              icon: "CalendarSync",
            },
            {
              alias: "payees-settlement",
              path: "/Financial/Payees/Settlement",
              title: "Settlement",
              icon: "ReplaceAll",
            },
          ],
        },
      ],
    },
    {
      name: "DSO",
      children: [
        {
          alias: "dso-dashboard",
          path: "/DSO/Dashboard",
          title: "Dashboard",
          icon: "LayoutDashboard",
        },
        {
          alias: "i20-pendings",
          path: "/DSO/I-20 Pendings",
          title: "I-20 Pendings",
          icon: "ListTodo",
        },
      ],
    },
    {
      name: "Settings",
      children: [
        {
          alias: "parameters",
          path: "/Settings/Parameters",
          title: "Parameters",
          icon: "SlidersHorizontal",
        },
        {
          alias: "filials",
          path: "/Settings/Branches",
          title: "Branches",
          icon: "Building",
        },
        {
          alias: "filial-types",
          path: "/Settings/BranchesTypes",
          title: "Branches Types",
          icon: "Building2",
        },
        {
          alias: "groups",
          path: "/Settings/Groups",
          title: "User Groups",
          icon: "Users",
        },
        {
          alias: "users",
          path: "/Settings/Users",
          title: "Users",
          icon: "User",
        },
        {
          alias: "languages",
          path: "/Settings/Languages",
          title: "Languages",
          icon: "Languages",
        },
        {
          alias: "program-categories",
          path: "/Settings/ProgramCategory",
          title: "Program Categories",
          icon: "BookMarked",
        },
        {
          alias: "levels",
          path: "/Settings/Levels",
          title: "Levels",
          icon: "School",
        },
        {
          alias: "language-modes",
          path: "/Settings/LanguageModes",
          title: "Language Modes",
          icon: "BookType",
        },
        {
          alias: "workloads",
          path: "/Settings/Workloads",
          title: "Workloads",
          icon: "CalendarClock",
        },
        {
          alias: "documents",
          path: "/Settings/Documents",
          title: "Documents",
          icon: "Files",
        },
        {
          alias: "processtypes",
          path: "/Settings/ProcessTypes",
          title: "Process Types",
          icon: "BookType",
        },
        {
          alias: "processsubstatuses",
          path: "/Settings/ProcessSubstatuses",
          title: "Process Substatuses",
          icon: "BookType",
        },
        {
          alias: "dataSync",
          path: "/Settings/DataSync",
          title: "Data Sync",
          icon: "FolderSync",
        },
      ],
    },
    {
      name: "Reports",
      children: [
        {
          alias: "report-dashboard",
          path: "/Reports/Dashboard",
          title: "Financial",
          icon: "BadgeDollarSign",
        },
        {
          alias: "report-financial",
          path: "/Reports/Financial",
          title: "Financial",
          icon: "BadgeDollarSign",
          children: [
            {
              alias: "report-financial-receivables",
              path: "/Reports/Financial/Receivables",
              title: "Receivables",
              icon: "BadgeDollarSign",
            },
            {
              alias: "report-financial-delinquency",
              path: "/Reports/Financial/Delinquency",
              title: "Delinquency",
              icon: "TrendingDown",
            },
          ],
        },
      ],
    },
    {
      name: "FillForm",
      children: [
        {
          alias: "staffs",
          path: "/fill-form/Staff",
          title: "Staff",
          icon: "Users",
        },
      ],
    },
    {
      name: "Auth",
      children: [
        {
          alias: "reset-password",
          path: "/Auth/ResetPassword",
          title: "Reset Password",
          icon: "Mail",
        },
      ],
    },
  ];
  return (
    <AlertContext.Provider value={{ alertData, setAlertData, alertBox }}>
      <QueryClientProvider client={queryClient}>
        <PageContext.Provider value={{ pages }}>
          <Outlet />
          <ToastContainer autoClose={2500} />
          <AlertBoxContainer />
        </PageContext.Provider>
      </QueryClientProvider>
    </AlertContext.Provider>
  );
}

export default App;
