import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { hasAccessTo } from '~/functions';
import { logout } from '~/store/modules/auth/actions';

// import { Container } from './styles';

function UnprotectedRoute({ children }) {
  const { signed, accesses } = useSelector(state => state.auth)

  const dispatch = useDispatch()

  const { pathname } = useLocation();
  const paths = pathname.substring(1).split('/')[0];
  if (paths === '401') {
    dispatch(logout());
    return <Navigate to="/login" />;
  }

  if (signed) {
    // user is authenticated
    let module_page = '';
    if (hasAccessTo(accesses, 'administrative').view) {
      module_page = 'Administrative';
    } else if (hasAccessTo(accesses, 'academic').view) {
      module_page = 'Academic';
    } else if (hasAccessTo(accesses, 'operational').view) {
      module_page = 'Operational';
    } else if (hasAccessTo(accesses, 'commercial').view) {
      module_page = 'Commercial';
    } else if (hasAccessTo(accesses, 'marketing').view) {
      module_page = 'Marketing';
    }
    if (!module_page) {
      return <Navigate to={`/login`} />;
    }
    return <Navigate to={`/${module_page}/dashboard`} />;
  }
  return children
}

export default UnprotectedRoute;
