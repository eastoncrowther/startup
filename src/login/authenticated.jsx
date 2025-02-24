import React from 'react';
import { useNavigate } from 'react-router-dom';

import Button from 'react-bootstrap/Button';

export function Authenticated(props) {
    const navigate = useNavigate();

    function logout() {
        localStorage.removeItem('userName');
        props.onLogout();
    }

    return (
        <div>
            <div className = 'playerName'>{props.userName}</div>
            <Button variant='primary' onClick={() => navigate('/game')}>Play</Button>
            <Button varient='secondary' onClick={() => logout()}>Logout</Button>
        </div>
    );
}