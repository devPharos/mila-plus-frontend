import React from "react";
import { createRoot } from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
// import 'rsuite/dist/rsuite-no-reset.min.css';
import "react-datepicker/dist/react-datepicker.css";
import "./index.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import ProtectedRoute from "./routes/ProtectedRoute";
import UnprotectedRoute from "./routes/UnprotectedRoute";
import LoginRoute from "./routes/LoginRoute";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Login";
import AcademicDashboard from "./pages/Academic/Dashboard";
import Academic from "./pages/Academic";
import Administrative from "./pages/Administrative";
import AdministrativeDashboard from "./pages/Administrative/Dashboard";
import AdministrativeFilials from "./pages/Settings/Filials";

import "react-toastify/dist/ReactToastify.css";
import AdministrativeGroups from "./pages/Settings/Groups";
import AdministrativeFilialTypes from "./pages/Settings/FilialTypes";
import AdministrativeParameters from "./pages/Settings/Parameters";
import AdministrativeChartOfAccounts from "./pages/Financial/ChartOfAccounts";
import Languages from "./pages/Settings/Languages";
import ProgramCategory from "./pages/Settings/Program Category";
import Levels from "./pages/Settings/Levels";
import Page404 from "./pages/Errors/Page404";
import Errors from "./pages/Errors";
import LanguageMode from "./pages/Settings/Language Mode";
import Workloads from "./pages/Settings/Workloads";
import { injectStore } from "./services/api";
import AdministrativeUsers from "./pages/Settings/Users";
import Commercial from "./pages/Commercial";
import CommercialDashboard from "./pages/Commercial/Dashboard";
import CommercialProspects from "./pages/Commercial/Prospects";
import AdministrativeStudent from "./pages/Administrative/Student";
import Financial from "./pages/Financial";
import Operational from "./pages/Operational";
import Settings from "./pages/Settings";
import FinancialDashboard from "./pages/Financial/Dashboard";
import OperationalDashboard from "./pages/Operational/Dashboard";
import AdministrativeStaffs from "./pages/Administrative/Staffs";
import AdministrativeAgents from "./pages/Commercial/Agents";
import AdministrativeCalendar from "./pages/Administrative/Calendar";
import AcademicCalendar from "./pages/Academic/Calendar";
import Documents from "./pages/Settings/Documents";
import Outside from "./pages/Outside";
import PagePreviewOutside from "./pages/Administrative/Staffs/Preview/outside";
import Enrollments from "./pages/Commercial/Enrollments";
import EnrollmentOutside from "./pages/Commercial/Enrollments/Preview/enrollment";
import Error401 from "./pages/Errors/Page401";
import ProcessTypes from "./pages/Settings/ProcessTypes";
import ProcessSubstatuses from "./pages/Settings/ProcessSubstatuses";
import SponsorOutside from "./pages/Commercial/Enrollments/Preview/sponsor";
import TransferOutside from "./pages/Commercial/Enrollments/Preview/transfer-student";
import TransferDSOOutside from "./pages/Commercial/Enrollments/Preview/transfer-dso";
import FinancialBank from "./pages/Financial/Bank";
import FinancialBankAccounts from "./pages/Financial/BankAccount";
import FinancialPaymentMethods from "./pages/Financial/PaymentMethods";
import FinancialPaymentCriteria from "./pages/Financial/PaymentCriterias";
import FinancialMerchants from "./pages/Financial/Merchants";
import FinancialIssuers from "./pages/Financial/Issuer";
import FinancialReceivables from "./pages/Financial/Receivables";
import FinancialPayees from "./pages/Financial/Payees";
import DataSync from "./pages/Settings/Data Sync";
import FinancialRecurrence from "./pages/Financial/Recurrence";

