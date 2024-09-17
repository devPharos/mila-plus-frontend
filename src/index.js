import React from 'react';
import { createRoot } from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
// import 'rsuite/dist/rsuite-no-reset.min.css';
import "react-datepicker/dist/react-datepicker.css";
import './index.css'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import App from './App';
import { Provider } from 'react-redux';
import { persistor, store } from './store';
import ProtectedRoute from './routes/ProtectedRoute';
import UnprotectedRoute from './routes/UnprotectedRoute';
import LoginRoute from './routes/LoginRoute';
import { ToastContainer } from 'react-toastify';
import Login from './pages/Login';
import AcademicDashboard from './pages/Academic/Dashboard';
import Academic from './pages/Academic';
import Administrative from './pages/Administrative';
import AdministrativeDashboard from './pages/Administrative/Dashboard';
import AdministrativeFilials from './pages/Administrative/Filials';

import 'react-toastify/dist/ReactToastify.css';
import AdministrativeGroups from './pages/Administrative/Groups';
import AdministrativeFilialTypes from './pages/Administrative/FilialTypes';
import AdministrativeParameters from './pages/Administrative/Parameters';
import AdministrativeChartOfAccounts from './pages/Administrative/ChartOfAccounts';
import Languages from './pages/Academic/Languages';
import ProgramCategory from './pages/Academic/Program Category';
import Levels from './pages/Academic/Levels';
import Page404 from './pages/Errors/Page404';
import Errors from './pages/Errors';
import LanguageMode from './pages/Academic/Language Mode';
import Workloads from './pages/Academic/Workloads';
import { injectStore } from './services/api';
import AdministrativeUsers from './pages/Administrative/Users';
import Commercial from './pages/Commercial';
import CommercialDashboard from './pages/Commercial/Dashboard';
import CommercialProspects from './pages/Commercial/Prospects';
import AdministrativeStudent from './pages/Administrative/Student';
import Financial from './pages/Financial';
import Operational from './pages/Operational';
import Settings from './pages/Settings';
import FinancialDashboard from './pages/Financial/Dashboard';
import OperationalDashboard from './pages/Operational/Dashboard';
import SettingsDashboard from './pages/Settings/Dashboard';
import AdministrativeStaffs from './pages/Administrative/Staffs';
import AdministrativeAgents from './pages/Administrative/Agents';
import AdministrativeCalendar from './pages/Administrative/Calendar';
import AcademicCalendar from './pages/Academic/Calendar';
import Documents from './pages/Settings/Documents';
import Outside from './pages/Outside';
import PagePreview from './pages/Administrative/Staffs/Preview';
import PagePreviewOutside from './pages/Administrative/Staffs/Preview/outside';
import Enrollments from './pages/Commercial/Enrollments';
import EnrollmentOutside from './pages/Commercial/Enrollments/Preview/enrollment';
import Error401 from './pages/Errors/Page401';
import ProcessTypes from './pages/Settings/ProcessTypes';
import ProcessSubstatuses from './pages/Settings/ProcessSubstatuses';

injectStore(store)

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement:
      <main style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
        <UnprotectedRoute>Error 404 <a href="/">home</a></UnprotectedRoute>
      </main>,
    children: [
      {
        path: "/login",
        element: <LoginRoute>
          <Login />
        </LoginRoute>,
      },
      {
        path: "/fill-form",
        element: <UnprotectedRoute>
          <Outside />
        </UnprotectedRoute>,
        children: [
          {
            path: "/fill-form/Staff",
            element: <PagePreviewOutside />
          },
          {
            path: "/fill-form/Enrollment",
            element: <EnrollmentOutside />
          },
        ]
      },
      {
        path: "/",
        element: <Navigate to="/login" />,
      },
      {
        path: "/Administrative",
        element: <ProtectedRoute><Administrative /></ProtectedRoute>,
        children: [
          {
            path: "/Administrative/Dashboard",
            element: <AdministrativeDashboard />
          },
          {
            path: "/Administrative/Calendar",
            element: <AdministrativeCalendar />
          },
          {
            path: "/Administrative/Students",
            element: <AdministrativeStudent />
          },
          {
            path: "/Administrative/Staffs",
            element: <AdministrativeStaffs />
          },
          {
            path: "/Administrative/*",
            element: <Page404 />
          },
        ]
      },
      {
        path: "/Academic",
        element: <ProtectedRoute><Academic /></ProtectedRoute>,
        children: [
          {
            path: "/Academic/Dashboard",
            element: <AcademicDashboard />
          },
          {
            path: "/Academic/Calendar",
            element: <AcademicCalendar />
          },
          {
            path: "/Academic/*",
            element: <Page404 />
          },
        ]
      },
      {
        path: "/Commercial",
        element: <ProtectedRoute><Commercial /></ProtectedRoute>,
        children: [
          {
            path: "/Commercial/Dashboard",
            element: <CommercialDashboard />
          },
          {
            path: "/Commercial/Prospects",
            element: <CommercialProspects />
          },
          {
            path: "/Commercial/Enrollments",
            element: <Enrollments />
          },
          {
            path: "/Commercial/Agents",
            element: <AdministrativeAgents />
          },
        ]
      },
      {
        path: "/Financial",
        element: <ProtectedRoute><Financial /></ProtectedRoute>,
        children: [
          {
            path: "/Financial/Dashboard",
            element: <FinancialDashboard />
          },
          {
            path: "/Financial/ChartOfAccounts",
            element: <AdministrativeChartOfAccounts />
          },
        ]
      },
      {
        path: "/Operational",
        element: <ProtectedRoute><Operational /></ProtectedRoute>,
        children: [
          {
            path: "/Operational/Dashboard",
            element: <OperationalDashboard />
          },
        ]
      },
      {
        path: "/Settings",
        element: <ProtectedRoute><Settings /></ProtectedRoute>,
        children: [
          {
            path: "/Settings/Parameters",
            element: <AdministrativeParameters />
          },
          {
            path: "/Settings/Languages",
            element: <Languages />
          },
          {
            path: "/Settings/ProgramCategory",
            element: <ProgramCategory />
          },
          {
            path: "/Settings/Levels",
            element: <Levels />
          },
          {
            path: "/Settings/LanguageModes",
            element: <LanguageMode />
          },
          {
            path: "/Settings/Workloads",
            element: <Workloads />
          },
          {
            path: "/Settings/FilialTypes",
            element: <AdministrativeFilialTypes />
          },
          {
            path: "/Settings/Filials",
            element: <AdministrativeFilials />
          },
          {
            path: "/Settings/Groups",
            element: <AdministrativeGroups />
          },
          {
            path: "/Settings/Users",
            element: <AdministrativeUsers />
          },
          {
            path: "/Settings/Documents",
            element: <Documents />
          },
          {
            path: "/Settings/ProcessTypes",
            element: <ProcessTypes />
          },
          {
            path: "/Settings/ProcessSubstatuses",
            element: <ProcessSubstatuses />
          }
        ]
      },
      {
        path: "/401",
        element: <UnprotectedRoute>
          <Error401 />
        </UnprotectedRoute>,
      },
      {
        path: "/*",
        element: <ProtectedRoute><Errors><Page404 /></Errors></ProtectedRoute>
      },
    ]
  },

]);

const root = createRoot(document.getElementById('root'));
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
