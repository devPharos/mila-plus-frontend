import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { hasAccessTo } from "~/functions";
import { logout } from "~/store/modules/auth/actions";

// import { Container } from './styles';

function LoginRoute({ children }) {
  const { signed, accesses } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const { pathname } = useLocation();
  const paths = pathname.substring(1).split("/")[0];
  if (paths === "401") {
    dispatch(logout());
    return <Navigate to="/login" />;
  }

  if (signed && accesses) {
    // user is authenticated
    let module_page = "";
    if (hasAccessTo(accesses, null, "administrative").view) {
      module_page = "Administrative";
    } else if (hasAccessTo(accesses, null, "academic").view) {
      module_page = "Academic";
    } else if (hasAccessTo(accesses, null, "operational").view) {
      module_page = "Operational";
    } else if (hasAccessTo(accesses, null, "commercial").view) {
      module_page = "Commercial";
    } else if (hasAccessTo(accesses, null, "marketing").view) {
      module_page = "Marketing";
    } else if (hasAccessTo(accesses, null, "financial").view) {
      module_page = "financial";
    }
    if (!module_page) {
      return <Navigate to={`/login`} />;
    }
    const firstPage = "Dashboard";
    // const firstPage = accesses.hierarchy[0].children[0].name || "Dashboard";
    return <Navigate to={`/${module_page}/${firstPage}`} />;
  }
  return children;
}

export default LoginRoute;
