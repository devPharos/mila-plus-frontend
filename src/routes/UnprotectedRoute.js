import React from 'react';
import { toast } from 'react-toastify';
import Header from '~/Header';
import api from '~/services/api';

function UnprotectedRoute({ children }) {

    return (
        <div className="h-screen flex flex-col justify-start items-start">
            <Header />
            {children}
        </div>)
}

export default UnprotectedRoute;
