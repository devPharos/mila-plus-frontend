import React from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

function App() {

  return <>
    <Outlet />
    <ToastContainer autoClose={2500} />
  </>;
}

export default App;
