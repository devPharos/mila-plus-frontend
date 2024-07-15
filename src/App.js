import React, { createContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AlertBoxContainer from "./components/AlertBox/AlertBoxContainer";

export const AlertContext = createContext()

export const PageContext = createContext()

function App() {
  const [alertData, setAlertData] = useState({ open: false, title: false })
  function alertBox(content) {
    setAlertData({ open: true, ...content })
  }
  const pages =
    [
      {
        name: 'Academic',
        children: [
          {
            alias: 'academic-dashboard',
            path: '/Academic/Dashboard',
            title: 'Dashboard',
            icon: 'LayoutDashboard',
          },
          {
            alias: 'languages',
            path: '/Academic/Languages',
            title: 'Languages',
            icon: 'Languages'
          },
          {
            alias: 'program-categories',
            path: '/Academic/ProgramCategory',
            title: 'Program Categories',
            icon: 'BookMarked'
          },
          {
            alias: 'levels',
            path: '/Academic/Levels',
            title: 'Levels',
            icon: 'School'
          },
          {
            alias: 'language-modes',
            path: '/Academic/LanguageModes',
            title: 'Language Modes',
            icon: 'BookType'
          },
          {
            alias: 'workloads',
            path: '/Academic/Workloads',
            title: 'Workloads',
            icon: 'CalendarClock'
          },
        ],
      },
      {
        name: 'Administrative',
        children: [
          {
            alias: 'administrative-dashboard',
            path: '/Administrative/Dashboard',
            title: 'Dashboard',
            icon: 'LayoutDashboard',
          },
          {
            alias: 'filial-types',
            path: '/Administrative/FilialTypes',
            title: 'Filial Types',
            icon: 'Building2'
          },
          {
            alias: 'filials',
            path: '/Administrative/Filials',
            title: 'Filials',
            icon: 'Building'
          },
          {
            alias: 'parameters',
            path: '/Administrative/Parameters',
            title: 'Parameters',
            icon: 'SlidersHorizontal'
          },
          {
            alias: 'chart-of-accounts',
            path: '/Administrative/ChartOfAccounts',
            title: 'Chart of Accounts',
            icon: 'GanttChart'
          },
          {
            alias: 'groups',
            path: '/Administrative/Groups',
            title: 'Groups',
            icon: 'Users'
          },
          {
            alias: 'users',
            path: '/Administrative/Users',
            title: 'Users',
            icon: 'User'
          }
        ]
      }
    ]
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
