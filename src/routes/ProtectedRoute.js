import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Header from '~/Header';

function ProtectedRoute({ children }) {
  const { signed } = useSelector(state => state.auth)
  // console.log(auth)
  if (!signed) {
    // user is not authenticated
    return <Navigate to="/login" />;
  }
  return (
    <div className="h-screen flex flex-col justify-start items-start ">
      <Header />
      {children}
    </div>)
}

export default ProtectedRoute;
