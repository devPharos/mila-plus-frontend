import React, { createContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AlertBoxContainer from "./components/AlertBox/AlertBoxContainer";

export const AlertContext = createContext()

function App() {
  const [alertData, setAlertData] = useState({ open: false, title: false })
  function alertBox(content) {
    setAlertData({ open: true, ...content })
  }
  return (
    <AlertContext.Provider value={{ alertData, setAlertData, alertBox }}>
      <Outlet />
      <ToastContainer autoClose={2500} />
      <AlertBoxContainer />
    </AlertContext.Provider>
  );
}

export default App;
