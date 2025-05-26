import React, { createContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AlertBoxContainer from "./components/AlertBox/AlertBoxContainer";

export const AlertContext = createContext();

export const PageContext = createContext();

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
      name: "Operational",
      children: [
        {
          alias: "operational-dashboard",
          path: "/Operational/Dashboard",
          title: "Dashboard",
          icon: "LayoutDashboard",
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
      <PageContext.Provider value={{ pages }}>
        <Outlet />
        <ToastContainer autoClose={2500} />
        <AlertBoxContainer />
      </PageContext.Provider>
    </AlertContext.Provider>
  );
}

export default App;
