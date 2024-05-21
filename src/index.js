import React from 'react';
import { createRoot } from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
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
import { ToastContainer } from 'react-toastify';
import ComercialDashboard from './pages/Commercial/Dashboard';
import AdministrativeDashboard from './pages/Administrative/Dashboard';
import Login from './pages/Login';
import Commercial from './pages/Commercial';
import Administrative from './pages/Administrative';
import CommercialDocuments from './pages/Commercial/Documents/Students';
import CommercialStudents from './pages/Commercial/Students/Students';
import AcademicDashboard from './pages/Academic/Dashboard';
import Academic from './pages/Academic';
import Operational from './pages/Operational';
import OperationalDashboard from './pages/Operational/Dashboard';
import Financial from './pages/Financial';
import FinancialDashboard from './pages/Financial/Dashboard';
import Holding from './pages/Holding';
import HoldingDashboard from './pages/Holding/Dashboard';
import HoldingFilials from './pages/Holding/Filials';

import 'react-toastify/dist/ReactToastify.css';
import HoldingGroups from './pages/Holding/Groups';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: 
    <main style={{ flex: 1,flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
      <UnprotectedRoute>Error 404 <a href="/">home</a></UnprotectedRoute>
    </main>,
    children: [
      {
        path: "/login",
        element: <UnprotectedRoute>
          <Login />
        </UnprotectedRoute>,
      },
      {
        path: "/",
        element: <Navigate to="/login" />,
      },
      {
        path: "/Holding",
        element: <ProtectedRoute><Holding /></ProtectedRoute>,
        children: [
          {
            path: "/Holding/Dashboard",
            element: <HoldingDashboard />
          },
          {
            path: "/Holding/Filials",
            element: <HoldingFilials />
          },
          {
            path: "/Holding/Groups",
            element: <HoldingGroups />
          },
        ]
      },
      {
        path: "/commercial",
        element: <ProtectedRoute><Commercial /></ProtectedRoute>,
        children: [
          {
            path: "/commercial/dashboard",
            element: <ComercialDashboard />
          },
          {
            path: "/commercial/students",
            element: <CommercialStudents />
          },
          {
            path: "/commercial/documents",
            element: <CommercialDocuments />
          }
        ]
      },
      {
        path: "/administrative",
        element: <ProtectedRoute><Administrative /></ProtectedRoute>,
        children: [
          {
            path: "/administrative/dashboard",
            element: <AdministrativeDashboard />
          }
        ]
      },
      {
        path: "/Academic",
        element: <ProtectedRoute><Academic /></ProtectedRoute>,
        children: [
          {
            path: "/Academic/dashboard",
            element: <AcademicDashboard />
          }
        ]
      },
      {
        path: "/Operational",
        element: <ProtectedRoute><Operational /></ProtectedRoute>,
        children: [
          {
            path: "/Operational/dashboard",
            element: <OperationalDashboard />
          }
        ]
      },
      {
        path: "/Financial",
        element: <ProtectedRoute><Financial /></ProtectedRoute>,
        children: [
          {
            path: "/Financial/dashboard",
            element: <FinancialDashboard />
          }
        ]
      },
      {
        path: "/401",
        element: <UnprotectedRoute>
            <div>401</div>
        </UnprotectedRoute>,
      },
      {
        path: "/*",
        element: <ProtectedRoute>
            <div>404</div>
        </ProtectedRoute>,
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