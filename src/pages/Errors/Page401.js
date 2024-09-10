import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '~/store/modules/auth/actions';

// import { Container } from './styles';

function Error401() {
    const dispatch = useDispatch();
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(logout())
        navigate("/login")
    }, [])
    return <div />;
}

export default Error401;