injectStore(store);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: (
      <main
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <UnprotectedRoute>
          Error 404 <a href="/">home</a>
        </UnprotectedRoute>
      </main>
    ),
    children: [
      {
        path: "/login",
        element: (
          <LoginRoute>
            <Login />
          </LoginRoute>
        ),
      },
      {
        path: "/fill-form",
        element: (
          <UnprotectedRoute>
            <Outside />
          </UnprotectedRoute>
        ),
        children: [
          {
            path: "/fill-form/Staff",
            element: <PagePreviewOutside />,
          },
          {
            path: "/fill-form/Enrollment",
            element: <EnrollmentOutside />,
          },
          {
            path: "/fill-form/Sponsor",
            element: <SponsorOutside />,
          },
          {
            path: "/fill-form/Transfer",
            element: <TransferOutside />,
          },
          {
            path: "/fill-form/TransferDSO",
            element: <TransferDSOOutside />,
          },
        ],
      },
      {
        path: "/",
        element: <Navigate to="/login" />,
      },
      {
        path: "/Administrative",
        element: (
          <ProtectedRoute>
            <Administrative />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "/Administrative/Dashboard",
            element: <AdministrativeDashboard />,
          },
          {
            path: "/Administrative/Calendar",
            element: <AdministrativeCalendar />,
          },
          {
            path: "/Administrative/Students",
            element: <AdministrativeStudent />,
          },
          {
            path: "/Administrative/Staffs",
            element: <AdministrativeStaffs />,
          },
          {
            path: "/Administrative/*",
            element: <Page404 />,
          },
        ],
      },
      {
        path: "/Academic",
        element: (
          <ProtectedRoute>
            <Academic />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "/Academic/Dashboard",
            element: <AcademicDashboard />,
          },
          {
            path: "/Academic/Calendar",
            element: <AcademicCalendar />,
          },
          {
            path: "/Academic/*",
            element: <Page404 />,
          },
        ],
      },
      {
        path: "/Commercial",
        element: (
          <ProtectedRoute>
            <Commercial />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "/Commercial/Dashboard",
            element: <CommercialDashboard />,
          },
          {
            path: "/Commercial/Prospects",
            element: <CommercialProspects />,
          },
          {
            path: "/Commercial/Enrollments",
            element: <Enrollments />,
          },
          {
            path: "/Commercial/Agents",
            element: <AdministrativeAgents />,
          },
        ],
      },
      {
        path: "/Financial",
        element: (
          <ProtectedRoute>
            <Financial />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "/Financial/Dashboard",
            element: <FinancialDashboard />,
          },
          {
            path: "/Financial/Bank",
            element: <FinancialBank />,
          },
          {
            path: "/Financial/BankAccount",
            element: <FinancialBankAccounts />,
          },
          {
            path: "/Financial/PaymentCriteria",
            element: <FinancialPaymentCriteria />,
          },
          {
            path: "/Financial/PaymentMethod",
            element: <FinancialPaymentMethods />,
          },
          {
            path: "/Financial/Merchants",
            element: <FinancialMerchants />,
          },
          {
            path: "/Financial/ChartOfAccounts",
            element: <AdministrativeChartOfAccounts />,
          },
          {
            path: "/Financial/Issuer",
            element: <FinancialIssuers />,
          },
          {
            path: "/Financial/Recurrence",
            element: <FinancialRecurrence />,
          },
          {
            path: "/Financial/Receivables",
            element: <FinancialReceivables />,
          },
          {
            path: "/Financial/Payees",
            element: <FinancialPayees />,
          },
        ],
      },
      {
        path: "/Operational",
        element: (
          <ProtectedRoute>
            <Operational />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "/Operational/Dashboard",
            element: <OperationalDashboard />,
          },
        ],
      },
      {
        path: "/Settings",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "/Settings/Parameters",
            element: <AdministrativeParameters />,
          },
          {
            path: "/Settings/Languages",
            element: <Languages />,
          },
          {
            path: "/Settings/ProgramCategory",
            element: <ProgramCategory />,
          },
          {
            path: "/Settings/Levels",
            element: <Levels />,
          },
          {
            path: "/Settings/LanguageModes",
            element: <LanguageMode />,
          },
          {
            path: "/Settings/Workloads",
            element: <Workloads />,
          },
          {
            path: "/Settings/BranchesTypes",
            element: <AdministrativeFilialTypes />,
          },
          {
            path: "/Settings/Branches",
            element: <AdministrativeFilials />,
          },
          {
            path: "/Settings/Groups",
            element: <AdministrativeGroups />,
          },
          {
            path: "/Settings/Users",
            element: <AdministrativeUsers />,
          },
          {
            path: "/Settings/Documents",
            element: <Documents />,
          },
          {
            path: "/Settings/ProcessTypes",
            element: <ProcessTypes />,
          },
          {
            path: "/Settings/ProcessSubstatuses",
            element: <ProcessSubstatuses />,
          },
          {
            path: "/Settings/DataSync",
            element: <DataSync />,
          },
        ],
      },
      {
        path: "/401",
        element: (
          <UnprotectedRoute>
            <Error401 />
          </UnprotectedRoute>
        ),
      },
      {
        path: "/404",
        element: (
          <UnprotectedRoute>
            <Page404 />
          </UnprotectedRoute>
        ),
      },
      {
        path: "/*",
        element: (
          <UnprotectedRoute>
            <Errors>
              <Page404 />
            </Errors>
          </UnprotectedRoute>
        ),
      },
    ],
  },
]);

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
      <ToastContainer autoClose={2500} />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
